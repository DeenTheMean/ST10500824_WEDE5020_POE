'use strict';

document.addEventListener('DOMContentLoaded', () => {
    initMobileNav();
    initFaqAccordion();
    initForms();
});

// Initialise the mobile navigation toggle and ensure it closes when a link is clicked
function initMobileNav() {
    const toggle = document.getElementById('nav-toggle');
    const label = document.querySelector('.nav-toggle-label');
    const navLinks = document.querySelectorAll('nav a');
 
    if (!toggle) return;
 
    // Sync the aria-expanded state of the toggle button with its checked state
    const syncExpandedState = () => {
        if (label) {
            label.setAttribute('aria-expanded', toggle.checked ? 'true' : 'false');
        }
    };
    
    toggle.addEventListener('change', syncExpandedState);
    syncExpandedState();
 
    // Close the mobile navigation when a link is clicked
    navLinks.forEach((link) => {
        link.addEventListener('click', () => {
            toggle.checked = false;
            syncExpandedState();
        });
    });
}

// Initialise the FAQ accordion functionality
function initFaqAccordion() {
    const faqContainers = document.querySelectorAll('.faq-container');
 
    // Add toggle event listeners to each FAQ item to ensure only one is open at a time
    faqContainers.forEach((details) => {
        const items = details.querySelectorAll('.questions');
 
        items.forEach((item) => {
            item.addEventListener('toggle', () => {
                if (!item.open) return;
                
                // Close all other items in the same container when one is opened
                items.forEach((other) => {
                    if (other !== item) {
                        other.open = false;
                    }
                });
            });
        });
    });
}

// Initialise form validation and submission handling
function initForms() {
    const forms = document.querySelectorAll('form.form');
 
    // Skip forms that have already been initialised
    forms.forEach((form) => {
        if (form.dataset.formReady === 'true') return;
        form.dataset.formReady = 'true';
        form.noValidate = true;

        const fields = form.querySelectorAll('input, select, textarea');
 
        // Add event listeners to validate fields on blur and input
        fields.forEach((field) => {
            field.addEventListener('blur', () => validateField(field));
            field.addEventListener('input', () => {
                if (field.classList.contains('invalid')) {
                    validateField(field);
                }
            });
        });
 
        // Handle form submission via AJAX
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            handleFormSubmit(form, fields);
        });
    });
}

// Validate a single form field and display an error message if invalid
function validateField(field) {
    const errorEl = document.getElementById(`${field.id}-error`);
    const value = field.value.trim();
    let message = '';
 
    // Check for required fields and validate based on field type
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
 
    // Toggle the invalid class and display the error message if present
    field.classList.toggle('invalid', message !== '');
    if (errorEl) {
        errorEl.textContent = message;
    }
 
    return message === '';
}

// Handle form submission by validating all fields and submitting via AJAX if valid
function handleFormSubmit(form, fields) {
    let isValid = true;
 
    // Validate all fields and track overall validity
    fields.forEach((field) => {
        const fieldIsValid = validateField(field);
        if (!fieldIsValid) {
            isValid = false;
        }
    });
 
    const successEl = document.getElementById(`${form.id}-success`);
 
    // If the form is invalid, hide the success message and focus the first invalid field
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

// Submit the form data via AJAX and handle the response
async function submitFormViaAjax(form, successEl) {
    // Prevent multiple submissions by checking the submitting state
    if (form.dataset.submitting === 'true') return;
    form.dataset.submitting = 'true';

    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton ? submitButton.textContent : '';
 
    // Disable the submit button and show a sending message while the request is in progress
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
    }

    // Use a try-finally block to ensure the submitting state is reset and the button is re-enabled after the request
    try {
        let response;

        try {
            // Send the form data via fetch to the form's action URL with the specified method and headers
            response = await fetch(form.action, {
                method: form.method || 'POST',
                body: new FormData(form),
                headers: { Accept: 'application/json' },
            });
        } catch (error) {
            // Handle network errors or other issues that prevent the request from being completed
            console.error('[Form] The request could not be completed:', error);
            showFormError(
                form,
                "We couldn't reach our form service. Please check your connection and try again, or contact us directly."
            );
            return;
        }

        // Check if the response was successful
        if (!response.ok) {
            let details = '';
            try {
                details = await response.text();
            } catch (error) {
                console.error('[Form] Failed to read response text:', error);
            }
            console.error(`[Form] The server replied with status ${response.status}:`, details);
            showFormError(form);
            return;
        }

        try {
            form.reset();
            form.querySelectorAll('.invalid').forEach((field) => {
                field.classList.remove('invalid');
            });
            hideFormError(form);
        } catch (error) {
            console.error('[Form] Sent, but tidying up the form failed:', error);
        }

        // Display a success message if the success element is present
        if (successEl) {
            successEl.textContent = "Message sent successfully! We'll get back to you soon.";
            successEl.classList.add('visible');
        }
    } finally {
        // Reset the submitting state and re-enable the submit button
        form.dataset.submitting = 'false';
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    }
}

// Display a form error message in a banner at the bottom of the form
function showFormError(form, message) {
    let banner = form.querySelector('.form-error-banner');
 
    // Create the error banner if it doesn't exist yet
    if (!banner) {
        banner = document.createElement('p');
        banner.className = 'form-error-banner';
        banner.setAttribute('role', 'alert');
        form.appendChild(banner);
    }
 
    // Set the error message and make the banner visible
    banner.textContent =
        message ||
        'Something went wrong. Please try again or contact us directly.';
    banner.classList.add('visible');
}

// Hide the form error banner if it is present
function hideFormError(form) {
    const banner = form.querySelector('.form-error-banner');
    if (banner) {
        banner.classList.remove('visible');
    }
}