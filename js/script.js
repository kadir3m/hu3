/* ==========================================================================
   Hacettepe Üniversitesi — ortak script dosyası
   ========================================================================== */
document.addEventListener("DOMContentLoaded", function () {
  initHeaderScroll();
  initMegaMenus();
  initMobileMenu();
  initSearchOverlay();
  initScrollReveal();
  initBackToTop();
  initEventDates();
  initFilterChips();
  initEventSearch();
  initContactForm();
  markActiveNavLink();
});

/* Header, aşağı kaydırıldığında hafif gölge alır */
function initHeaderScroll() {
  var header = document.querySelector(".site-header");
  if (!header) return;

  function onScroll() {
    if (window.scrollY > 8) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

/* Masaüstünde hover, dokunmatik/klavyede click ile açılan mega menüler */
function initMegaMenus() {
  var items = document.querySelectorAll("[data-menu-item]");

  items.forEach(function (item) {
    var trigger = item.querySelector(".nav-link");
    var menu = item.querySelector(".mega-menu");
    if (!trigger || !menu) return;

    function open() {
      closeAllMegaMenus();
      menu.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
    }

    function close() {
      menu.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
    }

    trigger.addEventListener("click", function (e) {
      e.preventDefault();
      var isOpen = menu.classList.contains("is-open");
      isOpen ? close() : open();
    });

    item.addEventListener("mouseenter", function () {
      if (window.innerWidth > 860) open();
    });

    item.addEventListener("mouseleave", function () {
      if (window.innerWidth > 860) close();
    });
  });

  document.addEventListener("click", function (e) {
    if (!e.target.closest("[data-menu-item]")) closeAllMegaMenus();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeAllMegaMenus();
  });

  function closeAllMegaMenus() {
    document.querySelectorAll(".mega-menu.is-open").forEach(function (m) {
      m.classList.remove("is-open");
    });
    document.querySelectorAll('.nav-link[aria-expanded="true"]').forEach(function (t) {
      t.setAttribute("aria-expanded", "false");
    });
  }
}

/* Mobil hamburger menü aç/kapa */
function initMobileMenu() {
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.querySelector(".primary-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", function () {
    var isOpen = nav.classList.toggle("is-open");
    toggle.classList.toggle("is-active", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    document.body.style.overflow = isOpen ? "hidden" : "";
  });
}

/* Tam ekran arama paneli */
function initSearchOverlay() {
  var openBtns = document.querySelectorAll("[data-search-open]");
  var overlay = document.querySelector(".search-overlay");
  if (!overlay) return;
  var closeBtn = overlay.querySelector(".search-close");
  var input = overlay.querySelector('input[type="search"]');

  function open() {
    overlay.classList.add("is-open");
    setTimeout(function () {
      if (input) input.focus();
    }, 150);
  }

  function close() {
    overlay.classList.remove("is-open");
  }

  openBtns.forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      open();
    });
  });

  if (closeBtn) closeBtn.addEventListener("click", close);

  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) close();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") close();
  });

  var form = overlay.querySelector("form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      close();
    });
  }
}

/* Elemanlar görünür alana girince yumuşak belirme animasyonu */
function initScrollReveal() {
  var targets = document.querySelectorAll(".reveal");
  if (!targets.length) return;

  if (!("IntersectionObserver" in window)) {
    targets.forEach(function (t) {
      t.classList.add("is-visible");
    });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  targets.forEach(function (t) {
    observer.observe(t);
  });
}

/* Sayfa başına dön butonu */
function initBackToTop() {
  var btn = document.querySelector(".back-to-top");
  if (!btn) return;

  window.addEventListener(
    "scroll",
    function () {
      btn.classList.toggle("show", window.scrollY > 500);
    },
    { passive: true }
  );

  btn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* data-date="2026-09-14" alanlarından gün/ay çıkarıp doldurur */
function initEventDates() {
  var months = [
    "OCA", "ŞUB", "MAR", "NİS", "MAY", "HAZ",
    "TEM", "AĞU", "EYL", "EKİ", "KAS", "ARA",
  ];

  document.querySelectorAll("[data-event-date]").forEach(function (el) {
    var raw = el.getAttribute("data-event-date");
    var parts = raw.split("-");
    var month = parseInt(parts[1], 10) - 1;
    var day = parts[2];
    var dayEl = el.querySelector(".day");
    var monthEl = el.querySelector(".month");
    if (dayEl) dayEl.textContent = day;
    if (monthEl) monthEl.textContent = months[month] || "";
  });
}

/* Akademik sayfasındaki fakülte filtre çipleri */
/* Bir sayfada birden fazla bağımsız filtre grubu olabilir (Bölümler, Haberler,
   Etkinlikler...). Her .filter-bar kendi data-filter-for hedefini işaretler;
   hedef bulunamazsa (eski kullanım) sayfadaki tüm [data-category] öğeleri
   taranır. */
function initFilterChips() {
  document.querySelectorAll(".filter-bar").forEach(function (bar) {
    var chips = bar.querySelectorAll(".filter-chip");
    if (!chips.length) return;

    var targetSelector = bar.getAttribute("data-filter-for");
    var scope = targetSelector ? document.querySelector(targetSelector) : document;
    if (!scope) return;

    var cards = scope.querySelectorAll("[data-category]");
    if (!cards.length) return;

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) {
          c.classList.remove("active");
        });
        chip.classList.add("active");

        var category = chip.getAttribute("data-filter");
        cards.forEach(function (card) {
          var match = category === "all" || card.getAttribute("data-category") === category;
          card.style.display = match ? "" : "none";
        });
      });
    });
  });
}

/* Etkinlik arama kutusu — başlık metnine göre anlık filtreleme */
function initEventSearch() {
  var input = document.querySelector("[data-event-search]");
  if (!input) return;

  var targetSelector = input.getAttribute("data-event-search");
  var scope = document.querySelector(targetSelector);
  if (!scope) return;

  var cards = scope.querySelectorAll("[data-category]");

  input.addEventListener("input", function () {
    var query = input.value.trim().toLocaleLowerCase("tr");
    cards.forEach(function (card) {
      var title = (card.querySelector("h3") || {}).textContent || "";
      var match = title.toLocaleLowerCase("tr").indexOf(query) !== -1;
      card.style.display = match ? "" : "none";
    });
  });
}

/* İletişim formu — istemci tarafı basit doğrulama ve durum mesajı */
function initContactForm() {
  var form = document.querySelector("#contact-form");
  if (!form) return;
  var status = form.querySelector(".form-status");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var name = form.querySelector("#cf-name");
    var email = form.querySelector("#cf-email");
    var message = form.querySelector("#cf-message");
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    var isValid =
      name.value.trim().length > 1 &&
      emailPattern.test(email.value.trim()) &&
      message.value.trim().length > 4;

    status.classList.remove("ok", "err");

    if (!isValid) {
      status.textContent = "Lütfen adınızı, geçerli bir e-posta adresinizi ve mesajınızı eksiksiz girin.";
      status.classList.add("err", "show");
      return;
    }

    status.textContent = "Mesajınız alındı. En kısa sürede size dönüş yapacağız.";
    status.classList.add("ok", "show");
    form.reset();
  });
}

/* Üst menüde bulunulan sayfayı vurgular (body[data-page] ile eşleşir) */
function markActiveNavLink() {
  var page = document.body.getAttribute("data-page");
  if (!page) return;

  document.querySelectorAll("[data-nav-key]").forEach(function (link) {
    if (link.getAttribute("data-nav-key") === page) {
      link.closest("li").classList.add("active");
    }
  });
}
