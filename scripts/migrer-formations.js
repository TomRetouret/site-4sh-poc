#!/usr/bin/env node
// Migration des fiches formation vers le schéma typé et regroupé du back-office.
//
//   node scripts/migrer-formations.js           convertit les fiches en place
//   node scripts/migrer-formations.js --essai   affiche le rapport sans rien écrire
//
// - Lit d'abord les 48 fiches (src/content/formations/*.md), puis convertit.
// - Idempotent : une fiche déjà convertie est laissée telle quelle ; une deuxième exécution
//   ne modifie aucun fichier.
// - Chaque valeur convertie est remise en forme avec les fonctions du site
//   (eleventy/formations.js) et comparée au texte d'origine : si le rendu diffère, la valeur
//   est signalée et la fiche n'est PAS écrite (rien n'est deviné).
// - Les formateurs deviennent des fiches Équipe (src/_data/equipe/<slug>.json), créées
//   seulement si elles n'existent pas encore.
// - Avant toute écriture, l'original est copié hors du dépôt dans
//   ~/sauvegarde-formations/<horodatage>/ (dossier modifiable par SAUVEGARDE_FORMATIONS).
const fs = require("fs");
const os = require("os");
const path = require("path");
const matter = require("gray-matter");
const yaml = require("js-yaml");
const o = require("../eleventy/formations.js").outils;

const racine = path.join(__dirname, "..");
const dossier = path.join(racine, "src", "content", "formations");
const dossierEquipe = path.join(racine, "src", "_data", "equipe");
const essai = process.argv.includes("--essai");
const sauvegarde = path.join(process.env.SAUVEGARDE_FORMATIONS || path.join(os.homedir(), "sauvegarde-formations"),
  new Date().toISOString().replace(/[:.]/g, "-"));

const ANCIENS = ["titre", "groupe", "sous_titre", "categorie", "niveau", "chapo", "meta_title", "meta_description", "noindex",
  "programme_pdf", "programme_pdf_poids", "prix", "duree", "participants", "note", "avis", "depuis", "theorie", "pratique",
  "image", "sessions", "pour_qui", "prerequis", "objectifs", "programme", "formateur", "faq"];
const NOUVEAUX = ["entete", "inscription", "chiffres", "public", "objectifs", "programme", "formateur", "faq", "referencement"];

const vide = (v) => v === undefined || v === null || (typeof v === "string" && v.trim() === "");
const slugPersonne = (nom) => String(nom).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const ajouter = (obj, cle, val) => { if (!vide(val) && !(Array.isArray(val) && !val.length)) obj[cle] = val; };
const plusFrequent = (valeurs) => {
  const c = new Map();
  valeurs.forEach((v) => c.set(v, (c.get(v) || 0) + 1));
  let meilleur = null, n = -1;
  for (const [v, k] of c) if (k > n) { meilleur = v; n = k; } // à égalité : la première rencontrée (ordre alphabétique des fichiers)
  return meilleur;
};

// ---------------------------------------------------------------------------
// 1. Lecture de toutes les fiches
// ---------------------------------------------------------------------------
const fichiers = fs.readdirSync(dossier).filter((f) => f.endsWith(".md")).sort();
const fiches = fichiers.map((f) => {
  const brut = fs.readFileSync(path.join(dossier, f), "utf8");
  const m = matter(brut);
  const cles = Object.keys(m.data);
  const ancien = cles.some((k) => ANCIENS.includes(k) && !NOUVEAUX.includes(k));
  const nouveau = cles.includes("entete");
  return { f, brut, data: m.data, corps: m.content, etat: nouveau && !ancien ? "converti" : ancien && !nouveau ? "ancien" : "mixte" };
});

const signalements = []; // { fichier, champ, valeur, raison }
const aReprendre = [];   // valeurs converties mais à vérifier à la main
const signaler = (f, champ, valeur, raison) => signalements.push({ f, champ, valeur, raison });

// ---------------------------------------------------------------------------
// 2. Fiches Équipe : valeurs de référence par formateur
// ---------------------------------------------------------------------------
const personnes = {}; // slug -> { nom, roles[], photos[], bios[] }
fiches.filter((x) => x.etat === "ancien" && x.data.formateur).forEach(({ f, data }) => {
  const fo = data.formateur;
  if (vide(fo.nom)) return signaler(f, "formateur.nom", fo.nom, "formateur sans nom");
  const s = slugPersonne(fo.nom);
  const p = (personnes[s] = personnes[s] || { nom: String(fo.nom).trim(), roles: [], photos: [], bios: [] });
  p.roles.push(fo.role || "");
  p.photos.push(fo.photo || "");
  const bio = Array.isArray(fo.bio) ? fo.bio : [];
  bio.forEach((para, i) => { if (/\n\s*\n/.test(String(para))) signaler(f, `formateur.bio.${i}`, para, "paragraphe contenant une ligne vide"); });
  p.bios.push(bio.map((x) => String(x).trim()).join("\n\n"));
});
const equipe = {};
const equipeCreee = [];
for (const s of Object.keys(personnes)) {
  const chemin = path.join(dossierEquipe, s + ".json");
  if (fs.existsSync(chemin)) { equipe[s] = JSON.parse(fs.readFileSync(chemin, "utf8")); continue; }
  const p = personnes[s];
  if (new Set(p.photos).size > 1) signaler(s + ".json", "photo", [...new Set(p.photos)].join(" | "), "photos différentes selon les fiches : la plus fréquente est retenue");
  equipe[s] = { nom: p.nom, fonction: plusFrequent(p.roles), photo: plusFrequent(p.photos), photo_alt: "", presentation: plusFrequent(p.bios) };
  equipeCreee.push(s);
}
// fiches Équipe déjà présentes (relance) : utilisées comme référence
if (fs.existsSync(dossierEquipe)) fs.readdirSync(dossierEquipe).filter((x) => x.endsWith(".json")).forEach((x) => {
  const s = x.replace(/\.json$/, "");
  if (!equipe[s]) equipe[s] = JSON.parse(fs.readFileSync(path.join(dossierEquipe, x), "utf8"));
});

// ---------------------------------------------------------------------------
// 3. Conversion d'une fiche
// ---------------------------------------------------------------------------
const RE_DATE = /(\d{2})\/(\d{2})\/(\d{4})/;
const isoDepuisFr = (t) => {
  const m = String(t).match(RE_DATE);
  if (!m) return "";
  const iso = `${m[3]}-${m[2]}-${m[1]}`;
  const d = new Date(iso + "T00:00:00Z");
  return !isNaN(d) && d.toISOString().slice(0, 10) === iso ? iso : "";
};

function convertir({ f, data: d }) {
  const avant = signalements.length;
  const verifier = (champ, origine, rendu) => {
    if (String(origine) !== String(rendu)) signaler(f, champ, origine, `non convertible (rendu obtenu : « ${rendu} »)`);
  };

  // En-tête
  const entete = {};
  ["titre", "sous_titre", "niveau", "groupe", "categorie", "chapo", "image"].forEach((k) => ajouter(entete, k, d[k]));

  // Inscription
  const inscription = {};
  if (!vide(d.prix)) {
    const m = String(d.prix).trim().match(/^(À partir de )?(\d+) € HT$/);
    if (m) {
      inscription.prix = Number(m[2]);
      if (m[1]) inscription.prix_a_partir = true;
      verifier("prix", d.prix, o.prixAffiche(inscription));
    } else signaler(f, "prix", d.prix, "format de prix inconnu");
  }
  if (Array.isArray(d.sessions) && d.sessions.length) {
    inscription.sessions = d.sessions.map((s, i) => {
      const t = String(s).trim();
      let m;
      if ((m = t.match(/^Du (\d{2}\/\d{2}\/\d{4}) au (\d{2}\/\d{2}\/\d{4})$/))) {
        const r = { debut: isoDepuisFr(m[1]), fin: isoDepuisFr(m[2]) };
        if (!r.debut || !r.fin || r.fin < r.debut) signaler(f, `sessions.${i}`, s, "dates invalides");
        return r;
      }
      if ((m = t.match(/^Le (\d{2}\/\d{2}\/\d{4})$/))) {
        const iso = isoDepuisFr(m[1]);
        if (!iso) signaler(f, `sessions.${i}`, s, "date invalide");
        return { debut: iso, fin: iso };
      }
      signaler(f, `sessions.${i}`, s, "format de session inconnu");
      return { debut: "", fin: "" };
    });
    verifier("sessions", d.sessions.join(" | "), o.sessionsAffichees(inscription.sessions, "0000-00-00").join(" | "));
  }
  ajouter(inscription, "programme_pdf", d.programme_pdf);
  ajouter(inscription, "programme_pdf_poids", d.programme_pdf_poids);

  // Chiffres clés
  const chiffres = {};
  if (!vide(d.duree)) {
    const t = String(d.duree).trim();
    const m = t.match(/^<b>(1\/2 journée|\d+(?:,\d+)? jours?)<\/b> \((\d+)h(\d{2})\)$/);
    if (m) {
      chiffres.duree_jours = m[1] === "1/2 journée" ? 0.5 : Number(m[1].replace(/ jours?$/, "").replace(",", "."));
      chiffres.duree_heures = Number(m[2]) + Number(m[3]) / 60;
      verifier("duree", t, o.dureeAffichee(chiffres));
    } else {
      // Fourchette ou format libre : texte de repli, à reprendre à la main
      const r = t.match(/^<b>([^<]+)<\/b>(\s*\([^<]*\))?$/);
      if (r) {
        chiffres.duree_texte = r[1] + (r[2] || "");
        verifier("duree", t, o.dureeAffichee(chiffres));
        aReprendre.push({ f, champ: "duree", valeur: t, raison: "durée en fourchette : gardée en texte de repli (« Durée, saisie libre »), jours et heures à laisser vides ou à décider" });
      } else signaler(f, "duree", d.duree, "format de durée inconnu");
    }
  }
  if (!vide(d.participants)) {
    const m = String(d.participants).trim().match(/^(\d+) à (\d+)$/);
    if (m) {
      chiffres.participants_min = Number(m[1]);
      chiffres.participants_max = Number(m[2]);
      verifier("participants", d.participants, o.participantsAffiche(chiffres));
    } else signaler(f, "participants", d.participants, "format inconnu");
  }
  if (!vide(d.note)) {
    const m = String(d.note).trim().match(/^(\d+(?:,\d+)?) \/ 5$/);
    if (m) {
      chiffres.note = Number(m[1].replace(",", "."));
      if (chiffres.note > 5) signaler(f, "note", d.note, "note supérieure à 5");
      verifier("note", d.note, o.noteAffichee(chiffres));
    } else signaler(f, "note", d.note, "format de note inconnu");
  }
  if (!vide(d.avis)) {
    if (Number.isInteger(d.avis)) chiffres.avis = d.avis; else signaler(f, "avis", d.avis, "nombre d'avis non entier");
  }
  ajouter(chiffres, "depuis", d.depuis);
  if (!vide(d.theorie)) {
    if (Number.isInteger(d.theorie) && d.theorie >= 0 && d.theorie <= 100) chiffres.theorie = d.theorie;
    else signaler(f, "theorie", d.theorie, "part de théorie hors de 0 à 100");
  }
  if (!vide(d.pratique) && d.pratique !== 100 - (d.theorie || 0)) signaler(f, "pratique", d.pratique, "pratique différente de 100 moins la théorie : ne peut pas être calculée");

  // Public visé et prérequis
  const pub = {};
  ajouter(pub, "pour_qui", d.pour_qui);
  ajouter(pub, "prerequis", d.prerequis);

  // Programme : « items » devient « points »
  const programme = Array.isArray(d.programme)
    ? d.programme.map((c) => { const r = {}; ajouter(r, "titre", c && c.titre); r.points = (c && Array.isArray(c.items)) ? c.items : []; return r; })
    : undefined;

  // Formateur : relation vers la fiche Équipe + fonction et présentation propres si différentes
  let formateur;
  if (d.formateur && !vide(d.formateur.nom)) {
    const s = slugPersonne(d.formateur.nom);
    const p = equipe[s];
    formateur = { personne: s };
    if (p) {
      const role = d.formateur.role || "";
      const bio = (Array.isArray(d.formateur.bio) ? d.formateur.bio : []).map((x) => String(x).trim()).join("\n\n");
      if (role !== (p.fonction || "")) formateur.fonction = role;
      if (bio !== (p.presentation || "")) formateur.presentation = bio;
      if ((d.formateur.photo || "") !== (p.photo || "")) signaler(f, "formateur.photo", d.formateur.photo, `photo différente de la fiche Équipe ${s}`);
      if (String(d.formateur.nom).trim() !== p.nom) signaler(f, "formateur.nom", d.formateur.nom, `nom différent de la fiche Équipe ${s}`);
      const vue = o.formateurAffiche(formateur, equipe);
      verifier("formateur", JSON.stringify([d.formateur.nom, d.formateur.role, d.formateur.photo, (d.formateur.bio || []).map((x) => String(x).trim())]),
        JSON.stringify([vue.nom, vue.role, vue.photo, vue.bio]));
    } else signaler(f, "formateur", d.formateur.nom, "fiche Équipe introuvable");
  }

  // Référencement (groupe séparé ; « noindex » devient « indexation », inversée)
  const referencement = {};
  ajouter(referencement, "meta_title", d.meta_title);
  ajouter(referencement, "meta_description", d.meta_description);
  referencement.indexation = d.noindex !== true;

  // Clés inconnues : conservées telles quelles et signalées
  const inconnues = Object.keys(d).filter((k) => !ANCIENS.includes(k));
  inconnues.forEach((k) => signaler(f, k, JSON.stringify(d[k]), "champ inconnu, conservé tel quel (non converti)"));

  if (signalements.length > avant) return null; // valeur non convertible : fiche laissée telle quelle

  const sortie = {};
  sortie.entete = entete;
  sortie.inscription = inscription;
  sortie.chiffres = chiffres;
  if (Object.keys(pub).length) sortie.public = pub;
  if (Array.isArray(d.objectifs)) sortie.objectifs = d.objectifs;
  if (programme) sortie.programme = programme;
  if (formateur) sortie.formateur = formateur;
  if (Array.isArray(d.faq)) sortie.faq = d.faq;
  sortie.referencement = referencement;
  inconnues.forEach((k) => (sortie[k] = d[k]));
  return sortie;
}

const enYaml = (data) => yaml.dump(data, { lineWidth: -1, noRefs: true, quotingType: '"', sortKeys: false });

// ---------------------------------------------------------------------------
// 4. Conversion puis écriture
// ---------------------------------------------------------------------------
const aEcrire = [];
let dejaConverties = 0;
for (const x of fiches) {
  if (x.etat === "converti") { dejaConverties++; continue; }
  if (x.etat === "mixte") { signaler(x.f, "(fiche)", "", "fiche à moitié convertie (anciens et nouveaux champs) : à reprendre à la main"); continue; }
  const sortie = convertir(x);
  if (!sortie) continue;
  const texte = `---\n${enYaml(sortie)}---\n${x.corps}`;
  if (texte !== x.brut) aEcrire.push({ f: x.f, brut: x.brut, texte });
}

function sauvegarder(nom, contenu) {
  fs.mkdirSync(sauvegarde, { recursive: true });
  fs.writeFileSync(path.join(sauvegarde, nom), contenu);
}

if (!essai) {
  for (const s of equipeCreee) {
    fs.mkdirSync(dossierEquipe, { recursive: true });
    fs.writeFileSync(path.join(dossierEquipe, s + ".json"), JSON.stringify(equipe[s], null, 2) + "\n");
  }
  for (const w of aEcrire) {
    sauvegarder(w.f, w.brut);
    fs.writeFileSync(path.join(dossier, w.f), w.texte);
  }
}

// ---------------------------------------------------------------------------
// 5. Rapport
// ---------------------------------------------------------------------------
console.log(`${essai ? "[ESSAI, rien n'est écrit] " : ""}Fiches lues : ${fiches.length}`);
console.log(`Fiches converties : ${aEcrire.length}${!essai && aEcrire.length ? ` (originaux copiés dans ${sauvegarde})` : ""}`);
console.log(`Fiches déjà converties (laissées telles quelles) : ${dejaConverties}`);
console.log(`Fiches Équipe créées : ${equipeCreee.length ? equipeCreee.join(", ") : "aucune"}`);
if (aReprendre.length) {
  console.log("\nValeurs à reprendre à la main :");
  aReprendre.forEach((r) => console.log(`  - ${r.f} / ${r.champ} : ${r.valeur} -> ${r.raison}`));
}
if (signalements.length) {
  console.log("\nValeurs NON converties (fiche laissée telle quelle) :");
  signalements.forEach((s) => console.log(`  - ${s.f} / ${s.champ} : ${s.valeur} -> ${s.raison}`));
  process.exitCode = 1;
}
