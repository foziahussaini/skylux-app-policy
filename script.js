// =====================================================
// LANGUAGE SYSTEM - Complete with persistence
// =====================================================

let translations = {};
const STORAGE_KEY = 'skylux_language';
const DEFAULT_LANGUAGE = 'en';

// 1. Fetch text mappings from lang.json
async function initializeTranslationEngine() {
    try {
        // Try relative path first; some environments require explicit './'
        let response = await fetch('lang.json');
        if (!response.ok) {
            // attempt alternate relative path
            response = await fetch('./lang.json');
        }
        if (!response.ok) throw new Error(`Failed to fetch lang.json (status ${response.status})`);
        translations = await response.json();
        
        // Get saved language or use default
        let savedLanguage = localStorage.getItem(STORAGE_KEY) || DEFAULT_LANGUAGE;

        // If saved language isn't available in the translations, fallback to DEFAULT_LANGUAGE
        if (!translations[savedLanguage]) {
            console.warn(`Saved language '${savedLanguage}' not found in translations. Falling back to '${DEFAULT_LANGUAGE}'.`);
            savedLanguage = DEFAULT_LANGUAGE;
            localStorage.setItem(STORAGE_KEY, savedLanguage);
        }

        const langSelector = document.querySelector('.lang-selector');
        if (langSelector) {
            // Ensure the selector has the option value; otherwise set to default
            const optionExists = Array.from(langSelector.options).some(opt => opt.value === savedLanguage);
            langSelector.value = optionExists ? savedLanguage : DEFAULT_LANGUAGE;

            // Apply the translation immediately
            applyTranslations(savedLanguage);

            // Listen for changes in the dropdown
            langSelector.addEventListener('change', (e) => {
                const selectedLang = e.target.value;
                // Save to localStorage
                localStorage.setItem(STORAGE_KEY, selectedLang);
                // Apply translation
                applyTranslations(selectedLang);
                console.log('Language changed to:', selectedLang);
            });
        }
    } catch (error) {
        console.error("Could not fetch translation config:", error);
    }
}

// 2. Apply translations to all elements with data-i18n attribute
function applyTranslations(lang) {
    if (!translations[lang]) {
        console.warn('Language not found:', lang);
        return;
    }
    
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang][key]) {
            // Check if content has HTML tags
            if (translations[lang][key].includes('<') && translations[lang][key].includes('>')) {
                element.innerHTML = translations[lang][key];
            } else {
                element.textContent = translations[lang][key];
            }
        }
    });

    // Handle RTL languages (Dari/Pashto)
    const contentBody = document.querySelector('.content-body');
    const sidebars = document.querySelectorAll('.sidebar, .mobile-dropdown-list');
    const header = document.querySelector('header');
    
    if (lang === 'da' || lang === 'pa') {
        // RTL setup
        document.documentElement.dir = 'rtl';
        document.documentElement.lang = lang;
        document.body.style.textAlign = 'right';
        if (contentBody) contentBody.style.direction = 'rtl';
        if (header) header.style.direction = 'rtl';
        sidebars.forEach(el => {
            el.style.direction = 'rtl';
            el.style.textAlign = 'right';
        });
    } else {
        // LTR setup
        document.documentElement.dir = 'ltr';
        document.documentElement.lang = lang;
        document.body.style.textAlign = 'left';
        if (contentBody) contentBody.style.direction = 'ltr';
        if (header) header.style.direction = 'ltr';
        sidebars.forEach(el => {
            el.style.direction = 'ltr';
            el.style.textAlign = 'left';
        });
    }
    
    console.log('Applied language:', lang);
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTranslationEngine);
} else {
    initializeTranslationEngine();
}


// =====================================================
// SIDEBAR NAVIGATION - Toggle & Smooth Scroll
// =====================================================

function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const mobileDropdown = document.getElementById("mobileDropdown");
    const desktopBtn = document.querySelector(".desktop-toggle");
    const mobileBtn = document.querySelector(".mobile-toggle");
    
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
        if (mobileDropdown) {
            mobileDropdown.classList.toggle("mobile-open");
            if (mobileBtn) {
                mobileBtn.innerHTML = mobileDropdown.classList.contains("mobile-open") ? "←" : "☰";
            }
        }
    } else {
        if (sidebar) {
            sidebar.classList.toggle("collapsed");
            if (desktopBtn) {
                desktopBtn.innerHTML = sidebar.classList.contains("collapsed") ? "&gt;" : "&lt;";
            }
        }
    }
}

// Navigate to section with smooth scroll
function navigateToSection(sectionId) {
    const targetElement = document.getElementById(sectionId);
    const mobileDropdown = document.getElementById("mobileDropdown");
    const mobileBtn = document.querySelector(".mobile-toggle");

    if (targetElement) {
        // Smooth scroll with custom easing
        const headerOffset = 80; 
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        const startingY = window.pageYOffset;
        const diff = offsetPosition - startingY;
        let start = null;
        const duration = 1200; 

        function easeInOutCubic(t) {
            return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
        }

        window.requestAnimationFrame(function step(timestamp) {
            if (!start) start = timestamp;
            const time = timestamp - start;
            let percent = Math.min(time / duration, 1);
            
            percent = easeInOutCubic(percent);
            
            window.scrollTo(0, startingY + diff * percent);
            
            if (time < duration) {
                window.requestAnimationFrame(step);
            }
        });
    }

    // Update active menu item
    const allNavItems = document.querySelectorAll('.sidebar .list li, .mobile-dropdown-list li');
    allNavItems.forEach(item => {
        item.classList.remove('active');
    });

    const matchingItems = document.querySelectorAll(`[data-section="${sectionId}"]`);
    matchingItems.forEach(item => {
        item.classList.add('active');
    });

    // Close mobile menu after click
    if (mobileDropdown && mobileDropdown.classList.contains("mobile-open")) {
        mobileDropdown.classList.remove("mobile-open");
        if (mobileBtn) mobileBtn.innerHTML = "☰";
    }
}
