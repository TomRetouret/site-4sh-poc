// Bloc « logos_clients » : src/_includes/composants/blocs/logos_clients.njk
// Champs : admin/config/blocs/logos_clients.yml.
import { rendreBloc, blocExemple } from "../../.storybook/4sh/rendre-bloc.js";
import { PAGES } from "../../.storybook/4sh/contenus-site.js";

export default {
  title: "Blocs/Projets et références/Logos clients",
  tags: ["autodocs"],
  render: (args, { parameters }) => rendreBloc("logos_clients", args, parameters.bloc),
  parameters: {
    docs: {
      description: {
        component:
          "Bandeau « Ils nous confient leur métier » : la liste des clients vient des **réglages du site** " +
          "(`src/_data/site.json`, champs `clients_intro` et `clients`), fournis au bloc par l'aiguilleur (`ctx.site`). " +
          "Sur les pages d'offre (gabarit `offre`), le balisage reprend celui des pages intérieures.\n\n" +
          "**Proposé sur** : accueil, pages d'offre, Notre démarche, Notre entreprise / Company, pages de démonstration.\n\n" +
          "**Règles éditoriales** : titre facultatif ; vide, il reprend l'intitulé des réglages du site. " +
          "Les noms des clients se modifient dans les réglages du site."
      },
      story: { height: "260px" }
    }
  },
  argTypes: {
    titre: {
      name: "Titre",
      control: "text",
      description: "Vide : intitulé des réglages du site. Les clients se modifient dans les réglages du site."
    }
  }
};

// Accueil : titre vide, intitulé repris des réglages (src/_data/contenus/fr/accueil.json).
export const Accueil = {
  name: "Accueil (intitulé des réglages)",
  args: blocExemple("accueil", "logos_clients")
};

// Page Logiciel métier : titre saisi, gabarit des pages d'offre.
export const PageOffre = {
  name: "Page d'offre (titre saisi)",
  args: blocExemple("logiciel_metier", "logos_clients"),
  parameters: PAGES.offre
};

// Accueil anglais : réglages du site en anglais (src/_data/en/site.json).
export const AccueilAnglais = {
  name: "Accueil (anglais)",
  args: blocExemple("accueil", "logos_clients", "en"),
  parameters: { bloc: { urlPage: "/en/" } }
};
