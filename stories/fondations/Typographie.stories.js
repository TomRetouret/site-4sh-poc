// Fondations / Typographie : chaque niveau est rendu avec le balisage et les classes du site,
// puis ses valeurs (famille, graisse, taille, interligne, approche) sont lues sur l'élément
// rendu. La colonne « Déclaration » recopie la règle de src/assets/charte.css.
import { planche, apresAffichage, source, code } from "./outils.js";
import { filtre } from "../composants/rendu.js";

const accent = (s) => filtre("accent", s);

// [nom, où sur le site, déclaration dans charte.css, HTML du spécimen ; l'élément mesuré porte data-mesure]
const NIVEAUX = [
  [
    "Accroche du hero (temps fort)",
    "Hero de l'accueil, `.hero-accroche`",
    "Manrope 800, `clamp(40px, min(8.3vw, 12.5vh), 120px)`, interligne .92, approche -.04em, blanc",
    `<div class="hero" style="height:auto;max-height:none;min-height:0;padding:32px 24px"><p class="hero-accroche" data-mesure style="margin:0">${accent("Un logiciel qui *épouse* vos processus")}</p></div>`
  ],
  [
    "Titre de page (H1)",
    "Hero sobre des pages internes, `.sect-hero h1`",
    "Manrope 800, `clamp(32px, 3.9vw, 56px)`, interligne 1.04, approche -.025em, encre",
    `<div class="sect-hero" style="padding:0!important"><h1 data-mesure style="margin:0">Offrez une expérience ${accent("*fluide et inclusive*")}</h1></div>`
  ],
  [
    "Titre de section (H2)",
    "`.sec-titre`",
    "Manrope 800, `clamp(32px, 3.9vw, 56px)`, interligne 1.04, approche -.025em, encre",
    `<h2 class="sec-titre" data-mesure style="margin:0">On connaît déjà ${accent("*votre métier*")}</h2>`
  ],
  [
    "Chiffre clé",
    "Bandeau de chiffres, `.chiffres b`",
    "Manrope 800, `clamp(44px, 6vw, 96px)`, interligne 1, approche -.03em, blanc sur nuit",
    `<div class="chiffres" style="padding:24px"><div class="container" style="padding:0"><div><b data-mesure>48h</b><span>Pour un premier retour</span></div></div></div>`
  ],
  [
    "Chapô de page",
    "Hero sobre, `.sect-hero .accroche` et `.hero-interne .chapo`",
    "Asap 400, 20px, interligne 1.55, texte secondaire, 760px maximum",
    `<div class="sect-hero" style="padding:0!important"><p class="accroche" data-mesure style="margin:0">Évaluez la qualité des interfaces de votre produit numérique pour optimiser l'ergonomie et la navigation.</p></div>`
  ],
  [
    "Sous-titre de section",
    "`.sec-sous`",
    "Asap 400, `clamp(18px, 1.5vw, 22px)`, interligne 1.55, texte secondaire, 720px maximum",
    `<p class="sec-sous" data-mesure style="margin:0">On a déjà développé des logiciels sur mesure dans votre secteur : on gagne du temps ensemble dès la première réunion.</p>`
  ],
  [
    "Titre de carte (H3)",
    "Cartes des parcours et des secteurs, étapes : `.porte h3`, `.secteur-carte h3`, `.etape h3`",
    "Manrope 700, 22px, encre ; interligne 1.2 sur `.porte h3` seulement",
    `<div class="porte" style="padding:0;background:none;border:0"><h3 data-mesure style="margin:0">Comprendre votre métier</h3></div>`
  ],
  [
    "Question de FAQ",
    "`.faq summary`",
    "Manrope 700, 20px, encre",
    `<div class="faq"><details><summary data-mesure>Combien coûte un logiciel sur mesure ?</summary><p>Ça dépend du périmètre.</p></details></div>`
  ],
  [
    "Texte courant",
    "`body`",
    "Asap 400, 17px (16px sous 768px), interligne 1.55, couleur texte",
    `<p data-mesure style="margin:0;max-width:720px">Ateliers avec vos équipes terrain. On repart avec vos processus réels, pas une liste de fonctionnalités. Les <a href="#">liens dans le texte</a> sont en rouge texte.</p>`
  ],
  [
    "Surtitre (étiquette de section)",
    "`.eyebrow`, `.surtitre`",
    "Manrope 700, 13px, approche .08em, capitales, rouge texte",
    `<p class="eyebrow" data-mesure style="margin:0">Vos métiers</p>`
  ],
  [
    "Bouton",
    "`.btn` (`.btn-sm` : 15px)",
    "Manrope 700, 16px, interligne 1, hauteur 48px minimum",
    `<a class="btn btn-primary" data-mesure href="#">Parlons de votre projet</a>`
  ],
  [
    "Note et fil d'Ariane",
    "`.fil-ariane`, `.logos-note`",
    "Asap 400, 14px, texte secondaire",
    `<nav class="fil-ariane" data-mesure>Accueil › Prestations › Audit UX</nav>`
  ]
];


function mesurer(racine) {
  racine.querySelectorAll("[data-niveau]").forEach((bloc) => {
    const el = bloc.querySelector("[data-mesure]");
    const cs = getComputedStyle(el);
    const famille = cs.fontFamily.split(",")[0].replace(/["']/g, "");
    const taille = parseFloat(cs.fontSize);
    const inter = cs.lineHeight === "normal" ? "normal" : (parseFloat(cs.lineHeight) / taille).toFixed(2);
    const approche = cs.letterSpacing === "normal" ? "0" : (parseFloat(cs.letterSpacing) / taille).toFixed(3) + "em";
    const charge = document.fonts
      ? [...document.fonts].some((f) => f.family.replace(/["']/g, "") === famille && f.status === "loaded")
      : true;
    bloc.querySelector(".sb4-mesures").innerHTML =
      `<b>${famille}</b> ${cs.fontWeight}${charge ? "" : ' <span class="sb4-ko">(police non chargée, repli affiché)</span>'}` +
      ` · ${Math.round(taille * 10) / 10}px · interligne ${inter} · approche ${approche}`;
  });
}

export default {
  title: "Fondations/Typographie",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Deux familles, chargées depuis Google Fonts comme sur le site (`base.njk`) : **Manrope** 700 et 800 " +
          "pour les titres, chiffres, surtitres et boutons (`--titre`), **Asap** 400 et 600 pour le texte (`--corps`). " +
          "Pas d'italique ni de serif : `charte.css` remet tout en style droit et remplace l'ancienne police serif " +
          "(`--serif`) par Manrope.\n\n" +
          "Chaque niveau ci-dessous est rendu avec les classes du site ; la ligne grise donne les valeurs mesurées " +
          "dans la page, à la largeur du cadre (les tailles en `clamp()` varient avec elle).\n\n" +
          "Source : `src/assets/charte.css` (jetons `--titre` et `--corps`, règles `body`, `.sec-titre`, `.sec-sous`, " +
          "`.eyebrow`, `.hero-accroche`, `.sect-hero`, `.chiffres`, `.faq`, `.btn`)."
      },
      story: { height: "2100px" }
    }
  }
};

export const Niveaux = {
  name: "Niveaux de texte",
  render: () => {
    const racine = planche(
      `<h2 class="sb4-t">Familles</h2>
<div class="sb4-grille" style="grid-template-columns:repeat(auto-fill,minmax(300px,1fr))">
  <div style="border-top:2px solid var(--encre);padding-top:16px"><p class="eyebrow">Titres · --titre</p>
    <p style="font:800 44px/1.05 var(--titre);color:var(--encre);margin:8px 0">Manrope 800</p>
    <p style="font:700 28px/1.2 var(--titre);color:var(--encre);margin:0">Manrope 700</p></div>
  <div style="border-top:2px solid var(--encre);padding-top:16px"><p class="eyebrow">Texte · --corps</p>
    <p style="font:400 22px/1.4 var(--corps);margin:8px 0">Asap 400, texte courant</p>
    <p style="font:600 22px/1.4 var(--corps);margin:0">Asap 600, citations</p></div>
</div>
<h2 class="sb4-t">Niveaux</h2>` +
        NIVEAUX.map(
          ([nom, ou, decl, html]) => `<div data-niveau style="border-top:1px solid var(--bordure);padding:24px 0">
  <p style="margin:0 0 4px;font:700 15px/1.3 var(--titre);color:var(--encre)">${nom} <span style="font-weight:400;font-family:var(--corps);color:var(--muted)">· ${code(ou)}</span></p>
  <p style="margin:0 0 16px;font-size:14px;color:var(--texte-2)">Déclaration : ${code(decl)}</p>
  ${html}
  <p class="sb4-mesures" style="margin:12px 0 0;font-size:13.5px;color:var(--muted)"></p>
</div>`
        ).join("") +
        source("<code>src/assets/charte.css</code> et <code>.storybook/preview.js</code> (polices de <code>base.njk</code>).")
    );
    apresAffichage(() => mesurer(racine));
    return racine;
  }
};
