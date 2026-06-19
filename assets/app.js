(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function setupMenu() {
    var toggle = qs("[data-menu-toggle]");
    var panel = qs("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = qs("[data-hero-slider]");
    if (!hero) {
      return;
    }
    var slides = qsa(".hero-slide", hero);
    var dots = qsa(".hero-dot", hero);
    var index = 0;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  }

  function setupSearchForms() {
    qsa(".site-search-form").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = qs("input[name='q']", form);
        if (!input || !input.value.trim()) {
          event.preventDefault();
          input && input.focus();
        }
      });
    });
  }

  function setupFilters() {
    qsa("[data-filter-panel]").forEach(function (panel) {
      var scopeSelector = panel.getAttribute("data-filter-panel");
      var scope = qs(scopeSelector);
      if (!scope) {
        return;
      }
      var cards = qsa("[data-movie-card]", scope);
      var keyword = qs("[data-filter-keyword]", panel);
      var year = qs("[data-filter-year]", panel);
      var type = qs("[data-filter-type]", panel);
      var empty = qs("[data-no-results]");

      function apply() {
        var kw = keyword ? keyword.value.trim().toLowerCase() : "";
        var yr = year ? year.value : "";
        var tp = type ? type.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-tags")
          ].join(" ").toLowerCase();
          var okKeyword = !kw || text.indexOf(kw) !== -1;
          var okYear = !yr || card.getAttribute("data-year") === yr;
          var okType = !tp || card.getAttribute("data-type") === tp;
          var ok = okKeyword && okYear && okType;
          card.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [keyword, year, type].forEach(function (el) {
        if (el) {
          el.addEventListener("input", apply);
          el.addEventListener("change", apply);
        }
      });
    });
  }

  function createResultCard(item) {
    return [
      '<article class="result-card">',
      '<a href="./' + escapeHtml(item.file) + '"><img src="./' + escapeHtml(item.cover) + '.jpg" alt="' + escapeHtml(item.title) + '" loading="lazy"></a>',
      '<div>',
      '<div class="result-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span><span>' + escapeHtml(item.category) + '</span></div>',
      '<h3><a href="./' + escapeHtml(item.file) + '">' + escapeHtml(item.title) + '</a></h3>',
      '<p>' + escapeHtml(item.line) + '</p>',
      '<a class="text-link" href="./' + escapeHtml(item.file) + '">查看详情</a>',
      '</div>',
      '</article>'
    ].join("");
  }

  function setupSearchPage() {
    var box = qs("[data-search-page]");
    if (!box || !window.SEARCH_INDEX) {
      return;
    }
    var input = qs("[data-search-input]", box);
    var results = qs("[data-search-results]", box);
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    if (input && initial) {
      input.value = initial;
    }

    function render() {
      var q = input ? input.value.trim().toLowerCase() : "";
      if (!q) {
        results.innerHTML = '<div class="content-panel" style="padding:24px;color:#64748b;">请输入影片名、类型、地区或标签进行搜索。</div>';
        return;
      }
      var terms = q.split(/\s+/).filter(Boolean);
      var matches = window.SEARCH_INDEX.filter(function (item) {
        var text = item.search.toLowerCase();
        return terms.every(function (term) {
          return text.indexOf(term) !== -1;
        });
      }).slice(0, 80);

      if (!matches.length) {
        results.innerHTML = '<div class="content-panel" style="padding:24px;color:#64748b;">没有找到匹配影片，可以换一个关键词。</div>';
        return;
      }

      results.innerHTML = matches.map(createResultCard).join("");
    }

    if (input) {
      input.addEventListener("input", render);
    }
    render();
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHero();
    setupSearchForms();
    setupFilters();
    setupSearchPage();
  });
})();
