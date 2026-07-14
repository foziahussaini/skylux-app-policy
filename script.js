// ==========================================================================
// 1. LANGUAGE UNIFIED FILE ENGINE WITH STORAGE PERSISTENCE
// ==========================================================================
let translations = {};
const STORAGE_KEY = 'skylux_language';
const DEFAULT_LANGUAGE = 'en';

async function initializeTranslationEngine() {
    try {
        // Fetch the single unified translation database
        let response = await fetch('lang.json');
        if (!response.ok) response = await fetch('./lang.json');
        if (!response.ok) throw new Error("Critical: Could not load unified lang.json asset.");
        
        // Load the complete language tree maps securely
        translations = await response.json();
        
        let savedLanguage = localStorage.getItem(STORAGE_KEY) || DEFAULT_LANGUAGE;
        
        // Fallback safety filter
        if (!translations[savedLanguage]) {
            savedLanguage = DEFAULT_LANGUAGE;
            localStorage.setItem(STORAGE_KEY, savedLanguage);
        }

        const langSelector = document.querySelector('.lang-selector');
        if (langSelector) {
            const optionExists = Array.from(langSelector.options).some(opt => opt.value === savedLanguage);
            langSelector.value = optionExists ? savedLanguage : DEFAULT_LANGUAGE;

            applyTranslations(savedLanguage);

            langSelector.addEventListener('change', (e) => {
                const selectedLang = e.target.value;
                localStorage.setItem(STORAGE_KEY, selectedLang);
                applyTranslations(selectedLang);
                console.log('Language changed to:', selectedLang);
            });
        }
    } catch (error) {
        console.error("Could not fetch translation config:", error);
    }
}

// 2. TEXT RENDERING ENGINE & AUTOMATED BI-DIRECTIONAL RTL OVERRIDES
function applyTranslations(lang) {
    if (!translations[lang]) {
        console.warn('Language object layer not found in database registry:', lang);
        return;
    }
    
    // Update text content across all elements with data-i18n attribute safely
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang][key]) {
            const translationString = translations[lang][key];
            if (translationString.includes('<') && translationString.includes('>')) {
                element.innerHTML = translationString;
            } else {
                element.textContent = translationString;
            }
        }
    });

    // Handle RTL layouts (Dari/Pashto) vs LTR layout (English)
    const contentBody = document.querySelector('.content-body');
    const sidebars = document.querySelectorAll('.sidebar, .mobile-dropdown-list');
    const header = document.querySelector('header');
    
    if (lang === 'da' || lang === 'pa') {
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
    console.log('Applied language rendering layout matrix state:', lang);
}

// ==========================================================================
// 3. SIDEBAR NAVIGATION WRAPPER AND INTERFACE RENDERING ENGINE
// ==========================================================================
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

// 4. MATHEMATICAL CUBIC EASING SLOW SMOOTH NAVIGATION SCROLLER 
function navigateToSection(sectionId) {
    let targetElement = document.getElementById(sectionId);
    let lookupAlias;
    if (sectionId === 'privacy-framework-root' || sectionId === 'information-collection') {
        lookupAlias = 'privacy';
    } else {
        lookupAlias = sectionId;
    }
    
    if (!targetElement) return;

    const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY;
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    const duration = 1200; 
    let startTime = null;

    function smoothEaseInOut(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    function animationLoop(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const nextScrollStep = smoothEaseInOut(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, nextScrollStep);
        if (timeElapsed < duration) {
            requestAnimationFrame(animationLoop);
        } else {
            window.scrollTo(0, targetPosition);
        }
    }
    requestAnimationFrame(animationLoop);

    const items = document.querySelectorAll('#mobileDropdown li, #desktopList li');
    items.forEach(item => item.classList.remove('active'));

    const clickedItems = document.querySelectorAll(`li[data-section="${lookupAlias}"]`);
    clickedItems.forEach(item => item.classList.add('active'));

    const mobileDropdown = document.getElementById('mobileDropdown');
    const mobileBtn = document.querySelector(".mobile-toggle");
    if (mobileDropdown) {
        mobileDropdown.classList.remove('mobile-open');
        if (mobileBtn) mobileBtn.innerHTML = "☰";
    }
}

// ==========================================================================
// 5. NATIVE MEDIA PIPELINE CONTROLLER
// ==========================================================================
function toggleVideoPlay(videoContainer) {
    const videoElement = videoContainer.querySelector('video');
    const playOverlay = videoContainer.querySelector('.video-play-overlay');
    
    if (videoElement.paused) {
        videoElement.play();
        if (playOverlay) {
            playOverlay.style.opacity = '0';
            playOverlay.style.visibility = 'hidden';
        }
    } else {
        videoElement.pause();
        if (playOverlay) {
            playOverlay.style.opacity = '1';
            playOverlay.style.visibility = 'visible';
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTranslationEngine);
} else {
    initializeTranslationEngine();
}
