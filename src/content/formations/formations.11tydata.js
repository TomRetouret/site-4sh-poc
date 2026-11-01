// Données appliquées à toutes les fiches formation.
//
// Les fiches sont saisies en champs typés, regroupés comme la page (voir
// docs/back-office/schema-formations.md). Les données calculées ci-dessous les remettent
// à plat et en forme (eleventy/formations.js) : les gabarits, le catalogue et les
// collections de eleventy.config.js lisent donc les mêmes noms et les mêmes textes
// qu'avant la restructuration (titre, prix, duree, participants, note, sessions...).
const o = require("../../../eleventy/formations.js").outils;

const groupe = (data, nom) => data[nom] || {};

module.exports = {
  layout: "formation.njk",
  eleventyComputed: {
    // En-tête
    titre: (data) => groupe(data, "entete").titre,
    sous_titre: (data) => groupe(data, "entete").sous_titre,
    niveau: (data) => groupe(data, "entete").niveau,
    groupe: (data) => groupe(data, "entete").groupe,
    categorie: (data) => groupe(data, "entete").categorie,
    chapo: (data) => groupe(data, "entete").chapo,
    image: (data) => groupe(data, "entete").image,
    // Inscription
    prix: (data) => o.prixAffiche(groupe(data, "inscription")),
    sessions: (data) => o.sessionsAffichees(groupe(data, "inscription").sessions),
    programme_pdf: (data) => groupe(data, "inscription").programme_pdf,
    programme_pdf_poids: (data) => groupe(data, "inscription").programme_pdf_poids,
    // Chiffres clés (la part de pratique est calculée)
    duree: (data) => o.dureeAffichee(groupe(data, "chiffres")),
    participants: (data) => o.participantsAffiche(groupe(data, "chiffres")),
    note: (data) => o.noteAffichee(groupe(data, "chiffres")),
    avis: (data) => groupe(data, "chiffres").avis,
    depuis: (data) => groupe(data, "chiffres").depuis,
    theorie: (data) => groupe(data, "chiffres").theorie,
    pratique: (data) => {
      const t = o.nombre(groupe(data, "chiffres").theorie);
      return t === null ? undefined : 100 - t;
    },
    // Public visé et prérequis
    pour_qui: (data) => groupe(data, "public").pour_qui,
    prerequis: (data) => groupe(data, "public").prerequis,
    // Formateur : fiche Équipe reliée (src/_data/equipe/<slug>.json)
    formateur_vue: (data) => o.formateurAffiche(data.formateur, data.equipe),
    // Référencement : titre et description de la page, indexation
    title: (data) => groupe(data, "referencement").meta_title || `Formation ${groupe(data, "entete").titre} - 4SH`,
    description: (data) => groupe(data, "referencement").meta_description || groupe(data, "entete").chapo,
    // base.njk et sitemap.njk lisent « noindex » : inverse de « Afficher dans les moteurs de recherche »
    noindex: (data) => groupe(data, "referencement").indexation === false
  }
};
