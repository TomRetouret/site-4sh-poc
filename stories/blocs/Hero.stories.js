// Bloc « hero » : src/_includes/composants/blocs/hero.njk
// Champs : docs/back-office/schema-blocs.md, section « hero ».
import { rendreBloc, blocExemple, donnee } from "../../.storybook/4sh/rendre-bloc.js";

// Couleur d'offre de la page (classe famille-* du body, calculée comme dans base.njk).
const FAMILLES = { build: "build", run: "run", learning: "formation" };
const sobre = { arg: "variante", eq: "sobre" };
const expressif = { arg: "variante", neq: "sobre" };

export default {
  title: "Blocs/Hero",
  tags: ["autodocs"],
  render: (args, { parameters }) =>
    rendreBloc("hero", args, {
      ...parameters.bloc,
      famille: args.variante === "sobre" ? FAMILLES[args.offre] : undefined
    }),
  parameters: {
    docs: {
      description: {
        component:
          "Haut de page, premier bloc de chaque page composée de blocs. Deux variantes : " +
          "**expressive** (accueil, photo en duotone, plan rouge et étapes de la méthode 4D) et " +
          "**sobre** (pages d'offre et pages intérieures : fil d'Ariane, surtitre coloré de l'offre, étiquettes). " +
          "Dans les titres, un mot entre `*astérisques*` s'affiche en rouge (filtre `accent`). " +
          "Champs du back-office : `docs/back-office/schema-blocs.md`, section « hero »."
      },
      story: { height: "760px" }
    }
  },
  argTypes: {
    variante: {
      name: "Variante",
      control: "inline-radio",
      options: ["expressif", "sobre"],
      description: "`expressif` (accueil) ou `sobre` (pages d'offre et pages intérieures). Vide = expressive.",
      table: { defaultValue: { summary: "expressif" } }
    },
    offre: {
      name: "Offre (surtitre coloré)",
      control: "select",
      options: ["", "build", "run", "learning", "institutionnel"],
      description: "Surtitre et couleur de la page. Variante sobre uniquement.",
      if: sobre
    },
    titre_page: {
      name: "Titre de la page (H1)",
      control: "text",
      description: "Obligatoire, 60 caractères maximum. Sobre : grand titre (accent avec *mot*). Expressive : petit surtitre."
    },
    accroche: {
      name: "Accroche",
      control: "text",
      description: "Grand titre de la variante expressive (accent avec *mot*).",
      if: expressif
    },
    chapo: { name: "Chapô", control: "text", description: "40 mots maximum." },
    bouton_principal: {
      name: "Bouton principal",
      control: "object",
      description: "Obligatoire. `{ texte, lien }`, lien par défaut `#contact`."
    },
    bouton_secondaire: {
      name: "Bouton secondaire",
      control: "object",
      description: "`{ texte, lien }`, lien par défaut `/references/`. Sans texte, pas de bouton."
    },
    note: { name: "Note sous les boutons", control: "text" },
    etiquettes: {
      name: "Étiquettes",
      control: "object",
      description: "Liste de chaînes, 4 au maximum. Variante sobre uniquement.",
      if: sobre
    },
    encart: {
      name: "Encart visuel",
      control: "object",
      description: "`{ afficher, titre, lignes: [{ cle, valeur }], badge, badge_note }`. Variante expressive uniquement.",
      if: expressif
    }
  }
};

// Hero de l'accueil (src/_data/contenus/fr/accueil.json).
export const Expressive = {
  name: "Expressive (accueil)",
  args: { variante: "expressif", ...blocExemple("accueil", "hero") }
};

// Même hero avec l'encart visuel affiché.
export const ExpressiveAvecEncart = {
  name: "Expressive avec encart",
  args: {
    ...Expressive.args,
    encart: { ...Expressive.args.encart, afficher: true }
  }
};

// Hero de la page Logiciel métier (src/_data/contenus/fr/logiciel_metier.json).
export const Sobre = {
  name: "Sobre (page d'offre)",
  args: blocExemple("logiciel_metier", "hero"),
  parameters: {
    feuilles: ["/assets/logiciel-metier.css"],
    bloc: { gabarit: "offre", filAriane: (donnee("contenus/fr/logiciel_metier") || {}).nom },
    docs: { story: { height: "560px" } }
  }
};
