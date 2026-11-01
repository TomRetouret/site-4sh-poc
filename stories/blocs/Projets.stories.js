// Bloc « projets » : src/_includes/composants/blocs/projets.njk
// Champs : admin/config/blocs/projets.yml.
import { rendreBloc, blocExemple } from "../../.storybook/4sh/rendre-bloc.js";

export default {
  title: "Blocs/Projets et références/Projets",
  tags: ["autodocs"],
  render: (args, { parameters }) => rendreBloc("projets", args, parameters.bloc),
  parameters: {
    docs: {
      description: {
        component:
          "Carrousel de réalisations : visuel, secteur, client, description, témoignage relié, chiffres du projet et bouton, " +
          "puis un bouton sous le carrousel. Les témoignages viennent de la collection Témoignages (`src/_data/temoignages/`), " +
          "fournie au bloc par l'aiguilleur (`ctx.temoignages`). Dans Storybook, le script des carrousels n'est pas chargé.\n\n" +
          "**Proposé sur** : accueil (français et anglais), pages d'offre, pages de démonstration.\n\n" +
          "**Règles éditoriales** : titre et chiffres avec un mot entre `*astérisques*` pour l'afficher en rouge ; " +
          "client obligatoire ; texte alternatif du visuel obligatoire sauf image décorative ; un témoignage se crée dans " +
          "la collection Témoignages, puis se choisit ici."
      },
      story: { height: "720px" }
    }
  },
  argTypes: {
    surtitre: { name: "Surtitre", control: "text" },
    titre: { name: "Titre", control: "text", description: "Obligatoire. Un mot entre *astérisques* s'affiche en rouge." },
    sous_titre: { name: "Sous-titre", control: "text" },
    projets: {
      name: "Projets",
      control: "object",
      description:
        "Liste de `{ secteur, client, image: { fichier, alt, decorative, credit, cadrage }, description, temoignage, " +
        "chiffres: [{ valeur, libelle }], bouton: { texte, lien } }` ; client obligatoire ; `temoignage` : slug d'une " +
        "fiche Témoignages (ex. `infoport`)."
    },
    bouton_bas: {
      name: "Bouton sous le carrousel",
      control: "object",
      description: "`{ texte, lien }`, lien par défaut `/references/`."
    }
  }
};

// Réalisations de l'accueil (src/_data/contenus/fr/accueil.json).
export const Accueil = {
  name: "Accueil",
  args: blocExemple("accueil", "projets")
};
