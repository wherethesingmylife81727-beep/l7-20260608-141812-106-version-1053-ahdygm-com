(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function bindMenu() {
    var button = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
      button.textContent = open ? "×" : "☰";
    });
  }

  function bindHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    window.setInterval(function () {
      show(current + 1);
    }, 5600);
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function bindFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var input = scope.querySelector("[data-filter-input]");
      var typeSelect = scope.querySelector("[data-filter-type]");
      var yearSelect = scope.querySelector("[data-filter-year]");
      var grid = scope.parentElement.querySelector("[data-card-grid]");
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
      function apply() {
        var query = normalize(input && input.value);
        var type = normalize(typeSelect && typeSelect.value);
        var year = normalize(yearSelect && yearSelect.value);
        cards.forEach(function (card) {
          var title = normalize(card.getAttribute("data-title"));
          var meta = normalize(card.getAttribute("data-meta"));
          var cardType = normalize(card.getAttribute("data-type"));
          var cardYear = normalize(card.getAttribute("data-year"));
          var hay = title + " " + meta + " " + cardType + " " + cardYear;
          var okQuery = !query || hay.indexOf(query) !== -1;
          var okType = !type || cardType.indexOf(type) !== -1 || meta.indexOf(type) !== -1;
          var okYear = !year || (year === "2020" ? Number(cardYear.slice(0, 4)) <= 2020 : cardYear.indexOf(year) !== -1);
          card.classList.toggle("is-hidden", !(okQuery && okType && okYear));
        });
      }
      [input, typeSelect, yearSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  }

  ready(function () {
    bindMenu();
    bindHero();
    bindFilters();
  });
})();
