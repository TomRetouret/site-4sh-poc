// Bloc « encart_bouton » : src/_includes/composants/blocs/encart_bouton.njk
// Champs : admin/config/blocs/encart_bouton.yml.
import { rendreBloc } from "../../.storybook/4sh/rendre-bloc.js";
import { blocDe, PAGES } from "../../.storybook/4sh/contenus-site.js";

export default {
  title: "Blocs/Fin de page/Encart avec bouton",
  tags: ["autodocs"],
  render: (args, { parameters }) => rendreBloc("encart_bouton", args, parameters.bloc),
  parameters: {
    ...PAGES.institutionnel,
    docs: {
      description: {
        component:
          "Court encart avec un bouton. **Encadré centré** : fond crème, bouton plein (recrutement). **Libre** : aligné à " +
          "gauche, sans fond, bouton contour (document à consulter).\n\n" +
          "**Proposé sur** : Notre démarche, Notre entreprise / Company, pages de démonstration.\n\n" +
          "**Règles éditoriales** : titre de 60 caractères ; texte de 40 mots ; bouton obligatoire, texte de 40 caractères, " +
          "une adresse `https://` s'ouvre dans un nouvel onglet. « Coller au bloc précédent » retire l'espace au-dessus quand " +
          "le bloc précédent a le même fond blanc."
      },
      story: { height: "340px" }
    }
  },
  argTypes: {
    sans_marge_haute: { name: "Coller au bloc précédent", control: "boolean", description: "Supprime l'espace au-dessus du bloc." },
    presentation: {
      name: "Présentation",
      control: "inline-radio",
      options: ["encadre", "libre"],
      description: "`encadre` : centré sur fond crème, bouton plein. `libre` : aligné à gauche, sans fond, bouton contour.",
      table: { defaultValue: { summary: "encadre" } }
    },
    titre: { name: "Titre", control: "text", description: "Obligatoire, 60 caractères maximum." },
    texte: { name: "Texte", control: "text", description: "40 mots maximum." },
    bouton: {
      name: "Bouton",
      control: "object",
      description: "Obligatoire. `{ texte, lien }`, texte de 40 caractères, lien par défaut `#contact`."
    }
  }
};

// Recrutement, encadré centré (src/_data/contenus/fr/notre_entreprise.json).
export const Encadre = {
  name: "Encadré centré (recrutement)",
  args: blocDe("notre_entreprise", "encart_bouton", 0)
};

// Charte RSE, présentation libre (même page).
export const Libre = {
  name: "Libre (document à consulter)",
  args: blocDe("notre_entreprise", "encart_bouton", 1)
};
