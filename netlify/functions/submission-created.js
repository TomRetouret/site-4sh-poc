/* =========================================================================
   Routage des demandes de contact
   Fonction déclenchée par Netlify à chaque soumission de formulaire
   (événement "submission-created"). Elle lit le champ caché "destinataire",
   posé par le choix du type de demande, et relaie le message à cette adresse
   via Mailjet, le service déjà déclaré dans la notice RGPD de 4SH.

   Variables d'environnement à définir dans Netlify (Site settings > Environment) :
     MJ_APIKEY_PUBLIC    clé publique Mailjet
     MJ_APIKEY_PRIVATE   clé privée Mailjet
     MAIL_EXPEDITEUR     adresse d'envoi validée chez Mailjet (ex. site@4sh.fr)
     MAIL_DEFAUT         destinataire de repli si le formulaire n'en porte pas

   Si les clés sont absentes, la fonction ne casse rien : la soumission reste
   enregistrée dans Netlify Forms et un message est écrit dans les logs.
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
const IGNORES = new Set(["destinataire", "form-name", "bot-field", "rgpd"]);

const echapper = (v) =>
  String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function corps(data) {
  const cles = [...ORDRE.filter((k) => data[k]), ...Object.keys(data).filter((k) => !ORDRE.includes(k) && !IGNORES.has(k) && data[k])];
  const texte = cles.map((k) => `${INTITULES[k] || k} : ${data[k]}`).join("\n");
  const html =
    "<table style=\"border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px\">" +
    cles
      .map(
        (k) =>
          `<tr><td style="padding:6px 14px 6px 0;color:#767676;vertical-align:top">${echapper(
            INTITULES[k] || k
          )}</td><td style="padding:6px 0;color:#1f292e"><b>${echapper(data[k]).replace(/\n/g, "<br>")}</b></td></tr>`
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
  const formulaire = soumission.form_name || data["form-name"] || "formulaire";

  const destinataire = (data.destinataire || process.env.MAIL_DEFAUT || "").trim();
  const expediteur = (process.env.MAIL_EXPEDITEUR || "").trim();
  const pub = process.env.MJ_APIKEY_PUBLIC;
  const priv = process.env.MJ_APIKEY_PRIVATE;

  if (!destinataire) {
    console.log(`[contact] ${formulaire} : aucun destinataire, soumission conservée dans Netlify Forms uniquement.`);
    return { statusCode: 200, body: "sans destinataire" };
  }
  if (!pub || !priv || !expediteur) {
    console.log(`[contact] ${formulaire} : Mailjet non configuré (MJ_APIKEY_PUBLIC / MJ_APIKEY_PRIVATE / MAIL_EXPEDITEUR). Destinataire visé : ${destinataire}`);
    return { statusCode: 200, body: "mailjet non configuré" };
  }

  const { texte, html } = corps(data);
  const sujet = data.sujet ? `[4sh.fr] ${data.sujet}` : `[4sh.fr] Nouvelle demande (${formulaire})`;

  const message = {
    Messages: [
      {
        From: { Email: expediteur, Name: "Site 4SH" },
        To: [{ Email: destinataire }],
        ReplyTo: data.email ? { Email: data.email, Name: data.nom || data.entreprise || "" } : undefined,
        Subject: sujet,
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
      const detail = await reponse.text();
      console.error(`[contact] Mailjet a refusé l'envoi (${reponse.status}) : ${detail}`);
      return { statusCode: 200, body: "envoi refusé" };
    }
    console.log(`[contact] ${formulaire} relayé vers ${destinataire}`);
    return { statusCode: 200, body: "relayé" };
  } catch (e) {
    console.error("[contact] échec de l'appel Mailjet :", e && e.message);
    return { statusCode: 200, body: "échec" };
  }
};
