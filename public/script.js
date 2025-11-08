// Wait for the DOM to be fully loaded before running scripts
document.addEventListener('DOMContentLoaded', () => {

    // Feather Icons initialization
    // This function finds all elements with a `data-feather` attribute and replaces them with SVG icons.
    feather.replace();

    // Mobile menu toggle functionality
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    // Check if both the button and the menu exist to avoid errors
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            // The `toggle` method adds the 'hidden' class if it's not present,
            // and removes it if it is present.
            mobileMenu.classList.toggle('hidden');
        });
    }

});