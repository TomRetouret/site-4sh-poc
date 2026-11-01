// Composants / Fil d'Ariane : macro fil_ariane(courant, parents) de src/_includes/composants/page.njk.
import { appeler, enSection } from "./rendu.js";

export default {
  title: "Composants/Fil d'Ariane",
  tags: ["autodocs"],
  render: ({ courant, parents, fond }) =>
    enSection(appeler("page", "fil_ariane", [courant, parents]), {
      classe: fond === "nuit" ? "sur-sombre" : "",
      style: "padding:24px 0" + (fond === "nuit" ? ";background:var(--nuit)" : "")
    }),
  parameters: {
    feuilles: ["/assets/secteurs.css"],
    docs: {
      description: {
        component:
          "Fil d'Ariane des pages internes : « Accueil » est ajouté d'office, les niveaux intermédiaires sont des liens, " +
          "la page en cours n'est pas cliquable. Asap 14 px, texte secondaire, liens soulignés de 44 px de haut " +
          "(cible tactile) ; sur fond sombre, gris clair `--sur-nuit`.\n\n" +
          "Appel : `{{ fil_ariane(\"Audit UX & accessibilité\", [{ label: \"Prestations\", url: \"/prestations/\" }]) }}`. " +
          "Le hero de `page.njk` l'affiche lui-même (paramètre `ariane`).\n\n" +
          "Source : `src/_includes/composants/page.njk` (macro `fil_ariane`), `src/assets/charte.css` (`.fil-ariane`)."
      },
      story: { height: "140px" }
    }
  },
  argTypes: {
    courant: { name: "Page en cours", control: "text" },
    parents: { name: "Niveaux intermédiaires", control: "object", description: "`[{ label, url }]`." },
    fond: { name: "Fond", control: "inline-radio", options: ["clair", "nuit"] }
  },
  args: { courant: "Celebrads", parents: [{ label: "Secteurs", url: "/" }], fond: "clair" }
};

// Comme secteur-libre.njk (src/content/pages-secteurs/celebrads.md).
export const PageSecteur = { name: "Page de secteur" };
export const SansNiveauIntermediaire = { name: "Sans niveau intermédiaire", args: { courant: "Audit UX & accessibilité", parents: [] } };
export const SurFondSombre = { name: "Sur fond sombre", args: { fond: "nuit" } };
