// Bloc « technologies » : src/_includes/composants/blocs/technologies.njk
// Champs : admin/config/blocs/technologies.yml.
import { rendreBloc } from "../../.storybook/4sh/rendre-bloc.js";
import { blocDe, PAGES } from "../../.storybook/4sh/contenus-site.js";

export default {
  title: "Blocs/Cartes/Technologies",
  tags: ["autodocs"],
  render: (args, { parameters }) => rendreBloc("technologies", args, parameters.bloc),
  parameters: {
    docs: {
      description: {
        component:
          "Technologies utilisées, en **nuage de mots** (noms seuls, accueil) ou en **cartes avec logo** (logo, nom et lien " +
          "« En savoir plus » sur fond sombre, styles des pages d'offre `logiciel-metier.css`).\n\n" +
          "**Proposé sur** : accueil, pages d'offre, Notre démarche, Notre entreprise / Company, pages de démonstration.\n\n" +
          "**Règles éditoriales** : titre avec un mot entre `*astérisques*` pour l'afficher en rouge ; en cartes, 4 à 8 technologies, " +
          "logo SVG carré sur fond transparent (le nom sert de texte alternatif), lien commençant par `/` (vide : pas de lien).\n\n" +
          "**À savoir** : la charte 2026 (`charte.css`) redéfinit `.section-sombre` en fond blanc ; en cartes, les logos " +
          "blancs de la page Logiciel métier deviennent invisibles, sur le site comme ici."
      },
      story: { height: "520px" }
    }
  },
  argTypes: {
    surtitre: { name: "Surtitre", control: "text" },
    titre: { name: "Titre", control: "text", description: "Obligatoire. Un mot entre *astérisques* s'affiche en rouge." },
    sous_titre: { name: "Sous-titre", control: "text" },
    affichage: {
      name: "Affichage",
      control: "inline-radio",
      options: ["nuage", "cartes"],
      description: "`nuage` : noms seuls. `cartes` : logo, nom et lien sur fond sombre (4 à 8 technologies). Vide : nuage.",
      table: { defaultValue: { summary: "nuage" } }
    },
    technos: {
      name: "Technologies",
      control: "object",
      description: "Liste de `{ nom, lien, logo }` ; nom obligatoire ; logo en affichage cartes uniquement."
    }
  }
};

// Nuage de l'accueil (src/_data/contenus/fr/accueil.json).
export const Nuage = {
  name: "Nuage de mots (accueil)",
  args: { affichage: "nuage", ...blocDe("accueil", "technologies") }
};

// Cartes avec logo de la page Logiciel métier (src/_data/contenus/fr/logiciel_metier.json).
export const Cartes = {
  name: "Cartes avec logo (page d'offre)",
  args: blocDe("logiciel_metier", "technologies"),
  parameters: { ...PAGES.offre, docs: { story: { height: "640px" } } }
};
