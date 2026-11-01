// Bloc « faq » : src/_includes/composants/blocs/faq.njk
// Champs : admin/config/blocs/faq.yml.
import { rendreBloc } from "../../.storybook/4sh/rendre-bloc.js";
import { blocDe, PAGES } from "../../.storybook/4sh/contenus-site.js";

export default {
  title: "Blocs/Texte/Questions fréquentes",
  tags: ["autodocs"],
  render: (args, { parameters }) => rendreBloc("faq", args, parameters.bloc),
  parameters: {
    docs: {
      description: {
        component:
          "Questions fréquentes en accordéon. Sur les pages d'offre (gabarit `offre`), le balisage reprend celui des pages intérieures.\n\n" +
          "**Proposé sur** : accueil, pages d'offre, Notre démarche, Notre entreprise / Company, pages de démonstration.\n\n" +
          "**Règles éditoriales** : titre de 60 caractères au plus, un mot entre `*astérisques*` s'affiche en rouge ; " +
          "chaque question a sa réponse (deux champs obligatoires)."
      },
      story: { height: "620px" }
    }
  },
  argTypes: {
    titre: { name: "Titre", control: "text", description: "Obligatoire, 60 caractères maximum. Un mot entre *astérisques* s'affiche en rouge." },
    sous_titre: { name: "Sous-titre", control: "text" },
    questions: {
      name: "Questions",
      control: "object",
      description: "Liste de `{ question, reponse }`, les deux obligatoires."
    }
  }
};

// Questions de l'accueil (src/_data/contenus/fr/accueil.json).
export const Accueil = {
  name: "Accueil",
  args: blocDe("accueil", "faq")
};

// Questions de la page Logiciel métier, gabarit des pages d'offre.
export const PageOffre = {
  name: "Page d'offre",
  args: blocDe("logiciel_metier", "faq"),
  parameters: PAGES.offre
};
