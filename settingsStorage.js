//==================================================================================
// Shared settings storage
// - device settings are indexed by the 8-character JVK ID
// - shared settings are global
// - group settings are indexed by the 7-character Quad group ID
//==================================================================================
(function () {
    if (window.KVIM_SETTINGS) return;

    const PREFIX = "webkvm_settings_v1";

    function safeKey(v, fallback = "default") {
        const s = String(v || fallback).trim().toUpperCase();
        return (s || fallback).replace(/[^0-9A-Z_-]/g, "_");
    }

    function deviceKey(deviceId, name) {
        return `${PREFIX}:device:${safeKey(deviceId)}:${name}`;
    }

    function sharedKey(name) {
        return `${PREFIX}:shared:${name}`;
    }

    function groupKey(groupId, name) {
        return `${PREFIX}:group:${safeKey(groupId)}:${name}`;
    }

    function getRaw(key) {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            return null;
        }
    }

    function setRaw(key, value) {
        try {
            localStorage.setItem(key, String(value));
            return true;
        } catch (e) {
            return false;
        }
    }

    function getDeviceSetting(deviceId, name, defaultValue = "") {
        const v = getRaw(deviceKey(deviceId, name));
        return v === null ? defaultValue : v;
    }

    function setDeviceSetting(deviceId, name, value) {
        if (!deviceId) return false;
        return setRaw(deviceKey(deviceId, name), value);
    }

    function getSharedSetting(name, defaultValue = "") {
        const v = getRaw(sharedKey(name));
        return v === null ? defaultValue : v;
    }

    function setSharedSetting(name, value) {
        return setRaw(sharedKey(name), value);
    }

    function getGroupSetting(groupId, name, defaultValue = "") {
        const v = getRaw(groupKey(groupId, name));
        return v === null ? defaultValue : v;
    }

    function setGroupSetting(groupId, name, value) {
        if (!groupId) return false;
        return setRaw(groupKey(groupId, name), value);
    }

    function selectHasValue(sel, value) {
        if (!sel || value === null || value === undefined) return false;
        const v = String(value);
        return Array.from(sel.options || []).some(opt => opt.value === v);
    }

    function applySelectValue(sel, value, fallbackValue = null) {
        if (!sel) return false;

        if (value !== null && value !== undefined && selectHasValue(sel, value)) {
            sel.value = String(value);
            return true;
        }

        if (fallbackValue !== null && fallbackValue !== undefined && selectHasValue(sel, fallbackValue)) {
            sel.value = String(fallbackValue);
            return true;
        }

        if (sel.options && sel.options.length > 0) {
            sel.selectedIndex = 0;
            return true;
        }

        return false;
    }

    window.KVIM_SETTINGS = {
        getDeviceSetting,
        setDeviceSetting,
        getSharedSetting,
        setSharedSetting,
        getGroupSetting,
        setGroupSetting,
        selectHasValue,
        applySelectValue
    };
})();
