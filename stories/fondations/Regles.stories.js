// Fondations / Règles de la charte : les règles transversales que src/assets/charte.css
// impose à tout le site, chacune avec un exemple rendu par les feuilles du site.
import { planche, source, code } from "./outils.js";
import { filtre } from "../composants/rendu.js";

const accent = (s) => filtre("accent", s);

const regle = (titre, texte, exemple, src) => `
<div style="display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:32px;border-top:2px solid var(--encre);padding:24px 0 40px">
  <div><h2 class="sb4-t" style="margin:0 0 8px;font-size:22px">${titre}</h2><p class="sb4-note">${code(texte)}</p>
  <p style="font-size:13px;color:var(--muted);margin:0">Source : ${code(src)}</p></div>
  <div>${exemple}</div>
</div>`;

export default {
  title: "Fondations/Règles de la charte",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    // Listes à coche (.sect-liste) : mise en place dans secteurs.css, coche dans charte.css.
    feuilles: ["/assets/secteurs.css"],
    docs: {
      description: {
        component:
          "Les règles de la charte graphique 4SH v1.1 qui valent pour tout composant, telles que `src/assets/charte.css` " +
          "les applique (ses commentaires sont cités entre guillemets). Les deux dernières viennent du document projet " +
          "« Design system 4SH 2026 » et ne sont pas traduites en CSS.\n\n" +
          "Source : `src/assets/charte.css`, `eleventy.config.js` (filtre `accent`), document « Design system 4SH 2026 »."
      },
      story: { height: "2600px" }
    }
  },
  args: { texte: "Parlons de votre *projet*" },
  argTypes: {
    texte: {
      name: "Titre (mot entre *astérisques*)",
      control: "text",
      description: "Passé au filtre `accent` du site pour l'exemple « Mot mis en valeur »."
    }
  }
};

export const Regles = {
  name: "Règles de la charte",
  render: ({ texte }) =>
    planche(
      regle(
        "Angles vifs",
        "« Angles vifs partout : ni pilule, ni coin arrondi, ni cercle. » Tout élément a `border-radius:0`, imposé par une règle globale en `!important`.",
        `<div style="display:flex;gap:24px;align-items:center"><div style="width:120px;height:80px;background:var(--fond-doux);border:2px solid var(--encre);border-radius:24px"></div>
<a class="btn btn-primary" href="#" style="border-radius:999px">Bouton</a></div>
<p style="font-size:14px;color:var(--muted);margin-top:12px">Ces deux éléments déclarent un arrondi en style en ligne ; la charte l'annule.</p>`,
        "`charte.css`, « Lot 2 » : `*,*::before,*::after{border-radius:0!important}`"
      ) +
        regle(
          "Aucune ombre",
          "« Aucune ombre portée : la charte est à plat (les anneaux de focus restent en outline). » Pas de soulèvement au survol non plus : « Rien de penché, rien qui bouge au survol ».",
          `<div class="porte" style="max-width:360px;box-shadow:0 18px 40px rgba(0,0,0,.4)"><h3>Carte</h3><p>Ombre déclarée en style en ligne, annulée.</p></div>`,
          "`charte.css`, « Recette du 1er novembre » : `body *:not(:focus):not(:focus-visible){box-shadow:none!important}`"
        ) +
        regle(
          "Mot mis en valeur",
          "Le rédacteur écrit `*mot*` dans le back-office ; le filtre `accent` le rend en `<em class=\"accent\">`. « Mot mis en valeur : rouge texte, sans italique ni serif » sur clair, rouge signal sur nuit, « jamais la couleur d'offre ». Exception : pages Formations, où « le violet domine ».",
          `<p style="font-size:13px;color:var(--muted);margin:0 0 4px">Sur clair</p><h3 class="sec-titre" style="font-size:36px">${accent(texte)}</h3>
<p style="font-size:13px;color:var(--muted);margin:16px 0 4px">Sur clair, page d'offre 4SH Run (le mot reste rouge)</p><div class="famille-run"><h3 class="sec-titre" style="font-size:36px">${accent(texte)}</h3></div>
<div class="sur-sombre" style="background:var(--nuit);padding:16px 24px;margin-top:16px"><p style="font-size:13px;color:var(--sur-nuit);margin:0 0 4px">Sur nuit</p><h3 class="sec-titre" style="font-size:36px;color:#fff">${accent(texte)}</h3></div>
<div class="learning" style="margin-top:16px"><p style="font-size:13px;color:var(--muted);margin:0 0 4px">Pages Formations</p><h3 class="sec-titre" style="font-size:36px">${accent(texte)}</h3></div>`,
          "`eleventy.config.js` (filtre `accent`), `charte.css` (`em.accent`, « Formations : le violet domine »)"
        ) +
        regle(
          "Pas d'italique ni de serif",
          "« Pas d'italique ni de serif : chiffres, numéros et lettres en Manrope droit. » L'ancienne police serif de `styles.css` est remplacée par Manrope (`--serif`).",
          `<p style="font-size:20px">Un texte <i>balisé en italique</i> reste droit, comme le <em class="accent">mot mis en valeur</em>.</p>`,
          "`charte.css`, « Lot 3 » : `body *:not(em):not(cite):not(q){font-style:normal!important}`"
        ) +
        regle(
          "Le losange",
          "Signe de la marque, en couleur d'accent : il marque l'entrée active du menu (carré de 8 px tourné à 45°), et il termine les plans et les tracés, où il s'allume en dernier. « Le losange n'est jamais une puce » : les listes prennent un trait ou une coche encre.",
          `<div style="display:flex;gap:40px;align-items:flex-end;flex-wrap:wrap">
<span style="position:relative;display:inline-block;font:800 15px var(--titre);color:var(--encre);padding:12px 12px 16px">Entrée active<span style="position:absolute;left:50%;bottom:2px;width:8px;height:8px;margin-left:-4px;background:var(--accent);transform:rotate(45deg)"></span></span>
<svg viewBox="0 0 1280 120" style="width:360px;height:auto" aria-hidden="true"><path d="M0 110H280L310 80H600L630 50H920L950 20H1240" fill="none" stroke="#14171C" stroke-width="2"/><path d="M1240 9L1251 20L1240 31L1229 20Z" fill="#ED203D"/></svg></div>
<ul class="sect-liste" style="list-style:none;margin:16px 0 0;padding:0;max-width:360px"><li style="position:relative;padding:6px 0 6px 34px">Liste à coche encre (trait 1,5)</li><li style="position:relative;padding:6px 0 6px 34px">Jamais de losange en puce</li></ul>`,
          "`charte.css` (`.menu>li>a.actif::after`, « Puces des études de cas », « Listes à coche »), tracé de `composants/pages/accueil.njk`, `mouvement.css`"
        ) +
        regle(
          "Rouge texte et rouge signal",
          "`#B8202C` (`--rouge`, 6,4:1 sur blanc) pour le bouton principal, les liens et tout texte rouge sur clair. `#ED203D` (`--signal`, 4,31:1) pour le losange, les plans et les filets d'accent, « jamais en texte courant sur clair ».",
          `<p><a class="btn btn-primary" href="#">Bouton principal #B8202C</a></p>
<p style="margin-top:16px"><span style="display:inline-block;width:160px;border-bottom:2px solid var(--signal);padding-bottom:4px;font:700 15px var(--titre)">Filet signal</span></p>`,
          "`charte.css`, commentaires des jetons `--signal` et `--rouge`"
        ) +
        regle(
          "Boutons : l'offre ne les colore pas",
          "« Boutons : rouge texte partout, blanc sur nuit ; l'offre ne colore jamais un bouton. » Exception : sur les pages Formations, le bouton principal est violet.",
          `<div class="famille-build" style="display:flex;gap:16px;flex-wrap:wrap"><a class="btn btn-primary" href="#">Page 4SH Build</a><a class="btn btn-ghost" href="#">Secondaire</a></div>
<div class="sur-sombre" style="background:var(--nuit);padding:16px;margin-top:16px;display:flex;gap:16px;flex-wrap:wrap"><a class="btn btn-primary" href="#">Sur nuit</a><a class="btn btn-ghost" href="#">Secondaire</a></div>`,
          "`charte.css`, « Lot 2 » (boutons) et « Formations : le violet domine »"
        ) +
        regle(
          "Couleurs d'offre",
          "Une page porte une seule couleur d'offre (classe `famille-*`). Les trois couleurs ensemble sont une exception, réservée à la vue portefeuille des offres (les trois parcours de l'accueil, en filets d'égale longueur), ou repérées par une barre dans le méga-menu (« exception à valider »).",
          `<div class="portes" style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px">
<div class="porte famille-build" style="padding:20px"><p class="offre">4SH Build</p></div><div class="porte famille-run" style="padding:20px"><p class="offre">4SH Run</p></div><div class="porte famille-formation" style="padding:20px"><p class="offre">4SH Learning</p></div></div>`,
          "`charte.css` (« Les trois parcours (exception trois couleurs d'offre) », méga-menus), document « Design system 4SH 2026 »"
        ) +
        regle(
          "Étiquette d'offre et coches",
          "« Étiquette d'offre : barre pleine 24 x 4 + nom de l'offre en couleur texte. » Coches de liste : « coche encre de la charte (trait 1,5), pas de pastille colorée ».",
          `<div class="famille-run"><span class="eyebrow eyebrow-offre"><span class="barre" aria-hidden="true"></span>4SH Run · Hébergement</span></div>
<div class="chips"><span>Étiquette à coche</span><span>Sans pastille</span></div>`,
          "`charte.css` (`.eyebrow-offre`, `.chips`, `.sect-liste`)"
        ) +
        regle(
          "Focus clavier",
          "« Focus clavier : contour 2 px décalé de 2 px », encre sur clair, blanc sur fond sombre.",
          `<p><a class="btn btn-ghost" href="#" style="outline:2px solid var(--encre);outline-offset:2px">Élément au focus</a></p>`,
          "`charte.css` (`:focus-visible`)"
        ) +
        regle(
          "Effets retirés",
          "« Rien au défilement, pas de doodle » : les tracés manuscrits de l'ancienne direction (macro `doodle` de `page.njk`, classe `.doodle`), le curseur personnalisé et les halos sont masqués. Les entrées au défilement ont été rétablies en phase 2 par `mouvement.css` (voir Mouvement).",
          `<p style="font-size:15px;color:var(--texte-2)">Aucun exemple à montrer : ces éléments ne s'affichent plus.</p>`,
          "`charte.css` (« effets retirés »), `mouvement.css`"
        ) +
        regle(
          "Répartition des couleurs et logo",
          "Répartition 70 % neutre, 25 % texte, 5 % couleur en sobre ; un aplat de 25 à 40 % en expressif. Logo en haut ou en bas à gauche, jamais l'élément le plus grand.",
          `<div style="display:flex;height:24px"><span style="flex:70;background:var(--fond-doux)"></span><span style="flex:25;background:var(--encre)"></span><span style="flex:5;background:var(--signal)"></span></div>
<p style="font-size:13px;color:var(--muted);margin-top:8px">70 % neutre · 25 % texte · 5 % couleur (sobre)</p>`,
          "document projet « Design system 4SH 2026 » (règles reprises de la charte v1.1) ; non exprimé dans `charte.css`"
        ) +
        source("<code>src/assets/charte.css</code>, <code>src/assets/mouvement.css</code>, <code>eleventy.config.js</code>, document « Design system 4SH 2026 ».")
    )
};
