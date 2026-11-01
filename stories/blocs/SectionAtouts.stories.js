// Bloc « section_atouts » : src/_includes/composants/blocs/section_atouts.njk
// Champs : admin/config/blocs/section_atouts.yml ; pages : docs/back-office/schema-prestations.md.
import { rendreBloc } from "../../.storybook/4sh/rendre-bloc.js";
import { sectionPrestation, PAGES } from "../../.storybook/4sh/contenus-site.js";

const story = (nom, slug, rang, hauteur) => {
  const s = sectionPrestation(slug, "section_atouts", rang);
  return { name: nom, args: s.args, parameters: { bloc: s.bloc, docs: { story: { height: hauteur } } } };
};

export default {
  title: "Blocs/Prestations/Section d'atouts",
  tags: ["autodocs"],
  render: (args, { parameters }) => rendreBloc("section_atouts", args, parameters.bloc),
  parameters: {
    ...PAGES.prestation,
    docs: {
      description: {
        component:
          "Atouts sur deux colonnes, sans limite de nombre, avec texte d'introduction et boutons facultatifs. Un atout avec " +
          "destination devient une carte cliquable (lien « Découvrir », titre seul). Fond alterné et numéro calculés selon la " +
          "place de la section (filtre `misePageSections`). Feuille de la page : `secteurs.css`.\n\n" +
          "**Proposé sur** : pages de prestation uniquement.\n\n" +
          "**Règles éditoriales** : titre vide uniquement pour l'introduction en haut de page ; titre d'atout facultatif de " +
          "60 caractères ; texte en Markdown (gras, italique, liens, listes), ignoré si la destination est remplie ; " +
          "3 boutons au plus, verbe d'action de 30 caractères, le premier rouge, les suivants en contour."
      }
    }
  },
  argTypes: {
    titre: { name: "Titre de la section", control: "text", description: "Vide uniquement pour le texte d'introduction en haut de page." },
    texte: { name: "Texte d'introduction", control: "text", description: "Facultatif. Markdown : gras, italique, liens et listes." },
    atouts: {
      name: "Atouts",
      control: "object",
      description: "Au moins un : `{ titre, texte, lien }` ; titre facultatif de 60 caractères ; avec `lien`, carte cliquable."
    },
    boutons: {
      name: "Boutons",
      control: "object",
      description: "3 au plus : `{ texte, lien }`, verbe d'action de 30 caractères ; lien par défaut `/contact/`."
    }
  }
};

// Atouts avec texte et bouton (page Application mobile à Bordeaux).
export const AvecBouton = story("Atouts avec bouton", "application-mobile-bordeaux", 0, "620px");
// Atouts cliquables vers d'autres pages (page Application mobile).
export const Cliquables = story("Atouts cliquables", "application-mobile", 1, "460px");
