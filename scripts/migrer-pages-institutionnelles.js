#!/usr/bin/env node
/*
  Migration des pages Notre démarche, Notre entreprise et Company (anglais) vers des pages composées de blocs.
  Spécification : docs/back-office/schema-pages.md (et schema-blocs.md pour la bibliothèque de blocs)

  Lit    src/_data/notre_demarche.json, src/_data/notre_entreprise.json, src/_data/en/notre_entreprise.json
         (conservés tels quels : retour arrière possible, plus lus par les pages)
  Écrit  src/_data/contenus/fr/notre_demarche.json    ({ seo, blocs })
         src/_data/contenus/fr/notre_entreprise.json  ({ seo, blocs })
         src/_data/contenus/en/notre_entreprise.json  ({ seo, blocs })

  Idempotent : relancer le script réécrit les mêmes fichiers à l'identique.
  Attention : il repart des anciens fichiers, donc écrase les modifications faites depuis dans le CMS.
  Usage : node scripts/migrer-pages-institutionnelles.js
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
  if (avant !== texte) fs.writeFileSync(cible, texte);
  console.log((avant === texte ? "inchangé " : "écrit    ") + "src/_data/" + rel);
};

const s = (v) => (v == null ? "" : String(v));
const lien = (texte, url) => ({ texte: s(texte), lien: s(url) });
const liste = (v) => (Array.isArray(v) ? v : []);
const avertir = (m) => console.warn("ATTENTION : " + m);

// Chiffres : l'ancien couple compte / suffixe est désormais déduit du chiffre affiché.
// Vérifie que la déduction redonne exactement l'ancien couple (sinon le rendu changerait).
function chiffres(anciens, page) {
  return liste(anciens).map((c) => {
    const m = /^(\d+)(\D*)$/.exec(s(c.valeur).trim());
    const anime = !!s(c.compte);
    if (anime && (!m || m[1] !== s(c.compte) || m[2] !== s(c.suffixe))) {
      avertir(`${page} : chiffre « ${c.valeur} » (compte ${c.compte}, suffixe « ${s(c.suffixe)} ») non déductible`);
    }
    return { valeur: s(c.valeur), texte: s(c.texte), note: s(c.note), animer: anime };
  });
}

function hero(d, filAriane, illustration) {
  return {
    type: "hero_institutionnel",
    masquer: false,
    fil_ariane: filAriane,
    surtitre: s(d.hero_eyebrow),
    titre_page: s(d.hero_h1),
    chapo: s(d.hero_chapo),
    bouton_principal: lien(d.hero_cta_principal_label, d.hero_cta_principal_url),
    bouton_secondaire: lien(d.hero_cta_secondaire_label, d.hero_cta_secondaire_url),
    etiquettes: liste(d.hero_chips).map(s),
    illustration,
  };
}

const seo = (d) => ({ meta_title: s(d.meta_title), meta_description: s(d.meta_description) });
const cartes = (l, f) => liste(l).map(f);

// ----- Notre démarche (français uniquement) -----
function demarche(d) {
  return {
    seo: seo(d),
    blocs: [
      // Fil d'Ariane écrit en dur dans l'ancien gabarit.
      hero(d, ["Accueil", "L'agence", "Notre démarche"], "demarche"),
      { type: "chiffres_compteurs", masquer: false, chiffres: chiffres(d.chiffres, "Notre démarche") },
      {
        type: "frise_methode", masquer: false, ancre: "methode",
        surtitre: s(d.methode_eyebrow), titre: s(d.methode_titre), sous_titre: s(d.methode_sous),
        etapes: cartes(d.methode_etapes, (e) => ({ numero: s(e.num), phase: s(e.label), titre: s(e.titre), texte: s(e.texte) })),
      },
      {
        type: "cartes_numerotees", masquer: false, sans_marge_haute: true, affichage: "grille", colonnes: "3",
        surtitre: s(d.ux_eyebrow), titre: s(d.ux_titre), sous_titre: s(d.ux_sous),
        cartes: cartes(d.ux_etapes, (e) => ({ titre: s(e.titre), texte: s(e.texte) })),
      },
      {
        type: "cartes_numerotees", masquer: false, sans_marge_haute: true, affichage: "carrousel", colonnes: "auto",
        surtitre: s(d.engagements_eyebrow), titre: s(d.engagements_titre), sous_titre: s(d.engagements_sous),
        cartes: cartes(d.engagements, (e) => ({ titre: s(e.titre), texte: s(e.texte) })),
      },
      {
        type: "cartes_texte", masquer: false, sans_marge_haute: true, presentation: "colonnes", fond: "blanc", colonnes: "auto",
        surtitre: s(d.dispositifs_eyebrow), titre: s(d.dispositifs_titre), sous_titre: s(d.dispositifs_sous),
        cartes: cartes(d.dispositifs, (e) => ({ titre: s(e.titre), texte: s(e.texte) })),
      },
    ],
  };
}

// ----- Notre entreprise / Company (même structure, contenus traduits) -----
function entreprise(d, langue) {
  const blocs = [
    // Fil d'Ariane écrit en dur (en français, y compris sur la page anglaise) dans l'ancien gabarit.
    hero(d, ["Accueil", "L'agence", "Notre entreprise"], "entreprise"),
    {
      type: "texte_simple", masquer: false,
      surtitre: s(d.apropos_eyebrow), titre: s(d.apropos_titre),
      // Un paragraphe par ancien élément de liste, séparés par une ligne vide (Markdown limité).
      texte: liste(d.apropos_paragraphes).map((p) => s(p).trim()).join("\n\n"),
    },
    { type: "chiffres_compteurs", masquer: false, chiffres: chiffres(d.chiffres, "Notre entreprise " + langue) },
    {
      type: "cartes_texte", masquer: false, sans_marge_haute: false, presentation: "encadrees", fond: "blanc", colonnes: "3",
      surtitre: s(d.culture_eyebrow), titre: s(d.culture_titre), sous_titre: s(d.culture_sous),
      cartes: cartes(d.culture_cartes, (c) => ({ titre: s(c.titre), texte: s(c.texte) })),
    },
    {
      type: "cartes_texte", masquer: false, sans_marge_haute: false, presentation: "encadrees", fond: "sombre", colonnes: "auto",
      surtitre: s(d.valeurs_eyebrow), titre: s(d.valeurs_titre), sous_titre: "",
      cartes: cartes(d.valeurs, (c) => ({ titre: s(c.titre), texte: s(c.texte) })),
    },
    {
      type: "cartes_texte", masquer: false, sans_marge_haute: false, presentation: "encadrees", fond: "blanc", colonnes: "4",
      surtitre: s(d.equipe_eyebrow), titre: s(d.equipe_titre), sous_titre: s(d.equipe_sous),
      cartes: cartes(d.equipe_metiers, (m) => ({ titre: s(m.nom), texte: "" })),
    },
    {
      type: "encart_bouton", masquer: false, sans_marge_haute: true, presentation: "encadre",
      titre: s(d.recrutement_titre), texte: s(d.recrutement_texte),
      bouton: lien(d.recrutement_cta_label, d.recrutement_cta_url),
    },
    {
      type: "cartes_texte", masquer: false, sans_marge_haute: true, presentation: "encadrees", fond: "blanc", colonnes: "auto",
      surtitre: s(d.agences_eyebrow), titre: s(d.agences_titre), sous_titre: s(d.agences_sous),
      cartes: cartes(d.agences, (a) => {
        const c = { titre: s(a.ville), texte: s(a.adresse) };
        // Libellé « Voir sur la carte » écrit en dur dans l'ancien gabarit (cartes françaises seulement).
        if (s(a.carte_url)) c.lien = lien("Voir sur la carte", a.carte_url);
        return c;
      }),
    },
  ];
  // Charte RSE : affichée seulement si son lien est rempli (absente de la page anglaise).
  if (s(d.rse_cta_url)) {
    blocs.push({
      type: "encart_bouton", masquer: false, sans_marge_haute: true, presentation: "libre",
      titre: s(d.rse_titre), texte: s(d.rse_texte), bouton: lien(d.rse_cta_label, d.rse_cta_url),
    });
  }
  return { seo: seo(d), blocs };
}

ecrire("contenus/fr/notre_demarche.json", demarche(lire("notre_demarche.json")));
ecrire("contenus/fr/notre_entreprise.json", entreprise(lire("notre_entreprise.json"), "fr"));
ecrire("contenus/en/notre_entreprise.json", entreprise(lire("en/notre_entreprise.json"), "en"));
