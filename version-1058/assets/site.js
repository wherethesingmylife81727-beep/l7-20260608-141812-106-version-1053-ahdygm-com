(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initializeMobileMenu() {
        var button = document.querySelector("[data-mobile-menu-button]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function initializeHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initializeFilters() {
        var panel = document.querySelector("[data-filter-panel]");
        if (!panel) {
            return;
        }
        var searchInput = panel.querySelector("[data-filter-search]");
        var categorySelect = panel.querySelector("[data-filter-category]");
        var yearSelect = panel.querySelector("[data-filter-year]");
        var typeSelect = panel.querySelector("[data-filter-type]");
        var items = Array.prototype.slice.call(document.querySelectorAll(".filter-item"));
        var empty = document.querySelector("[data-empty-state]");
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";

        if (searchInput && query) {
            searchInput.value = query;
        }

        function normalize(value) {
            return (value || "").toString().toLowerCase().trim();
        }

        function update() {
            var q = normalize(searchInput && searchInput.value);
            var category = normalize(categorySelect && categorySelect.value);
            var year = normalize(yearSelect && yearSelect.value);
            var type = normalize(typeSelect && typeSelect.value);
            var visible = 0;

            items.forEach(function (item) {
                var text = normalize([
                    item.getAttribute("data-title"),
                    item.getAttribute("data-region"),
                    item.getAttribute("data-type"),
                    item.getAttribute("data-year"),
                    item.getAttribute("data-category"),
                    item.getAttribute("data-tags")
                ].join(" "));
                var match = true;
                if (q && text.indexOf(q) === -1) {
                    match = false;
                }
                if (category && normalize(item.getAttribute("data-category")) !== category) {
                    match = false;
                }
                if (year && normalize(item.getAttribute("data-year")) !== year) {
                    match = false;
                }
                if (type && normalize(item.getAttribute("data-type")).indexOf(type) === -1 && text.indexOf(type) === -1) {
                    match = false;
                }
                item.style.display = match ? "" : "none";
                if (match) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("show", visible === 0);
            }
        }

        [searchInput, categorySelect, yearSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", update);
                control.addEventListener("change", update);
            }
        });
        update();
    }

    function initializePlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-video-src]"));
        players.forEach(function (box) {
            var video = box.querySelector("video");
            var button = box.querySelector("[data-play-button]");
            var message = box.querySelector("[data-player-message]");
            var source = box.getAttribute("data-video-src");
            var hls = null;

            function showMessage(text) {
                if (message) {
                    message.textContent = text;
                    message.classList.add("show");
                }
            }

            function attach() {
                if (!video || !source || video.getAttribute("data-ready") === "1") {
                    return;
                }
                video.setAttribute("data-ready", "1");
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            showMessage("视频加载失败，请稍后重试");
                        }
                    });
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                } else {
                    showMessage("当前浏览器不支持 HLS 播放");
                }
            }

            function play() {
                attach();
                if (!video) {
                    return;
                }
                var result = video.play();
                if (result && typeof result.catch === "function") {
                    result.catch(function () {
                        showMessage("请再次点击播放按钮开始播放");
                    });
                }
            }

            if (button) {
                button.addEventListener("click", play);
            }
            if (video) {
                video.addEventListener("click", function () {
                    if (video.paused) {
                        play();
                    } else {
                        video.pause();
                    }
                });
                video.addEventListener("play", function () {
                    box.classList.add("is-playing");
                });
                video.addEventListener("pause", function () {
                    box.classList.remove("is-playing");
                });
                attach();
            }
            window.addEventListener("beforeunload", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    ready(function () {
        initializeMobileMenu();
        initializeHero();
        initializeFilters();
        initializePlayers();
    });
}());
