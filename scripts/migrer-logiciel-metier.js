#!/usr/bin/env node
/*
  Migration de la page Logiciel métier vers une page d'offre composée de blocs.
  Spécification : docs/back-office/schema-logiciel-metier.md (et schema-blocs.md pour les blocs)

  Lit    src/_data/logiciel_metier.json (conservé tel quel : retour arrière possible)
  Écrit  src/_data/contenus/fr/logiciel_metier.json  ({ nom, bouton_flottant, seo, blocs })
  Amorce src/_data/temoignages/fr/infoport.json             (citation SIMAR, sans auteur : aucun nom inventé)
         src/_data/appels_action/parlons-de-votre-projet.json (bouton flottant, vers #contact)
  Complète src/_data/site.json : ajoute INFOPORT aux clients (après CIN) s'il n'y est pas.

  Idempotent : relancer le script réécrit les mêmes fichiers à l'identique.
  Usage : node scripts/migrer-logiciel-metier.js
*/
const fs = require("fs");
const path = require("path");

const racine = path.join(__dirname, "..");
const data = path.join(racine, "src", "_data");

const lire = (rel) => JSON.parse(fs.readFileSync(path.join(data, rel), "utf8"));
const ecrire = (rel, obj) => {
  const cible = path.join(data, rel);
  fs.mkdirSync(path.dirname(cible), { recursive: true });
  const texte = JSON.stringify(obj, null, 2) + "\n";
  const avant = fs.existsSync(cible) ? fs.readFileSync(cible, "utf8") : null;
  fs.writeFileSync(cible, texte);
  console.log((avant === texte ? "inchangé " : "écrit    ") + "src/_data/" + rel);
};

const s = (v) => (v == null ? "" : String(v));
const lien = (texte, url) => ({ texte: s(texte), lien: s(url) });

// HTML saisi à la main dans les paragraphes vers Markdown limité (gras, liens, listes).
// Toute autre balise est signalée puis retirée (texte conservé).
function versMarkdown(html) {
  let t = s(html)
    .replace(/<(strong|b)>([\s\S]*?)<\/\1>/gi, "**$2**")
    .replace(/<(em|i)>([\s\S]*?)<\/\1>/gi, "*$2*")
    .replace(/<a\s+[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)");
  const restes = t.match(/<[^>]+>/g);
  if (restes) {
    console.warn("  balises non converties, retirées : " + restes.join(" "));
    t = t.replace(/<[^>]+>/g, "");
  }
  return t.trim();
}
const paragraphes = (liste) => (liste || []).map(versMarkdown).filter(Boolean).join("\n\n");

// Slug de fiche référence à partir d'une adresse /references/<slug>/
const slugReference = (url) => {
  const m = s(url).match(/\/references\/([a-z0-9-]+)\/?$/i);
  return m ? m[1] : "";
};

const SLUG_TEMOIGNAGE = "infoport";
const SLUG_APPEL = "parlons-de-votre-projet";

function migrer(lm) {
  const v = lm.realisations_vedette || {};
  return {
    nom: "Logiciel métier",
    bouton_flottant: s(lm.sticky_cta_label) ? SLUG_APPEL : "",
    seo: { meta_title: s(lm.meta_title), meta_description: s(lm.meta_description) },
    blocs: [
      {
        type: "hero",
        masquer: false,
        variante: "sobre",
        // surtitre « 4SH Build · Concevoir & développer » codé en dur dans l'ancien gabarit
        offre: "build",
        titre_page: s(lm.hero_h1),
        accroche: "",
        chapo: s(lm.hero_chapo),
        bouton_principal: lien(lm.hero_cta_principal_label, lm.hero_cta_principal_url || "#contact"),
        bouton_secondaire: lien(lm.hero_cta_secondaire_label, lm.hero_cta_secondaire_url || "#realisations"),
        note: "",
        etiquettes: (lm.hero_chips || []).map(s)
      },
      {
        type: "chiffres_cles",
        masquer: false,
        // compte et suffixe, jamais lus par le gabarit, disparaissent
        chiffres: (lm.chiffres || []).map((c) => ({ valeur: s(c.valeur), texte: s(c.texte), note: s(c.note) }))
      },
      {
        type: "texte_simple",
        masquer: false,
        surtitre: s(lm.pourquoi_eyebrow),
        titre: s(lm.pourquoi_titre),
        texte: paragraphes(lm.pourquoi_paragraphes)
      },
      {
        type: "etapes",
        masquer: false,
        surtitre: s(lm.methode_eyebrow),
        titre: s(lm.methode_titre),
        sous_titre: s(lm.methode_sous),
        // le numéro (num) est désormais calculé selon la position
        etapes: (lm.methode_etapes || []).map((e) => ({ phase: s(e.label), titre: s(e.titre), texte: s(e.texte) }))
      },
      {
        type: "technologies",
        masquer: false,
        affichage: "cartes",
        surtitre: s(lm.socle_eyebrow),
        titre: s(lm.socle_titre),
        sous_titre: s(lm.socle_sous),
        // lien_label, toujours « En savoir plus → », devient un libellé commun du bloc
        technos: (lm.socle_cartes || []).map((t) => ({ nom: s(t.nom), lien: s(t.lien_url), logo: s(t.logo) }))
      },
      {
        type: "texte_simple",
        masquer: false,
        surtitre: s(lm.pour_qui_eyebrow),
        titre: s(lm.pour_qui_titre),
        texte: paragraphes(lm.pour_qui_paragraphes)
      },
      {
        type: "benefices",
        masquer: false,
        surtitre: s(lm.atouts_eyebrow),
        titre: s(lm.atouts_titre),
        sous_titre: s(lm.atouts_sous),
        benefices: (lm.atouts || []).map((a) => ({ titre: s(a.titre), texte: s(a.texte) }))
      },
      {
        type: "projet_vedette",
        masquer: false,
        ancre: "realisations",
        surtitre: s(lm.realisations_eyebrow),
        titre: s(lm.realisations_titre),
        secteur: s(v.secteur),
        client: s(v.logo_texte),
        description: s(v.description),
        temoignage: s(v.citation) ? SLUG_TEMOIGNAGE : "",
        chiffres: (v.chiffres || []).map((c) => ({ valeur: s(c.valeur), libelle: s(c.label) })),
        bouton: lien(v.cta_label, v.cta_url),
        // secteur, titre et texte des cartes sont repris des fiches reliées
        references: (lm.realisations_cartes || []).map((r) => slugReference(r.url)).filter(Boolean)
      },
      {
        type: "logos_clients",
        masquer: false,
        // les noms viennent des réglages du site (site.clients)
        titre: s(lm.realisations_clients_titre)
      },
      {
        type: "derniers_articles",
        masquer: false,
        // articles récupérés automatiquement (les 3 articles saisis pointaient vers #)
        titre: s(lm.blog_titre),
        lien_tout: lien("Tout le blog", "https://blog.4sh.fr/")
      },
      {
        type: "faq",
        masquer: false,
        titre: s(lm.faq_titre),
        sous_titre: s(lm.faq_sous),
        questions: (lm.faq || []).map((q) => ({ question: s(q.question), reponse: s(q.reponse) }))
      }
    ]
  };
}

const lm = lire("logiciel_metier.json");
ecrire("contenus/fr/logiciel_metier.json", migrer(lm));

// Témoignage partagé de la réalisation vedette : citation sans auteur connu.
// L'entreprise (Infoport) est celle indiquée dans le secteur de la réalisation. Aucun nom inventé.
const v = lm.realisations_vedette || {};
if (s(v.citation)) {
  ecrire(`temoignages/fr/${SLUG_TEMOIGNAGE}.json`, {
    citation: s(v.citation),
    auteur: s(v.auteur),
    fonction: "",
    entreprise: "Infoport"
  });
}

// Appel à l'action partagé du bouton flottant (destination codée en dur auparavant : #contact).
if (s(lm.sticky_cta_label)) {
  ecrire(`appels_action/${SLUG_APPEL}.json`, {
    intitule: "Parlons de votre projet (formulaire de contact)",
    texte: s(lm.sticky_cta_label),
    lien: "#contact"
  });
}

// INFOPORT figurait dans le bandeau de la page mais pas dans les réglages du site.
const site = lire("site.json");
if (!(site.clients || []).some((c) => s(c.nom).toUpperCase() === "INFOPORT")) {
  const i = site.clients.findIndex((c) => c.nom === "CIN");
  site.clients.splice(i >= 0 ? i + 1 : site.clients.length, 0, { nom: "INFOPORT", url: "/references/infoport/" });
  ecrire("site.json", site);
} else {
  console.log("inchangé src/_data/site.json (INFOPORT déjà présent)");
}
