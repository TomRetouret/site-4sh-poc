// Composants / Sections : macros de src/_includes/composants/sections.njk.
import { appeler, enSection, donnee, FICHE_FILHET_ALLARD } from "./rendu.js";

const accueil = donnee("accueil") || {};
const libelles = donnee("libelles") || { secteur: {} };

export default {
  title: "Composants/Sections",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Les sections qui reviennent d'une page à l'autre (`src/_includes/composants/sections.njk`) :\n\n" +
          "- `faq_accordeon(items, style)` : liste dépliante, première question ouverte ; `faq_section(items, titre, creme)` " +
          "l'enveloppe d'une section titrée et ajoute le JSON-LD `FAQPage` (`faq_schema`).\n" +
          "- `frise_etapes(etapes)` : la méthode 4D en quatre temps (filet encre, numéro, nom de l'étape en rouge texte).\n" +
          "- `carrousel(libelle, variante, auto, defiler)` : enveloppe à appeler avec `{% call %}`.\n" +
          "- `bloc_references(slugs, toutes, eyebrow, titre)` : les fiches références liées à une page.\n\n" +
          "Les scripts du site (`script.js`, `mouvement.js`) ne sont pas chargés dans le Storybook : le carrousel n'a " +
          "ni points ni défilement automatique, la FAQ s'ouvre sans animation (fonctionnement natif de `<details>`).\n\n" +
          "Source : `src/_includes/composants/sections.njk`, `src/assets/charte.css` (« FAQ », « Méthode 4D », « Carrousels »), " +
          "`src/assets/styles.css`, `src/assets/secteurs.css`."
      },
      story: { height: "560px" }
    }
  }
};

const items = { name: "Questions", control: "object", description: "`[{ question, reponse }]`." };

// FAQ de l'accueil (src/_data/accueil.json).
export const FaqAccordeon = {
  name: "FAQ accordéon (faq_accordeon)",
  args: { items: accueil.faq },
  argTypes: { items },
  render: ({ items }) => enSection(appeler("sections", "faq_accordeon", [items]))
};

export const FaqSection = {
  name: "FAQ complète (faq_section)",
  args: { items: (accueil.faq || []).slice(0, 3), titre: accueil.faq_titre || "Questions fréquentes", creme: true },
  argTypes: {
    items,
    titre: { name: "Titre", control: "text" },
    creme: { name: "Fond crème", control: "boolean" }
  },
  parameters: { feuilles: ["/assets/secteurs.css"] },
  render: ({ items, titre, creme }) => `<main>${appeler("sections", "faq_section", [items, titre, creme])}</main>`
};

// Étapes de la méthode 4D de l'accueil (src/_data/accueil.json, methode_etapes).
export const FriseEtapes = {
  name: "Frise d'étapes (frise_etapes)",
  args: { etapes: accueil.methode_etapes },
  argTypes: { etapes: { name: "Étapes", control: "object", description: "`[{ num, label, titre, texte }]`." } },
  parameters: { docs: { story: { height: "420px" } } },
  render: ({ etapes }) =>
    enSection(
      `<svg class="trace-4d" viewBox="0 0 1280 120" aria-hidden="true" focusable="false"><path d="M0 110H280L310 80H600L630 50H920L950 20H1240" fill="none" stroke="#14171C" stroke-width="2"/><path d="M1240 9L1251 20L1240 31L1229 20Z" fill="#ED203D"/></svg>` +
        appeler("sections", "frise_etapes", [etapes]),
      { classe: "section-sombre", style: "padding:48px 0" }
    )
};

// Carrousel des secteurs de l'accueil (src/_includes/composants/pages/accueil.njk, accueil.secteurs).
export const Carrousel = {
  name: "Carrousel (carrousel)",
  args: { libelle: "Secteurs", variante: "car--secteurs", auto: false, secteurs: accueil.secteurs },
  argTypes: {
    libelle: { name: "Libellé", control: "text", description: "`aria-label` du carrousel et de la piste." },
    variante: { name: "Variante", control: "select", options: ["car--secteurs", "car--real", "car--blocs"], description: "Classe de largeur des éléments." },
    auto: { name: "Défilement automatique", control: "boolean", description: "`false` : `data-carrousel-auto=\"off\"` (script du site)." },
    secteurs: { name: "Cartes (secteurs)", control: "object", description: "Contenu passé à `caller()` : cartes `.secteur-carte`." }
  },
  render: ({ libelle, variante, auto, secteurs }) => {
    const cartes = (secteurs || [])
      .map((s) => `<div class="secteur-carte"><h3>${s.titre}</h3><p>${s.texte}</p><a href="${s.url || "#"}">${s.lien_libelle}</a></div>`)
      .join("");
    return enSection(appeler("sections", "carrousel", [libelle, variante, auto], null, cartes));
  }
};

export const BlocReferences = {
  name: "Références liées (bloc_references)",
  // Surtitre et titre : libelles.secteur (src/_data/libelles.json), comme secteur-libre.njk.
  args: { eyebrow: libelles.secteur.refs_eyebrow, titre: libelles.secteur.refs_titre },
  argTypes: { eyebrow: { name: "Surtitre", control: "text" }, titre: { name: "Titre", control: "text" } },
  parameters: { feuilles: ["/assets/secteurs.css"], docs: { story: { height: "700px" } } },
  render: ({ eyebrow, titre }) =>
    `<main>${appeler("sections", "bloc_references", [["filhet-allard"], [FICHE_FILHET_ALLARD], eyebrow, titre])}</main>`
};
