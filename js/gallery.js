'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const links = Array.from(document.querySelectorAll('.gallery-item'));
    if (links.length === 0 || typeof HTMLDialogElement === 'undefined') return;

    const lightbox = buildLightbox();
    document.body.append(lightbox.dialog);

    let current = 0;
    let lastFocused = null;

    function show(index) {
        current = (index + links.length) % links.length;

        const link = links[current];
        const thumb = link.querySelector('img');
        const alt = thumb ? thumb.alt : '';

        lightbox.image.src = link.href;
        lightbox.image.alt = alt;
        lightbox.caption.textContent = alt;
        lightbox.count.textContent = `${current + 1} / ${links.length}`;

        [current - 1, current + 1].forEach((i) => {
            const neighbour = links[(i + links.length) % links.length];
            new Image().src = neighbour.href;
        });
    }

    function open(index, trigger) {
        lastFocused = trigger;
        show(index);
        lightbox.dialog.showModal();
        document.documentElement.classList.add('lightbox-open');
    }

    function close() {
        if (lightbox.dialog.open) lightbox.dialog.close();
    }

    links.forEach((link, index) => {
        link.addEventListener('click', (event) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
            event.preventDefault();
            open(index, link);
        });
    });

    lightbox.dialog.addEventListener('close', () => {
        document.documentElement.classList.remove('lightbox-open');
        lightbox.image.removeAttribute('src');
        if (lastFocused) lastFocused.focus();
    });

    lightbox.closeButton.addEventListener('click', close);
    lightbox.prevButton.addEventListener('click', () => show(current - 1));
    lightbox.nextButton.addEventListener('click', () => show(current + 1));

    lightbox.dialog.addEventListener('click', (event) => {
        if (event.target === lightbox.dialog || event.target === lightbox.stage) close();
    });

    lightbox.dialog.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            show(current - 1);
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            show(current + 1);
        }
    });

    let touchStartX = null;
    lightbox.dialog.addEventListener(
        'touchstart',
        (event) => {
            touchStartX = event.changedTouches[0].clientX;
        },
        { passive: true }
    );
    lightbox.dialog.addEventListener(
        'touchend',
        (event) => {
            if (touchStartX === null) return;
            const deltaX = event.changedTouches[0].clientX - touchStartX;
            touchStartX = null;
            if (Math.abs(deltaX) < 50) return;
            show(deltaX < 0 ? current + 1 : current - 1);
        },
        { passive: true }
    );

    if (links.length < 2) {
        lightbox.prevButton.hidden = true;
        lightbox.nextButton.hidden = true;
        lightbox.count.hidden = true;
    }
});

function buildLightbox() {
    const dialog = document.createElement('dialog');
    dialog.className = 'lightbox';
    dialog.setAttribute('aria-label', 'Image viewer');

    const closeButton = makeButton('lightbox-btn lightbox-close', 'Close image viewer', '×');
    const prevButton = makeButton('lightbox-btn lightbox-prev', 'Previous image', '‹');
    const nextButton = makeButton('lightbox-btn lightbox-next', 'Next image', '›');

    const stage = document.createElement('div');
    stage.className = 'lightbox-stage';

    const figure = document.createElement('figure');
    figure.className = 'lightbox-figure';

    const image = document.createElement('img');
    image.className = 'lightbox-image';
    image.alt = '';

    const caption = document.createElement('figcaption');
    caption.className = 'lightbox-caption';

    const count = document.createElement('p');
    count.className = 'lightbox-count';
    count.setAttribute('aria-live', 'polite');

    figure.append(image, caption);
    stage.append(figure);
    dialog.append(closeButton, prevButton, stage, nextButton, count);

    return { dialog, stage, image, caption, count, closeButton, prevButton, nextButton };
}

function makeButton(className, label, symbol) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.setAttribute('aria-label', label);
    button.textContent = symbol;
    return button;
}