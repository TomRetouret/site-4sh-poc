// Bloc « texte_simple » : src/_includes/composants/blocs/texte_simple.njk
// Champs : admin/config/blocs/texte_simple.yml.
import { rendreBloc } from "../../.storybook/4sh/rendre-bloc.js";
import { blocDe, PAGES } from "../../.storybook/4sh/contenus-site.js";

export default {
  title: "Blocs/Texte/Texte simple",
  tags: ["autodocs"],
  render: (args, { parameters }) => rendreBloc("texte_simple", args, parameters.bloc),
  parameters: {
    ...PAGES.offre,
    docs: {
      description: {
        component:
          "Section de texte courant : surtitre, titre et texte mis en forme (gras, liens, listes). " +
          "Styles des pages d'offre (`logiciel-metier.css`).\n\n" +
          "**Proposé sur** : pages d'offre, Notre démarche, Notre entreprise / Company, pages de démonstration.\n\n" +
          "**Règles éditoriales** : surtitre 30 caractères ; titre 60 caractères, un mot entre `*astérisques*` s'affiche en rouge ; " +
          "texte de 300 mots au plus, gras, liens et listes uniquement, une ligne vide entre deux paragraphes."
      },
      story: { height: "480px" }
    }
  },
  argTypes: {
    surtitre: { name: "Surtitre", control: "text", description: "30 caractères maximum." },
    titre: { name: "Titre", control: "text", description: "Obligatoire, 60 caractères maximum. Un mot entre *astérisques* s'affiche en rouge." },
    texte: {
      name: "Texte",
      control: "text",
      description: "Obligatoire. Markdown : gras, liens et listes. Une ligne vide entre deux paragraphes. 300 mots maximum."
    }
  }
};

// « Pourquoi opter pour un logiciel métier ? » (src/_data/contenus/fr/logiciel_metier.json).
export const LogicielMetier = {
  name: "Page d'offre (Logiciel métier)",
  args: blocDe("logiciel_metier", "texte_simple")
};

// « Pour qui ? », second texte de la même page.
export const PourQui = {
  name: "Page d'offre, second texte",
  args: blocDe("logiciel_metier", "texte_simple", 1)
};

// « Une passion, le développement » (src/_data/contenus/fr/notre_entreprise.json).
export const NotreEntreprise = {
  name: "Notre entreprise",
  args: blocDe("notre_entreprise", "texte_simple")
};
