// Composants / Formulaires : macros de src/_includes/composants/formulaires.njk, avec les
// libellés réels (site.formulaire, site.contact, libelles.devis) et un contexte factice
// (adresse de page et nom de formulaire), signalé par le bandeau « Exemple ».
import { appeler, donnee, exemple } from "./rendu.js";

const site = donnee("site") || {};
const libelles = donnee("libelles") || {};
const URL_EXEMPLE = "/exemple-storybook/";
const sujets = (site.formulaire && site.formulaire.sujets ? site.formulaire.sujets : []).map((s) => s.label);

export default {
  title: "Composants/Formulaires",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Les briques des formulaires du site (`src/_includes/composants/formulaires.njk`) : `champ_sujet` (type de " +
          "demande, qui porte l'adresse du destinataire), `case_rgpd` (consentement, lien vers la notice injecté dans la " +
          "phrase), `formulaire` (formulaire de contact Netlify Forms), `contact_final` (grand bloc nuit de fin de page) " +
          "et `devis` (demande de devis des pages formation).\n\n" +
          "Charte : champs de 48 px, bord `--muted` de 1,5 px puis encre au survol et au focus (contour 2 px décalé de 2 px), " +
          "erreur en bord rouge texte de 2 px, case à cocher de 24 px, bouton rouge texte même sur fond nuit.\n\n" +
          "**Contexte factice.** Les libellés sont les vrais (`src/_data/site.json`, `src/_data/libelles.json`) ; l'adresse " +
          `de page (\`${URL_EXEMPLE}\`) et les noms de formulaire sont des exemples. Envoyer un formulaire depuis le ` +
          "Storybook n'a pas d'effet utile (pas de Netlify Forms). `formulaires.js` n'est pas chargé : le sujet reste une " +
          "liste native, non transformée en liste déroulante à la charte.\n\n" +
          "Source : `src/_includes/composants/formulaires.njk`, `src/assets/charte.css` (« bloc contact »), `src/assets/styles.css`."
      },
      story: { height: "860px" }
    }
  }
};

export const Formulaire = {
  name: "Formulaire de contact (formulaire)",
  args: { nom: "exemple-contact", avec_tel: true, sujet_defaut: "" },
  argTypes: {
    nom: { name: "Nom du formulaire", control: "text", description: "Nom Netlify, préfixe des identifiants de champs ; unique dans la page." },
    avec_tel: { name: "Champ téléphone", control: "boolean" },
    sujet_defaut: { name: "Sujet présélectionné", control: "select", options: ["", ...sujets] }
  },
  render: ({ nom, avec_tel, sujet_defaut }) =>
    `<main>${exemple(`page ${URL_EXEMPLE}, formulaire « ${nom} »`)}<section class="fond-doux" style="padding:48px 0"><div class="container" style="max-width:640px">` +
    appeler("formulaires", "formulaire", [site.formulaire, URL_EXEMPLE, nom, avec_tel, sujet_defaut || null, `${nom}-sujet`, `${nom}-rgpd`]) +
    `</div></section></main>`
};

export const ChampsEtats = {
  name: "Champs : survol, focus, erreur",
  parameters: { docs: { story: { height: "520px" } } },
  render: () =>
    `<main>${exemple("états simulés, balisage des champs du formulaire")}<section class="fond-doux" style="padding:48px 0"><div class="container" style="max-width:640px">
<form class="formulaire" onsubmit="return false">
  <label for="ex-repos">Champ au repos</label><input id="ex-repos" type="text" placeholder="${site.formulaire.ph_nom}">
  <label for="ex-focus">Champ au focus</label><input id="ex-focus" type="email" value="prenom@entreprise.fr" style="border-color:var(--encre)!important;outline:2px solid var(--encre);outline-offset:2px">
  <label for="ex-erreur">Champ en erreur (<code>aria-invalid="true"</code>)</label><input id="ex-erreur" type="email" value="prenom@" aria-invalid="true">
  <p class="aide">${site.formulaire.aide}</p>
</form></div></section></main>`
};

export const ChampSujet = {
  name: "Champ sujet (champ_sujet)",
  args: { sujet_defaut: "" },
  argTypes: { sujet_defaut: { name: "Sujet présélectionné", control: "select", options: ["", ...sujets] } },
  parameters: { docs: { story: { height: "260px" } } },
  render: ({ sujet_defaut }) =>
    `<main>${exemple("champ seul, identifiant « exemple-sujet »")}<section class="fond-doux" style="padding:32px 0"><div class="container" style="max-width:640px"><div class="formulaire">` +
    appeler("formulaires", "champ_sujet", [site.formulaire, "exemple-sujet", sujet_defaut || null]) +
    `</div></div></section></main>`
};

export const CaseRgpd = {
  name: "Case de consentement (case_rgpd)",
  parameters: { docs: { story: { height: "220px" } } },
  render: () =>
    `<main>${exemple("case seule, identifiant « exemple-rgpd »")}<section class="fond-doux" style="padding:32px 0"><div class="container" style="max-width:640px"><div class="formulaire">` +
    appeler("formulaires", "case_rgpd", [site.formulaire, "exemple-rgpd"]) +
    `</div></div></section></main>`
};

export const ContactFinal = {
  name: "Bloc contact final (contact_final)",
  parameters: { docs: { story: { height: "1100px" } } },
  render: () =>
    `<main>${exemple(`page ${URL_EXEMPLE}, formulaire « exemple-contact-bandeau »`)}` +
    appeler("formulaires", "contact_final", [site, URL_EXEMPLE, "exemple-contact-bandeau"]) +
    `</main>`
};

export const Devis = {
  name: "Demande de devis (devis, pages formation)",
  parameters: { docs: { story: { height: "1000px" } } },
  render: () =>
    `<main class="learning famille-formation">${exemple(`page ${URL_EXEMPLE}, contexte d'une page Formations (classe learning)`)}` +
    appeler("formulaires", "devis", [libelles.devis, site.formulaire, URL_EXEMPLE, "contact", null, site.formulaire.sujet_defaut_formation]) +
    `</main>`
};
