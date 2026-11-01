'use strict';

document.addEventListener('DOMContentLoaded', () => {
    initMobileNav();
    initFaqAccordion();
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

function initFaqAccordion() {
    const faqContainers = document.querySelectorAll('.faq-container');
 
    faqContainers.forEach((details) => {
        const items = details.querySelectorAll('.questions');
 
        items.forEach((item) => {
            item.addEventListener('toggle', () => {
                if (!item.open) return;
 
                items.forEach((other) => {
                    if (other !== item) {
                        other.open = false;
                    }
                });
            });
        });
    });
}

function initForms() {

}

function validateField(field) {

}

function handleFormSubmit(form, fields) {

}

function submitFormViaAjax(form, successE1) {

}

function showFormError(form) {
    let banner = form.querySelector('.form-error-banner');
 
    if (!banner) {
        banner = document.createElement('p');
        banner.className = 'form-error-banner';
        banner.setAttribute('role', 'alert');
        form.appendChild(banner);
    }
 
    banner.textContent =
        'Something went wrong. Please try again.';
    banner.classList.add('visible');    
}

function hideFormError(form) {
    const banner = form.querySelector('.form-error-banner');
    if (banner) {
        banner.classList.remove('visible');
    }
}