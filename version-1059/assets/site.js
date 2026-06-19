(function () {
  function normalize(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      var open = panel.classList.toggle("open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero-carousel]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var thumbs = Array.prototype.slice.call(root.querySelectorAll("[data-hero-thumb]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
      thumbs.forEach(function (thumb, i) {
        thumb.classList.toggle("active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    thumbs.forEach(function (thumb, i) {
      thumb.addEventListener("mouseenter", function () {
        show(i);
      });
      thumb.addEventListener("focus", function () {
        show(i);
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-search-form]"));
    forms.forEach(function (form) {
      var scopeId = form.getAttribute("data-scope");
      var scope = scopeId ? document.getElementById(scopeId) : document;
      if (!scope) {
        return;
      }
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
      var keyword = form.querySelector("[name='keyword']");
      var year = form.querySelector("[name='year']");
      var type = form.querySelector("[name='type']");
      var region = form.querySelector("[name='region']");

      function apply() {
        var q = normalize(keyword && keyword.value);
        var y = normalize(year && year.value);
        var t = normalize(type && type.value);
        var r = normalize(region && region.value);
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-tags")
          ].join(" "));
          var ok = true;
          if (q && haystack.indexOf(q) === -1) {
            ok = false;
          }
          if (y && normalize(card.getAttribute("data-year")) !== y) {
            ok = false;
          }
          if (t && normalize(card.getAttribute("data-type")) !== t) {
            ok = false;
          }
          if (r && normalize(card.getAttribute("data-region")) !== r) {
            ok = false;
          }
          card.classList.toggle("hidden-card", !ok);
        });
      }

      [keyword, year, type, region].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
      form.addEventListener("reset", function () {
        window.setTimeout(apply, 0);
      });

      try {
        var params = new URLSearchParams(window.location.search);
        var preset = params.get("keyword");
        if (preset && keyword) {
          keyword.value = preset;
        }
      } catch (error) {}
      apply();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
