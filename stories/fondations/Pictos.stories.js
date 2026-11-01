// Fondations / Pictos : le jeu d'icônes de src/_includes/composants/icones.njk, rendu par la
// vraie macro navicone(nom).
import { planche, source } from "./outils.js";
import { appeler } from "../composants/rendu.js";

// Noms reconnus par navicone (ordre du fichier icones.njk).
const NOMS = [
  "ecran", "cloud", "mobile", "design", "serveurs", "refonte", "audit", "logistique", "eclair", "bouclier",
  "editeur", "cloud-plus", "reseau", "megaphone", "hub", "graph", "batterie", "code", "data"
];

// Les pictos portent la classe « doodle », que charte.css masque (display:none!important).
// Cette planche les rend visibles, dans son cadre seulement, pour les montrer.
const VISIBLES = `<style>.sb4-pictos svg.doodle{display:block!important}</style>`;

const picto = (nom) => appeler("icones", "navicone", [nom]).trim();

const COULEURS = { encre: "var(--encre)", rouge: "var(--rouge)", blanc: "#fff" };

export default {
  title: "Fondations/Pictos",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Les 19 pictos de `src/_includes/composants/icones.njk`, rendus par la macro `navicone(nom)` " +
          "(`navicone(\"\")` ou un nom inconnu ne rend rien). Tracé au trait de 1,6 à 1,7 px en `currentColor` : " +
          "le picto prend la couleur du texte qui l'entoure.\n\n" +
          "Règle de la charte appliquée par `charte.css` à tous les SVG : « Pictos et schémas : extrémités carrées, " +
          "angles vifs » (`stroke-linecap:square; stroke-linejoin:miter`).\n\n" +
          "**État sur le site.** La macro sert le méga-menu (`base.njk`, champ `icone` d'un lien de `navigation.json`). " +
          "Les SVG portent la classe `doodle`, masquée par `charte.css` (« effets retirés »), et la vignette `.svc-ico` " +
          "du menu est elle aussi masquée : ces pictos ne s'affichent donc pas aujourd'hui. Cette planche les rend " +
          "visibles dans son cadre uniquement. Plusieurs tracés gardent des coins arrondis (`rx` des rectangles) ou des " +
          "cercles, que la règle CSS des angles vifs ne modifie pas.\n\n" +
          "Source : `src/_includes/composants/icones.njk`, `src/assets/charte.css`."
      },
      story: { height: "900px" }
    }
  },
  argTypes: {
    taille: { name: "Taille (px)", control: { type: "range", min: 16, max: 96, step: 8 } },
    couleur: { name: "Couleur", control: "inline-radio", options: Object.keys(COULEURS) }
  },
  args: { taille: 48, couleur: "encre" }
};

export const Tous = {
  name: "Tous les pictos",
  render: ({ taille, couleur }) => {
    const fond = couleur === "blanc" ? "var(--nuit)" : "#fff";
    const vides = NOMS.filter((n) => !picto(n));
    return planche(
      VISIBLES +
        `<div class="sb4-pictos sb4-grille" style="grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:0;border-top:1px solid var(--bordure);border-left:1px solid var(--bordure)">
${NOMS.map(
  (n) => `<figure style="margin:0;padding:24px 16px;border-right:1px solid var(--bordure);border-bottom:1px solid var(--bordure);background:${fond};color:${COULEURS[couleur]};display:flex;flex-direction:column;align-items:center;gap:12px">
  <span style="display:block;width:${taille}px;height:${taille}px" class="sb4-p">${picto(n).replace(/width="24" height="24"/, `width="${taille}" height="${taille}"`)}</span>
  <figcaption style="font:700 13px/1.2 var(--titre);letter-spacing:.04em;color:${couleur === "blanc" ? "var(--sur-nuit)" : "var(--texte-2)"}"><code>${n}</code></figcaption>
</figure>`
).join("")}
</div>
${vides.length ? `<p class="sb4-ko">Rendu vide : ${vides.join(", ")}</p>` : ""}
<p class="sb4-note" style="margin-top:24px">Appel : <code>{% from "composants/icones.njk" import navicone %}{{ navicone("graph") }}</code></p>` +
        source("<code>src/_includes/composants/icones.njk</code> (macro <code>navicone</code>), <code>src/assets/charte.css</code> (<code>svg *</code>, <code>.doodle</code>).")
    );
  }
};

export const UnPicto = {
  name: "Un picto",
  args: { nom: "graph" },
  argTypes: { nom: { name: "Nom", control: "select", options: NOMS, description: "Argument de `navicone(nom)`." } },
  parameters: { docs: { story: { height: "260px" } } },
  render: ({ nom, taille, couleur }) =>
    planche(
      VISIBLES +
        `<div class="sb4-pictos" style="display:inline-block;padding:24px;background:${couleur === "blanc" ? "var(--nuit)" : "#fff"};color:${COULEURS[couleur]}">` +
        picto(nom).replace(/width="24" height="24"/, `width="${taille}" height="${taille}"`) +
        `</div>`
    )
};
