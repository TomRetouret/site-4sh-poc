// Bloc « cartes_texte » : src/_includes/composants/blocs/cartes_texte.njk
// Champs : admin/config/blocs/cartes_texte.yml.
import { rendreBloc } from "../../.storybook/4sh/rendre-bloc.js";
import { blocDe, PAGES } from "../../.storybook/4sh/contenus-site.js";

const encadrees = { arg: "presentation", neq: "colonnes" };

export default {
  title: "Blocs/Cartes/Cartes de texte",
  tags: ["autodocs"],
  render: (args, { parameters }) => rendreBloc("cartes_texte", args, parameters.bloc),
  parameters: {
    ...PAGES.institutionnel,
    docs: {
      description: {
        component:
          "Cartes de texte, avec un petit lien facultatif sous chaque texte. Deux présentations : **cartes encadrées** " +
          "(petites cartes bordées : valeurs, métiers, agences ; fond blanc ou sombre) et **colonnes** (cartes plus larges " +
          "sur deux ou trois colonnes : offres, dispositifs).\n\n" +
          "**Proposé sur** : Notre démarche, Notre entreprise / Company, pages de démonstration.\n\n" +
          "**Règles éditoriales** : surtitre 30 caractères ; titre 60 caractères, un mot entre `*astérisques*` s'affiche en rouge ; " +
          "sous-titre 50 mots ; de 1 à 12 cartes, titre de 40 caractères, texte de 35 mots (un retour à la ligne crée une " +
          "nouvelle ligne, pratique pour une adresse) ; la flèche du lien est ajoutée automatiquement, une adresse `https://` " +
          "s'ouvre dans un nouvel onglet. Le fond sombre convient aux cartes encadrées.\n\n" +
          "**Fond sombre** : fond nuit de la charte (classe `.section-nuit`, mêmes jetons que le bandeau des chiffres : " +
          "titres blancs, texte secondaire `--sur-nuit`, mot mis en valeur rouge signal, filet `#3A4048`). `.section-sombre` " +
          "reste en fond clair, réservé à la Méthode 4D. Utilisé sur Notre entreprise / Company (Nos valeurs)."
      },
      story: { height: "620px" }
    }
  },
  argTypes: {
    sans_marge_haute: {
      name: "Coller au bloc précédent",
      control: "boolean",
      description: "Supprime l'espace au-dessus du bloc, quand le bloc précédent a le même fond."
    },
    surtitre: { name: "Surtitre", control: "text", description: "30 caractères maximum." },
    titre: { name: "Titre", control: "text", description: "Obligatoire, 60 caractères maximum. Un mot entre *astérisques* s'affiche en rouge." },
    sous_titre: { name: "Sous-titre", control: "text", description: "50 mots maximum." },
    presentation: {
      name: "Présentation",
      control: "inline-radio",
      options: ["encadrees", "colonnes"],
      description: "`encadrees` : petites cartes bordées. `colonnes` : cartes larges sur deux ou trois colonnes.",
      table: { defaultValue: { summary: "encadrees" } }
    },
    fond: {
      name: "Fond",
      control: "inline-radio",
      options: ["blanc", "sombre"],
      description: "`sombre` : fond nuit (`.section-nuit`). Convient aux cartes encadrées.",
      table: { defaultValue: { summary: "blanc" } }
    },
    colonnes: {
      name: "Colonnes (cartes encadrées)",
      control: "inline-radio",
      options: ["auto", "2", "3", "4"],
      description: "Cartes par ligne sur grand écran. `auto` laisse la mise en page décider.",
      table: { defaultValue: { summary: "auto" } },
      if: encadrees
    },
    cartes: {
      name: "Cartes",
      control: "object",
      description: "De 1 à 12 cartes `{ titre, texte, lien: { texte, lien } }` ; titre obligatoire (40 caractères), texte de 35 mots."
    }
  }
};

// Nos dispositifs, en colonnes (src/_data/contenus/fr/notre_demarche.json).
export const Colonnes = {
  name: "Colonnes",
  args: blocDe("notre_demarche", "cartes_texte")
};

// Une société technique, cartes encadrées sur 3 colonnes (src/_data/contenus/fr/notre_entreprise.json).
export const Encadrees = {
  name: "Cartes encadrées, 3 par ligne",
  args: blocDe("notre_entreprise", "cartes_texte", 0)
};

// Nos valeurs, cartes encadrées sur fond sombre.
export const FondSombre = {
  name: "Cartes encadrées, fond sombre",
  args: blocDe("notre_entreprise", "cartes_texte", 1)
};

// L'équipe, cartes encadrées sur 4 colonnes.
export const QuatreParLigne = {
  name: "Cartes encadrées, 4 par ligne",
  args: blocDe("notre_entreprise", "cartes_texte", 2)
};

// Nos agences : adresses sur plusieurs lignes et liens « Voir sur la carte ».
export const AvecLiens = {
  name: "Cartes encadrées avec liens (agences)",
  args: blocDe("notre_entreprise", "cartes_texte", 3)
};
