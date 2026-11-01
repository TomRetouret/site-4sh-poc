// Fondations / Mouvement : les règles de src/assets/mouvement.css (phase 2) et une
// démonstration qui pose les mêmes classes que src/assets/mouvement.js.
import { planche, source, code } from "./outils.js";

const JETONS = [
  ["--mv-courbe", "cubic-bezier(0.2, 0, 0, 1)", "Courbe de décélération unique, pour tout le mouvement."],
  ["--mv-entree", "600ms", "Entrée des titres et des cartes."],
  ["--mv-bloc", "800ms", "Révélation des chiffres clés."],
  ["--mv-trace", "600ms", "Tracés et plans (de 300 à 900 ms)."],
  ["--mv-survol", "200ms", "Survols, losange du menu."]
];

const ANIME = [
  ["Entrées au défilement", "`.mv-e` + `.mv-glisse` (titres, chapôs : glissement de 16 px de gauche à droite) ou `.mv-monte` (cartes, étapes : montée de 16 px). Une seule fois par élément."],
  ["Barre d'étiquette d'offre", "La barre 24 × 4 se trace après le texte (`scaleX`, 400 ms, 200 ms de décalage)."],
  ["Chiffres clés", "`.mv-bloc` : révélation de gauche à droite par `clip-path`, le chiffre ne défile jamais. Neutralisée aujourd'hui par `charte.css` (« Chiffres clés : toujours visibles ») : les chiffres s'affichent d'emblée."],
  ["Plans pleins (hero, bloc contact)", "`.mv-plan` : le plan monte ses paliers de gauche à droite (300 à 900 ms), puis le losange blanc s'allume (1 050 ms)."],
  ["Tracé de la méthode 4D", "`.mv-trace` : le trait se dessine (`stroke-dashoffset`), puis le losange s'allume."],
  ["Losange du menu", "Glisse vers l'entrée survolée en 200 ms, sans tourner (au-delà de 1024 px)."],
  ["Méga-menus", "Ouverture en 200 ms, contenu décalé par colonne (40, 80, 120 ms)."],
  ["FAQ", "La réponse se pose à l'ouverture (280 ms)."],
  ["Survol des cartes", "Flèche « → » qui avance de 4 px ; filet d'accent de 2 px qui se trace de gauche à droite sur les cartes à bord fin (`.secteur-carte`, `.cas`, `.blog-carte`) ; filet d'offre qui passe de 4 à 6 px (`.porte`, `.sect-ref-carte`)."],
  ["Hero de l'accueil et hero Learning", "Scènes propres (`hero-signal.js`, `learning-scene.js`) : épure, paliers nommés, objets qui se structurent."]
];

const REGLES = [
  "Une seule courbe : `cubic-bezier(0.2, 0, 0, 1)`.",
  "Propriétés animées : `transform`, `opacity`, `stroke-dashoffset`, `clip-path` uniquement ; durées de 200 à 1 100 ms.",
  "Tracé de gauche à droite : départ à 300 ms, dernier palier à 900 ms, losange allumé à 1 050 ms.",
  "Jamais de boucle, de parallaxe ni de compteur qui défile.",
  "Le losange s'allume en dernier ; il ne tourne pas et ne bouge pas (sauf celui du menu, qui glisse).",
  "Entrées au défilement une seule fois par élément (levée, pour la phase 2, de la règle « rien au défilement » de `charte.css`).",
  "Amélioration progressive : rien n'est masqué tant que `mouvement.js` n'a pas posé `.mv` sur `<html>`, ce qu'il ne fait que si `IntersectionObserver` existe.",
  "`prefers-reduced-motion: reduce` et impression : état final affiché directement, sans transition ni animation (règle aussi posée globalement par `charte.css`)."
];


// Démonstration : mêmes classes que le site. html.mv est posé le temps de l'animation,
// puis retiré, pour ne pas toucher les autres stories affichées dans le même cadre.
const DEMO = `
<div class="sb4-demo" style="border:1px solid var(--bordure);padding:32px;margin:8px 0 24px">
  <p style="margin:0 0 24px"><button type="button" class="btn btn-ghost btn-sm" data-rejouer>Rejouer l'entrée</button>
  <span class="sb4-reduit" style="margin-left:16px;font-size:14px;color:var(--muted)"></span></p>
  <p class="eyebrow eyebrow-offre mv-e mv-glisse"><span class="barre" aria-hidden="true"></span>4SH Build · Étiquette d'offre</p>
  <h3 class="sec-titre mv-e mv-glisse" style="--mv-delai:80ms">Titre qui glisse</h3>
  <div class="portes" style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px;margin:24px 0">
    <div class="porte mv-e mv-monte" style="--mv-delai:0ms"><h3>Carte 1</h3><p>Montée de 16 px.</p></div>
    <div class="porte mv-e mv-monte" style="--mv-delai:80ms"><h3>Carte 2</h3><p>Décalage de 80 ms.</p></div>
    <div class="porte mv-e mv-monte" style="--mv-delai:160ms"><h3>Carte 3</h3><p>Survolez : le filet s'épaissit.</p></div>
  </div>
  <svg class="trace-4d mv-trace" viewBox="0 0 1280 120" aria-hidden="true" focusable="false"><path d="M0 110H280L310 80H600L630 50H920L950 20H1240" fill="none" stroke="#14171C" stroke-width="2"/><path d="M1240 9L1251 20L1240 31L1229 20Z" fill="#ED203D"/></svg>
  <div style="background:var(--nuit);margin-top:24px"><svg class="contact-plan mv-plan" viewBox="0 0 1440 220" preserveAspectRatio="xMinYMax meet" aria-hidden="true" focusable="false"><path d="M0 220V160H420L460 120H760L800 80H1440V220Z" fill="#ED203D"/><path d="M1320 65L1335 80L1320 95L1305 80Z" fill="#FFFFFF"/></svg></div>
  <div class="secteur-carte" style="max-width:360px;margin-top:24px"><h3>Carte à bord fin</h3><p>Survolez : filet d'accent tracé de gauche à droite.</p><a href="#">Découvrir <span class="mv-fleche">→</span></a></div>
</div>`;

function rejouer(racine) {
  const html = document.documentElement;
  const elements = racine.querySelectorAll(".mv-e, .mv-trace, .mv-plan");
  const trace = racine.querySelector(".mv-trace > path");
  if (trace && trace.getTotalLength) {
    const l = Math.ceil(trace.getTotalLength());
    trace.style.strokeDasharray = l;
    racine.querySelector(".mv-trace").style.setProperty("--mv-long", l);
  }
  elements.forEach((e) => e.classList.remove("mv-vu"));
  html.classList.add("mv");
  void racine.offsetWidth; // applique l'état de départ avant de lancer la transition
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      elements.forEach((e) => e.classList.add("mv-vu"));
      setTimeout(() => {
        elements.forEach((e) => e.classList.remove("mv-vu"));
        html.classList.remove("mv");
      }, 1600);
    })
  );
}

export default {
  title: "Fondations/Mouvement",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "La grammaire du mouvement de la charte v1.1 (page « Mouvement »), implémentée par `src/assets/mouvement.css` " +
          "(chargée après `charte.css`) et `src/assets/mouvement.js`.\n\n" +
          "Dans ce Storybook, `mouvement.js` n'est pas chargé (voir `docs/storybook.md`, « Scripts ») : les composants " +
          "s'affichent dans leur état final. La démonstration ci-dessous pose les mêmes classes que le script " +
          "(`.mv` sur `<html>`, puis `.mv-vu`). Les survols, eux, sont en CSS pur et fonctionnent partout.\n\n" +
          "Source : `src/assets/mouvement.css` (en-tête « Grammaire », sections 1 à 9), `src/assets/charte.css` " +
          "(réduction du mouvement, chiffres toujours visibles)."
      },
      story: { height: "1900px" }
    }
  }
};

export const Mouvement = {
  name: "Mouvement",
  render: () => {
    const racine = planche(
      `<h2 class="sb4-t">Démonstration</h2>${DEMO}
<h2 class="sb4-t">Règles</h2>
<ul style="margin:0 0 24px 1.2em;max-width:900px">${REGLES.map((r) => `<li style="margin:6px 0">${code(r)}</li>`).join("")}</ul>
<h2 class="sb4-t">Jetons</h2>
<table class="sb4-tab"><thead><tr><th>Jeton</th><th>Valeur</th><th>Usage</th></tr></thead><tbody>
${JETONS.map(([n, v, u]) => `<tr><td><code>${n}</code></td><td><b style="font-family:var(--titre)">${v}</b></td><td>${u}</td></tr>`).join("")}
</tbody></table>
<h2 class="sb4-t">Ce qui s'anime</h2>
<table class="sb4-tab"><tbody>${ANIME.map(([n, d]) => `<tr><td style="width:260px"><b style="font-family:var(--titre)">${n}</b></td><td>${code(d)}</td></tr>`).join("")}</tbody></table>
<h2 class="sb4-t">Réduction du mouvement</h2>
<p class="sb4-note">Avec <code>prefers-reduced-motion: reduce</code>, <code>charte.css</code> coupe toute animation et toute transition
(<code>*{animation:none!important;transition:none!important}</code>) et <code>mouvement.css</code> force l'état final : opacité 1,
aucune translation, aucun découpage, tracés complets, losanges allumés. Les scènes du hero (<code>.hs-canvas</code>) sont masquées.
Même traitement à l'impression.</p>` +
        source("<code>src/assets/mouvement.css</code>, <code>src/assets/charte.css</code>.")
    );
    const reduit = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    racine.querySelector(".sb4-reduit").textContent = reduit
      ? "Mouvement réduit actif sur ce poste : l'état final s'affiche directement."
      : "";
    racine.querySelector("[data-rejouer]").addEventListener("click", () => rejouer(racine));
    return racine;
  }
};
