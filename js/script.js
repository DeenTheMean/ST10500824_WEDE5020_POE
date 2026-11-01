'use strict';

document.addEventListener('DOMContentLoaded', () => {
    initMobileNav();
});

function initMobileNav() {
    const toggle = document.getElementById('nav-toggle');
    const label = document.querySelector('.nav-toggle-label');
    const navLinks = document.querySelectorAll('nav a');
 
    if (!toggle) return;
 
    const syncExpandedState = () => {
        if (label) {
            label.setAttribute('aria-expanded', toggle.checked ? 'true' : 'false');
        }
    };
    
    toggle.addEventListener('change', syncExpandedState);
    syncExpandedState();
 
    navLinks.forEach((link) => {
        link.addEventListener('click', () => {
            toggle.checked = false;
            syncExpandedState();
        });
    });
}
