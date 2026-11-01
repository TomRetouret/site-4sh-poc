// Bloc « derniers_articles » : src/_includes/composants/blocs/derniers_articles.njk
// Champs : admin/config/blocs/derniers_articles.yml.
import { rendreBloc, blocExemple } from "../../.storybook/4sh/rendre-bloc.js";
import { PAGES } from "../../.storybook/4sh/contenus-site.js";

export default {
  title: "Blocs/Fin de page/Derniers articles du blog",
  tags: ["autodocs"],
  render: (args, { parameters }) => rendreBloc("derniers_articles", args, parameters.bloc),
  parameters: {
    docs: {
      description: {
        component:
          "Les derniers articles du blog, repris automatiquement (`ctx.blog`), avec un lien vers le blog. Sur le site, les " +
          "articles viennent du flux du blog au build ; dans Storybook, de la copie de secours `src/_data/blog_fallback.json`.\n\n" +
          "**Proposé sur** : accueil, pages d'offre, Notre démarche, Notre entreprise / Company, pages de démonstration.\n\n" +
          "**Règles éditoriales** : titre par défaut « Nos derniers *articles* », un mot entre `*astérisques*` s'affiche en rouge ; " +
          "les articles ne se saisissent pas."
      },
      story: { height: "620px" }
    }
  },
  argTypes: {
    titre: { name: "Titre", control: "text", description: "Par défaut « Nos derniers *articles* »." },
    lien_tout: {
      name: "Lien vers le blog",
      control: "object",
      description: "`{ texte, lien }`, par défaut « Tout le blog » vers https://blog.4sh.fr/."
    }
  }
};

// Accueil (src/_data/contenus/fr/accueil.json).
export const Accueil = {
  name: "Accueil",
  args: blocExemple("accueil", "derniers_articles")
};

// Page Logiciel métier, titre propre à la page.
export const PageOffre = {
  name: "Page d'offre",
  args: blocExemple("logiciel_metier", "derniers_articles"),
  parameters: PAGES.offre
};
