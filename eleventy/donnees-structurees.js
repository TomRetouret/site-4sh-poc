// Données structurées (schema.org, JSON-LD) : générées au build, réglables dans le back-office.
//
// Principe (docs/back-office/donnees-structurees.md) :
//  - base.njk retire du corps de page tout <script type="application/ld+json"> (filtre sansJsonLd)
//    et écrit dans le <head> le résultat du filtre donneesStructurees ;
//  - les schémas sont déduits du contenu rendu ou des champs déjà saisis, sans double saisie :
//      Organisation (Réglages · Données structurées, src/_data/donnees_structurees.json), toutes les pages ;
//      Fil d'Ariane (BreadcrumbList), lu dans <nav class="fil-ariane"> ;
//      FAQ (FAQPage), lue dans les blocs <div class="faq"> (details / summary) ;
//      Cours (Course), fiches formation (champs entete, inscription, chiffres) ;
//      Étude de cas (Article), fiches référence ;
//      JSON-LD personnalisé, saisi page par page (groupe « Données structurées » du Référencement) ;
//  - interrupteurs : globaux (activer.* dans Réglages) puis par page (referencement.donnees_structurees
//    ou seo.donnees_structurees : faq, fil_ariane, schema_page, json_ld) ;
//  - contrôles : avertissements « [données structurées] » au build (JSON invalide, @type manquant,
//    formation sans prix...). Ils ne bloquent jamais la construction du site.

const ENTITES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsquo: "\u2019", lsquo: "\u2018",
  ldquo: "\u201c", rdquo: "\u201d", laquo: "\u00ab", raquo: "\u00bb", hellip: "\u2026", eacute: "\u00e9",
  egrave: "\u00e8", agrave: "\u00e0", ccedil: "\u00e7", ecirc: "\u00ea", ocirc: "\u00f4", ucirc: "\u00fb", icirc: "\u00ee" };

function decoder(s) {
  return String(s).replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+);/gi, (m, e) => {
    if (e[0] === "#") {
      const n = e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : m;
    }
    return Object.prototype.hasOwnProperty.call(ENTITES, e.toLowerCase()) ? ENTITES[e.toLowerCase()] : m;
  });
}

function texte(html) {
  return decoder(String(html || "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(p|li|div|h[1-6])>/gi, " ")
    .replace(/<[^>]+>/g, ""))
    .replace(/\s+/g, " ").trim();
}

const absolue = (base, u) => {
  if (!u) return undefined;
  if (/^https?:\/\//i.test(u)) return u;
  return String(base || "").replace(/\/$/, "") + (u.startsWith("/") ? u : "/" + u);
};

const jsonScript = (o) => JSON.stringify(o).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");

// Zone d'un élément à partir de l'index de sa balise ouvrante (comptage des <div>).
function zoneDiv(html, debut) {
  const re = /<\/?div\b[^>]*>/gi;
  re.lastIndex = debut;
  let profondeur = 0, m;
  while ((m = re.exec(html))) {
    profondeur += m[0][1] === "/" ? -1 : 1;
    if (profondeur === 0) return html.slice(debut, m.index);
  }
  return html.slice(debut);
}

function faq(html) {
  const questions = [], vues = new Set();
  const reBloc = /<div\b[^>]*class="(?:[^"]*\s)?faq(?:\s[^"]*)?"[^>]*>/gi;
  let b;
  while ((b = reBloc.exec(html))) {
    const zone = zoneDiv(html, b.index);
    const reQ = /<details\b[^>]*>([\s\S]*?)<\/details>/gi;
    let q;
    while ((q = reQ.exec(zone))) {
      const s = /<summary\b[^>]*>([\s\S]*?)<\/summary>([\s\S]*)/i.exec(q[1]);
      if (!s) continue;
      const question = texte(s[1]), reponse = texte(s[2]);
      if (!question || !reponse || vues.has(question)) continue;
      vues.add(question);
      questions.push({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: reponse } });
    }
  }
  return questions;
}

function filAriane(html, base, url) {
  const m = /<nav\b[^>]*class="(?:[^"]*\s)?fil-ariane(?:\s[^"]*)?"[^>]*>([\s\S]*?)<\/nav>/i.exec(html);
  if (!m) return null;
  const items = [];
  const reA = /<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
  let a, fin = 0;
  while ((a = reA.exec(m[1]))) {
    const nom = texte(a[2]);
    if (nom) items.push({ nom, url: a[1] });
    fin = reA.lastIndex;
  }
  const dernier = texte(m[1].slice(fin)).replace(/^[\s›>/|·]+/, "").trim();
  if (dernier) items.push({ nom: dernier, url });
  else if (items.length) items[items.length - 1].url = items[items.length - 1].url || url;
  if (items.length < 2) return null;
  return {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.nom, item: absolue(base, it.url || url) }))
  };
}

function organisation(o, base) {
  const r = {
    "@context": "https://schema.org", "@type": o.type || "Organization", "@id": absolue(base, "/#organisation"),
    name: o.nom || "4SH", url: absolue(base, "/")
  };
  if (o.logo) r.logo = absolue(base, o.logo);
  if (o.description) r.description = o.description;
  if (o.date_creation) r.foundingDate = String(o.date_creation);
  if (o.telephone) r.telephone = o.telephone;
  if (o.email) r.email = o.email;
  const adr = (o.adresses || []).filter((x) => x && (x.ville || x.rue));
  if (adr.length) r.address = adr.map((x) => {
    const p = { "@type": "PostalAddress" };
    if (x.rue) p.streetAddress = x.rue;
    if (x.code_postal) p.postalCode = String(x.code_postal);
    if (x.ville) p.addressLocality = x.ville;
    p.addressCountry = x.pays || "FR";
    return p;
  });
  const reseaux = (o.reseaux || []).map((x) => (typeof x === "string" ? x : x && x.url)).filter(Boolean);
  if (reseaux.length) r.sameAs = reseaux;
  return r;
}

const nombre = (v) => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(String(v).replace(",", ".").replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && String(v).match(/[0-9]/) ? n : null;
};

function cours(d, ctx, org, avertir) {
  const e = d.entete || {}, ins = d.inscription || {}, ch = d.chiffres || {};
  const reg = (ctx.reglages && ctx.reglages.formations) || {};
  const nom = ["Formation " + (e.titre || ""), e.sous_titre].filter((x) => x && x.trim()).join(" - ").trim();
  const r = {
    "@context": "https://schema.org", "@type": "Course", name: nom,
    description: e.chapo || ctx.description || nom,
    url: absolue(ctx.base, ctx.url), inLanguage: ctx.lang || "fr",
    provider: { "@type": "Organization", name: org.nom || "4SH", sameAs: absolue(ctx.base, "/") }
  };
  if (e.image) r.image = absolue(ctx.base, e.image);
  const prix = nombre(ins.prix);
  if (prix !== null) r.offers = [{ "@type": "Offer", category: "Paid", price: prix, priceCurrency: reg.devise || "EUR", url: r.url }];
  else avertir("formation sans prix (schéma Cours incomplet)");
  const modes = (reg.modes && reg.modes.length) ? reg.modes : ["Onsite", "Online"];
  const heures = nombre(ch.duree_heures);
  const jours = nombre(ch.duree_jours);
  const charge = heures !== null ? "PT" + heures + "H" : (jours !== null ? "P" + jours + "D" : undefined);
  const auj = new Date().toISOString().slice(0, 10);
  const sessions = (ins.sessions || []).filter((s) => s && s.debut && String(s.fin || s.debut) >= auj);
  const instance = (s) => {
    const i = { "@type": "CourseInstance", courseMode: modes.length === 1 ? modes[0] : modes };
    if (charge) i.courseWorkload = charge;
    if (s && s.debut) i.startDate = String(s.debut);
    if (s && s.fin) i.endDate = String(s.fin);
    return i;
  };
  r.hasCourseInstance = sessions.length ? sessions.map(instance) : [instance(null)];
  if (!charge) avertir("formation sans durée (courseWorkload absent)");
  const note = nombre(ch.note), avis = nombre(ch.avis);
  if (note !== null && avis) r.aggregateRating = { "@type": "AggregateRating", ratingValue: note, bestRating: 5, ratingCount: avis };
  return r;
}

function etudeDeCas(d, ctx, org) {
  const titre = d.h1 || d.titre;
  if (!titre) return null;
  const r = {
    "@context": "https://schema.org", "@type": "Article", headline: texte(titre).slice(0, 110),
    mainEntityOfPage: absolue(ctx.base, ctx.url), inLanguage: ctx.lang || "fr",
    author: { "@type": "Organization", name: org.nom || "4SH", url: absolue(ctx.base, "/") },
    publisher: { "@type": "Organization", name: org.nom || "4SH" }
  };
  if (org.logo) r.publisher.logo = { "@type": "ImageObject", url: absolue(ctx.base, org.logo) };
  const desc = d.sous_titre || d.resume || ctx.description;
  if (desc) r.description = texte(desc);
  const img = d.image || d.logo;
  if (img) r.image = absolue(ctx.base, typeof img === "string" ? img : img.fichier);
  if (d.maj) r.dateModified = String(d.maj);
  if (d.client) r.about = { "@type": "Organization", name: d.client };
  return r;
}

function personnalise(source, avertir) {
  if (!source || !String(source).trim()) return [];
  let v;
  try { v = JSON.parse(source); } catch (e) { avertir("JSON-LD personnalisé invalide, ignoré (" + e.message + ")"); return []; }
  const liste = Array.isArray(v) ? v : [v];
  return liste.filter((o) => {
    if (!o || typeof o !== "object" || Array.isArray(o)) { avertir("JSON-LD personnalisé : un élément n'est pas un objet, ignoré"); return false; }
    if (!o["@type"] && !o["@graph"]) { avertir("JSON-LD personnalisé : @type manquant, élément ignoré"); return false; }
    if (!o["@context"]) o["@context"] = "https://schema.org";
    return true;
  });
}

function donneesStructurees(content, ctx) {
  ctx = ctx || {};
  const html = String(content || "");
  const reg = ctx.reglages || {};
  const actif = reg.activer || {};
  const p = (ctx.page && typeof ctx.page === "object") ? ctx.page : {};
  const org = reg.organisation || {};
  const d = ctx.donnees || {};
  const url = ctx.url || "/";
  const avertir = (m) => console.warn(`[données structurées] ${url} : ${m}`);
  const sortie = [];

  if (actif.organisation !== false) sortie.push(organisation(org, ctx.base));
  if (actif.fil_ariane !== false && p.fil_ariane !== false) {
    const f = filAriane(html, ctx.base, url);
    if (f) sortie.push(f);
  }
  if (actif.faq !== false && p.faq !== false) {
    const q = faq(html);
    if (q.length) sortie.push({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: q });
  }
  if (p.schema_page !== false) {
    if (actif.cours !== false && d.inscription && d.entete) sortie.push(cours(d, ctx, org, avertir));
    else if (actif.etudes_de_cas !== false && url.startsWith("/references/") && url !== "/references/" && d.client) {
      const a = etudeDeCas(d, ctx, org);
      if (a) sortie.push(a);
    }
  }
  sortie.push(...personnalise(p.json_ld, avertir));
  return sortie.map((o) => `<script type="application/ld+json">${jsonScript(o)}</script>`).join("\n");
}

const sansJsonLd = (content) =>
  String(content || "").replace(/[ \t]*<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>[ \t]*\n?/gi, "");

module.exports = function (eleventyConfig) {
  eleventyConfig.addFilter("donneesStructurees", donneesStructurees);
  eleventyConfig.addFilter("sansJsonLd", sansJsonLd);
};
module.exports.outils = { donneesStructurees, sansJsonLd, faq, filAriane, texte };
