#!/usr/bin/env node
/*
  Migration de la page d'accueil vers une liste de blocs.
  Spécification : docs/back-office/schema-blocs.md

  Lit    src/_data/accueil.json et src/_data/en/accueil.json (non modifiés)
  Écrit  src/_data/contenus/fr/accueil.json et src/_data/contenus/en/accueil.json
  Amorce src/_data/temoignages/fr/<slug>.json depuis src/_data/logiciel_metier.json

  Idempotent : relancer le script réécrit les mêmes fichiers à l'identique.
  Usage : node scripts/migrer-accueil-blocs.js
*/
const fs = require("fs");
const path = require("path");

const racine = path.join(__dirname, "..");
const data = path.join(racine, "src", "_data");

const lire = (rel) => JSON.parse(fs.readFileSync(path.join(data, rel), "utf8"));
const ecrire = (rel, obj) => {
  const cible = path.join(data, rel);
  fs.mkdirSync(path.dirname(cible), { recursive: true });
  fs.writeFileSync(cible, JSON.stringify(obj, null, 2) + "\n");
  console.log("écrit  src/_data/" + rel);
};

const s = (v) => (v == null ? "" : String(v));
const lien = (texte, url) => ({ texte: s(texte), lien: s(url) });
const sansPrefixeFleche = (t) => s(t).replace(/^\s*→\s*/, "");
const sansAsterisques = (t) => s(t).replace(/\*([^*\n]+)\*/g, "$1");
const image = (fichier, alt) => ({
  fichier: s(fichier),
  alt: s(alt),
  decorative: false,
  credit: "",
  cadrage: "centre"
});

const OFFRES = ["build", "run", "learning"];

function migrer(a) {
  const accroche = [s(a.hero_accroche_debut), a.hero_accroche_accent ? "*" + a.hero_accroche_accent + "*" : "", s(a.hero_accroche_fin)]
    .filter((x) => x !== "")
    .join(" ");

  return {
    seo: { meta_title: s(a.meta_title), meta_description: s(a.meta_description) },
    blocs: [
      {
        type: "hero",
        masquer: false,
        titre_page: s(a.hero_surtitre),
        accroche,
        chapo: s(a.hero_chapo),
        bouton_principal: lien(a.hero_cta_principal, "#contact"),
        bouton_secondaire: lien(a.hero_cta_secondaire, "/references/"),
        note: s(a.hero_note),
        encart: {
          // l'ancien gabarit masquait l'encart dès qu'une photo d'équipe était renseignée
          afficher: !a.equipe_photo,
          titre: s(a.hero_visuel_titre),
          lignes: (a.hero_visuel_lignes || []).map((l) => ({ cle: s(l.cle), valeur: s(l.valeur) })),
          badge: s(a.hero_visuel_badge),
          badge_note: s(a.hero_visuel_badge_note)
        }
      },
      { type: "logos_clients", masquer: false, titre: "" },
      {
        type: "cartes_offres",
        masquer: false,
        surtitre: s(a.portes_eyebrow),
        titre: s(a.portes_titre),
        sous_titre: s(a.portes_sous),
        cartes: (a.portes || []).slice(0, 3).map((p, i) => ({
          offre: OFFRES[i],
          titre: s(p.titre),
          texte: s(p.texte),
          liens: (p.liens || []).map((l) => lien(sansPrefixeFleche(l.label), l.url)),
          lien_bas: lien(p.suite_label, p.suite_url)
        }))
      },
      {
        type: "chiffres_cles",
        masquer: false,
        chiffres: (a.chiffres || []).map((c) => ({ valeur: s(c.valeur), texte: s(c.texte), note: s(c.note) }))
      },
      {
        type: "cartes_secteurs",
        masquer: false,
        surtitre: s(a.secteurs_eyebrow),
        titre: s(a.secteurs_titre),
        sous_titre: s(a.secteurs_sous),
        cartes: (a.secteurs || []).map((c) => ({
          titre: s(c.titre),
          texte: s(c.texte),
          lien: lien(c.lien_libelle, c.url)
        }))
      },
      {
        type: "methode_4d",
        masquer: false,
        surtitre: s(a.methode_eyebrow),
        titre: s(a.methode_titre),
        sous_titre: s(a.methode_sous),
        etapes: (a.methode_etapes || []).map((e) => ({
          numero: s(e.num),
          phase: s(e.label),
          titre: s(e.titre),
          texte: s(e.texte)
        }))
      },
      {
        type: "projets",
        masquer: false,
        surtitre: s(a.cas_eyebrow),
        titre: s(a.cas_titre),
        sous_titre: s(a.cas_sous),
        projets: (a.realisations || []).map((r) => ({
          secteur: s(r.secteur),
          client: s(r.client),
          image: image(r.image, r.image ? s(r.client) + ", " + s(r.secteur) : ""),
          description: s(r.visuel_texte),
          // les citations de l'accueil sont toutes vides : aucun témoignage relié
          temoignage: "",
          chiffres: (r.chiffres || []).map((c) => ({ valeur: s(c.valeur), libelle: s(c.label) })),
          bouton: lien(r.cta_label, r.cta_url)
        })),
        bouton_bas: lien(a.realisations_cta_label, a.realisations_cta_url || "/references/")
      },
      {
        type: "technologies",
        masquer: false,
        surtitre: s(a.technos_eyebrow),
        titre: s(a.technos_titre),
        sous_titre: s(a.technos_sous),
        technos: (a.technos || []).map((t) => ({ nom: s(t.nom), lien: s(t.url) }))
      },
      {
        type: "faq",
        masquer: false,
        titre: s(a.faq_titre),
        sous_titre: s(a.faq_sous),
        questions: (a.faq || []).map((q) => ({ question: s(q.question), reponse: s(q.reponse) }))
      },
      {
        type: "derniers_articles",
        masquer: false,
        // valeurs auparavant codées en dur dans le gabarit (identiques en FR et en EN)
        titre: "Nos derniers *articles*",
        lien_tout: lien("Tout le blog", "https://blog.4sh.fr/")
      },
      {
        type: "equipe",
        masquer: false,
        surtitre: s(a.equipe_eyebrow),
        titre: s(a.equipe_titre),
        texte: s(a.equipe_texte),
        photo: image(a.equipe_photo, sansAsterisques(a.equipe_titre)),
        // bouton auparavant codé en dur dans le gabarit (identique en FR et en EN)
        bouton: lien("Notre entreprise", "/notre-entreprise/"),
        // l'ancien gabarit ne rendait pas la section sans photo
        ...(a.equipe_photo ? {} : { masquer: true })
      }
    ]
  };
}

ecrire("contenus/fr/accueil.json", migrer(lire("accueil.json")));
ecrire("contenus/en/accueil.json", migrer(lire("en/accueil.json")));

// ---------------------------------------------------------------------------
// Amorçage des témoignages : objets de logiciel_metier.json qui portent une
// citation ET un auteur. Aucun témoignage n'est inventé.
// ---------------------------------------------------------------------------
const slugifier = (t) =>
  s(t)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const trouves = [];
(function parcourir(n) {
  if (Array.isArray(n)) return n.forEach(parcourir);
  if (n && typeof n === "object") {
    if (s(n.citation).trim() && s(n.auteur).trim()) trouves.push(n);
    Object.values(n).forEach(parcourir);
  }
})(lire("logiciel_metier.json"));

for (const t of trouves) {
  const morceaux = s(t.auteur).split(",").map((x) => x.trim());
  const temoignage = {
    citation: s(t.citation).trim(),
    auteur: morceaux[0] || "",
    fonction: morceaux[1] || "",
    entreprise: morceaux.slice(2).join(", ") || ""
  };
  ecrire("temoignages/fr/" + slugifier(temoignage.auteur + " " + temoignage.entreprise) + ".json", temoignage);
}
console.log(trouves.length + " témoignage(s) publié(s) trouvé(s) dans logiciel_metier.json");

// garde les dossiers de la collection dans Git même vides
for (const l of ["fr", "en"]) {
  const dir = path.join(data, "temoignages", l);
  fs.mkdirSync(dir, { recursive: true });
  if (!fs.readdirSync(dir).some((f) => f.endsWith(".json")) && !fs.existsSync(path.join(dir, ".gitkeep"))) {
    fs.writeFileSync(path.join(dir, ".gitkeep"), "");
  }
}
