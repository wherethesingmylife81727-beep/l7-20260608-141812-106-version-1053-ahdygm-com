
(function () {
    function onReady(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        var timer;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function start() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                start();
            });
        });

        slider.addEventListener("mouseenter", function () {
            clearInterval(timer);
        });
        slider.addEventListener("mouseleave", start);
        start();
    }

    function setupFilters() {
        var forms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));
        forms.forEach(function (form) {
            var targetSelector = form.getAttribute("data-target");
            var scope = targetSelector ? document.querySelector(targetSelector) : document;
            if (!scope) {
                return;
            }
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
            var searchInput = form.querySelector("[data-search-input]");
            var genreSelect = form.querySelector("[data-genre-select]");
            var yearSelect = form.querySelector("[data-year-select]");
            var emptyState = document.querySelector("[data-empty-state]");

            function valueOf(element) {
                return element ? element.value.trim().toLowerCase() : "";
            }

            function apply() {
                var keyword = valueOf(searchInput);
                var genre = valueOf(genreSelect);
                var year = valueOf(yearSelect);
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-region"),
                        card.textContent
                    ].join(" ").toLowerCase();
                    var cardGenre = (card.getAttribute("data-genre") || "").toLowerCase();
                    var cardYear = (card.getAttribute("data-year") || "").toLowerCase();
                    var ok = true;

                    if (keyword && haystack.indexOf(keyword) === -1) {
                        ok = false;
                    }
                    if (genre && cardGenre.indexOf(genre) === -1) {
                        ok = false;
                    }
                    if (year && cardYear !== year) {
                        ok = false;
                    }

                    card.hidden = !ok;
                    if (ok) {
                        visible += 1;
                    }
                });

                if (emptyState) {
                    emptyState.hidden = visible !== 0;
                }
            }

            [searchInput, genreSelect, yearSelect].forEach(function (element) {
                if (!element) {
                    return;
                }
                element.addEventListener("input", apply);
                element.addEventListener("change", apply);
            });
        });
    }

    function setupMoviePlayer(videoId, buttonId, overlayId, source) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        var overlay = document.getElementById(overlayId);
        var prepared = false;
        var hlsInstance = null;

        if (!video || !source) {
            return;
        }

        function prepare() {
            if (prepared) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                prepared = true;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                prepared = true;
                return;
            }
            video.src = source;
            prepared = true;
        }

        function start(event) {
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
            prepare();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener("click", start);
        }
        if (overlay) {
            overlay.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (!prepared) {
                start();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    window.setupMoviePlayer = setupMoviePlayer;

    onReady(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
}());
