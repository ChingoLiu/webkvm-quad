//==================================================================================
// Common UI helpers
// - i18n
// - theme
// - shared lang/theme init
//==================================================================================
(function () {
    if (window.KVIM_UI) return;

    const DEFAULT_LANG = "zh-TW";
    const DEFAULT_THEME = "dark";

    let currentLang = DEFAULT_LANG;
    let currentTheme = DEFAULT_THEME;

    function S() {
        return window.KVIM_SETTINGS || null;
    }

    function D() {
        return window.KVIM_I18N_DICT || {};
    }

    function normalizeTheme(theme, fallback = DEFAULT_THEME) {
        return (theme === "light" || theme === "dark") ? theme : fallback;
    }

    function normalizeLang(lang, fallback = DEFAULT_LANG) {
        const dict = D();
        return dict[lang] ? lang : fallback;
    }

    function getUrlParam(name) {
        try {
            return new URLSearchParams(location.search).get(name) || "";
        } catch (e) {
            return "";
        }
    }

    function getInitialTheme(fallback = DEFAULT_THEME) {
        const urlTheme = normalizeTheme(getUrlParam("theme"), "");
        if (urlTheme) return urlTheme;

        try {
            const api = S();
            if (api) {
                return normalizeTheme(api.getSharedSetting("theme", fallback), fallback);
            }
        } catch (e) {}

        return fallback;
    }

    function getInitialLang(fallback = DEFAULT_LANG) {
        const urlLang = normalizeLang(getUrlParam("lang"), "");
        if (urlLang) return urlLang;

        try {
            const api = S();
            if (api) {
                return normalizeLang(api.getSharedSetting("lang", fallback), fallback);
            }
        } catch (e) {}

        return fallback;
    }

    function t(key, vars = {}, lang = currentLang) {
        const dict = D()[lang] || {};
        let text = dict[key] || key;

        for (const k in vars) {
            text = text.replaceAll(`{${k}}`, vars[k]);
        }

        return text;
    }

    function applyI18N(lang, options = {}) {
        const save = options.save === true;
        const selectId = options.selectId || "";
        const afterApply = options.afterApply;

        currentLang = normalizeLang(lang, DEFAULT_LANG);

        document.documentElement.setAttribute("lang", currentLang);

        document.querySelectorAll("[data-i18n]").forEach(el => {
            const key = el.getAttribute("data-i18n");
            const text = t(key, {}, currentLang);
            const attr = el.getAttribute("data-i18n-attr");

            if (attr) {
                el.setAttribute(attr, text);
            } else {
                el.textContent = text;
            }
        });

        if (selectId) {
            const sel = document.getElementById(selectId);
            if (sel && sel.value !== currentLang) {
                sel.value = currentLang;
            }
        }

        if (save) {
            try {
                S()?.setSharedSetting("lang", currentLang);
            } catch (e) {}
        }

        if (typeof afterApply === "function") {
            afterApply(currentLang);
        }

        return currentLang;
    }

    function applyTheme(theme, options = {}) {
        const save = options.save === true;
        const selectId = options.selectId || "";
        const afterApply = options.afterApply;

        currentTheme = normalizeTheme(theme, DEFAULT_THEME);

        document.documentElement.setAttribute("data-theme", currentTheme);

        if (selectId) {
            const sel = document.getElementById(selectId);
            if (sel && sel.value !== currentTheme) {
                sel.value = currentTheme;
            }
        }

        if (save) {
            try {
                S()?.setSharedSetting("theme", currentTheme);
            } catch (e) {}
        }

        if (typeof afterApply === "function") {
            afterApply(currentTheme);
        }

        return currentTheme;
    }

    // 給 <head> 早期使用，避免 CSS 先吃錯 theme
    function applyInitialRootSettings(options = {}) {
        const lang = getInitialLang(options.defaultLang || DEFAULT_LANG);
        const theme = getInitialTheme(options.defaultTheme || DEFAULT_THEME);

        document.documentElement.setAttribute("lang", lang);
        document.documentElement.setAttribute("data-theme", theme);

        currentLang = lang;
        currentTheme = theme;

        return { lang, theme };
    }

    function bindLangSelect(selectId, options = {}) {
        const sel = document.getElementById(selectId);
        if (!sel) return;

        sel.value = currentLang;

        sel.addEventListener("change", () => {
            applyI18N(sel.value, {
                save: options.save === true,
                selectId,
                afterApply: options.afterApply
            });

            if (typeof options.onChange === "function") {
                options.onChange(currentLang);
            }
        });
    }

    function bindThemeSelect(selectId, options = {}) {
        const sel = document.getElementById(selectId);
        if (!sel) return;

        sel.value = currentTheme;

        sel.addEventListener("change", () => {
            applyTheme(sel.value, {
                save: options.save === true,
                selectId,
                afterApply: options.afterApply
            });

            if (typeof options.onChange === "function") {
                options.onChange(currentTheme);
            }
        });
    }

    window.KVIM_UI = {
        getInitialLang,
        getInitialTheme,
        applyInitialRootSettings,

        normalizeLang,
        normalizeTheme,

        t,
        applyI18N,
        applyTheme,

        bindLangSelect,
        bindThemeSelect,

        get currentLang() {
            return currentLang;
        },

        get currentTheme() {
            return currentTheme;
        }
    };
})();