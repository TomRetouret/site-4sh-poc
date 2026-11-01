// Composants / Boutons et liens : classes .btn de src/assets/charte.css, et la macro
// boutons() de src/_includes/composants/blocs/_section.njk (fin de section des pages de prestation).
import { appeler, enSection } from "./rendu.js";

const FONDS = {
  clair: { classe: "", style: "padding:48px 0" },
  "fond doux": { classe: "fond-doux", style: "padding:48px 0" },
  nuit: { classe: "sur-sombre", style: "padding:48px 0;background:var(--nuit)" }
};

function bouton({ texte, lien, variante, taille }) {
  const classes = ["btn", variante === "secondaire" ? "btn-ghost" : "btn-primary", taille === "petit" ? "btn-sm" : ""]
    .filter(Boolean)
    .join(" ");
  return `<a class="${classes}" href="${lien}">${texte}</a>`;
}

export default {
  title: "Composants/Boutons et liens",
  tags: ["autodocs"],
  render: (args) => {
    const f = FONDS[args.fond] || FONDS.clair;
    return enSection(bouton(args), { ...f, famille: args.famille });
  },
  parameters: {
    docs: {
      description: {
        component:
          "Boutons du site : un `<a>` (ou `<button>`) avec `.btn` et une variante. Pas de macro dédiée : les " +
          "gabarits posent les classes, et la macro `boutons(liste)` de `blocs/_section.njk` assemble ceux des fins de section.\n\n" +
          "- **Primaire** `.btn-primary` : rouge texte `#B8202C`, survol `#8E1620`. Sur fond nuit (`.sur-sombre`, `.hero`, " +
          "`.contact-final`) : blanc, texte nuit.\n" +
          "- **Secondaire** `.btn-ghost` : contour encre, plein encre au survol ; contour blanc sur nuit.\n" +
          "- **Petit** `.btn-sm` : 44 px de haut au lieu de 48, 15 px.\n" +
          "- Manrope 700, angles vifs, sans ombre ni flèche. La couleur d'offre ne colore jamais un bouton (sauf pages Formations).\n\n" +
          "Source : `src/assets/charte.css` (« boutons », « Lot 2 »), `src/_includes/composants/blocs/_section.njk`."
      },
      story: { height: "200px" }
    }
  },
  argTypes: {
    texte: { name: "Libellé", control: "text" },
    lien: { name: "Lien", control: "text" },
    variante: { name: "Variante", control: "inline-radio", options: ["primaire", "secondaire"] },
    taille: { name: "Taille", control: "inline-radio", options: ["normal", "petit"] },
    fond: { name: "Fond", control: "inline-radio", options: Object.keys(FONDS) },
    famille: {
      name: "Famille de la page",
      control: "select",
      options: ["", "build", "run", "formation"],
      description: "Classe `famille-*` : vérifie que l'offre ne change pas la couleur du bouton (sauf `formation`, qui suit `.learning` seulement)."
    }
  },
  args: { texte: "Parlons de votre projet", lien: "/contact/", variante: "primaire", taille: "normal", fond: "clair", famille: "" }
};

export const Primaire = { name: "Primaire" };
export const Secondaire = { name: "Secondaire", args: { variante: "secondaire", texte: "Voir nos réalisations", lien: "/references/" } };
export const Petit = { name: "Petit", args: { taille: "petit", texte: "Nous contacter" } };
export const SurFondSombre = { name: "Sur fond sombre", args: { fond: "nuit" } };
export const SecondaireSurFondSombre = {
  name: "Secondaire sur fond sombre",
  args: { fond: "nuit", variante: "secondaire", texte: "Voir nos réalisations", lien: "/references/" }
};

// Macro boutons(liste) : le premier plein, les suivants en contour ; les entrées sans texte ou sans lien sont ignorées.
export const BoutonsDeSection = {
  name: "Boutons de fin de section (macro)",
  args: {
    liste: [
      { texte: "Demander un audit UX", lien: "/contact/" },
      { texte: "Voir nos références", lien: "/references/" }
    ]
  },
  argTypes: {
    liste: { name: "Boutons", control: "object", description: "`[{ texte, lien }]`. Un lien `http...` s'ouvre dans un nouvel onglet." },
    texte: { table: { disable: true } },
    lien: { table: { disable: true } },
    variante: { table: { disable: true } },
    taille: { table: { disable: true } }
  },
  parameters: { feuilles: ["/assets/secteurs.css"] },
  render: ({ liste, fond, famille }) => {
    const f = FONDS[fond] || FONDS.clair;
    return enSection(appeler("blocs/_section", "boutons", [liste]), { ...f, famille });
  }
};

// Liens texte : rouge texte dans le contenu, liens « Découvrir → » des cartes, liens soulignés d'un filet signal.
export const Liens = {
  name: "Liens",
  argTypes: {
    texte: { table: { disable: true } },
    lien: { table: { disable: true } },
    variante: { table: { disable: true } },
    taille: { table: { disable: true } }
  },
  parameters: { docs: { story: { height: "300px" } } },
  render: ({ fond, famille }) => {
    const f = FONDS[fond] || FONDS.clair;
    return enSection(
      `<p style="max-width:720px">Dans un texte, un <a href="#">lien sans classe</a> prend le rouge texte (blanc sur fond sombre).</p>
<p style="margin-top:16px"><a class="socle-lien" href="#">Voir la référence &rarr;</a> <span style="color:var(--muted);font-size:14px">· <code>.socle-lien</code>, couleur texte de l'offre</span></p>
<div class="secteur-carte" style="max-width:360px;margin-top:16px"><h3>Logistique</h3><p>Lien de carte souligné d'un filet signal de 2 px.</p><a href="#">Nos projets logistique →</a></div>`,
      { ...f, famille }
    );
  }
};
