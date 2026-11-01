module.exports = function (eleventyConfig) {
  // Fichiers copiés tels quels vers le site généré
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "admin": "admin" });
  // Back-office (preuve de concept) : configuration Decap et gabarits d'aperçu partagés Sveltia / Decap
  eleventyConfig.addPassthroughCopy({ "admin-decap": "admin-decap" });
  eleventyConfig.addPassthroughCopy({ "admin-shared": "admin-shared" });
  eleventyConfig.addPassthroughCopy({ "src/uploads": "uploads" });
  // Redirections 301 des anciennes URLs (.html) vers la refonte : lu par Netlify à la racine du site.
  eleventyConfig.addPassthroughCopy({ "src/_redirects": "_redirects" });

  // Filtre "accent" : le rédacteur écrit *mot* dans le CMS, le site affiche <em class="accent">mot</em>.
  // Objectif : plus aucune balise HTML à taper à la main dans les champs de titre.
  // Shortcode "learningScene" : hero de /formations/ (4SH Learning). Écrit l'état final de
  // l'animation en SVG statique, avec le même modèle que le script du navigateur.
  eleventyConfig.addShortcode("learningScene", (noms) => {
    delete require.cache[require.resolve("./src/assets/learning-scene.js")];
    return require("./src/assets/learning-scene.js").balisage(noms);
  });

  eleventyConfig.addFilter("accent", (s) =>
    s == null ? "" : String(s).replace(/\*([^*\n]+)\*/g, '<em class="accent">$1</em>')
  );

  // -------------------------------------------------------------------------
  // Filtre "blocs" : répartit le corps markdown d'une page dans les blocs de
  // la charte, au lieu d'un long bloc de prose.
  //
  // Chaque H2 devient une section, avec un fond alterné (blanc / crème) et un
  // temps fort sur fond sombre. Selon la forme de la section, ses H3 sont
  // rendus en cartes, en atouts sur deux colonnes ou en étapes numérotées.
  // Les listes deviennent des checklists, et un paragraphe qui ne contient
  // qu'un lien devient un bouton.
  //
  // Aucun contenu n'est ajouté ni retiré : seule la mise en forme change.
  // -------------------------------------------------------------------------
  const txt = (h) => String(h || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

  // découpe un fragment HTML sur ses <h2> ou ses <h3>
  const decouper = (html, tag) => {
    const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "g");
    const marques = [];
    let m;
    while ((m = re.exec(html)) !== null) {
      marques.push({ debut: m.index, fin: m.index + m[0].length, titre: m[1] });
    }
    if (!marques.length) return { intro: html, items: [] };
    return {
      intro: html.slice(0, marques[0].debut),
      items: marques.map((mk, i) => ({
        titre: mk.titre,
        corps: html.slice(mk.fin, i + 1 < marques.length ? marques[i + 1].debut : html.length)
      }))
    };
  };

  // un paragraphe qui ne contient qu'un lien = un appel à l'action.
  // On n'accepte qu'un paragraphe dont le contenu EST le lien, sinon la
  // première phrase d'une section liée avale tout le reste du bloc.
  const extraireCta = (html) => {
    const ctas = [];
    const reste = html.replace(/<p>([\s\S]*?)<\/p>/g, (tout, dedans) => {
      const m = dedans.trim().match(/^<a href="([^"]+)"([^>]*)>([\s\S]*?)<\/a>$/);
      if (!m || /<a[\s>]/i.test(m[3])) return tout;
      ctas.push({ url: m[1], label: txt(m[3]), externe: /target=/.test(m[2]) });
      return "";
    });
    return { reste, ctas };
  };

  const listes = (html) =>
    html.replace(/<ul>/g, '<ul class="sect-liste">').replace(/<ol>/g, '<ol class="sect-liste">');

  const echapper = (s) =>
    String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const boutons = (ctas) =>
    ctas.length
      ? `<div class="hero-cta" style="margin-top:30px">${ctas
          .map(
            (c, i) =>
              `<a class="btn ${i === 0 ? "btn-primary" : "btn-ghost"}" href="${c.url}"${
                c.externe ? ' target="_blank" rel="noopener"' : ""
              }>${c.label}</a>`
          )
          .join("")}</div>`
      : "";

  // Au-delà de trois cartes, la grille ne se casse plus sur deux rangées
  // inégales : elle défile en carrousel, même composant que la page d'accueil.
  const SEUIL_CARROUSEL = 4;
  const grilleCartes = (cartes, label, variante) =>
    cartes.length >= SEUIL_CARROUSEL
      ? `<div class="carrousel car--blocs${
          variante === "refs" ? " car--refs" : ""
        }" data-carrousel data-carrousel-auto="off" aria-label="${
          echapper(txt(label)) || "Éléments"
        }"><div class="car-piste" tabindex="0" role="group" aria-label="Faites défiler">${cartes.join("")}</div><div class="car-dots"></div></div>`
      : `<div class="${
          variante === "refs" ? "sect-refs-inline" : "sect-defis"
        }">${cartes.join("")}</div>`;

  // une liste à puces de trois éléments ou plus devient une grille de cartes :
  // « **Titre** : texte » donne une carte titrée, un lien seul donne une carte
  // cliquable, le reste reste une puce.
  const listeEnCartes = (dedans, type, label) => {
    const lis = [];
    const re = /<li>([\s\S]*?)<\/li>/g;
    let m;
    while ((m = re.exec(dedans)) !== null) lis.push(m[1].trim());
    if (lis.length < 3) return null;
    const carte = type === "atouts" ? "sect-atout" : "sect-defi";
    const cartes = lis.map((li) => {
      let t = li.match(/^<strong>([\s\S]*?)<\/strong>\s*:?\s*([\s\S]*)$/);
      if (t) return `<div class="${carte}"><h3>${t[1]}</h3><p>${t[2].trim()}</p></div>`;
      t = li.match(/^<a href="([^"]+)"([^>]*)>([\s\S]*?)<\/a>$/);
      if (t)
        return `<a class="${carte} sect-defi--lien" href="${t[1]}"><h3>${t[3]}</h3><span class="socle-lien">Découvrir &rarr;</span></a>`;
      return `<div class="${carte}"><p>${li}</p></div>`;
    });
    if (type === "atouts") return `<div class="sect-atouts">${cartes.join("")}</div>`;
    return grilleCartes(cartes, label);
  };

  const RE_ETAPES = /approche|m[ée]thode|m[ée]thodologie|d[ée]marche|fa[çc]on de|en pratique|^comment|cycle|process|quatre temps|notre veille/i;
  const RE_ATOUTS = /pourquoi|atout|choisir|confiance|nous choisissent|diff[ée]renc|engagement/i;

  const rendreItems = (items, type, label) => {
    if (type === "etapes") {
      return `<div class="sect-etapes">${items
        .map(
          (it) =>
            `<div class="sect-etape"><div><h3>${it.titre}</h3>${listes(it.corps)}</div></div>`
        )
        .join("")}</div>`;
    }
    if (type === "atouts") {
      return `<div class="sect-atouts">${items
        .map((it) => `<div class="sect-atout"><h3>${it.titre}</h3>${listes(it.corps)}</div>`)
        .join("")}</div>`;
    }
    return grilleCartes(
      items.map((it) => `<div class="sect-defi"><h3>${it.titre}</h3>${listes(it.corps)}</div>`),
      label
    );
  };

  // Aperçu d'une fiche référence : quand une section parle d'un projet, le
  // renvoi discret est remplacé par une carte d'aperçu de la fiche, posée à
  // côté du texte imposé par la page.
  const apercuRef = (ref) => {
    const d = ref.data || {};
    const visuel = d.image
      ? `<img src="${echapper(d.image)}" alt="${echapper(d.titre)}" loading="lazy" decoding="async">`
      : `<span class="ref-vide-nom">${echapper(d.client)}</span>`;
    const logo = d.logo
      ? `<img src="${echapper(d.logo)}" alt="${echapper(d.client)}" loading="lazy" decoding="async">`
      : `<span class="ref-cartouche-txt">${echapper(d.client)}</span>`;
    const tags = (d.technologies || [])
      .slice(0, 4)
      .map((t) => `<span>${echapper(t)}</span>`)
      .join("");
    return (
      `<a class="sect-ref-apercu" href="${ref.url}">` +
      `<div class="sect-ref-visuel${d.image ? "" : " ref-visuel--vide"}">${visuel}` +
      `<div class="ref-cartouche">${logo}</div></div>` +
      `<div class="sect-ref-corps">` +
      `<span class="sect-ref-label">${
        d.secteurs && d.secteurs.length ? echapper(d.secteurs[0]) : "Référence client"
      }</span>` +
      `<h3>${echapper(d.titre)}</h3>` +
      (d.resume ? `<p>${echapper(d.resume)}</p>` : "") +
      (tags ? `<div class="ref-tags">${tags}</div>` : "") +
      `<span class="socle-lien">Voir la référence &rarr;</span>` +
      `</div></a>`
    );
  };

  const refDeCorps = (corps, parSlug) => {
    const m = String(corps).match(/\/references\/([a-z0-9-]+)\//i);
    return m && parSlug[m[1]] ? parSlug[m[1]] : null;
  };

  // Une section qui présente plusieurs projets : chaque sous-titre devient une
  // carte d'aperçu de la fiche référence citée. Le titre et le texte sont ceux
  // imposés par la page, le visuel et le logo viennent de la fiche.
  const carteRefItem = (it, ref) => {
    let corps = it.corps;
    let lien = ref ? ref.url : "";
    let libelle = "Voir la référence";
    // un renvoi en fin de paragraphe devient le lien de la carte, avec son
    // libellé d'origine. Un lien en milieu de phrase reste dans le texte.
    const mFin = corps.match(/\s*<a href="([^"]+)"([^>]*)>([^<]*)<\/a>\s*<\/p>/);
    if (mFin && (!ref || mFin[1] === ref.url)) {
      lien = mFin[1];
      libelle = txt(mFin[3]);
      corps = corps.replace(mFin[0], "</p>").replace(/<p>\s*<\/p>/g, "");
    }
    const d = ref ? ref.data || {} : {};
    const visuel = d.image
      ? `<img src="${echapper(d.image)}" alt="${echapper(d.titre)}" loading="lazy" decoding="async">`
      : `<span class="ref-vide-nom">${echapper(
          d.client || txt(it.titre).split(/[,:–-]/)[0].trim()
        )}</span>`;
    const cartouche = d.logo
      ? `<div class="ref-cartouche"><img src="${echapper(d.logo)}" alt="${echapper(
          d.client
        )}" loading="lazy" decoding="async"></div>`
      : d.client
      ? `<div class="ref-cartouche"><span class="ref-cartouche-txt">${echapper(
          d.client
        )}</span></div>`
      : "";
    const etiquette = d.secteurs && d.secteurs.length ? echapper(d.secteurs[0]) : "Projet";
    return (
      `<div class="sect-ref-carte">` +
      `<div class="sect-ref-visuel${d.image ? "" : " ref-visuel--vide"}">${visuel}${cartouche}</div>` +
      `<div class="sect-ref-corps">` +
      `<span class="sect-ref-label">${etiquette}</span>` +
      `<h3>${it.titre}</h3>` +
      `<div class="sect-ref-texte">${listes(corps)}</div>` +
      (lien
        ? `<a class="socle-lien" href="${lien}"${
            /^https?:/.test(lien) ? ' target="_blank" rel="noopener"' : ""
          }>${libelle} &rarr;</a>`
        : "") +
      `</div></div>`
    );
  };

  // -------------------------------------------------------------------------
  // Page d'accueil en blocs (docs/back-office/schema-blocs.md)
  // -------------------------------------------------------------------------
  // Premier bloc d'un type donné dans une liste de blocs, masqué ou non
  // (le hero reprend les étapes du premier bloc methode_4d).
  eleventyConfig.addFilter("premierBloc", (blocs, type) =>
    (blocs || []).find((b) => b && b.type === type) || null
  );
  // Étapes du bloc methode_4d vers la forme attendue par frise_etapes (num, label).
  eleventyConfig.addFilter("etapesFrise", (etapes) =>
    (etapes || []).map((e) => ({ num: e.numero, label: e.phase, titre: e.titre, texte: e.texte }))
  );
  // Cadrage d'une image : attribut style object-position, rien au cadrage centre.
  const CADRAGES = { haut: "center top", bas: "center bottom", gauche: "left center", droite: "right center" };
  eleventyConfig.addFilter("cadrageStyle", (cadrage) =>
    CADRAGES[cadrage] ? ` style="object-position: ${CADRAGES[cadrage]}"` : ""
  );

  // Retrouve la fiche référence correspondant à une URL, pour les gabarits
  // qui déclarent leurs références sous forme de liens (fiches technologie).
  eleventyConfig.addFilter("ficheRef", (refs, lien) =>
    (refs || []).find((r) => r.url === lien) || null
  );

  // Transforme une liste de { label, url } en boutons pour le hero : le
  // premier est plein, les suivants fantomes. prefixe s'ajoute aux libelles.
  eleventyConfig.addFilter("boutons", (liste, prefixe) =>
    (liste || []).map((x, i) => ({
      label: (prefixe || "") + (x.label || ""),
      url: x.url,
      fantome: i > 0,
      externe: true
    }))
  );

  // Mémoire des références déjà mises en avant dans le corps d'une page :
  // le gabarit s'en sert pour ne pas répéter le bloc « projets liés » en pied.
  const refsParPage = new Map();
  eleventyConfig.addFilter("refsMisesEnAvant", (url) => refsParPage.get(url) || []);
  eleventyConfig.addFilter("sansRefs", (liste, exclues) =>
    (liste || []).filter((s) => !(exclues || []).includes(s))
  );

  eleventyConfig.addFilter("blocs", function (contenu, refs, urlPage) {
    if (!contenu) return "";
    const parSlug = {};
    (refs || []).forEach((r) => {
      if (r && r.fileSlug) parSlug[r.fileSlug] = r;
    });
    const misesEnAvant = [];
    const { intro, items } = decouper(String(contenu), "h2");
    const sorties = [];
    let rang = 0; // sert à alterner les fonds
    let sombreUtilise = false;
    let precedent = null; // traitement de la section précédente

    const section = (titre, corps, indexTitre, dernier) => {
      const c = extraireCta(corps);
      const { intro: sIntro, items: h3 } = decouper(c.reste, "h3");

      // une section sans H3 dont le corps porte une vraie liste : on la sort
      // en grille de cartes plutôt qu'en puces alignées
      let grille = "";
      let texteAvant = sIntro;
      let listeBrute = null;
      if (!h3.length) {
        const mUl = sIntro.match(/<ul>([\s\S]*?)<\/ul>/);
        if (mUl && listeEnCartes(mUl[1], "cartes", titre)) {
          listeBrute = mUl[1];
          texteAvant = sIntro.slice(0, mUl.index) + sIntro.slice(mUl.index + mUl[0].length);
        }
      }

      // la section parle d'un projet documenté en référence : on prépare son aperçu
      let ref = null;
      if (!h3.length && !listeBrute) {
        const trouve = String(corps).match(/\/references\/([a-z0-9-]+)\//i);
        if (trouve && parSlug[trouve[1]] && misesEnAvant.indexOf(trouve[1]) === -1) {
          ref = parSlug[trouve[1]];
          misesEnAvant.push(trouve[1]);
        }
      }

      // quel traitement pour cette section ?
      let type = "prose";
      if (listeBrute) type = "cartes";
      if (h3.length) {
        const moyenne = h3.reduce((n, it) => n + txt(it.corps).length, 0) / h3.length;
        if (RE_ETAPES.test(txt(titre)) && h3.length >= 3) type = "etapes";
        else if (RE_ATOUTS.test(txt(titre)) && h3.length >= 2) type = "atouts";
        else if (h3.length >= 3 && moyenne < 420) type = "cartes";
        else type = "atouts";
        // deux sections voisines ne portent pas le même traitement : sinon la
        // page enchaîne six grilles identiques et redevient monotone.
      }
      if (ref) type = "ref";
      // plusieurs sous-titres qui parlent chacun d'un projet : galerie d'aperçus
      let refsItems = null;
      if (h3.length >= 2) {
        const trouves = h3.map((it) => refDeCorps(it.corps, parSlug));
        const distincts = trouves.filter(Boolean).map((r) => r.fileSlug);
        const uniques = distincts.filter((v, k) => distincts.indexOf(v) === k);
        if (uniques.length >= 2 && distincts.length / h3.length >= 0.6) {
          type = "refs";
          refsItems = trouves;
          uniques.forEach((sl) => {
            if (misesEnAvant.indexOf(sl) === -1) misesEnAvant.push(sl);
          });
        }
      }
      if (type === precedent && (type === "cartes" || type === "atouts")) {
        type = type === "cartes" ? "atouts" : "cartes";
      }
      // deux sections de prose qui se suivent : la seconde passe en deux
      // colonnes, titre à gauche et texte à droite, pour casser le pavé.
      if (type === "prose" && precedent === "prose" && titre) type = "duo";
      precedent = type === "duo" ? "prose" : type;

      if (listeBrute) grille = listeEnCartes(listeBrute, type, titre);

      // fond : un temps fort sombre sur la première section en étapes,
      // alternance blanc / crème pour le reste
      let fond = "";
      if (type === "etapes" && !sombreUtilise && rang > 0) {
        fond = " sect-bloc--sombre";
        sombreUtilise = true;
      } else if (rang % 2 === 1) {
        fond = " sect-bloc--creme";
      }
      rang += 1;

      const eyebrow = indexTitre
        ? `<p class="eyebrow eyebrow--rang">${String(indexTitre).padStart(2, "0")}</p>`
        : "";
      const h2 = titre ? `<h2>${titre}</h2>` : "";
      const chapeau = txt(texteAvant) ? `<div class="sect-prose">${listes(texteAvant)}</div>` : "";
      const corpsItems =
        type === "refs"
          ? grilleCartes(
              h3.map((it, k) => carteRefItem(it, refsItems[k])),
              titre,
              "refs"
            )
          : h3.length
          ? rendreItems(h3, type === "duo" ? "atouts" : type, titre)
          : grille;

      // section de mise en avant d'un projet : texte de la page à gauche,
      // aperçu de la fiche référence à droite. Le lien vers la fiche n'est pas
      // répété en bouton puisque la carte entière est cliquable.
      if (type === "ref") {
        const autres = c.ctas.filter((x) => x.url !== ref.url);
        return `<section class="sect-bloc${fond} sect-bloc--ref"><div class="container">${eyebrow}${h2}<div class="sect-ref-duo"><div class="sect-prose sect-ref-texte">${listes(
          texteAvant
        )}</div>${apercuRef(ref)}</div>${boutons(autres)}</div></section>`;
      }

      if (type === "duo") {
        return `<section class="sect-bloc${fond}"><div class="container"><div class="sect-duo"><div>${eyebrow}${h2}</div><div>${chapeau}${corpsItems}${boutons(
          c.ctas
        )}</div></div></div></section>`;
      }

      // une dernière section courte qui ne porte qu'un bouton devient un
      // bandeau d'appel à l'action centré plutôt qu'un paragraphe orphelin
      if (dernier && !h3.length && c.ctas.length && txt(sIntro).length < 400) {
        return `<section class="sect-bloc${fond} sect-bloc--cta"><div class="container">${h2}${chapeau}${boutons(
          c.ctas
        )}</div></section>`;
      }

      return `<section class="sect-bloc${fond}"><div class="container">${eyebrow}${h2}${chapeau}${corpsItems}${boutons(
        c.ctas
      )}</div></section>`;
    };

    // préambule : le texte avant le premier H2 (et ses éventuels H3)
    if (txt(intro)) sorties.push(section("", intro, 0));
    items.forEach((s, i) =>
      sorties.push(section(s.titre, s.corps, i + 1, i === items.length - 1))
    );
    if (urlPage) refsParPage.set(urlPage, misesEnAvant);
    return sorties.join("\n");
  });

  // Rang d'affichage des niveaux de formation
  const RANG_NIVEAU = { "Essentiel": 1, "Fondamental": 2, "Intermédiaire": 3, "Avancé": 4 };
  const rang = (n) => RANG_NIVEAU[n] || 9;
  const prixNombre = (p) => parseInt(String(p || "").replace(/[^0-9]/g, ""), 10) || 0;

  // Collection des formations (une fiche = un niveau = un fichier Markdown)
  eleventyConfig.addCollection("formations", (collectionApi) => {
    return collectionApi
      .getFilteredByGlob("src/content/formations/*.md")
      .sort((a, b) => (a.data.titre || "").localeCompare(b.data.titre || ""));
  });

  // Formations regroupées par techno (une carte au catalogue, plusieurs niveaux)
  eleventyConfig.addCollection("formationsParGroupe", (collectionApi) => {
    const items = collectionApi.getFilteredByGlob("src/content/formations/*.md");
    const groupes = {};
    items.forEach((it) => {
      const g = it.data.groupe || it.fileSlug;
      (groupes[g] = groupes[g] || []).push(it);
    });
    return Object.keys(groupes)
      .map((g) => {
        const list = groupes[g].sort((a, b) => rang(a.data.niveau) - rang(b.data.niveau));
        const entree = list[0];
        const min = Math.min(...list.map((l) => prixNombre(l.data.prix)).filter((n) => n > 0));
        return {
          groupe: g,
          titre: entree.data.titre,
          categorie: entree.data.categorie,
          image: entree.data.image,
          chapo: entree.data.chapo,
          avis: entree.data.avis,
          prixMin: isFinite(min) ? min : prixNombre(entree.data.prix),
          url: entree.url,
          niveaux: list.map((l) => ({
            niveau: l.data.niveau,
            duree: l.data.duree,
            url: l.url,
            prix: l.data.prix
          }))
        };
      })
      .sort((a, b) => (a.titre || "").localeCompare(b.titre || ""));
  });

  // Prestations (une page d'offre = un fichier Markdown), triées par famille puis ordre
  eleventyConfig.addCollection("prestations", (collectionApi) => {
    return collectionApi
      .getFilteredByGlob("src/content/prestations/*.md")
      .sort((a, b) => (a.data.ordre || 99) - (b.data.ordre || 99) || (a.data.titre || "").localeCompare(b.data.titre || ""));
  });

  // Références (une fiche projet = un fichier Markdown)
  eleventyConfig.addCollection("references", (collectionApi) => {
    return collectionApi
      .getFilteredByGlob("src/content/references/*.md")
      .sort((a, b) => (a.data.ordre || 99) - (b.data.ordre || 99) || (a.data.titre || "").localeCompare(b.data.titre || ""));
  });

  // Technologies (une fiche = un fichier Markdown), triées par ordre d'affichage
  eleventyConfig.addCollection("technologies", (collectionApi) => {
    return collectionApi
      .getFilteredByGlob("src/content/technologies/*.md")
      .sort((a, b) => (a.data.ordre || 99) - (b.data.ordre || 99));
  });

  // Valeurs uniques pour les filtres de la page Références
  eleventyConfig.addCollection("referenceFiltres", (collectionApi) => {
    const items = collectionApi.getFilteredByGlob("src/content/references/*.md");
    const uniq = (key) => {
      const set = new Set();
      items.forEach((it) => (it.data[key] || []).forEach((v) => set.add(v)));
      return Array.from(set).sort((a, b) => a.localeCompare(b));
    };
    return { secteurs: uniq("secteurs"), technologies: uniq("technologies") };
  });

  // Glossaire : termes lus sur le disque (fiable même en permalink:false), groupés par lettre
  eleventyConfig.addCollection("glossaireGroupes", () => {
    const fs = require("fs");
    const path = require("path");
    const matter = require("gray-matter");
    const dir = path.join(__dirname, "src", "content", "glossaire");
    const norm = (s) => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();
    let fichiers = [];
    try { fichiers = fs.readdirSync(dir).filter((f) => f.endsWith(".md")); } catch (e) { return []; }
    const termes = fichiers
      .map((f) => {
        const g = matter(fs.readFileSync(path.join(dir, f), "utf8"));
        return { terme: g.data.terme, definition: g.data.definition };
      })
      .filter((t) => t.terme)
      .sort((a, b) => norm(a.terme).localeCompare(norm(b.terme)));
    const groupes = {};
    termes.forEach((t) => {
      const L = norm(t.terme).charAt(0);
      (groupes[L] = groupes[L] || []).push(t);
    });
    return Object.keys(groupes).sort().map((L) => ({ lettre: L, termes: groupes[L] }));
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "dist"
    },
    templateFormats: ["njk", "md", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk"
  };
};
