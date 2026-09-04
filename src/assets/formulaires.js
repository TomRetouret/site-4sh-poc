/* =========================================================================
   Formulaires 4SH
   1) Transforme les <select> marqués [data-dropdown] en liste déroulante
      à la charte du site, accessible au clavier. Sans JavaScript, le select
      natif reste affiché et fonctionnel : rien n'est perdu.
   2) Recopie l'adresse de destination de l'option choisie dans le champ
      caché "destinataire", lu par la fonction Netlify de routage.
   ========================================================================= */
(function () {
  "use strict";

  function majDestinataire(select) {
    var form = select.form;
    if (!form) return;
    var cible = form.querySelector('input[name="destinataire"]');
    if (!cible) return;
    var opt = select.options[select.selectedIndex];
    cible.value = (opt && opt.getAttribute("data-email")) || "";
  }

  function construire(enveloppe) {
    var select = enveloppe.querySelector("select");
    if (!select || enveloppe.dataset.pret === "oui") return;

    var options = Array.prototype.filter.call(select.options, function (o) {
      return !o.disabled;
    });
    if (!options.length) return;

    var placeholder = select.querySelector("option[disabled]");
    var texteVide = placeholder ? placeholder.textContent : "";
    var idListe = (select.id || "sujet") + "-liste";

    enveloppe.classList.remove("champ-select");
    enveloppe.classList.add("select-perso");
    enveloppe.dataset.pret = "oui";

    var bouton = document.createElement("button");
    bouton.type = "button";
    bouton.id = (select.id || "sujet") + "-bouton";
    bouton.className = "declencheur";
    bouton.setAttribute("aria-haspopup", "listbox");
    bouton.setAttribute("aria-expanded", "false");
    bouton.setAttribute("aria-controls", idListe);
    var etiquette = select.id ? document.getElementById(select.id + "-label") : null;
    if (etiquette) {
      bouton.setAttribute("aria-labelledby", etiquette.id);
      // le clic sur l'intitulé doit ouvrir le composant, plus le select masqué
      etiquette.setAttribute("for", bouton.id);
    }
    // Un champ masqué et "required" empêche l'envoi sans pouvoir recevoir le focus :
    // on retire l'attribut et on refait la vérification nous-mêmes à la soumission.
    var obligatoire = select.required;
    if (obligatoire) {
      select.required = false;
      bouton.setAttribute("aria-required", "true");
    }
    bouton.innerHTML = '<span class="valeur"></span><span class="chevron" aria-hidden="true"></span>';

    var liste = document.createElement("ul");
    liste.className = "liste";
    liste.id = idListe;
    liste.setAttribute("role", "listbox");
    liste.hidden = true;

    options.forEach(function (o, i) {
      var li = document.createElement("li");
      li.setAttribute("role", "option");
      li.id = idListe + "-" + i;
      li.dataset.index = String(i);
      li.setAttribute("aria-selected", o.selected ? "true" : "false");
      li.innerHTML = '<span class="puce" aria-hidden="true"></span><span>' + o.textContent + "</span>";
      liste.appendChild(li);
    });

    enveloppe.appendChild(bouton);
    enveloppe.appendChild(liste);

    var survol = -1;

    function rendre() {
      var choisie = select.options[select.selectedIndex];
      var vide = !choisie || choisie.disabled || choisie.value === "";
      bouton.querySelector(".valeur").textContent = vide ? texteVide : choisie.textContent;
      bouton.dataset.vide = vide ? "oui" : "non";
      options.forEach(function (o, i) {
        liste.children[i].setAttribute("aria-selected", o.selected ? "true" : "false");
      });
    }

    function marquer(i) {
      Array.prototype.forEach.call(liste.children, function (li) {
        li.classList.remove("survol");
      });
      if (i < 0 || i >= liste.children.length) {
        bouton.removeAttribute("aria-activedescendant");
        survol = -1;
        return;
      }
      survol = i;
      var li = liste.children[i];
      li.classList.add("survol");
      bouton.setAttribute("aria-activedescendant", li.id);
      var haut = li.offsetTop, bas = haut + li.offsetHeight;
      if (haut < liste.scrollTop) liste.scrollTop = haut - 6;
      else if (bas > liste.scrollTop + liste.clientHeight) liste.scrollTop = bas - liste.clientHeight + 6;
    }

    function ouvrir() {
      liste.hidden = false;
      enveloppe.classList.add("ouvert");
      bouton.setAttribute("aria-expanded", "true");
      var dep = options.findIndex(function (o) { return o.selected; });
      marquer(dep >= 0 ? dep : 0);
    }

    function fermer(rendreFocus) {
      enveloppe.classList.remove("ouvert");
      bouton.setAttribute("aria-expanded", "false");
      marquer(-1);
      window.setTimeout(function () {
        if (!enveloppe.classList.contains("ouvert")) liste.hidden = true;
      }, 180);
      if (rendreFocus) bouton.focus();
    }

    function choisir(i) {
      if (i < 0 || i >= options.length) return;
      select.value = options[i].value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      rendre();
      fermer(true);
    }

    bouton.addEventListener("click", function () {
      enveloppe.classList.contains("ouvert") ? fermer(false) : ouvrir();
    });

    bouton.addEventListener("keydown", function (e) {
      var ouvertes = enveloppe.classList.contains("ouvert");
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          ouvertes ? marquer(Math.min(survol + 1, options.length - 1)) : ouvrir();
          break;
        case "ArrowUp":
          e.preventDefault();
          ouvertes ? marquer(Math.max(survol - 1, 0)) : ouvrir();
          break;
        case "Home":
          if (ouvertes) { e.preventDefault(); marquer(0); }
          break;
        case "End":
          if (ouvertes) { e.preventDefault(); marquer(options.length - 1); }
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          ouvertes ? choisir(survol) : ouvrir();
          break;
        case "Escape":
          if (ouvertes) { e.preventDefault(); fermer(true); }
          break;
        case "Tab":
          if (ouvertes) fermer(false);
          break;
      }
    });

    liste.addEventListener("mousemove", function (e) {
      var li = e.target.closest("li");
      if (li) marquer(Number(li.dataset.index));
    });
    liste.addEventListener("click", function (e) {
      var li = e.target.closest("li");
      if (li) choisir(Number(li.dataset.index));
    });

    document.addEventListener("click", function (e) {
      if (!enveloppe.contains(e.target) && enveloppe.classList.contains("ouvert")) fermer(false);
    });

    select.addEventListener("change", function () {
      majDestinataire(select);
      rendre();
    });

    if (obligatoire && select.form) {
      select.form.addEventListener("submit", function (e) {
        var choisie = select.options[select.selectedIndex];
        if (!choisie || choisie.disabled || choisie.value === "") {
          e.preventDefault();
          e.stopPropagation();
          bouton.setAttribute("aria-invalid", "true");
          bouton.focus();
          ouvrir();
        } else {
          bouton.removeAttribute("aria-invalid");
        }
      }, true);
    }

    rendre();
    majDestinataire(select);
  }

  function init() {
    // routage : vaut aussi pour les selects laissés en natif
    Array.prototype.forEach.call(document.querySelectorAll('select[name="sujet"]'), function (s) {
      majDestinataire(s);
      s.addEventListener("change", function () { majDestinataire(s); });
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-dropdown]"), construire);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
