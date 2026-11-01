// Bloc « telechargement » : src/_includes/composants/blocs/telechargement.njk (feuille /assets/blocs.css)
// Champs : admin/config/blocs/telechargement.yml.
import { rendreBloc } from "../../.storybook/4sh/rendre-bloc.js";
import { blocDemo, PAGES } from "../../.storybook/4sh/contenus-site.js";

export default {
  title: "Blocs/Fin de page/Téléchargement d'un document",
  tags: ["autodocs"],
  render: (args, { parameters }) => rendreBloc("telechargement", args, parameters.bloc),
  parameters: {
    ...PAGES.demo,
    docs: {
      description: {
        component:
          "Carte de téléchargement d'un document : titre, texte, format déduit du nom du fichier (PDF, DOCX...), poids et " +
          "bouton. Feuille propre `blocs.css`.\n\n" +
          "**Proposé sur** : pages d'offre, Notre démarche, Notre entreprise / Company, pages de démonstration.\n\n" +
          "**Règles éditoriales** : surtitre 30 caractères ; titre (nom du document) de 60 caractères, un mot entre " +
          "`*astérisques*` s'affiche en rouge ; texte de 40 mots ; document déposé (PDF de préférence, 10 Mo au plus) ou adresse " +
          "`https://` ; bouton de 30 caractères qui commence par un verbe ; poids facultatif (« 2,4 Mo »).\n\n" +
          "Données : page de démonstration `src/demo/essai-blocs.md` (surtitre marqué « [DÉMO] »)."
      },
      story: { height: "380px" }
    }
  },
  argTypes: {
    surtitre: { name: "Surtitre", control: "text", description: "30 caractères maximum." },
    titre: { name: "Titre", control: "text", description: "Obligatoire. Nom du document, 60 caractères maximum." },
    texte: { name: "Texte", control: "text", description: "Ce que contient le document et à qui il sert, 40 mots maximum." },
    document: {
      name: "Document",
      control: "text",
      description: "Obligatoire. Fichier déposé (PDF de préférence, 10 Mo maximum) ou adresse https://."
    },
    bouton_texte: {
      name: "Texte du bouton",
      control: "text",
      description: "Obligatoire, 30 caractères, commence par un verbe. Par défaut « Télécharger le document »."
    },
    poids: { name: "Poids du fichier", control: "text", description: "Par exemple « 2,4 Mo ». Vide : poids non affiché." }
  }
};

// Fiche référence Tekcar en ligne (src/demo/essai-blocs.md).
export const DocumentEnLigne = {
  name: "Document en ligne",
  args: blocDemo("telechargement")
};

// Même bloc, document déposé dans le site (format déduit de l'extension, sans poids).
export const FichierDepose = {
  name: "Exemple : fichier PDF déposé, sans poids",
  args: {
    ...blocDemo("telechargement"),
    document: "/uploads/exemple-plaquette.pdf",
    poids: ""
  }
};
