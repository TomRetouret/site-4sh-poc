// Bloc « hero_institutionnel » : src/_includes/composants/blocs/hero_institutionnel.njk
// Champs : admin/config/blocs/hero_institutionnel.yml.
import { rendreBloc } from "../../.storybook/4sh/rendre-bloc.js";
import { blocDe, PAGES } from "../../.storybook/4sh/contenus-site.js";

export default {
  title: "Blocs/Haut de page/Haut de page institutionnelle",
  tags: ["autodocs"],
  render: (args, { parameters }) => rendreBloc("hero_institutionnel", args, parameters.bloc),
  parameters: {
    ...PAGES.institutionnel,
    docs: {
      description: {
        component:
          "Haut des pages institutionnelles : fil d'Ariane, surtitre, grand titre (H1), chapô, un ou deux boutons, " +
          "étiquettes et, à droite, un schéma dessiné au choix (masqué sur téléphone).\n\n" +
          "**Proposé sur** : Notre démarche, Notre entreprise / Company, pages de démonstration.\n\n" +
          "**Règles éditoriales** : fil d'Ariane de 4 étapes au plus (30 caractères chacune, la première renvoie à l'accueil) ; " +
          "surtitre 30 caractères ; titre 70 caractères, un mot entre `*astérisques*` s'affiche en rouge ; chapô 45 mots ; " +
          "boutons 30 caractères (`#contact` descend au formulaire, une adresse `https://` s'ouvre dans un nouvel onglet) ; " +
          "4 étiquettes de 20 caractères au plus. Les textes des schémas sont écrits dans le gabarit, en français.\n\n" +
          "**À savoir** : la charte 2026 (`charte.css`) masque les schémas (`.schema-craft { display: none }`) ; " +
          "le réglage Illustration n'a donc pas d'effet visible, sur le site comme ici."
      },
      story: { height: "640px" }
    }
  },
  argTypes: {
    fil_ariane: {
      name: "Fil d'Ariane",
      control: "object",
      description: "Liste de 4 chaînes au plus, de l'accueil à la page, 30 caractères chacune. Vide : pas de fil d'Ariane."
    },
    surtitre: { name: "Surtitre", control: "text", description: "30 caractères maximum." },
    titre_page: {
      name: "Titre de la page (H1)",
      control: "text",
      description: "Obligatoire, 70 caractères maximum. Un mot entre *astérisques* s'affiche en rouge."
    },
    chapo: { name: "Chapô", control: "text", description: "45 mots maximum." },
    bouton_principal: {
      name: "Bouton principal",
      control: "object",
      description: "Obligatoire. `{ texte, lien }`, texte de 30 caractères, lien par défaut `#contact`."
    },
    bouton_secondaire: {
      name: "Bouton secondaire",
      control: "object",
      description: "`{ texte, lien }`. Texte vide : pas de second bouton. Une #ancre descend à la section qui la porte."
    },
    etiquettes: { name: "Étiquettes", control: "object", description: "Liste de 4 chaînes au plus, 20 caractères chacune." },
    illustration: {
      name: "Illustration",
      control: "inline-radio",
      options: ["aucune", "demarche", "entreprise"],
      description:
        "Schéma à droite du titre : `aucune`, `demarche` (de votre idée à la mise en production) ou " +
        "`entreprise` (nos agences autour de 4SH).",
      table: { defaultValue: { summary: "aucune" } }
    }
  }
};

// Haut de la page Notre démarche (src/_data/contenus/fr/notre_demarche.json) : pas de schéma choisi.
export const NotreDemarche = {
  name: "Notre démarche",
  args: blocDe("notre_demarche", "hero_institutionnel")
};

// Haut de la page Notre entreprise (src/_data/contenus/fr/notre_entreprise.json) : pas de schéma choisi.
export const NotreEntreprise = {
  name: "Notre entreprise",
  args: blocDe("notre_entreprise", "hero_institutionnel")
};

// Contenu de Notre démarche avec le schéma « de votre idée à la mise en production ».
export const SchemaDemarche = {
  name: "Avec le schéma démarche",
  args: { ...NotreDemarche.args, illustration: "demarche" }
};

// Contenu de Notre entreprise avec le schéma « nos agences autour de 4SH ».
export const SchemaEntreprise = {
  name: "Avec le schéma agences",
  args: { ...NotreEntreprise.args, illustration: "entreprise" }
};

// Version anglaise de Notre entreprise (src/_data/contenus/en/notre_entreprise.json).
export const Company = {
  name: "Company (anglais)",
  args: blocDe("notre_entreprise", "hero_institutionnel", 0, "en"),
  parameters: { bloc: { gabarit: "offre", urlPage: "/en/company/" } }
};
