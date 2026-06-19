(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  ready(function () {
    setupMenu();
    setupHeroCarousel();
    setupPlayers();
    setupSearchPage();
  });

  function setupMenu() {
    var toggle = document.querySelector('.menu-toggle');
    if (!toggle) {
      return;
    }

    toggle.addEventListener('click', function () {
      document.body.classList.toggle('menu-open');
    });
  }

  function setupHeroCarousel() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var next = document.querySelector('[data-hero-next]');
    var prev = document.querySelector('[data-hero-prev]');

    if (!slides.length) {
      return;
    }

    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
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
      }
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    show(0);
    start();
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (container) {
      var button = container.querySelector('[data-play-button]');
      var video = container.querySelector('video');
      var message = container.querySelector('[data-player-message]');
      var source = container.getAttribute('data-src');
      var hlsInstance = null;
      var initialized = false;

      if (!button || !video || !source) {
        return;
      }

      function showMessage(text) {
        if (!message) {
          return;
        }
        message.textContent = text;
        message.classList.add('show');
      }

      function playVideo() {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            showMessage('浏览器阻止了自动播放，请再次点击视频播放。');
          });
        }
      }

      function initHls() {
        if (initialized) {
          playVideo();
          return;
        }
        initialized = true;
        container.classList.add('playing');

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false,
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            playVideo();
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              showMessage('播放源加载失败，请刷新页面或稍后重试。');
              if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
              }
            }
          });
          return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', playVideo, { once: true });
          video.load();
          return;
        }

        showMessage('当前浏览器不支持 HLS 播放，请使用 Chrome、Edge、Safari 或移动端浏览器访问。');
      }

      button.addEventListener('click', initHls);
      video.addEventListener('play', function () {
        container.classList.add('playing');
      });
    });
  }

  function setupSearchPage() {
    var data = window.MOVIE_SEARCH_DATA;
    var results = document.querySelector('[data-search-results]');
    var form = document.querySelector('[data-search-form]');
    var input = document.querySelector('[data-search-input]');
    var title = document.querySelector('[data-search-title]');
    var count = document.querySelector('[data-search-count]');
    var filterBar = document.querySelector('[data-filter-bar]');

    if (!Array.isArray(data) || !results || !form || !input || !filterBar) {
      return;
    }

    var filters = {
      kind: filterBar.querySelector('[data-filter="kind"]'),
      region: filterBar.querySelector('[data-filter="region"]'),
      year: filterBar.querySelector('[data-filter="year"]'),
      sort: filterBar.querySelector('[data-filter="sort"]'),
    };

    fillSelect(filters.kind, unique(data.map(function (item) { return item.kind; })).sort());
    fillSelect(filters.region, unique(data.map(function (item) { return item.region; })).sort());
    fillSelect(filters.year, unique(data.map(function (item) { return String(item.year); })).sort().reverse());

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    input.value = initialQuery;

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      render();
    });

    Object.keys(filters).forEach(function (key) {
      if (filters[key]) {
        filters[key].addEventListener('change', render);
      }
    });

    if (initialQuery) {
      render();
    }

    function render() {
      var query = input.value.trim().toLowerCase();
      var kind = filters.kind ? filters.kind.value : '';
      var region = filters.region ? filters.region.value : '';
      var year = filters.year ? filters.year.value : '';
      var sort = filters.sort ? filters.sort.value : 'rating';

      var matched = data.filter(function (item) {
        var haystack = [
          item.title,
          item.region,
          item.kind,
          item.year,
          item.genre,
          item.tags,
          item.oneLine,
        ].join(' ').toLowerCase();

        if (query && haystack.indexOf(query) === -1) {
          return false;
        }
        if (kind && item.kind !== kind) {
          return false;
        }
        if (region && item.region !== region) {
          return false;
        }
        if (year && String(item.year) !== year) {
          return false;
        }
        return true;
      });

      matched.sort(function (a, b) {
        if (sort === 'year') {
          return Number(b.year) - Number(a.year) || Number(b.rating) - Number(a.rating);
        }
        if (sort === 'title') {
          return a.title.localeCompare(b.title, 'zh-CN');
        }
        return Number(b.rating) - Number(a.rating) || Number(b.year) - Number(a.year);
      });

      var limited = matched.slice(0, 120);
      results.innerHTML = limited.map(renderCard).join('');

      if (title) {
        title.textContent = query ? '“' + input.value.trim() + '”的搜索结果' : '筛选结果';
      }
      if (count) {
        count.textContent = '共找到 ' + matched.length + ' 部内容，当前展示前 ' + limited.length + ' 部。';
      }
    }

    function fillSelect(select, values) {
      if (!select) {
        return;
      }
      values.forEach(function (value) {
        if (!value) {
          return;
        }
        var option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    }

    function unique(values) {
      var seen = Object.create(null);
      return values.filter(function (value) {
        if (!value || seen[value]) {
          return false;
        }
        seen[value] = true;
        return true;
      });
    }

    function escapeHtml(value) {
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function renderCard(item) {
      return [
        '<article class="movie-card">',
        '  <a class="movie-poster" href="' + escapeHtml(item.url) + '" aria-label="观看 ' + escapeHtml(item.title) + '">',
        '    <img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
        '    <span class="poster-shade"></span>',
        '    <span class="play-mark">▶</span>',
        '    <span class="rating-pill">★ ' + escapeHtml(item.rating) + '</span>',
        '  </a>',
        '  <div class="movie-card-body">',
        '    <div class="movie-meta-line"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.kind) + '</span></div>',
        '    <h3><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h3>',
        '    <p>' + escapeHtml(item.oneLine) + '</p>',
        '    <div class="mini-tags"><span>' + escapeHtml(item.genre.split(/[，,、/]/)[0] || item.kind) + '</span></div>',
        '  </div>',
        '</article>',
      ].join('');
    }
  }
})();
