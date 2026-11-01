#!/usr/bin/env node
/*
  Migration des pages uniques vers des fiches structurées (champs regroupés dans l'ordre de la page).
  Spécification : docs/back-office/schema-pages.md

  Fichiers de données (JSON) : les champs à plat deviennent des groupes (seo, hero, sections).
    src/_data/page_formations.json, src/_data/en/page_formations.json
    src/_data/page_technologies.json, src/_data/en/page_technologies.json
    src/_data/page_references.json, src/_data/page_glossaire.json
    src/_data/contact.json, src/_data/page_podcasts.json
  Pages Markdown (front matter) : groupe « referencement » (et non « seo », qui masquerait la donnée
  globale seo), groupe « hero » pour Intelligence artificielle, groupe « suivi » pour les notes internes.
    src/intelligence-artificielle.md, src/mentions-legales.md, src/rgpd.md

  Champs jamais affichés par le site, retirés (valeurs dans l'historique Git) :
    page_glossaire : cta_titre, cta_texte, cta_label, cta_url
    page_technologies (FR et EN) : cta_titre, cta_label, cta_url

  Idempotent : un fichier déjà migré (groupe seo ou referencement présent) est laissé tel quel.
  Usage : node scripts/migrer-pages-uniques.js
*/
const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const yaml = require("js-yaml");

const racine = path.join(__dirname, "..");
const src = path.join(racine, "src");
const s = (v) => (v == null ? "" : String(v));
const liste = (v) => (Array.isArray(v) ? v : []);
const lien = (texte, url) => ({ texte: s(texte), lien: s(url) });
const seo = (d) => ({ meta_title: s(d.meta_title), meta_description: s(d.meta_description) });

function majJson(rel, convertir) {
  const cible = path.join(src, rel);
  const avant = fs.readFileSync(cible, "utf8");
  const d = JSON.parse(avant);
  const deja = d.seo && typeof d.seo === "object";
  const texte = deja ? avant : JSON.stringify(convertir(d), null, 2) + "\n";
  if (texte !== avant) fs.writeFileSync(cible, texte);
  console.log((texte === avant ? "inchangé " : "écrit    ") + "src/" + rel);
}

function majMarkdown(rel, convertir) {
  const cible = path.join(src, rel);
  const avant = fs.readFileSync(cible, "utf8");
  const f = matter(avant);
  if (f.data.referencement && typeof f.data.referencement === "object") {
    console.log("inchangé src/" + rel);
    return;
  }
  const front = yaml.dump(convertir(f.data), { lineWidth: -1, noRefs: true, quotingType: '"' });
  const texte = "---\n" + front + "---\n" + (f.content.startsWith("\n") ? "" : "\n") + f.content;
  fs.writeFileSync(cible, texte);
  console.log("écrit    src/" + rel);
}

// ----- Formations (page mère) -----
const formations = (d) => ({
  seo: seo(d),
  hero: {
    surtitre: s(d.eyebrow), titre: s(d.h1), chapo: s(d.chapo),
    note: s(d.note), note_detail: s(d.note_detail),
    bouton_principal: lien(d.hero_cta_principal_label, d.hero_cta_principal_url),
    bouton_secondaire: lien(d.hero_cta_secondaire_label, d.hero_cta_secondaire_url),
    etiquettes: liste(d.hero_chips).map(s),
    etapes: liste(d.hero_etapes).map(s),
  },
  pourquoi: { titre: s(d.pourquoi_titre), cartes: liste(d.pourquoi).map((c) => ({ titre: s(c.titre), texte: s(c.texte) })) },
  catalogue: { titre: s(d.catalogue_titre), sous_titre: s(d.catalogue_sous) },
  agenda: {
    titre: s(d.agenda_titre), sous_titre: s(d.agenda_sous),
    bouton: lien(d.agenda_cta_label, d.agenda_cta_url),
    mois: liste(d.agenda),
  },
  qualiopi: { titre: s(d.qualiopi_titre), texte: s(d.qualiopi_texte) },
  temoignages: { titre: s(d.temoignages_titre), liste: liste(d.temoignages) },
});

// ----- Expertises techniques (page mère) -----
// Le bouton du haut de page était écrit en dur dans le gabarit (en français, y compris en anglais).
const technologies = (d) => ({
  seo: seo(d),
  hero: { surtitre: s(d.hero_eyebrow), titre: s(d.hero_titre), intro: s(d.hero_intro), bouton: lien("Parlons de votre projet", "/contact/") },
  phares: { titre: s(d.phares_titre) },
  autres: { intro: s(d.autres_intro), technos: liste(d.autres).map((a) => ({ nom: s(a.nom), logo: s(a.logo) })) },
});

const enteteSimple = (d) => ({ seo: seo(d), hero: { surtitre: s(d.eyebrow), titre: s(d.h1), chapo: s(d.chapo) } });
const contact = (d) => ({ seo: seo(d), hero: { titre: s(d.h1), chapo: s(d.chapo) } });
const podcasts = (d) => ({
  seo: seo(d),
  hero: {
    surtitre: s(d.eyebrow), titre: s(d.h1), chapo: s(d.chapo),
    plateformes: liste(d.plateformes).map((p) => ({ label: s(p.label), url: s(p.url) })),
  },
  episodes: liste(d.episodes),
});

// ----- Pages Markdown -----
const suivi = (d, cles) => {
  const o = {};
  cles.forEach((k) => { if (d[k] !== undefined) o[k] = s(d[k]); });
  return o;
};
const pageLibre = (d) => ({
  layout: d.layout, permalink: d.permalink, titre: s(d.titre),
  referencement: seo(d),
  hero: { surtitre: s(d.eyebrow), titre: s(d.h1), chapo: s(d.chapo), bouton: lien(d.cta_label, d.cta_url) },
  references: liste(d.references),
  faq: liste(d.faq),
  contact_final: d.contact_final !== false,
  suivi: suivi(d, ["requete_cible", "source_confluence", "source_url"]),
});
const pageLegale = (d) => {
  const o = { layout: d.layout, permalink: d.permalink, titre: s(d.titre), h1: s(d.h1) };
  if (d.maj !== undefined) o.maj = s(d.maj);
  o.referencement = seo(d);
  o.suivi = suivi(d, ["source_url"]);
  return o;
};

majJson("_data/page_formations.json", formations);
majJson("_data/en/page_formations.json", formations);
majJson("_data/page_technologies.json", technologies);
majJson("_data/en/page_technologies.json", technologies);
majJson("_data/page_references.json", enteteSimple);
majJson("_data/page_glossaire.json", enteteSimple);
majJson("_data/contact.json", contact);
majJson("_data/page_podcasts.json", podcasts);
majMarkdown("intelligence-artificielle.md", pageLibre);
majMarkdown("mentions-legales.md", pageLegale);
majMarkdown("rgpd.md", pageLegale);
