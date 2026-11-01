// Bloc « cartes_secteurs » : src/_includes/composants/blocs/cartes_secteurs.njk
// Champs : admin/config/blocs/cartes_secteurs.yml.
import { rendreBloc, blocExemple } from "../../.storybook/4sh/rendre-bloc.js";

export default {
  title: "Blocs/Cartes/Cartes secteurs",
  tags: ["autodocs"],
  render: (args, { parameters }) => rendreBloc("cartes_secteurs", args, parameters.bloc),
  parameters: {
    docs: {
      description: {
        component:
          "Carrousel de cartes, une par secteur d'activité, chacune avec un lien vers la page du secteur. " +
          "Dans Storybook, le script des carrousels (`script.js`) n'est pas chargé : la piste reste défilable à la main.\n\n" +
          "**Proposé sur** : accueil (français et anglais), pages d'offre, pages de démonstration.\n\n" +
          "**Règles éditoriales** : titre avec un mot entre `*astérisques*` pour l'afficher en rouge ; chaque carte a un titre " +
          "obligatoire, un texte et un lien facultatifs."
      },
      story: { height: "560px" }
    }
  },
  argTypes: {
    surtitre: { name: "Surtitre", control: "text" },
    titre: { name: "Titre", control: "text", description: "Obligatoire. Un mot entre *astérisques* s'affiche en rouge." },
    sous_titre: { name: "Sous-titre", control: "text" },
    cartes: {
      name: "Cartes",
      control: "object",
      description: "Liste de `{ titre, texte, lien: { texte, lien } }` ; titre obligatoire."
    }
  }
};

// Secteurs de l'accueil (src/_data/contenus/fr/accueil.json).
export const Accueil = {
  name: "Accueil",
  args: blocExemple("accueil", "cartes_secteurs")
};
