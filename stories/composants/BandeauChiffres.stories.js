// Composants / Bandeau de chiffres : macro bandeau_chiffres(chiffres) de src/_includes/composants/page.njk.
import { appeler, CHIFFRES_CELEBRADS } from "./rendu.js";

export default {
  title: "Composants/Bandeau de chiffres",
  tags: ["autodocs"],
  render: ({ chiffres }) => `<main>${appeler("page", "bandeau_chiffres", [chiffres])}</main>`,
  parameters: {
    feuilles: ["/assets/secteurs.css"],
    docs: {
      description: {
        component:
          "Bande nuit de résultats chiffrés des pages de prestation, page libre et pages de secteur. Chiffres en " +
          "Manrope 800, sur une seule ligne quel que soit leur nombre ; un mot entre `*astérisques*` passe en rouge " +
          "signal. Liste vide : rien n'est affiché.\n\n" +
          "Pour les pages composées de blocs, voir **Blocs/Chiffres clés**.\n\n" +
          "Source : `src/_includes/composants/page.njk` (macro `bandeau_chiffres`), `src/assets/references.css` " +
          "(`.ref-resultats`), `src/assets/charte.css` (« Chiffres clés : toujours visibles, sur une seule ligne »)."
      },
      story: { height: "340px" }
    }
  },
  argTypes: {
    chiffres: { name: "Chiffres", control: "object", description: "`[{ chiffre, label }]` ; `chiffre` accepte `*mot*`." }
  },
  args: { chiffres: CHIFFRES_CELEBRADS }
};

// src/content/pages-secteurs/celebrads.md
export const QuatreChiffres = { name: "Quatre chiffres (Celebrads)" };
export const AvecAccent = {
  name: "Chiffre avec mot mis en valeur",
  args: { chiffres: [{ chiffre: "*48*h", label: "pour un premier retour" }, ...CHIFFRES_CELEBRADS.slice(1, 3)] }
};
