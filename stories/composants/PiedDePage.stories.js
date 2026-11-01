// Composants / Pied de page : macro pied_de_page(site, url_page) de
// src/_includes/composants/pied-de-page.njk, appelée par base.njk sur toutes les pages.
// Données réelles : src/_data/site.json (français) et src/_data/en/site.json (anglais).
import { appeler, donnee } from "./rendu.js";

const SITE = { fr: donnee("site") || {}, en: donnee("en/site") || {} };
// Adresse d'exemple : la langue de la signature (libellé commun.pied_signature) est lue dans l'adresse.
const PAGE = { fr: "/", en: "/en/" };

export default {
  title: "Composants/Pied de page",
  tags: ["autodocs"],
  render: ({ langue }) => {
    const l = langue === "en" ? "en" : "fr";
    return appeler("pied-de-page", "pied_de_page", [SITE[l], PAGE[l]]);
  },
  parameters: {
    docs: {
      description: {
        component:
          "Pied de page de toutes les pages : logo blanc, signature, accroche, villes et téléphone, colonnes de liens, " +
          "mentions légales, réseaux et sites de formation. Sorti de `base.njk` en macro, rendu identique sur le site.\n\n" +
          "Appel (dans `base.njk`) : `{{ pied_de_page(site, page.url) }}`, avec `site` en anglais sur les pages anglaises.\n\n" +
          "Charte : fond nuit, texte `--sur-nuit` ; signature Manrope 700, 20 px, blanche ; titres de colonne Manrope 700, " +
          "13 px, capitales, blancs ; liens de 32 px de haut (44 px sur mobile), blancs soulignés au survol ; filet `#3A4048` " +
          "au-dessus des mentions ; contour de focus blanc.\n\n" +
          "Données : `src/_data/site.json`, `src/_data/en/site.json`, libellé `commun.pied_signature` " +
          "(`src/_data/libelles.json`). Source : `src/_includes/composants/pied-de-page.njk`, `src/assets/charte.css` (pied de page)."
      },
      story: { height: "460px" }
    }
  },
  argTypes: {
    langue: { name: "Langue", control: "inline-radio", options: ["fr", "en"] }
  },
  args: { langue: "fr" }
};

export const Francais = { name: "Français" };
export const Anglais = { name: "Anglais", args: { langue: "en" } };
