// Fondations / Couleurs : les jetons de couleur de src/assets/charte.css (bloc :root).
// Valeurs, échantillons et contrastes sont lus et calculés dans la page, sur les feuilles
// du site : si charte.css change, la planche change.
import { planche, apresAffichage, contraste, verdict, jeton, source, code } from "./outils.js";

// Usages : commentaires de charte.css quand il y en a (entre guillemets), sinon les règles
// de charte.css qui emploient le jeton.
const GROUPES = [
  {
    titre: "Marque",
    jetons: [
      ["--signal", "#ED203D", "« losange, plans expressifs, filets d'accent. Jamais en texte courant sur clair (4,31:1) ». Mot mis en valeur sur fond nuit (`.hero em.accent`, `.contact-final em.accent`)."],
      ["--rouge", "#B8202C", "« rouge texte, liens, bouton principal (6,4:1 sur blanc) ». Mot mis en valeur sur clair, surtitres (`.eyebrow`)."],
      ["--rouge-fonce", "#8E1620", "Survol du bouton principal (`.btn-primary:hover`)."],
      ["--encre", "#14171C", "Titres (`.sec-titre`), bouton secondaire (`.btn-ghost`), contour de focus, coches, filets des étapes."],
      ["--nuit", "#0B0D10", "Fond des temps forts expressifs : hero de l'accueil, chiffres clés, bloc contact, pied de page."]
    ]
  },
  {
    titre: "Texte et fonds",
    jetons: [
      ["--texte", "#14171C", "Texte courant (`body`)."],
      ["--texte-2", "#3A4048", "Sous-titres (`.sec-sous`), chapô des pages internes, textes de cartes, fil d'Ariane."],
      ["--muted", "#5E656E", "« notes, bord de champ (5,9:1) ». Numéros d'étape, titres de colonnes du menu."],
      ["--sur-nuit", "#B8C0C8", "« texte secondaire sur nuit (10,6:1) ». Chapô du hero, liens du pied de page."],
      ["--fond", "#FFFFFF", "Fond de page (`body`)."],
      ["--fond-doux", "#F4F5F7", "Sections alternées (`.fond-doux`), cartes des trois parcours (`.porte`), survol du menu."],
      ["--bordure", "#E3E5E8", "Filets de 1 px : cartes, en-tête, FAQ, grilles."]
    ]
  },
  {
    titre: "Offres",
    note: "Chaque offre a une couleur de repère (barre, filet, losange) et une couleur de texte, seule autorisée pour un texte sur clair.",
    jetons: [
      ["--build", "#F26B21", "4SH Build : barre d'étiquette, filet de carte, losange du menu (`.famille-build`)."],
      ["--build-texte", "#A9460F", "4SH Build : surtitre et numéros en couleur d'offre (`--accent-texte`)."],
      ["--run", "#24A9C2", "4SH Run : repères (`.famille-run`)."],
      ["--run-texte", "#0E6F82", "4SH Run : texte en couleur d'offre."],
      ["--learning", "#7C4DDB", "4SH Learning : repères, et boutons des pages Formations (`.learning .btn-primary`)."],
      ["--learning-texte", "#5B2DB0", "4SH Learning : texte en couleur d'offre, mot mis en valeur des pages Formations."],
      ["--learning-nuit", "#9A75EC", "4SH Learning sur fond nuit (`--accent-clair`, mot mis en valeur sur nuit)."]
    ]
  },
  {
    titre: "Alias conservés pour styles.css",
    note: "Anciens noms de styles.css, redéfinis par charte.css pour que les anciennes règles prennent les couleurs de la charte. Ne pas les employer dans un nouveau composant.",
    jetons: [
      ["--rouge-pale", "#F4F5F7", "Vaut le fond doux."],
      ["--carte", "#FFFFFF", "Vaut le fond."],
      ["--creme", "#F4F5F7", "Vaut le fond doux."],
      ["--sombre", "#0B0D10", "Vaut la nuit."],
      ["--sombre-2", "#14171C", "Vaut l'encre."],
      ["--violet", "#7C4DDB", "Vaut --learning."],
      ["--cyan", "#24A9C2", "Vaut --run."]
    ]
  }
];

const FONDS = [
  ["blanc", "#FFFFFF"],
  ["fond doux", "#F4F5F7"],
  ["nuit", "#0B0D10"]
];


function tableau(groupe) {
  const lignes = groupe.jetons
    .map(
      ([nom, declare, usage]) => `<tr data-jeton="${nom}" data-declare="${declare}">
  <td style="width:96px"><span class="sb4-ech" style="display:block;width:80px;height:56px;background:var(${nom});border:1px solid var(--bordure)"></span></td>
  <td><code>${nom}</code><br><b class="sb4-valeur" style="font-family:var(--titre)">${declare}</b></td>
  <td style="max-width:420px">${code(usage)}</td>
  ${FONDS.map(() => `<td class="sb4-c"></td>`).join("")}
</tr>`
    )
    .join("");
  return `<h2 class="sb4-t">${groupe.titre}</h2>
${groupe.note ? `<p class="sb4-note">${groupe.note}</p>` : ""}
<table class="sb4-tab"><thead><tr><th></th><th>Jeton</th><th>Usage</th>${FONDS.map(([n]) => `<th>Sur ${n}</th>`).join("")}</tr></thead><tbody>${lignes}</tbody></table>`;
}

function remplir(racine) {
  racine.querySelectorAll("tr[data-jeton]").forEach((tr) => {
    const valeur = jeton(tr.dataset.jeton) || tr.dataset.declare;
    const v = tr.querySelector(".sb4-valeur");
    v.textContent = valeur.toUpperCase();
    if (valeur.toUpperCase() !== tr.dataset.declare.toUpperCase()) {
      v.insertAdjacentHTML("afterend", ` <span class="sb4-ko">(attendu ${tr.dataset.declare})</span>`);
    }
    tr.querySelectorAll(".sb4-c").forEach((td, i) => (td.innerHTML = verdict(contraste(valeur, FONDS[i][1]))));
  });
}

export default {
  title: "Fondations/Couleurs",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Les jetons de couleur de la charte graphique 4SH v1.1, tels que `src/assets/charte.css` les déclare " +
          "(bloc `:root`, chargé après toutes les autres feuilles). Les échantillons et les valeurs affichées sont " +
          "lus dans la page ; les contrastes sont calculés selon WCAG 2.x (AA : 4,5:1 pour le texte courant, " +
          "3:1 pour les grands textes et les éléments graphiques).\n\n" +
          "À retenir : **#B8202C** (`--rouge`) pour le bouton principal, les liens et tout texte rouge sur clair ; " +
          "**#ED203D** (`--signal`) réservé aux accents (losange, plans, filets) et au mot mis en valeur sur nuit, " +
          "jamais en texte courant sur clair.\n\n" +
          "Source : `src/assets/charte.css` (`:root`, commentaires des jetons, classes `.famille-*`)."
      },
      story: { height: "1500px" }
    }
  }
};

export const Jetons = {
  name: "Jetons de couleur",
  render: () => {
    const racine = planche(
      GROUPES.map(tableau).join("") +
        source("<code>src/assets/charte.css</code>, bloc <code>:root</code> (charte graphique 4SH v1.1).")
    );
    apresAffichage(() => remplir(racine));
    return racine;
  }
};

// Couleur d'offre : les classes famille-* de charte.css changent l'accent de la page.
const FAMILLES = { "": "Rouge de marque (par défaut)", build: "4SH Build", run: "4SH Run", formation: "4SH Learning" };
const NOMS_OFFRE = { "": "4SH", build: "4SH Build", run: "4SH Run", formation: "4SH Learning" };

export const CouleurOffre = {
  name: "Couleur d'offre (accent)",
  args: { famille: "build" },
  argTypes: {
    famille: {
      name: "Famille de la page",
      control: "select",
      options: Object.keys(FAMILLES),
      labels: FAMILLES,
      description:
        "Classe `famille-*` posée sur le `<body>` par `base.njk` selon l'offre de la page. " +
        "Elle redéfinit `--accent`, `--accent-texte`, `--accent-fonce` et `--accent-clair`."
    }
  },
  parameters: { docs: { story: { height: "640px" } } },
  render: ({ famille }) => {
    const racine = planche(`
<div class="${famille ? "famille-" + famille : ""}">
  <h2 class="sb4-t">${FAMILLES[famille]}</h2>
  <p class="sb4-note">La couleur d'offre colore les repères (barre, filet, losange) et le petit texte d'étiquette.
  Elle ne colore jamais un bouton (exception : pages Formations) ni le mot mis en valeur.</p>
  <table class="sb4-tab"><thead><tr><th></th><th>Jeton</th><th>Valeur appliquée</th><th>Sur blanc</th></tr></thead><tbody>
    ${["--accent", "--accent-texte", "--accent-fonce", "--accent-clair"]
      .map((n) => `<tr data-accent="${n}"><td style="width:96px"><span style="display:block;width:80px;height:40px;background:var(${n})"></span></td><td><code>${n}</code></td><td class="v"></td><td class="c"></td></tr>`)
      .join("")}
  </tbody></table>
  <p><span class="eyebrow eyebrow-offre"><span class="barre" aria-hidden="true"></span>${NOMS_OFFRE[famille]} · Étiquette d'offre</span></p>
  <div class="porte" style="max-width:420px;margin-top:16px"><p class="offre">${NOMS_OFFRE[famille]}</p><h3>Carte de parcours</h3><p>Filet supérieur de 4 px en couleur d'offre.</p></div>
  <p style="margin-top:24px"><a class="btn btn-primary" href="#">Bouton principal</a></p>
</div>` + source("<code>src/assets/charte.css</code> : <code>.famille-build</code>, <code>.famille-run</code>, <code>.famille-formation</code>, <code>.eyebrow-offre</code>, <code>.porte</code>, boutons du lot 2."));
    apresAffichage(() => {
      const cadre = racine.querySelector("div[class]") || racine;
      racine.querySelectorAll("tr[data-accent]").forEach((tr) => {
        const v = getComputedStyle(cadre).getPropertyValue(tr.dataset.accent).trim();
        tr.querySelector(".v").textContent = v.toUpperCase();
        tr.querySelector(".c").innerHTML = verdict(contraste(v, "#FFFFFF"));
      });
    });
    return racine;
  }
};
