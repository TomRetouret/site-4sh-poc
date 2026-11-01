// Bloc « section_projets » : src/_includes/composants/blocs/section_projets.njk
// Champs : admin/config/blocs/section_projets.yml ; pages : docs/back-office/schema-prestations.md.
import { rendreBloc } from "../../.storybook/4sh/rendre-bloc.js";
import { sectionPrestation, PAGES } from "../../.storybook/4sh/contenus-site.js";

const story = (nom, slug, rang, hauteur) => {
  const s = sectionPrestation(slug, "section_projets", rang);
  return { name: nom, args: s.args, parameters: { bloc: s.bloc, docs: { story: { height: hauteur } } } };
};

export default {
  title: "Blocs/Prestations/Section de projets",
  tags: ["autodocs"],
  render: (args, { parameters }) => rendreBloc("section_projets", args, parameters.bloc),
  parameters: {
    ...PAGES.prestation,
    docs: {
      description: {
        component:
          "Une carte par projet : texte saisi ; visuel, logo et secteur lus dans la fiche référence reliée (collection " +
          "Références clients, fournie par `ctx.references`, ici `src/content/references/*.md`). Jusqu'à 3 projets côte à côte, " +
          "à partir de 4 un carrousel. Les fiches reliées ne sont pas répétées dans les références de bas de page. Fond alterné " +
          "et numéro calculés selon la place de la section (filtre `misePageSections`). Feuille de la page : `secteurs.css`.\n\n" +
          "**Proposé sur** : pages de prestation uniquement.\n\n" +
          "**Règles éditoriales** : titre du projet obligatoire, client et secteur (« IZIVIA, électromobilité ») ; texte en " +
          "Markdown (ce que nous avons fait) ; lien par défaut vers la fiche reliée, texte par défaut « Voir la référence » ; " +
          "sans fiche ni destination, pas de lien ; 3 boutons au plus, verbe d'action de 30 caractères."
      }
    }
  },
  argTypes: {
    titre: { name: "Titre de la section", control: "text", description: "Vide uniquement pour le texte d'introduction en haut de page." },
    texte: { name: "Texte d'introduction", control: "text", description: "Facultatif. Markdown : gras, italique, liens et listes." },
    projets: {
      name: "Projets",
      control: "object",
      description:
        "Au moins un : `{ titre, texte, reference, lien_texte, lien }` ; `reference` : slug d'une fiche de " +
        "src/content/references/ (visuel, logo, secteur et lien par défaut)."
    },
    boutons: {
      name: "Boutons",
      control: "object",
      description: "3 au plus : `{ texte, lien }`, verbe d'action de 30 caractères ; lien par défaut `/contact/`."
    }
  }
};

// Trois projets côte à côte (page Application SaaS à Paris).
export const TroisProjets = story("Trois projets côte à côte", "application-saas-paris", 0, "720px");
// Quatre projets en carrousel (page Application mobile à Paris).
export const Carrousel = story("Carrousel (4 projets)", "application-mobile-paris", 0, "720px");
