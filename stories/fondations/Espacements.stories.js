// Fondations / Espacements et grille : valeurs déclarées dans src/assets/charte.css pour les
// conteneurs, les sections, les grilles de cartes et les cibles tactiles.
import { planche, apresAffichage, jeton, source, code } from "./outils.js";

const barre = (px) =>
  `<span style="display:inline-block;vertical-align:middle;height:12px;width:${px}px;max-width:100%;background:var(--signal)"></span>`;

// [élément, règle, grand écran (≥ 1200 px), tablette (768 à 1199 px), mobile (< 768 px)]
const ESPACES = [
  ["Marge latérale de page", "`--marge` (padding du `.container`)", 80, 32, 16],
  ["Section", "`section { padding }` haut et bas", 144, 96, 56],
  ["Bandeau de chiffres clés", "`.chiffres { padding }`", 112, 112, 56],
  ["Hero sobre des pages internes", "`.sect-hero`, `.hero-interne` : haut / bas", "56 / 96", "56 / 96", "32 / 56"],
  ["Sous-titre de section, marge basse", "`.sec-sous { margin-bottom }`", 56, 56, 56],
  ["Titre de section, marge basse", "`.sec-titre { margin-bottom }`", 16, 16, 16],
  ["Gouttière des grilles de cartes", "`.portes`, `.etapes`, `.chiffres .container` : `gap`", 24, 24, "24 (12 pour les chiffres)"],
  ["Rembourrage des cartes", "`.porte`, `.secteur-carte`, `.formulaire` : `padding`", 32, 32, 32],
  ["Hauteur de bouton", "`.btn` / `.btn-sm` : `min-height`", "48 / 44", "48 / 44", "48 / 44"],
  ["Cible tactile minimale", "liens du menu, du fil d'Ariane, onglets, flèches de carrousel", 44, 44, 44],
  ["Hauteur de l'en-tête", "`header .nav { height }` (64 px sous 961 px)", 80, "80 ou 64", 64]
];

const LARGEURS = [
  ["Conteneur", "`.container { max-width: 1440px }`, centré, marges `--marge`"],
  ["Texte de sous-titre", "`.sec-sous { max-width: 720px }`"],
  ["Chapô de page", "`.sect-hero .accroche { max-width: 760px }`"],
  ["Réponse de FAQ", "`.faq details p { max-width: 760px }`"],
  ["Titre de page", "`.sect-hero h1 { max-width: 1100px }`"]
];

const POINTS = [
  ["1200 px et plus", "Grand écran : marge 80 px, sections de 144 px, carrousels à plusieurs éléments."],
  ["768 à 1199 px", "Tablette (`max-width:1199px`) : marge 32 px, sections de 96 px, un seul élément visible par carrousel."],
  ["961 px et moins", "Menu replié derrière le bouton « Menu » (`max-width:960px`), en-tête de 64 px."],
  ["767 px et moins", "Mobile (`max-width:767px`) : marge 16 px, sections de 56 px, texte courant 16 px, boutons du hero en pleine largeur."]
];

const cellule = (v) => (typeof v === "number" ? `${barre(v)} <b style="font-family:var(--titre)">${v}</b>` : `<b style="font-family:var(--titre)">${v}</b>`);

export default {
  title: "Fondations/Espacements et grille",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Les espacements des sections et des conteneurs, en pixels, aux trois largeurs que la charte distingue " +
          "(points de rupture 1199 px et 767 px, plus 960 px pour le menu). Les barres rouges sont à l'échelle 1:1.\n\n" +
          "Source : `src/assets/charte.css` (`--marge`, `.container`, `section`, `.chiffres`, `.sect-hero`, `.sec-titre`, " +
          "`.sec-sous`, `.portes`, `.etapes`, `.porte`, `.btn`, `header .nav`)."
      },
      story: { height: "1350px" }
    }
  }
};

export const Espacements = {
  name: "Espacements et grille",
  render: () => {
    const racine = planche(
      `<h2 class="sb4-t">Dans ce cadre</h2>
<p class="sb4-note" data-direct>…</p>
<h2 class="sb4-t">Espacements (px)</h2>
<table class="sb4-tab"><thead><tr><th>Élément</th><th>Règle</th><th>≥ 1200 px</th><th>768 à 1199 px</th><th>&lt; 768 px</th></tr></thead><tbody>
${ESPACES.map(([n, r, a, b, c]) => `<tr><td>${n}</td><td>${code(r)}</td><td>${cellule(a)}</td><td>${cellule(b)}</td><td>${cellule(c)}</td></tr>`).join("")}
</tbody></table>
<h2 class="sb4-t">Largeurs maximales</h2>
<table class="sb4-tab"><tbody>${LARGEURS.map(([n, r]) => `<tr><td style="width:240px">${n}</td><td>${code(r)}</td></tr>`).join("")}</tbody></table>
<h2 class="sb4-t">Points de rupture</h2>
<table class="sb4-tab"><tbody>${POINTS.map(([n, r]) => `<tr><td style="width:240px"><b style="font-family:var(--titre)">${n}</b></td><td>${code(r)}</td></tr>`).join("")}</tbody></table>
<h2 class="sb4-t">Exemple : conteneur et section</h2>
<p class="sb4-note">Section réelle (<code>section</code> + <code>.container</code>) : le fond doux montre le rembourrage vertical, le filet rouge la marge latérale.</p>
<div style="margin:0 calc(-1 * var(--marge))"><section class="fond-doux"><div class="container" style="outline:1px dashed var(--signal);outline-offset:-1px">
<p class="eyebrow">Surtitre</p><h2 class="sec-titre">Titre de section</h2><p class="sec-sous">Sous-titre de 720 px au plus, suivi de 56 px avant le contenu.</p>
<div class="portes" style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr))"><div class="porte"><h3>Carte</h3><p>Rembourrage 32 px.</p></div><div class="porte"><h3>Carte</h3><p>Gouttière 24 px.</p></div><div class="porte"><h3>Carte</h3><p>Filet d'offre 4 px.</p></div></div>
</div></section></div>` + source("<code>src/assets/charte.css</code>.")
    );
    apresAffichage(() => {
      const sec = racine.querySelector("section");
      const cont = racine.querySelector(".container");
      racine.querySelector("[data-direct]").innerHTML =
        `Largeur du cadre : <b>${window.innerWidth} px</b> · <code>--marge</code> appliquée : <b>${jeton("--marge")}</b> · ` +
        `rembourrage de section : <b>${getComputedStyle(sec).paddingTop}</b> · largeur maximale du conteneur : <b>${getComputedStyle(cont).maxWidth}</b>.`;
    });
    return racine;
  }
};
