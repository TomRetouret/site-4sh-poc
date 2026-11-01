// Extension Eleventy des fiches formation (chargée automatiquement par eleventy.config.js).
//
// Les fiches sont saisies dans Sveltia CMS en champs typés et regroupés comme la page
// (entete, inscription, chiffres, public, formateur, referencement). Ce module met ces
// champs en forme EXACTEMENT comme les anciens champs texte, pour que les gabarits,
// le catalogue et les collections de eleventy.config.js lisent les mêmes valeurs
// qu'avant (titre, prix, duree, participants, note, sessions...).
//
// Les fonctions de mise en forme sont exportées (module.exports.outils) et utilisées par
// src/content/formations/formations.11tydata.js (données calculées de chaque fiche).

// Date de référence pour masquer les sessions passées : date du build, heure de Paris.
// La variable d'environnement DATE_REFERENCE_SESSIONS (AAAA-MM-JJ) permet de la forcer
// (contrôle de non-régression, aperçu d'une date future).
const dateDuJour = () => {
  const forcee = process.env.DATE_REFERENCE_SESSIONS;
  if (forcee && /^\d{4}-\d{2}-\d{2}$/.test(forcee)) return forcee;
  return new Intl.DateTimeFormat("fr-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
};

const vide = (v) => v === undefined || v === null || (typeof v === "string" && v.trim() === "");
const nombre = (v) => {
  if (vide(v)) return null;
  const n = typeof v === "number" ? v : Number(String(v).replace(",", "."));
  return isFinite(n) ? n : null;
};
// 4.85 -> "4,85" ; 1.5 -> "1,5" ; 3 -> "3"
const decimalFr = (n) => String(n).replace(".", ",");
const echapper = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Date saisie (chaîne AAAA-MM-JJ, ou objet Date si le YAML l'a lue comme date) -> "AAAA-MM-JJ"
const dateIso = (v) => {
  if (vide(v)) return "";
  if (v instanceof Date) return isNaN(v) ? "" : v.toISOString().slice(0, 10);
  const m = String(v).trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : "";
};
const dateFr = (iso) => iso.split("-").reverse().join("/");

// 1950 (+ à partir de) -> "1950 € HT" / "À partir de 700 € HT"
function prixAffiche(insc) {
  insc = insc || {};
  const n = nombre(insc.prix);
  if (n === null) return "";
  return `${insc.prix_a_partir ? "À partir de " : ""}${decimalFr(n)} € HT`;
}

// Jours -> "1/2 journée", "1 jour", "1,5 jours", "3 jours"
function joursTexte(j) {
  if (j === 0.5) return "1/2 journée";
  return `${decimalFr(j)} ${j <= 1 ? "jour" : "jours"}`;
}
// Heures -> "3h30", "21h00"
function heuresTexte(h) {
  let entier = Math.floor(h);
  let minutes = Math.round((h - entier) * 60);
  if (minutes === 60) { entier += 1; minutes = 0; }
  return `${entier}h${String(minutes).padStart(2, "0")}`;
}
// Durée affichée (HTML) : "<b>3 jours</b> (21h00)". Le texte de repli (fourchette)
// passe avant : la partie qui précède la parenthèse est mise en gras.
function dureeAffichee(ch) {
  ch = ch || {};
  if (!vide(ch.duree_texte)) {
    const t = String(ch.duree_texte).trim();
    const m = t.match(/^(.*?)(\s*\(.*\))$/);
    return m ? `<b>${echapper(m[1])}</b>${echapper(m[2])}` : `<b>${echapper(t)}</b>`;
  }
  const j = nombre(ch.duree_jours);
  const h = nombre(ch.duree_heures);
  if (j === null && h === null) return "";
  if (j === null) return `<b>${heuresTexte(h)}</b>`;
  return `<b>${joursTexte(j)}</b>${h === null ? "" : ` (${heuresTexte(h)})`}`;
}

// 1 et 8 -> "1 à 8"
function participantsAffiche(ch) {
  ch = ch || {};
  const min = nombre(ch.participants_min);
  const max = nombre(ch.participants_max);
  if (min !== null && max !== null) return min === max ? `${max}` : `${min} à ${max}`;
  if (max !== null) return `${max}`;
  if (min !== null) return `${min}`;
  return "";
}

// 4.85 -> "4,85 / 5"
function noteAffichee(ch) {
  const n = nombre((ch || {}).note);
  return n === null ? "" : `${decimalFr(n)} / 5`;
}

// Sessions -> ["Du 22/09/2026 au 24/09/2026", "Le 24/09/2026"], sans les sessions
// déjà commencées à la date de référence.
function sessionsAffichees(liste, reference) {
  const jour = reference || dateDuJour();
  return (Array.isArray(liste) ? liste : [])
    .map((s) => ({ debut: dateIso(s && s.debut), fin: dateIso(s && s.fin) }))
    .filter((s) => s.debut && s.debut >= jour)
    .map((s) => (!s.fin || s.fin === s.debut ? `Le ${dateFr(s.debut)}` : `Du ${dateFr(s.debut)} au ${dateFr(s.fin)}`));
}

// Texte en paragraphes séparés par une ligne vide -> liste de paragraphes
function paragraphes(t) {
  if (vide(t)) return [];
  return String(t).split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
}

// Formateur de la fiche : fiche Équipe reliée + fonction et présentation propres à la formation.
function formateurAffiche(f, equipe) {
  if (!f || vide(f.personne)) return null;
  const p = (equipe || {})[f.personne];
  if (!p) return null;
  return {
    nom: p.nom,
    role: vide(f.fonction) ? p.fonction : f.fonction,
    photo: p.photo,
    bio: paragraphes(vide(f.presentation) ? p.presentation : f.presentation)
  };
}

module.exports = function (eleventyConfig) {
  // Aucun filtre global : la mise en forme passe par les données calculées des fiches.
};
module.exports.outils = {
  dateDuJour, dateIso, prixAffiche, dureeAffichee, joursTexte, heuresTexte,
  participantsAffiche, noteAffichee, sessionsAffichees, paragraphes, formateurAffiche, nombre
};
