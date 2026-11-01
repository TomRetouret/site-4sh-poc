/* =========================================================================
   Routage des demandes de contact
   Fonction déclenchée par Netlify à chaque soumission de formulaire validée
   (événement "submission-created" ; Netlify signe l'événement, la fonction
   n'est pas appelable directement depuis l'extérieur). Elle relaie le message
   via Mailjet, le service déjà déclaré dans la notice RGPD de 4SH.

   SÉCURITÉ (docs/securite.md) : le destinataire n'est JAMAIS lu dans la
   soumission. Le champ caché « destinataire » des formulaires est modifiable
   par n'importe quel visiteur ; s'y fier ferait du site un relais de spam
   vers n'importe quelle adresse. Le destinataire est déduit du type de
   demande (champ « sujet ») à partir de la liste blanche des sujets déclarée
   dans src/_data/site.json et src/_data/en/site.json (formulaire.sujets,
   modifiable dans le back-office), embarquée dans la fonction au déploiement.
   Sujet inconnu ou absent : MAIL_DEFAUT. Toute adresse doit en plus
   appartenir à un domaine autorisé (MAIL_DOMAINES_AUTORISES, 4sh.fr par défaut).

   Variables d'environnement à définir dans Netlify (Site settings > Environment) :
     MJ_APIKEY_PUBLIC         clé publique Mailjet
     MJ_APIKEY_PRIVATE        clé privée Mailjet
     MAIL_EXPEDITEUR          adresse d'envoi validée chez Mailjet (ex. site@4sh.fr)
     MAIL_DEFAUT              destinataire de repli (sujet inconnu, formulaires sans sujet)
     MAIL_DOMAINES_AUTORISES  facultatif, domaines de destination admis, séparés
                              par des virgules (défaut : 4sh.fr)

   Si les clés sont absentes, la fonction ne casse rien : la soumission reste
   enregistrée dans Netlify Forms et un message est écrit dans les logs.
   Les logs ne contiennent aucune donnée saisie par le visiteur.
   ========================================================================= */

const ORDRE = ["sujet", "nom", "entreprise", "email", "telephone", "participants", "formation", "besoin", "page"];
const INTITULES = {
  sujet: "Type de demande",
  nom: "Nom",
  entreprise: "Entreprise",
  email: "Email",
  telephone: "Téléphone",
  participants: "Participants",
  formation: "Formation concernée",
  besoin: "Message",
  page: "Page d'origine",
};
const IGNORES = new Set(["destinataire", "form-name", "bot-field", "rgpd", "g-recaptcha-response"]);

// Tailles maximales (caractères) : un message légitime tient largement dedans.
const TAILLE_MESSAGE = 5000;
const TAILLE_CHAMP = 300;
const CHAMPS_MAX = 20;

const RE_EMAIL = /^[^\s@<>()",;:\\]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

/** Liste blanche « libellé du sujet » vers adresse, lue dans les données du site (FR et EN). */
function chargerSujets() {
  const table = new Map();
  for (const charger of [() => require("../../src/_data/site.json"), () => require("../../src/_data/en/site.json")]) {
    try {
      const sujets = (charger().formulaire || {}).sujets || [];
      for (const s of sujets) {
        if (s && typeof s.label === "string" && typeof s.email === "string") table.set(s.label.trim(), s.email.trim());
      }
    } catch (e) {
      console.error("[contact] liste des sujets illisible :", e && e.message);
    }
  }
  return table;
}
const SUJETS = chargerSujets();

const domainesAutorises = () =>
  (process.env.MAIL_DOMAINES_AUTORISES || "4sh.fr")
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);

function adresseAutorisee(adresse) {
  if (!adresse || !RE_EMAIL.test(adresse)) return false;
  const domaine = adresse.split("@").pop().toLowerCase();
  return domainesAutorises().some((d) => domaine === d || domaine.endsWith("." + d));
}

/** Nettoie une valeur saisie : texte, sans caractères de contrôle, longueur bornée. */
function nettoyer(valeur, max, multiligne = false) {
  let v = String(valeur == null ? "" : valeur);
  v = multiligne ? v.replace(/\r\n?/g, "\n").replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, "") : v.replace(/[\u0000-\u001F\u007F]+/g, " ");
  v = v.trim();
  return v.length > max ? v.slice(0, max) + " […]" : v;
}

const echapper = (v) =>
  String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function corps(data) {
  const autres = Object.keys(data).filter((k) => !ORDRE.includes(k) && !IGNORES.has(k) && /^[\w-]{1,40}$/.test(k) && data[k]);
  const cles = [...ORDRE.filter((k) => data[k]), ...autres].slice(0, CHAMPS_MAX);
  const valeurs = cles.map((k) => [k, nettoyer(data[k], k === "besoin" ? TAILLE_MESSAGE : TAILLE_CHAMP, k === "besoin")]).filter(([, v]) => v);
  const texte = valeurs.map(([k, v]) => `${INTITULES[k] || k} : ${v}`).join("\n");
  const html =
    "<table style=\"border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px\">" +
    valeurs
      .map(
        ([k, v]) =>
          `<tr><td style="padding:6px 14px 6px 0;color:#767676;vertical-align:top">${echapper(
            INTITULES[k] || k
          )}</td><td style="padding:6px 0;color:#1f292e"><b>${echapper(v).replace(/\n/g, "<br>")}</b></td></tr>`
      )
      .join("") +
    "</table>";
  return { texte, html };
}

exports.handler = async (event) => {
  let charge;
  try {
    charge = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, body: "corps illisible" };
  }

  const soumission = charge.payload || {};
  const data = soumission.data || {};
  const formulaire = nettoyer(soumission.form_name || data["form-name"] || "formulaire", 60);

  // Pot de miel : Netlify écarte déjà ces soumissions, double sécurité.
  if (data["bot-field"]) {
    console.log(`[contact] ${formulaire} : pot de miel rempli, soumission ignorée.`);
    return { statusCode: 200, body: "ignoré" };
  }

  // Destinataire : uniquement par la liste blanche des sujets, jamais par le champ caché.
  const sujet = nettoyer(data.sujet, TAILLE_CHAMP);
  const sujetConnu = SUJETS.has(sujet);
  const candidat = sujetConnu ? SUJETS.get(sujet) : (process.env.MAIL_DEFAUT || "").trim();
  const destinataire = adresseAutorisee(candidat) ? candidat : "";

  const expediteur = (process.env.MAIL_EXPEDITEUR || "").trim();
  const pub = process.env.MJ_APIKEY_PUBLIC;
  const priv = process.env.MJ_APIKEY_PRIVATE;

  if (!destinataire) {
    console.log(
      `[contact] ${formulaire} : aucun destinataire autorisé (sujet ${sujetConnu ? "connu" : "inconnu"}, vérifier MAIL_DEFAUT et MAIL_DOMAINES_AUTORISES) ; soumission conservée dans Netlify Forms uniquement.`
    );
    return { statusCode: 200, body: "sans destinataire" };
  }
  if (!pub || !priv || !expediteur) {
    console.log(`[contact] ${formulaire} : Mailjet non configuré (MJ_APIKEY_PUBLIC / MJ_APIKEY_PRIVATE / MAIL_EXPEDITEUR).`);
    return { statusCode: 200, body: "mailjet non configuré" };
  }

  const { texte, html } = corps(data);
  // Objet : libellé de la liste blanche, pas le texte libre envoyé par le visiteur.
  const objet = sujetConnu ? `[4sh.fr] ${sujet}` : `[4sh.fr] Nouvelle demande (${formulaire})`;

  const email = nettoyer(data.email, 254);
  const nomReponse = nettoyer(data.nom || data.entreprise || "", 100);

  const message = {
    Messages: [
      {
        From: { Email: expediteur, Name: "Site 4SH" },
        To: [{ Email: destinataire }],
        ReplyTo: RE_EMAIL.test(email) ? { Email: email, Name: nomReponse } : undefined,
        Subject: objet,
        TextPart: texte,
        HTMLPart: html,
      },
    ],
  };

  try {
    const reponse = await fetch("https://api.mailjet.com/v3.1/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + Buffer.from(`${pub}:${priv}`).toString("base64"),
      },
      body: JSON.stringify(message),
    });
    if (!reponse.ok) {
      // Statut seulement : le détail renvoyé par Mailjet peut reprendre des adresses saisies.
      console.error(`[contact] ${formulaire} : Mailjet a refusé l'envoi (statut ${reponse.status}).`);
      return { statusCode: 200, body: "envoi refusé" };
    }
    console.log(`[contact] ${formulaire} relayé (${sujetConnu ? "sujet connu" : "destinataire par défaut"}).`);
    return { statusCode: 200, body: "relayé" };
  } catch (e) {
    console.error(`[contact] ${formulaire} : échec de l'appel Mailjet :`, e && e.message);
    return { statusCode: 200, body: "échec" };
  }
};
