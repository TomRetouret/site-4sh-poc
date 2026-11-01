// Aperçu du Storybook 4SH : feuilles de styles et polices du site, chargées comme dans
// src/_includes/base.njk (même ordre). Les adresses /assets/... sont celles du site :
// servies par Storybook en développement, par le site lui-même une fois publié sous /storybook/.
const POLICES = "https://fonts.googleapis.com/css2?family=Asap:wght@400;600&family=Manrope:wght@700;800&display=swap";
const AVANT = ["/assets/styles.css"];
const APRES = ["/assets/charte.css", "/assets/mouvement.css"];

function lien(href) {
  const l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = href;
  l.dataset.sb4sh = href;
  return l;
}

// Remet les feuilles dans l'ordre de base.njk : styles.css, feuilles de la page
// (paramètre feuilles, l'équivalent de extraCss), charte.css, mouvement.css.
function chargerStyles(feuilles) {
  const voulues = [POLICES, ...AVANT, ...(feuilles || []), ...APRES];
  const actuelles = [...document.head.querySelectorAll("link[data-sb4sh]")].map((l) => l.dataset.sb4sh);
  if (voulues.join("|") === actuelles.join("|")) return;
  document.head.querySelectorAll("link[data-sb4sh]").forEach((l) => {
    if (!voulues.includes(l.dataset.sb4sh)) l.remove();
  });
  voulues.forEach((href) => {
    const existant = document.head.querySelector(`link[data-sb4sh="${href}"]`);
    document.head.appendChild(existant || lien(href));
  });
}

/** @type { import('@storybook/html-vite').Preview } */
const preview = {
  decorators: [
    (story, { parameters }) => {
      chargerStyles(parameters.feuilles);
      return story();
    }
  ],
  parameters: {
    layout: "fullscreen",
    controls: { expanded: true, sort: "none" },
    docs: {
      // Chaque exemple de la documentation dans son propre cadre : les styles du site
      // ne débordent pas sur la page de documentation.
      story: { inline: false, height: "520px" },
      source: { type: "dynamic", language: "html" }
    },
    options: {
      storySort: { order: ["Design system 4SH", "Fondations", "Composants", "Blocs"] }
    }
  }
};

export default preview;
