// Composants / Surtitre et titres de section.
//  - Section de prestation : macro section(b, ctx) de src/_includes/composants/blocs/_section.njk
//    (numéro, titre, introduction, contenu, boutons).
//  - Tête de section de l'accueil : surtitre .eyebrow, titre .sec-titre, sous-titre .sec-sous,
//    balisage de src/_includes/composants/pages/accueil.njk (pas de macro).
import { appeler, enSection, filtre, donnee } from "./rendu.js";

const accueil = donnee("accueil") || {};

export default {
  title: "Composants/Surtitre et titres de section",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "La tête d'une section : **surtitre** (`.eyebrow`, Manrope 700, 13 px, capitales, rouge texte ou couleur texte de l'offre), " +
          "**titre** H2 (`.sec-titre` ou `.sect-bloc h2`, Manrope 800 ; un mot entre `*astérisques*` passe en rouge avec le filtre `accent`), et " +
          "**sous-titre** ou introduction (`.sec-sous`, `.sect-prose`).\n\n" +
          "Sur les pages de prestation, la macro `section(b, ctx)` de `blocs/_section.njk` pose le numéro de section (`01`, `02`... " +
          "calculé par le filtre `misePageSections`, jamais saisi), le titre (filtre `mdTitre`, Markdown en ligne : `*mot*` y produit un italique et non le mot mis en valeur), l'introduction (filtre " +
          "`mdSection`), le contenu et les boutons.\n\n" +
          "Source : `src/_includes/composants/blocs/_section.njk`, `src/_includes/composants/pages/accueil.njk`, " +
          "`src/assets/charte.css` (`.eyebrow`, `.sec-titre`, `.sec-sous`, « Numéros de section »), `src/assets/secteurs.css`."
      },
      story: { height: "460px" }
    }
  }
};

export const TeteAccueil = {
  name: "Surtitre, titre et sous-titre",
  args: {
    surtitre: accueil.secteurs_eyebrow,
    titre: accueil.secteurs_titre,
    sous_titre: accueil.secteurs_sous,
    fond: "clair"
  },
  argTypes: {
    surtitre: { name: "Surtitre", control: "text" },
    titre: { name: "Titre (accent avec *mot*)", control: "text" },
    sous_titre: { name: "Sous-titre", control: "text" },
    fond: { name: "Fond", control: "inline-radio", options: ["clair", "fond doux"] }
  },
  render: ({ surtitre, titre, sous_titre, fond }) =>
    enSection(
      `<p class="eyebrow">${surtitre || ""}</p>
<h2 class="sec-titre">${filtre("accent", titre)}</h2>
<p class="sec-sous">${sous_titre || ""}</p>`,
      { classe: fond === "fond doux" ? "fond-doux" : "" }
    )
};

const FONDS = { blanc: "", "crème (une section sur deux)": " sect-bloc--creme", "sombre (temps fort)": " sect-bloc--sombre" };

// Exemple : section_atouts de src/content/prestations/audit-ux.md (titre et texte), sans ses cartes.
export const SectionPrestation = {
  name: "Section de prestation (macro section)",
  args: {
    titre: "Pourquoi réaliser un audit ?",
    texte: "Plusieurs signaux ou contextes indiquent qu'il est temps de réaliser un audit.",
    numero: "02",
    fond: "blanc",
    boutons: [{ texte: "Demander un audit UX", lien: "/contact/" }]
  },
  argTypes: {
    titre: { name: "Titre", control: "text", description: "Filtre `mdTitre` : Markdown en ligne (gras, italique, lien). Attention : `*mot*` y donne un italique, pas le mot mis en valeur rouge." },
    texte: { name: "Texte d'introduction", control: "text", description: "Markdown (filtre `mdSection`)." },
    numero: { name: "Numéro (calculé)", control: "text", description: "`ctx.numero`, calculé par `misePageSections`. Vide : pas de numéro." },
    fond: { name: "Fond (calculé)", control: "select", options: Object.keys(FONDS), description: "`ctx.fond`, calculé par `misePageSections`." },
    boutons: { name: "Boutons", control: "object", description: "`[{ texte, lien }]`." }
  },
  parameters: { feuilles: ["/assets/secteurs.css"] },
  render: ({ titre, texte, numero, fond, boutons }) =>
    `<main>${appeler("blocs/_section", "section", [{ titre, texte, boutons }, { numero, fond: FONDS[fond] }], null, "")}</main>`
};
