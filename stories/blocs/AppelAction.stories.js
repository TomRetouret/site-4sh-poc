// Bloc « appel_action » : src/_includes/composants/blocs/appel_action.njk
// Champs : admin/config/blocs/appel_action.yml.
import { rendreBloc, donnee } from "../../.storybook/4sh/rendre-bloc.js";
import { PAGES } from "../../.storybook/4sh/contenus-site.js";

// Appels à l'action partagés (src/_data/appels_action/*.json), fournis par l'aiguilleur (ctx.appels_action).
const APPELS = ["parlons-de-votre-projet"].filter((a) => donnee(`appels_action/${a}`));

// Aucune page ne contient encore ce bloc : titre et texte sont des exemples, marqués comme tels.
const exemple = {
  titre: "Exemple : un projet en *tête* ?",
  texte: "Exemple de texte d'appel à l'action, 30 mots au plus. Le bouton vient de l'appel à l'action partagé choisi.",
  appel: APPELS[0] || ""
};

export default {
  title: "Blocs/Fin de page/Appel à l'action final",
  tags: ["autodocs"],
  render: (args, { parameters }) => rendreBloc("appel_action", args, parameters.bloc),
  parameters: {
    ...PAGES.offre,
    docs: {
      description: {
        component:
          "Bandeau d'appel à l'action centré, en fin de page. Le bouton vient d'un **appel à l'action partagé** " +
          "(collection Appels à l'action, `src/_data/appels_action/`), fourni au bloc par l'aiguilleur (`ctx.appels_action`). " +
          "Styles des pages d'offre (`logiciel-metier.css`).\n\n" +
          "**Proposé sur** : pages d'offre, Notre démarche, Notre entreprise / Company, pages de démonstration.\n\n" +
          "**Règles éditoriales** : titre de 60 caractères, un mot entre `*astérisques*` s'affiche en rouge ; texte de 30 mots ; " +
          "un appel à l'action se crée dans sa collection, puis se choisit ici ; fond blanc, gris clair (par défaut) ou sombre.\n\n" +
          "Aucune page ne contient encore ce bloc : titre et texte sont des exemples, marqués « Exemple ».\n\n" +
          "**À savoir** : la charte 2026 (`charte.css`) redéfinit `.section-sombre` en fond blanc ; le fond sombre " +
          "s'affiche donc blanc, sur le site comme ici."
      },
      story: { height: "340px" }
    }
  },
  argTypes: {
    titre: { name: "Titre", control: "text", description: "Obligatoire, 60 caractères maximum. Un mot entre *astérisques* s'affiche en rouge." },
    texte: { name: "Texte", control: "text", description: "30 mots maximum." },
    appel: {
      name: "Bouton",
      control: "select",
      options: APPELS,
      description: "Obligatoire. Appel à l'action partagé (texte et destination du bouton), collection Appels à l'action."
    },
    fond: {
      name: "Fond",
      control: "inline-radio",
      options: ["blanc", "doux", "sombre"],
      description: "`blanc`, `doux` (gris clair) ou `sombre`.",
      table: { defaultValue: { summary: "doux" } }
    }
  }
};

export const GrisClair = { name: "Fond gris clair", args: { ...exemple, fond: "doux" } };
export const Blanc = { name: "Fond blanc", args: { ...exemple, fond: "blanc" } };
export const Sombre = { name: "Fond sombre", args: { ...exemple, fond: "sombre" } };
