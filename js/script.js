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
    const forms = document.querySelectorAll('form.form');
 
    forms.forEach((form) => {
        const fields = form.querySelectorAll('input, select, textarea');
 
        fields.forEach((field) => {
            field.addEventListener('blur', () => validateField(field));
            field.addEventListener('input', () => {
                if (field.classList.contains('invalid')) {
                    validateField(field);
                }
            });
        });
 
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            handleFormSubmit(form, fields);
        });
    });
}

function validateField(field) {
    const errorEl = document.getElementById(`${field.id}-error`);
    const value = field.value.trim();
    let message = '';
 
    if (field.hasAttribute('required') && value === '') {
        message = 'This field is required.';
    } else if (value !== '') {
        if (field.type === 'email') {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(value)) {
                message = 'Please enter a valid email address.';
            }
        } else if (field.type === 'tel') {
            const phonePattern = /^[0-9+()\-\s]{7,15}$/;
            if (!phonePattern.test(value)) {
                message = 'Please enter a valid phone number.';
            }
        } else if (field.tagName === 'TEXTAREA' && value.length < 10) {
            message = 'Please provide a bit more detail (at least 10 characters).';
        }
    }
 
    field.classList.toggle('invalid', message !== '');
    if (errorEl) {
        errorEl.textContent = message;
    }
 
    return message === '';
}

function handleFormSubmit(form, fields) {
    let isValid = true;
 
    fields.forEach((field) => {
        const fieldIsValid = validateField(field);
        if (!fieldIsValid) {
            isValid = false;
        }
    });
 
    const successEl = document.getElementById(`${form.id}-success`);
 
    if (!isValid) {
        if (successEl) {
            successEl.classList.remove('visible');
        }
        const firstInvalid = form.querySelector('.invalid');
        if (firstInvalid) {
            firstInvalid.focus();
        }
        return;
    }
 
    submitFormViaAjax(form, successEl);
}

function submitFormViaAjax(form, successE1) {
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton ? submitButton.textContent : '';
 
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
    }
 
    fetch(form.action, {
        method: form.method || 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
    })
        .then((response) => {
            if (response.ok) {
                form.reset();
                form.querySelectorAll('.invalid').forEach((field) => {
                    field.classList.remove('invalid');
                });
                hideFormError(form);
                if (successEl) {
                    successEl.textContent =
                        "Thanks — your message has been sent. We'll be in touch soon.";
                    successEl.classList.add('visible');
                }
            } else {
                showFormError(form);
            }
        })
        .catch(() => {
            showFormError(form);
        })
        .finally(() => {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        });
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