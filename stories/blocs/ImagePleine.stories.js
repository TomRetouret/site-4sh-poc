// Bloc « image_pleine » : src/_includes/composants/blocs/image_pleine.njk (feuille /assets/blocs.css)
// Champs : admin/config/blocs/image_pleine.yml.
import { rendreBloc } from "../../.storybook/4sh/rendre-bloc.js";
import { blocDemo, PAGES } from "../../.storybook/4sh/contenus-site.js";

export default {
  title: "Blocs/Texte/Image pleine largeur",
  tags: ["autodocs"],
  render: (args, { parameters }) => rendreBloc("image_pleine", args, parameters.bloc),
  parameters: {
    ...PAGES.demo,
    docs: {
      description: {
        component:
          "Image sur toute la largeur de l'écran, en bandeau panoramique recadré ou entière, avec légende et crédit facultatifs. " +
          "Feuille propre `blocs.css`, chargée avec le bloc.\n\n" +
          "**Proposé sur** : pages d'offre, Notre démarche, Notre entreprise / Company, pages de démonstration.\n\n" +
          "**Règles éditoriales** : image paysage de **2400 px de large minimum** ; texte alternatif d'une phrase (120 caractères) " +
          "sauf image décorative ; légende de 120 caractères au plus ; en bandeau, le réglage Cadrage choisit la partie conservée.\n\n" +
          "Données : page de démonstration `src/demo/essai-blocs.md` (légende marquée « [DÉMO] »)."
      },
      story: { height: "520px" }
    }
  },
  argTypes: {
    image: {
      name: "Image",
      control: "object",
      description:
        "Obligatoire. `{ fichier, alt, decorative, credit, cadrage }` ; paysage, 2400 px minimum. " +
        "`cadrage` : centre, haut, bas, gauche ou droite."
    },
    format: {
      name: "Format d'affichage",
      control: "inline-radio",
      options: ["bandeau", "entiere"],
      description: "`bandeau` : bande panoramique recadrée. `entiere` : aucune partie coupée.",
      table: { defaultValue: { summary: "bandeau" } }
    },
    legende: { name: "Légende", control: "text", description: "120 caractères maximum. Vide : pas de légende." }
  }
};

// Bandeau panoramique avec légende et crédit (src/demo/essai-blocs.md).
export const Bandeau = {
  name: "Bandeau panoramique",
  args: blocDemo("image_pleine")
};

// Même image, affichée entière.
export const Entiere = {
  name: "Image entière",
  args: { ...blocDemo("image_pleine"), format: "entiere" },
  parameters: { docs: { story: { height: "900px" } } }
};
