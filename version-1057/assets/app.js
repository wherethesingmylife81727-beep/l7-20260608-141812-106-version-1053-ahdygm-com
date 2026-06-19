(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector('.mobile-toggle');
    var nav = document.querySelector('.mobile-nav');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function start() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }
    show(0);
    start();
  }

  function loadHls() {
    return new Promise(function (resolve, reject) {
      if (window.Hls) {
        resolve(window.Hls);
        return;
      }
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function safePlay(video) {
    var playResult = video.play();
    if (playResult && typeof playResult.catch === 'function') {
      playResult.catch(function () {});
    }
  }

  window.initVideoPlayer = function (source) {
    ready(function () {
      var video = document.querySelector('[data-player-video]');
      var cover = document.querySelector('[data-player-cover]');
      var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-player-play]'));
      if (!video || !source) {
        return;
      }

      function attachAndPlay() {
        if (cover) {
          cover.classList.add('is-hidden');
        }
        if (video.dataset.ready === '1') {
          safePlay(video);
          return;
        }
        video.dataset.ready = '1';
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          safePlay(video);
          return;
        }
        loadHls().then(function (Hls) {
          if (Hls && Hls.isSupported()) {
            if (video._hlsPlayer) {
              video._hlsPlayer.destroy();
            }
            var hls = new Hls({
              enableWorker: true,
              lowLatencyMode: false
            });
            video._hlsPlayer = hls;
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
              safePlay(video);
            });
          } else {
            video.src = source;
            safePlay(video);
          }
        }).catch(function () {
          video.src = source;
          safePlay(video);
        });
      }

      buttons.forEach(function (button) {
        button.addEventListener('click', function (event) {
          event.preventDefault();
          attachAndPlay();
        });
      });
      video.addEventListener('click', function () {
        if (video.dataset.ready !== '1') {
          attachAndPlay();
        }
      });
    });
  };

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function setupSearchPage() {
    var results = document.querySelector('[data-search-results]');
    var status = document.querySelector('[data-search-status]');
    if (!results || !status || !window.SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = (params.get('q') || '').trim();
    var formInput = document.querySelector('.search-page-form input[name="q"]');
    if (formInput) {
      formInput.value = q;
    }
    if (!q) {
      return;
    }
    var lower = q.toLowerCase();
    var matched = window.SEARCH_INDEX.filter(function (item) {
      return [item.title, item.category, item.region, item.type, item.year, item.genre, item.tags]
        .join(' ')
        .toLowerCase()
        .indexOf(lower) !== -1;
    }).slice(0, 120);
    status.textContent = matched.length ? '已找到相关影片，点击卡片即可观看。' : '没有找到匹配影片。';
    results.innerHTML = matched.map(function (item) {
      return '<article class="movie-card">'
        + '<a class="movie-cover" href="' + escapeHtml(item.path) + '">'
        + '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">'
        + '<span class="cover-chip">' + escapeHtml(item.category) + '</span>'
        + '<span class="cover-play">▶</span>'
        + '</a>'
        + '<div class="movie-card-body">'
        + '<a class="movie-title" href="' + escapeHtml(item.path) + '">' + escapeHtml(item.title) + '</a>'
        + '<p>' + escapeHtml(item.oneLine) + '</p>'
        + '<div class="movie-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.year) + '年</span></div>'
        + '</div>'
        + '</article>';
    }).join('');
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupSearchPage();
  });
})();
