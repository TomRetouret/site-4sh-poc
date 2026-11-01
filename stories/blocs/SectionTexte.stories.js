// Bloc « section_texte » : src/_includes/composants/blocs/section_texte.njk
// Champs : admin/config/blocs/section_texte.yml ; pages : docs/back-office/schema-prestations.md.
import { rendreBloc } from "../../.storybook/4sh/rendre-bloc.js";
import { sectionPrestation, PAGES } from "../../.storybook/4sh/contenus-site.js";

// Fond alterné et numéro de section : calculés par le filtre misePageSections, selon la place
// du bloc dans sa page (passés dans ctx par le gabarit prestation.njk).
const story = (nom, slug, rang, hauteur) => {
  const s = sectionPrestation(slug, "section_texte", rang);
  return { name: nom, args: s.args, parameters: { bloc: s.bloc, docs: { story: { height: hauteur } } } };
};

export default {
  title: "Blocs/Prestations/Section de texte",
  tags: ["autodocs"],
  render: (args, { parameters }) => rendreBloc("section_texte", args, parameters.bloc),
  parameters: {
    ...PAGES.prestation,
    docs: {
      description: {
        component:
          "Section de texte des pages de prestation, en trois dispositions : **titre au-dessus du texte**, **titre à gauche, " +
          "texte à droite** et **bandeau d'appel centré** (sans numéro, pour la dernière section). Le fond alterné (blanc ou " +
          "crème) et le petit numéro (01, 02...) ne se règlent pas : ils sont calculés selon la place de la section dans la page " +
          "(filtre `misePageSections`). Feuille de la page : `secteurs.css`.\n\n" +
          "**Proposé sur** : pages de prestation uniquement.\n\n" +
          "**Règles éditoriales** : titre vide uniquement pour le texte d'introduction en haut de page ; texte en Markdown " +
          "(gras, italique, liens ; les listes s'affichent en liste à cocher), une ligne vide entre deux paragraphes ; " +
          "3 boutons au plus, verbe d'action de 30 caractères, le premier rouge, les suivants en contour."
      }
    }
  },
  argTypes: {
    titre: { name: "Titre de la section", control: "text", description: "Vide uniquement pour le texte d'introduction en haut de page." },
    disposition: {
      name: "Disposition",
      control: "inline-radio",
      options: ["empile", "colonnes", "bandeau"],
      description: "`empile` : titre au-dessus. `colonnes` : titre à gauche, texte à droite. `bandeau` : bandeau d'appel centré.",
      table: { defaultValue: { summary: "empile" } }
    },
    texte: { name: "Texte", control: "text", description: "Markdown : gras, italique, liens et listes (liste à cocher)." },
    boutons: {
      name: "Boutons",
      control: "object",
      description: "3 au plus : `{ texte, lien }`, verbe d'action de 30 caractères ; lien par défaut `/contact/`."
    }
  }
};

// Texte d'introduction sans titre, en haut de la page Application mobile à Bordeaux.
export const Introduction = story("Introduction sans titre", "application-mobile-bordeaux", 0, "360px");
// Titre à gauche, texte à droite (même page).
export const Colonnes = story("Titre à gauche, texte à droite", "application-mobile-bordeaux", 1, "480px");
// Titre au-dessus du texte, avec bouton (même page).
export const Empile = story("Titre au-dessus du texte, avec bouton", "application-mobile-bordeaux", 2, "520px");
// Bandeau d'appel centré, dernière section de la page.
export const Bandeau = story("Bandeau d'appel centré", "application-mobile-bordeaux", 3, "360px");
