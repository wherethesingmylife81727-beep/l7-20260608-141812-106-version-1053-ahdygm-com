const Hls = window.Hls;

const menuButton = document.querySelector('[data-menu-toggle]');
const mobileMenu = document.querySelector('[data-mobile-menu]');

if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('open');
    });
}

const hero = document.querySelector('[data-hero]');

if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let index = 0;
    let timer = null;

    const show = (nextIndex) => {
        if (!slides.length) {
            return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach((slide, currentIndex) => {
            slide.classList.toggle('active', currentIndex === index);
        });
        dots.forEach((dot, currentIndex) => {
            dot.classList.toggle('active', currentIndex === index);
        });
    };

    const start = () => {
        timer = window.setInterval(() => show(index + 1), 5200);
    };

    dots.forEach((dot, dotIndex) => {
        dot.addEventListener('click', () => {
            show(dotIndex);
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        });
    });

    show(0);
    start();
}

const normalize = (value) => String(value || '').trim().toLowerCase();

const applyFilter = (form) => {
    const input = form.querySelector('[data-filter-input]');
    const list = document.querySelector('[data-filter-list]');
    if (!input || !list) {
        return;
    }

    const cards = Array.from(list.querySelectorAll('.movie-card'));
    const existing = list.querySelector('.no-results');
    if (existing) {
        existing.remove();
    }

    const keyword = normalize(input.value);
    let visible = 0;

    cards.forEach((card) => {
        const haystack = normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.year,
            card.dataset.genre,
            card.textContent
        ].join(' '));
        const matched = !keyword || haystack.includes(keyword);
        card.style.display = matched ? '' : 'none';
        if (matched) {
            visible += 1;
        }
    });

    if (!visible) {
        const empty = document.createElement('div');
        empty.className = 'no-results';
        empty.textContent = '没有找到匹配的影片';
        list.appendChild(empty);
    }
};

document.querySelectorAll('[data-filter-form]').forEach((form) => {
    const input = form.querySelector('[data-filter-input]');
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');

    if (input && q) {
        input.value = q;
        applyFilter(form);
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        applyFilter(form);
    });

    if (input) {
        input.addEventListener('input', () => applyFilter(form));
    }
});

const initPlayer = (root) => {
    const video = root.querySelector('video');
    const button = root.querySelector('[data-play-button]');
    const source = root.dataset.source;
    let attached = false;
    let hls = null;

    if (!video || !source) {
        return;
    }

    const attach = () => {
        if (attached) {
            return;
        }
        attached = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(source);
            hls.attachMedia(video);
        } else {
            video.src = source;
        }

        video.controls = true;
        if (button) {
            button.classList.add('hidden');
        }

        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => {
                if (button) {
                    button.classList.remove('hidden');
                }
            });
        }
    };

    if (button) {
        button.addEventListener('click', attach);
    }

    video.addEventListener('click', () => {
        if (!attached) {
            attach();
        }
    });

    video.addEventListener('emptied', () => {
        if (hls) {
            hls.destroy();
            hls = null;
        }
        attached = false;
    });
};

document.querySelectorAll('[data-player]').forEach(initPlayer);
