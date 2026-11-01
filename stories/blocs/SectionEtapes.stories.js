// Bloc « section_etapes » : src/_includes/composants/blocs/section_etapes.njk
// Champs : admin/config/blocs/section_etapes.yml ; pages : docs/back-office/schema-prestations.md.
import { rendreBloc } from "../../.storybook/4sh/rendre-bloc.js";
import { sectionPrestation, PAGES } from "../../.storybook/4sh/contenus-site.js";

const story = (nom, slug, rang, hauteur, fond) => {
  const s = sectionPrestation(slug, "section_etapes", rang);
  if (fond !== undefined) s.bloc.contexte.fond = fond;
  return { name: nom, args: s.args, parameters: { bloc: s.bloc, docs: { story: { height: hauteur } } } };
};

export default {
  title: "Blocs/Prestations/Section en étapes",
  tags: ["autodocs"],
  render: (args, { parameters }) => rendreBloc("section_etapes", args, parameters.bloc),
  parameters: {
    ...PAGES.prestation,
    docs: {
      description: {
        component:
          "Étapes d'une démarche, dans l'ordre. La première section en étapes de la page (si elle n'ouvre pas la page) passe " +
          "sur **fond sombre**, temps fort calculé une seule fois par le filtre `misePageSections` ; les suivantes suivent le " +
          "fond alterné. Feuille de la page : `secteurs.css`.\n\n" +
          "**Proposé sur** : pages de prestation uniquement.\n\n" +
          "**Règles éditoriales** : titre vide uniquement pour l'introduction en haut de page ; titre d'étape obligatoire de " +
          "60 caractères ; texte en Markdown, une ligne vide entre deux paragraphes ; 3 boutons au plus, verbe d'action de " +
          "30 caractères."
      }
    }
  },
  argTypes: {
    titre: { name: "Titre de la section", control: "text", description: "Vide uniquement pour le texte d'introduction en haut de page." },
    texte: { name: "Texte d'introduction", control: "text", description: "Facultatif. Markdown : gras, italique, liens et listes." },
    etapes: {
      name: "Étapes",
      control: "object",
      description: "Au moins une : `{ titre, texte }`, titre obligatoire de 60 caractères, texte en Markdown."
    },
    boutons: {
      name: "Boutons",
      control: "object",
      description: "3 au plus : `{ texte, lien }`, verbe d'action de 30 caractères ; lien par défaut `/contact/`."
    }
  }
};

// Temps fort sombre, avec bouton (page Transformation digitale).
export const TempsFort = story("Temps fort sur fond sombre", "transformation-digitale", 0, "720px");
// Même section sur fond clair : rendu d'une seconde section en étapes dans la page.
export const FondClair = story("Sur fond clair", "transformation-digitale", 0, "720px", "");
