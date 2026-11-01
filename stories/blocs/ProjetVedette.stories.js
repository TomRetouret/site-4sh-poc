// Bloc « projet_vedette » : src/_includes/composants/blocs/projet_vedette.njk
// Champs : admin/config/blocs/projet_vedette.yml.
import { rendreBloc } from "../../.storybook/4sh/rendre-bloc.js";
import { blocDe, referencesSite, PAGES } from "../../.storybook/4sh/contenus-site.js";

export default {
  title: "Blocs/Projets et références/Projet vedette",
  tags: ["autodocs"],
  render: (args, { parameters }) => rendreBloc("projet_vedette", args, parameters.bloc),
  parameters: {
    feuilles: PAGES.offre.feuilles,
    // Fiches références (src/content/references/*.md) au format de collections.references,
    // comme les pages les passent à l'aiguilleur ; témoignages : contexte par défaut de rendreBloc.
    bloc: { gabarit: "offre", contexte: { references: referencesSite() } },
    docs: {
      description: {
        component:
          "Une réalisation mise en avant (secteur, client, description, témoignage relié, chiffres, bouton), puis des cartes " +
          "« Autres références » construites à partir des fiches de la collection Références clients. Le témoignage vient de " +
          "la collection Témoignages (`ctx.temoignages`), les fiches de `ctx.references`. Styles des pages d'offre " +
          "(`logiciel-metier.css`).\n\n" +
          "**Proposé sur** : pages d'offre, Notre démarche, Notre entreprise / Company, pages de démonstration.\n\n" +
          "**Règles éditoriales** : surtitre 30 caractères ; titre 60 caractères, un mot entre `*astérisques*` s'affiche en rouge ; " +
          "secteur 25 caractères ; client 40 caractères en toutes lettres ; description 30 mots ; 3 chiffres au plus " +
          "(2 conseillés), chiffre de 10 caractères et libellé de 30 ; bouton de 25 caractères qui commence par un verbe ; " +
          "2 à 3 autres références."
      },
      story: { height: "720px" }
    }
  },
  argTypes: {
    surtitre: { name: "Surtitre", control: "text", description: "30 caractères maximum." },
    titre: { name: "Titre", control: "text", description: "Obligatoire, 60 caractères maximum. Un mot entre *astérisques* s'affiche en rouge." },
    ancre: { name: "Ancre de la section", control: "text", description: "Par défaut `realisations`. Vide : pas d'ancre." },
    secteur: { name: "Secteur", control: "text", description: "25 caractères maximum, par exemple « Infoport · Fret maritime »." },
    client: { name: "Client", control: "text", description: "Obligatoire, 40 caractères maximum, en toutes lettres." },
    description: { name: "Description", control: "text", description: "30 mots maximum." },
    temoignage: {
      name: "Témoignage",
      control: "select",
      options: ["", "infoport"],
      description: "Fiche de la collection Témoignages (src/_data/temoignages/fr)."
    },
    chiffres: {
      name: "Chiffres du projet",
      control: "object",
      description: "3 au plus, 2 conseillés : `{ valeur, libelle }`, chiffre de 10 caractères (accent avec *mot*), libellé de 30."
    },
    bouton: {
      name: "Bouton du projet",
      control: "object",
      description: "`{ texte, lien }`, texte de 25 caractères qui commence par un verbe. Vide : pas de bouton."
    },
    references: {
      name: "Autres références",
      control: "object",
      description: "2 à 3 slugs de fiches Références clients (src/content/references/), par exemple `cin`, `izivia-portail`."
    }
  }
};

// Projet vedette de la page Logiciel métier (src/_data/contenus/fr/logiciel_metier.json).
export const LogicielMetier = {
  name: "Page d'offre (Logiciel métier)",
  args: blocDe("logiciel_metier", "projet_vedette")
};

// Même projet, sans témoignage ni autres références.
export const SansTemoignage = {
  name: "Sans témoignage ni autres références",
  args: { ...blocDe("logiciel_metier", "projet_vedette"), temoignage: "", references: [] },
  parameters: { docs: { story: { height: "460px" } } }
};
