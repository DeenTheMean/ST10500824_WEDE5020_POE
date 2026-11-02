'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const links = Array.from(document.querySelectorAll('.gallery-item'));
    if (links.length === 0 || typeof HTMLDialogElement === 'undefined') return;

    const lightbox = buildLightbox();
    document.body.append(lightbox.dialog);

    let current = 0;
    let lastFocused = null;

    // Display the lightbox with the image at the given index
    function show(index) {
        // Wrap around at both ends
        current = (index + links.length) % links.length;

        const link = links[current];
        const thumb = link.querySelector('img');
        const alt = thumb ? thumb.alt : '';

        lightbox.image.src = link.href;
        lightbox.image.alt = alt;
        lightbox.caption.textContent = alt;
        lightbox.count.textContent = `${current + 1} / ${links.length}`;

        // Prepare the cache for the neighbouring images so switching between them feels instant
        [current - 1, current + 1].forEach((i) => {
            const neighbour = links[(i + links.length) % links.length];
            new Image().src = neighbour.href;
        });
    }

    // Open the lightbox with the image at the given index
    function open(index, trigger) {
        lastFocused = trigger;
        show(index);
        lightbox.dialog.showModal();
        document.documentElement.classList.add('lightbox-open');
    }

    // Close the lightbox if it is open
    function close() {
        if (lightbox.dialog.open) lightbox.dialog.close();
    }

    // Add click handlers to all gallery links to open the lightbox
    links.forEach((link, index) => {
        link.addEventListener('click', (event) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
            event.preventDefault();
            open(index, link);
        });
    });

    // Add handlers to close the lightbox and clean up when it is closed
    lightbox.dialog.addEventListener('close', () => {
        document.documentElement.classList.remove('lightbox-open');
        lightbox.image.removeAttribute('src');
        if (lastFocused) lastFocused.focus();
    });

    // Add handlers for the lightbox buttons and keyboard/touch navigation
    lightbox.closeButton.addEventListener('click', close);
    lightbox.prevButton.addEventListener('click', () => show(current - 1));
    lightbox.nextButton.addEventListener('click', () => show(current + 1));

    // Close the lightbox if the user clicks outside the image or presses Escape
    lightbox.dialog.addEventListener('click', (event) => {
        if (event.target === lightbox.dialog || event.target === lightbox.stage) close();
    });

    // Add keyboard and touch navigation for the lightbox
    lightbox.dialog.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            show(current - 1);
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            show(current + 1);
        }
    });

    // Add touch navigation for the lightbox
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
});

// Build the lightbox element
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

// Create a button element with the given class, label, and symbol
function makeButton(className, label, symbol) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.setAttribute('aria-label', label);
    button.textContent = symbol;
    return button;
}