// Bloc « texte_image » : src/_includes/composants/blocs/texte_image.njk (feuille /assets/blocs.css)
// Champs : admin/config/blocs/texte_image.yml.
import { rendreBloc } from "../../.storybook/4sh/rendre-bloc.js";
import { blocDemo, PAGES } from "../../.storybook/4sh/contenus-site.js";

export default {
  title: "Blocs/Texte/Texte et image",
  tags: ["autodocs"],
  render: (args, { parameters }) => rendreBloc("texte_image", args, parameters.bloc),
  parameters: {
    ...PAGES.demo,
    docs: {
      description: {
        component:
          "Texte et image côte à côte, image à gauche ou à droite sur ordinateur, toujours au-dessus du texte sur téléphone. " +
          "Feuille propre `blocs.css`, chargée avec le bloc.\n\n" +
          "**Proposé sur** : pages d'offre, Notre démarche, Notre entreprise / Company, pages de démonstration.\n\n" +
          "**Règles éditoriales** : surtitre 30 caractères ; titre 60 caractères, un mot entre `*astérisques*` s'affiche en rouge ; " +
          "texte de 150 mots au plus (gras, liens et listes) ; image paysage de 1600 px de large minimum, **affichée en 4:3** ; " +
          "texte alternatif d'une phrase (120 caractères) sauf image décorative ; bouton de 25 caractères qui commence par un verbe.\n\n" +
          "Données : page de démonstration `src/demo/essai-blocs.md` (surtitres marqués « [DÉMO] »)."
      },
      story: { height: "560px" }
    }
  },
  argTypes: {
    surtitre: { name: "Surtitre", control: "text", description: "30 caractères maximum." },
    titre: { name: "Titre", control: "text", description: "Obligatoire, 60 caractères maximum. Un mot entre *astérisques* s'affiche en rouge." },
    texte: { name: "Texte", control: "text", description: "Obligatoire. Markdown : gras, liens et listes. 150 mots maximum." },
    image: {
      name: "Image",
      control: "object",
      description:
        "Obligatoire. `{ fichier, alt, decorative, credit, cadrage }` ; paysage, 1600 px minimum, affichée en 4:3. " +
        "`cadrage` : centre, haut, bas, gauche ou droite."
    },
    position_image: {
      name: "Position de l'image",
      control: "inline-radio",
      options: ["gauche", "droite"],
      description: "Sur ordinateur. Sur téléphone, l'image passe toujours au-dessus du texte.",
      table: { defaultValue: { summary: "gauche" } }
    },
    bouton: {
      name: "Bouton",
      control: "object",
      description: "`{ texte, lien }`, texte de 25 caractères qui commence par un verbe. Texte vide : pas de bouton."
    }
  }
};

// Image à gauche, avec bouton (src/demo/essai-blocs.md).
export const ImageAGauche = {
  name: "Image à gauche",
  args: blocDemo("texte_image", 0)
};

// Image à droite, sans bouton, cadrage haut.
export const ImageADroite = {
  name: "Image à droite",
  args: blocDemo("texte_image", 1)
};
