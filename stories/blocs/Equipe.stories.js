// Bloc « equipe » : src/_includes/composants/blocs/equipe.njk
// Champs : admin/config/blocs/equipe.yml.
import { rendreBloc, blocExemple } from "../../.storybook/4sh/rendre-bloc.js";

export default {
  title: "Blocs/Équipe/Équipe (photo et texte)",
  tags: ["autodocs"],
  render: (args, { parameters }) => rendreBloc("equipe", args, parameters.bloc),
  parameters: {
    docs: {
      description: {
        component:
          "Photo de l'équipe et court texte de présentation, avec un bouton vers la page Notre entreprise.\n\n" +
          "**Proposé sur** : accueil (français et anglais), pages d'offre, Notre démarche, Notre entreprise / Company, " +
          "pages de démonstration.\n\n" +
          "**Règles éditoriales** : titre avec un mot entre `*astérisques*` pour l'afficher en rouge ; texte alternatif de la photo " +
          "obligatoire sauf image décorative (à défaut, le titre est utilisé) ; le cadrage choisit la partie conservée quand " +
          "l'image est recadrée."
      },
      story: { height: "620px" }
    }
  },
  argTypes: {
    surtitre: { name: "Surtitre", control: "text" },
    titre: { name: "Titre", control: "text", description: "Obligatoire. Un mot entre *astérisques* s'affiche en rouge." },
    texte: { name: "Texte", control: "text" },
    photo: {
      name: "Photo de l'équipe",
      control: "object",
      description: "`{ fichier, alt, decorative, credit, cadrage }` ; `cadrage` : centre, haut, bas, gauche ou droite."
    },
    bouton: {
      name: "Bouton",
      control: "object",
      description: "`{ texte, lien }`, par défaut « Notre entreprise » vers `/notre-entreprise/`."
    }
  }
};

// Équipe de l'accueil (src/_data/contenus/fr/accueil.json).
export const Accueil = {
  name: "Accueil",
  args: blocExemple("accueil", "equipe")
};
