// Bloc « section_cartes » : src/_includes/composants/blocs/section_cartes.njk
// Champs : admin/config/blocs/section_cartes.yml ; pages : docs/back-office/schema-prestations.md.
import { rendreBloc } from "../../.storybook/4sh/rendre-bloc.js";
import { sectionPrestation, PAGES } from "../../.storybook/4sh/contenus-site.js";

const story = (nom, slug, rang, hauteur) => {
  const s = sectionPrestation(slug, "section_cartes", rang);
  return { name: nom, args: s.args, parameters: { bloc: s.bloc, docs: { story: { height: hauteur } } } };
};

export default {
  title: "Blocs/Prestations/Section en cartes",
  tags: ["autodocs"],
  render: (args, { parameters }) => rendreBloc("section_cartes", args, parameters.bloc),
  parameters: {
    ...PAGES.prestation,
    docs: {
      description: {
        component:
          "Section de cartes des pages de prestation : jusqu'à 3 cartes en grille, à partir de 4 un carrousel que l'on fait " +
          "défiler. Une carte avec destination devient entièrement cliquable (lien « Découvrir », titre seul). Fond alterné et " +
          "numéro calculés selon la place de la section (filtre `misePageSections`). Feuille de la page : `secteurs.css`. " +
          "Dans Storybook, le script des carrousels n'est pas chargé.\n\n" +
          "**Proposé sur** : pages de prestation uniquement.\n\n" +
          "**Règles éditoriales** : titre vide uniquement pour l'introduction en haut de page ; texte d'introduction facultatif " +
          "en Markdown ; titre de carte de 60 caractères ; le texte d'une carte est ignoré si sa destination est remplie ; " +
          "3 boutons au plus, verbe d'action de 30 caractères."
      }
    }
  },
  argTypes: {
    titre: { name: "Titre de la section", control: "text", description: "Vide uniquement pour le texte d'introduction en haut de page." },
    texte: { name: "Texte d'introduction", control: "text", description: "Facultatif. Markdown : gras, italique, liens et listes." },
    cartes: {
      name: "Cartes",
      control: "object",
      description:
        "Au moins une : `{ titre, texte, lien }`. Titre de 60 caractères ; avec `lien`, la carte entière devient un lien " +
        "« Découvrir » et seul le titre s'affiche. Jusqu'à 3 : grille ; à partir de 4 : carrousel."
    },
    boutons: {
      name: "Boutons",
      control: "object",
      description: "3 au plus : `{ texte, lien }`, verbe d'action de 30 caractères ; lien par défaut `/contact/`."
    }
  }
};

// Trois cartes en grille (page Application mobile).
export const Grille = story("Grille de 3 cartes", "application-mobile", 0, "560px");
// Cinq cartes en carrousel (page Audit cloud).
export const Carrousel = story("Carrousel (5 cartes)", "audit-cloud", 1, "560px");
// Cartes cliquables vers d'autres pages (page Application SaaS).
export const Cliquables = story("Cartes cliquables", "application-saas", 1, "460px");
