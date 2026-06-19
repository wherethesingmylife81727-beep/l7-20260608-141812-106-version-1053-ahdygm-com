(function () {
    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function initMobileNav() {
        var toggle = document.querySelector('[data-nav-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initHeroCarousel() {
        var root = document.querySelector('[data-hero-carousel]');
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
        var next = root.querySelector('[data-hero-next]');
        var prev = root.querySelector('[data-hero-prev]');
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function render(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                render(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (next) {
            next.addEventListener('click', function () {
                render(index + 1);
                start();
            });
        }
        if (prev) {
            prev.addEventListener('click', function () {
                render(index - 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                render(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });
        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        render(0);
        start();
    }

    function getUrlQuery() {
        var params = new URLSearchParams(window.location.search);
        return params.get('q') || '';
    }

    function initMovieFilters() {
        var panel = document.querySelector('[data-filter-panel]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
        if (!panel || !cards.length) {
            return;
        }
        var searchInput = panel.querySelector('[data-movie-search]');
        var selects = Array.prototype.slice.call(panel.querySelectorAll('[data-filter]'));
        var count = panel.querySelector('[data-result-count]');
        var initialQuery = getUrlQuery();

        if (initialQuery && searchInput) {
            searchInput.value = initialQuery;
        }

        function cardMatches(card) {
            var query = normalize(searchInput ? searchInput.value : '');
            var haystack = normalize(card.getAttribute('data-search') + ' ' + card.textContent);
            if (query && haystack.indexOf(query) === -1) {
                return false;
            }
            for (var i = 0; i < selects.length; i += 1) {
                var select = selects[i];
                var key = select.getAttribute('data-filter');
                var selected = normalize(select.value);
                if (!selected) {
                    continue;
                }
                var value = normalize(card.getAttribute('data-' + key));
                if (value !== selected) {
                    return false;
                }
            }
            return true;
        }

        function applyFilters() {
            var visible = 0;
            cards.forEach(function (card) {
                var ok = cardMatches(card);
                card.classList.toggle('is-hidden', !ok);
                if (ok) {
                    visible += 1;
                }
            });
            if (count) {
                count.textContent = String(visible);
            }
        }

        if (searchInput) {
            searchInput.addEventListener('input', applyFilters);
        }
        selects.forEach(function (select) {
            select.addEventListener('change', applyFilters);
        });
        applyFilters();
    }

    function initPosterFallbacks() {
        var images = Array.prototype.slice.call(document.querySelectorAll('img'));
        images.forEach(function (image) {
            image.addEventListener('error', function () {
                image.classList.add('image-missing');
            });
        });
    }

    function initVideoPlayer() {
        var shell = document.querySelector('.player-shell');
        var video = document.querySelector('.video-player');
        var button = document.querySelector('[data-player-start]');
        var status = document.querySelector('[data-player-status]');
        if (!shell || !video || !button) {
            return;
        }
        var source = video.getAttribute('data-video-src');
        var hlsInstance = null;

        function setStatus(message) {
            if (status) {
                status.textContent = message;
            }
        }

        function playVideo() {
            shell.classList.add('is-playing');
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    shell.classList.remove('is-playing');
                    setStatus('浏览器阻止了自动播放，请再次点击播放');
                });
            }
        }

        function attachNative() {
            video.src = source;
            video.addEventListener('loadedmetadata', playVideo, { once: true });
            video.load();
        }

        button.addEventListener('click', function () {
            if (!source) {
                setStatus('当前影片暂无可用线路');
                return;
            }
            setStatus('正在载入播放线路...');
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                attachNative();
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
                hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setStatus('播放线路已载入');
                    playVideo();
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setStatus('播放线路载入失败，可刷新页面重试');
                    }
                });
                return;
            }
            setStatus('当前浏览器不支持 HLS 播放');
        });

        video.addEventListener('play', function () {
            shell.classList.add('is-playing');
            setStatus('正在播放');
        });
        video.addEventListener('pause', function () {
            setStatus('已暂停');
        });
        video.addEventListener('ended', function () {
            shell.classList.remove('is-playing');
            setStatus('播放结束');
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileNav();
        initHeroCarousel();
        initMovieFilters();
        initPosterFallbacks();
        initVideoPlayer();
    });
}());
