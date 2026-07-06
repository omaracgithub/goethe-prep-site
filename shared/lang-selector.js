(function () {
  'use strict';

  const LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'ar', name: 'العربية' },
    { code: 'nl', name: 'Nederlands' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'id', name: 'Bahasa Indonesia' },
    { code: 'it', name: 'Italiano' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
    { code: 'pl', name: 'Polski' },
    { code: 'pt', name: 'Português' },
    { code: 'ru', name: 'Русский' },
    { code: 'zh', name: '中文' },
    { code: 'tr', name: 'Türkçe' },
    { code: 'uk', name: 'Українська' },
    { code: 'vi', name: 'Tiếng Việt' }
  ];

  function getDefaultLang() {
    // Check data attribute first
    var bodyAttr = document.body.getAttribute('data-default-lang');
    if (bodyAttr) return bodyAttr;

    // Detect from domain
    var host = window.location.hostname;
    if (host.indexOf('prepdele.com') !== -1) return 'es';
    if (host.indexOf('goetheprep.com') !== -1) return 'en';

    // Fallback
    return 'en';
  }

  function getCurrentLang() {
    var htmlLang = document.documentElement.getAttribute('lang');
    if (htmlLang) return htmlLang.split('-')[0].toLowerCase();
    return getDefaultLang();
  }

  function getCurrentPathLang() {
    var path = window.location.pathname;
    var segments = path.split('/').filter(Boolean);
    if (segments.length > 0) {
      var first = segments[0].toLowerCase();
      var match = LANGUAGES.find(function (l) { return l.code === first; });
      if (match) return match.code;
    }
    return null;
  }

  function buildTargetUrl(targetLang) {
    var defaultLang = getDefaultLang();
    var path = window.location.pathname;
    var pathLang = getCurrentPathLang();

    if (targetLang === defaultLang) {
      // Strip prefix, navigate to root equivalent
      if (pathLang) {
        var rest = path.replace(new RegExp('^/' + pathLang + '(/|$)'), '/');
        return rest || '/';
      }
      return path;
    }

    if (pathLang) {
      // Swap prefix
      return path.replace(new RegExp('^/' + pathLang + '(/|$)'), '/' + targetLang + '$1');
    }

    // On root or no lang prefix — add prefix
    if (path === '/' || path === '') {
      return '/' + targetLang + '/';
    }
    return '/' + targetLang + path;
  }

  function createSelector() {
    var currentLang = getCurrentLang();
    var currentLangObj = LANGUAGES.find(function (l) { return l.code === currentLang; }) || LANGUAGES[0];

    // Container
    var container = document.createElement('div');
    container.className = 'lang-selector';

    // Trigger button
    var trigger = document.createElement('button');
    trigger.className = 'lang-selector__trigger';
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-label', 'Select language');
    trigger.innerHTML = '<span class="lang-selector__globe">🌐</span> <span class="lang-selector__current">' + currentLangObj.name + '</span> <span class="lang-selector__arrow">▾</span>';

    // Dropdown
    var dropdown = document.createElement('div');
    dropdown.className = 'lang-selector__dropdown';
    dropdown.setAttribute('role', 'listbox');
    dropdown.setAttribute('aria-label', 'Languages');
    dropdown.hidden = true;

    LANGUAGES.forEach(function (lang) {
      var option = document.createElement('a');
      option.className = 'lang-selector__option';
      if (lang.code === currentLang) {
        option.className += ' lang-selector__option--active';
        option.setAttribute('aria-selected', 'true');
      }
      option.setAttribute('role', 'option');
      option.setAttribute('href', buildTargetUrl(lang.code));
      option.setAttribute('data-lang', lang.code);

      var checkmark = lang.code === currentLang ? '<span class="lang-selector__check">✓</span> ' : '';
      option.innerHTML = checkmark + lang.name;

      option.addEventListener('click', function (e) {
        e.preventDefault();
        var url = buildTargetUrl(lang.code);
        window.location.href = url;
      });

      dropdown.appendChild(option);
    });

    container.appendChild(trigger);
    container.appendChild(dropdown);

    // Toggle dropdown
    function toggleDropdown(show) {
      var isOpen = typeof show === 'boolean' ? show : dropdown.hidden;
      dropdown.hidden = !isOpen;
      trigger.setAttribute('aria-expanded', String(isOpen));
    }

    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleDropdown();
    });

    // Keyboard accessibility
    trigger.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleDropdown();
      }
      if (e.key === 'Escape') {
        toggleDropdown(false);
      }
    });

    dropdown.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        toggleDropdown(false);
        trigger.focus();
      }
    });

    // Close on click outside
    document.addEventListener('click', function (e) {
      if (!container.contains(e.target)) {
        toggleDropdown(false);
      }
    });

    return container;
  }

  function init() {
    // Find header nav — try common selectors
    var nav = document.querySelector('.site-header nav') ||
              document.querySelector('header nav') ||
              document.querySelector('.header-inner nav') ||
              document.querySelector('nav');

    if (nav) {
      var selector = createSelector();
      nav.appendChild(selector);
    } else {
      // Fallback: append to header
      var header = document.querySelector('.site-header') ||
                   document.querySelector('header') ||
                   document.querySelector('.header-inner');
      if (header) {
        var selector = createSelector();
        header.appendChild(selector);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
