document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector("[data-menu-button]");
  var mobileMenu = document.querySelector("[data-mobile-menu]");

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function () {
      mobileMenu.classList.toggle("is-open");
    });
  }

  var slider = document.querySelector("[data-hero-slider]");

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function runAuto() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 6200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        runAuto();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
        runAuto();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
        runAuto();
      });
    }

    runAuto();
  }

  var filterPage = document.querySelector(".filter-page");

  if (filterPage) {
    var query = new URLSearchParams(window.location.search);
    var input = filterPage.querySelector("[data-filter-input]");
    var category = filterPage.querySelector("[data-category-filter]");
    var year = filterPage.querySelector("[data-year-filter]");
    var type = filterPage.querySelector("[data-type-filter]");
    var reset = filterPage.querySelector("[data-filter-reset]");
    var cards = Array.prototype.slice.call(filterPage.querySelectorAll(".movie-card"));

    if (input && query.get("q")) {
      input.value = query.get("q");
    }

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function applyFilters() {
      var word = normalize(input && input.value);
      var cat = normalize(category && category.value);
      var selectedYear = normalize(year && year.value);
      var selectedType = normalize(type && type.value);

      cards.forEach(function (card) {
        var search = normalize(card.getAttribute("data-search"));
        var cardCategory = normalize(card.getAttribute("data-category"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var cardType = normalize(card.getAttribute("data-type"));
        var matched = true;

        if (word && search.indexOf(word) === -1) {
          matched = false;
        }

        if (cat && cardCategory !== cat) {
          matched = false;
        }

        if (selectedYear && cardYear !== selectedYear) {
          matched = false;
        }

        if (selectedType && cardType !== selectedType) {
          matched = false;
        }

        card.classList.toggle("is-hidden", !matched);
      });
    }

    [input, category, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });

    if (reset) {
      reset.addEventListener("click", function () {
        if (input) {
          input.value = "";
        }
        if (category) {
          category.value = "";
        }
        if (year) {
          year.value = "";
        }
        if (type) {
          type.value = "";
        }
        applyFilters();
      });
    }

    applyFilters();
  }

  document.querySelectorAll("[data-player]").forEach(function (player) {
    var video = player.querySelector("video");
    var layer = player.querySelector(".play-layer");
    var attached = false;
    var hlsInstance = null;

    function attachVideo() {
      if (!video || attached) {
        return;
      }

      var url = video.getAttribute("data-play");
      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
        return;
      }

      video.src = url;
    }

    function startVideo() {
      attachVideo();
      if (!video) {
        return;
      }

      if (layer) {
        layer.classList.add("is-hidden");
      }

      video.controls = true;
      var action = video.play();

      if (action && typeof action.catch === "function") {
        action.catch(function () {
          if (layer) {
            layer.classList.remove("is-hidden");
          }
        });
      }
    }

    attachVideo();

    if (layer) {
      layer.addEventListener("click", startVideo);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          startVideo();
        }
      });
      video.addEventListener("play", function () {
        if (layer) {
          layer.classList.add("is-hidden");
        }
      });
      video.addEventListener("pause", function () {
        if (layer && video.currentTime === 0) {
          layer.classList.remove("is-hidden");
        }
      });
    }

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
});
