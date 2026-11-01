// Composants / En-tête : macro en_tete(navigation, rubrique, lang, alt_url, url_page) de
// src/_includes/composants/en-tete.njk, appelée par base.njk sur toutes les pages.
// Données réelles : src/_data/navigation.json (français) et src/_data/en/navigation.json (anglais).
import { appeler, donnee } from "./rendu.js";

const NAVIGATION = { fr: donnee("navigation") || { items: [], actions: [] }, en: donnee("en/navigation") || { items: [], actions: [] } };
// Adresses d'exemple : la langue des libellés (filtre libelle) est lue dans l'adresse de la page.
const PAGE = { fr: { url: "/", alt: "/en/" }, en: { url: "/en/", alt: "/" } };
const rubriques = (langue) => [
  "",
  ...NAVIGATION[langue].items.map((i) => i.label),
  ...(NAVIGATION[langue].actions || []).map((a) => a.label)
];

export default {
  title: "Composants/En-tête",
  tags: ["autodocs"],
  render: ({ langue, rubrique, selecteur_langue }) => {
    const l = langue === "en" ? "en" : "fr";
    return appeler("en-tete", "en_tete", [NAVIGATION[l], rubrique || "", l === "en" ? "en" : "", selecteur_langue ? PAGE[l].alt : "", PAGE[l].url]);
  },
  parameters: {
    docs: {
      description: {
        component:
          "En-tête de toutes les pages : logo, menu principal (liens, menus simples, méga-menus), sélecteur de langue, " +
          "actions et bouton « Menu » du mobile. Sorti de `base.njk` en macro, rendu identique sur le site.\n\n" +
          "Appel (dans `base.njk`) : `{{ en_tete(navigation, rubrique, lang, altUrl, page.url) }}`. `rubrique` est calculée " +
          "par `base.njk` d'après l'adresse de la page (entrée active, losange de 8 px en couleur d'offre) ; `alt_url` " +
          "affiche le sélecteur FR / EN ; `url_page` donne la langue des libellés (bouton « Menu »).\n\n" +
          "Charte : blanc, collé en haut, filet bas `--bordure`, 80 px de haut (64 px sous 961 px) ; menu Manrope 700, 15 px, " +
          "encre, survol rouge texte ; entrée active en Manrope 800 ; méga-menus plats, colonnes d'offre repérées par une " +
          "barre Build ou Run ; bouton « Menu » à contour encre de 2 px, 44 px de haut, affiché sous 961 px.\n\n" +
          "Les méga-menus s'ouvrent au survol (CSS de `mouvement.css`). `script.js` n'est pas chargé ici : le bouton " +
          "« Menu » du mobile n'ouvre rien et le losange ne glisse pas d'une entrée à l'autre.\n\n" +
          "Données : `src/_data/navigation.json`, `src/_data/en/navigation.json`. Source : `src/_includes/composants/en-tete.njk`, " +
          "`src/assets/charte.css` (en-tête, méga-menus), `src/assets/mouvement.css`. Pictos du méga-menu : **Fondations/Pictos**."
      },
      story: { height: "620px" }
    }
  },
  argTypes: {
    langue: { name: "Langue", control: "inline-radio", options: ["fr", "en"] },
    rubrique: { name: "Entrée active (rubrique)", control: "select", options: [...new Set([...rubriques("fr"), ...rubriques("en")])] },
    selecteur_langue: { name: "Sélecteur de langue (page traduite)", control: "boolean" }
  },
  args: { langue: "fr", rubrique: "", selecteur_langue: true }
};

export const Francais = { name: "Français" };
export const FrancaisRubriqueActive = { name: "Français, rubrique active", args: { rubrique: NAVIGATION.fr.items[0] ? NAVIGATION.fr.items[0].label : "" } };
export const Anglais = { name: "Anglais", args: { langue: "en" } };
export const SansSelecteurDeLangue = { name: "Page sans traduction", args: { selecteur_langue: false } };
