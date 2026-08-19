/* ==========================================================================
   Hacettepe Üniversitesi — çok dilli içerik (TR / EN / FR)
   [data-i18n]="a.b.c" -> dict.a.b.c metnini elementin textContent'ine yazar.
   [data-i18n-placeholder], [data-i18n-aria-label], [data-i18n-alt],
   [data-i18n-title] aynı mantıkla ilgili özniteliği çevirir.
   ========================================================================== */
(function () {
  var STORAGE_KEY = "hu-lang";
  var DEFAULT_LANG = "tr";
  var cache = {};

  function resolveKey(dict, key) {
    var node = dict;
    var parts = key.split(".");
    for (var i = 0; i < parts.length; i++) {
      if (node == null) return null;
      node = node[parts[i]];
    }
    return typeof node === "string" ? node : null;
  }

  function applyAttr(dict, dataAttr, targetAttr) {
    document.querySelectorAll("[" + dataAttr + "]").forEach(function (el) {
      var value = resolveKey(dict, el.getAttribute(dataAttr));
      if (value != null) el.setAttribute(targetAttr, value);
    });
  }

  function applyTranslations(dict) {
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var value = resolveKey(dict, el.getAttribute("data-i18n"));
      if (value != null) el.textContent = value;
    });

    applyAttr(dict, "data-i18n-placeholder", "placeholder");
    applyAttr(dict, "data-i18n-aria-label", "aria-label");
    applyAttr(dict, "data-i18n-alt", "alt");
    applyAttr(dict, "data-i18n-title", "title");

    var page = document.body.getAttribute("data-page");
    if (page) {
      var title = resolveKey(dict, "meta." + page + ".title");
      var desc = resolveKey(dict, "meta." + page + ".description");
      if (title) document.title = title;
      if (desc) {
        var metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute("content", desc);
      }
    }
  }

  function syncLangControl(lang) {
    document.querySelectorAll(".lang-switch").forEach(function (switcher) {
      var current = switcher.querySelector(".lang-current");
      var options = switcher.querySelectorAll(".lang-options li");
      var matched = null;

      options.forEach(function (li) {
        var isMatch = li.getAttribute("data-lang") === lang;
        li.classList.toggle("active", isMatch);
        if (isMatch) matched = li;
      });

      if (current && matched) {
        current.innerHTML =
          '<span class="flag ' + matched.getAttribute("data-flag") + '" aria-hidden="true"></span> ' +
          matched.textContent.trim();
      }
    });
  }

  function loadLanguage(lang) {
    if (cache[lang]) {
      applyTranslations(cache[lang]);
      document.documentElement.setAttribute("lang", lang);
      syncLangControl(lang);
      return;
    }

    fetch("lang/" + lang + ".json")
      .then(function (res) {
        return res.json();
      })
      .then(function (dict) {
        cache[lang] = dict;
        applyTranslations(dict);
        document.documentElement.setAttribute("lang", lang);
        syncLangControl(lang);
      })
      .catch(function (err) {
        console.error("Dil dosyası yüklenemedi: " + lang, err);
      });
  }

  function closeAllLangSwitches() {
    document.querySelectorAll(".lang-switch.is-open").forEach(function (switcher) {
      switcher.classList.remove("is-open");
      var btn = switcher.querySelector(".lang-current");
      if (btn) btn.setAttribute("aria-expanded", "false");
    });
  }

  function initI18n() {
    var lang = localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
    loadLanguage(lang);

    document.querySelectorAll(".lang-switch").forEach(function (switcher) {
      var current = switcher.querySelector(".lang-current");
      if (!current) return;

      current.addEventListener("click", function (e) {
        e.stopPropagation();
        var isOpen = switcher.classList.contains("is-open");
        closeAllLangSwitches();
        if (!isOpen) {
          switcher.classList.add("is-open");
          current.setAttribute("aria-expanded", "true");
        }
      });

      switcher.querySelectorAll(".lang-options li").forEach(function (li) {
        li.addEventListener("click", function () {
          var newLang = li.getAttribute("data-lang");
          closeAllLangSwitches();
          if (!newLang || newLang === localStorage.getItem(STORAGE_KEY)) return;
          localStorage.setItem(STORAGE_KEY, newLang);
          loadLanguage(newLang);
        });
      });
    });

    document.addEventListener("click", closeAllLangSwitches);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeAllLangSwitches();
    });
  }

  document.addEventListener("DOMContentLoaded", initI18n);
})();
