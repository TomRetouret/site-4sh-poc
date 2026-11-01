// Bloc « frise_methode » : src/_includes/composants/blocs/frise_methode.njk
// Champs : admin/config/blocs/frise_methode.yml.
import { rendreBloc } from "../../.storybook/4sh/rendre-bloc.js";
import { blocDe, PAGES } from "../../.storybook/4sh/contenus-site.js";

export default {
  title: "Blocs/Méthode et étapes/Frise de méthode",
  tags: ["autodocs"],
  render: (args, { parameters }) => rendreBloc("frise_methode", args, parameters.bloc),
  parameters: {
    ...PAGES.institutionnel,
    docs: {
      description: {
        component:
          "Frise de 3 à 6 étapes sur fond sombre, numéro en grand et phase à côté. Une ancre facultative permet à un bouton " +
          "d'y descendre (`#methode`).\n\n" +
          "**Proposé sur** : Notre démarche, Notre entreprise / Company, pages de démonstration.\n\n" +
          "**Règles éditoriales** : surtitre 30 caractères ; titre 60 caractères, un mot entre `*astérisques*` s'affiche en rouge ; " +
          "sous-titre 50 mots ; chaque étape : numéro (obligatoire), phase courte, titre de 40 caractères, texte de 35 mots."
      },
      story: { height: "620px" }
    }
  },
  argTypes: {
    ancre: { name: "Ancre de la section", control: "text", description: "Nom court, par exemple `methode` pour `#methode`. Facultatif." },
    surtitre: { name: "Surtitre", control: "text", description: "30 caractères maximum." },
    titre: { name: "Titre", control: "text", description: "Obligatoire, 60 caractères maximum. Un mot entre *astérisques* s'affiche en rouge." },
    sous_titre: { name: "Sous-titre", control: "text", description: "50 mots maximum." },
    etapes: {
      name: "Étapes",
      control: "object",
      description: "De 3 à 6 éléments `{ numero, phase, titre, texte }` ; numéro, titre (40 caractères) et texte (35 mots) obligatoires."
    }
  }
};

// Les 4D de Notre démarche (src/_data/contenus/fr/notre_demarche.json).
export const NotreDemarche = {
  name: "Notre démarche",
  args: blocDe("notre_demarche", "frise_methode")
};
