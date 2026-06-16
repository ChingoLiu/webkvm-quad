const params = new URLSearchParams(location.search);
const childPage = params.get("page") || "index1.html";

const root = document.getElementById("quad-root");
const modal = document.getElementById("quad-settings-modal");
const slotGrid = document.getElementById("quad-slot-grid");
const groupSelect = document.getElementById("quad-group-select");
const statusLine = document.getElementById("quad-status-line");
const refreshBtn = document.getElementById("quad-refresh-btn");
const confirmBtn = document.getElementById("quad-confirm-btn");
const resetDefaultBtn = document.getElementById("quad-reset-default-btn");
const backToHomepageBtn = document.getElementById("quad-back-to-homepage-btn");

const SLOT_COUNT = 4;

const SHARED_MAP = [
    ["qs_lang", "lang-select"],
    ["qs_theme", "theme-select"]
];

const QUAD_DEVICE_SETTING_MAP = [
    ["resolution", "selResolution"],
    ["framerate", "selFramerate"],
    ["rotate", "selRotate"],
    ["mouse_report_mode", "id_select_mouse_report_mode"],
    ["relative_mouse_speed", "id_select_relative_mouse_speed"],
    ["scrollspeed", "id_select_scrollspeed"],
    ["direction", "id_select_direction"],
    ["topbar", "st_select_topbarmode"]
];

const QUAD_DEVICE_DEFAULTS = {
    resolution: "1920x1080",
    framerate: "60",
    rotate: "0",
    mouse_report_mode: "mouse",
    relative_mouse_speed: "1",
    scrollspeed: "1",
    direction: "-1",
    topbar: "auto"
};

const QUAD_GROUP_DEFAULTS = {
    topbar_link: "1"
};

const GROUP_PLACEHOLDER_VALUE = "0";

let currentGroup = "";
let quadState = "settings";      // settings / applying / running / device_lost
let quadDeviceChangeTimer = null;

const I18N_DICT = window.KVIM_I18N_DICT || {};
let currentLang = window.KVIM_UI.currentLang || "zh-TW";

function S() {
    return window.KVIM_SETTINGS || null;
}

function t(key, vars = {}) {
    return window.KVIM_UI.t(key, vars, currentLang);
}

function applyQuadI18N(lang) {
    currentLang = window.KVIM_UI.applyI18N(lang, {
        save: true,
        selectId: "qs_lang"
    });

    updateGroupPlaceholderText();
    refreshQuadStatusTextByState();
    refreshAllComAuthText();
    refreshAllParentFixedOptionLabels();
}

function applyQuadTheme(theme) {
    window.KVIM_UI.applyTheme(theme, {
        save: true,
        selectId: "qs_theme"
    });
}

function getSelectedGroupId() {
    const g = String(groupSelect.value || currentGroup || "").trim().toUpperCase();
    return /^[0-9A-Z]{7}$/.test(g) ? g : "";
}

function quadDeviceId(slot, group = getSelectedGroupId()) {
    if (!/^[1-4]$/.test(String(slot)) || !/^[0-9A-Z]{7}$/.test(String(group || ""))) return "";
    return `${slot}${String(group).toUpperCase()}`;
}

function getSelect(id) {
    return document.getElementById(id);
}

function setOptions(sel, items) {
    if (!sel) return;
    const oldValue = sel.value;
    sel.innerHTML = "";
    for (const item of items) {
        const [value, text, i18nKey] = item;
        const opt = document.createElement("option");
        opt.value = String(value);
        opt.textContent = text;
        if (i18nKey) opt.setAttribute("data-i18n", i18nKey);
        sel.appendChild(opt);
    }
    if (oldValue && Array.from(sel.options).some(o => o.value === oldValue)) {
        sel.value = oldValue;
    }
}

function fillParentFixedSettingOptions(slot) {
    setOptions(getSelect(`qs_rotate_${slot}`), [
        ["0", "0°", "setting.rotate0"], ["90", "90°", "setting.rotate90"],
        ["180", "180°", "setting.rotate180"], ["270", "270°", "setting.rotate270"]
    ]);

    setOptions(getSelect(`qs_mouse_report_mode_${slot}`), [
        ["mouse", t("setting.mouseReportLow"), "setting.mouseReportLow"],
        ["pointer", t("setting.mouseReportHigh"), "setting.mouseReportHigh"]
    ]);

    setOptions(getSelect(`qs_relative_mouse_speed_${slot}`), [
        ["2.0", t("setting.relCursorSuperFast"), "setting.relCursorSuperFast"],
        ["1.5", t("setting.relCursorFast"), "setting.relCursorFast"],
        ["1", t("setting.relCursorMedium"), "setting.relCursorMedium"],
        ["0.7", t("setting.relCursorSlow"), "setting.relCursorSlow"],
        ["0.4", t("setting.relCursorSuperSlow"), "setting.relCursorSuperSlow"]
    ]);

    setOptions(getSelect(`qs_scrollspeed_${slot}`), [
        ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"],
        ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"]
    ]);

    setOptions(getSelect(`qs_direction_${slot}`), [
        ["-1", t("setting.scrollNormal"), "setting.scrollNormal"],
        ["1", t("setting.scrollReverse"), "setting.scrollReverse"]
    ]);

    setOptions(getSelect(`qs_topbar_${slot}`), [
        ["auto", t("setting.topbarAuto"), "setting.topbarAuto"],
        ["fixed", t("setting.topbarFixed"), "setting.topbarFixed"]
    ]);
}

function refreshAllParentFixedOptionLabels() {
    for (let slot = 1; slot <= SLOT_COUNT; slot++) {
        const rotateSel = getSelect(`qs_rotate_${slot}`);
        if (rotateSel && rotateSel.options.length > 0) fillParentFixedSettingOptions(slot);
    }
}

function clearParentSlotSettingOptions(slot) {
    const names = ["resolution", "framerate", "rotate", "mouse_report_mode", "relative_mouse_speed", "scrollspeed", "direction", "topbar"];
    for (const name of names) {
        const el = getSelect(`qs_${name}_${slot}`);
        if (el) el.innerHTML = "";
    }
}

function applySelectSetting(sel, saved, fallback) {
    const api = S();
    if (api) return api.applySelectValue(sel, saved, fallback);
    return false;
}

function loadQuadDeviceSettingsToPanel(slot, deviceId) {
    const api = S();
    if (!api || !deviceId) return;

    for (const [name] of QUAD_DEVICE_SETTING_MAP) {
        const sel = getSelect(`qs_${name}_${slot}`);
        if (!sel) continue;

        const def = QUAD_DEVICE_DEFAULTS[name] ?? "";
        const saved = api.getDeviceSetting(deviceId, name, def);

        applySelectSetting(sel, saved, def);
    }
}

function saveQuadDeviceSetting(slot, name) {
    const group = getSelectedGroupId();
    const deviceId = quadDeviceId(slot, group);
    const el = getSelect(`qs_${name}_${slot}`);
    const api = S();
    if (!api || !deviceId || !el || el.value === "") return false;
    return api.setDeviceSetting(deviceId, name, el.value);
}

function saveAllQuadDeviceSettings() {
    for (let slot = 1; slot <= SLOT_COUNT; slot++) {
        for (const [name] of QUAD_DEVICE_SETTING_MAP) {
            saveQuadDeviceSetting(slot, name);
        }
    }
}

function hasSelectValue(sel, value) {
    if (!sel) return false;

    return Array.from(sel.options || []).some(opt => {
        return opt.value === String(value);
    });
}

function setParentSelectToDefault(slot, name) {
    const sel = getSelect(`qs_${name}_${slot}`);
    if (!sel || !sel.options || sel.options.length === 0) {
        return "";
    }

    const def = QUAD_DEVICE_DEFAULTS[name];

    if (def !== undefined && hasSelectValue(sel, def)) {
        sel.value = String(def);
    } else {
        // 例如某些解析度 / FPS 不支援預設值時，就退回目前清單第一個
        sel.selectedIndex = 0;
    }

    return sel.value;
}

function saveAndApplyParentSettingToChild(slot, name) {
    const childMap = QUAD_DEVICE_SETTING_MAP.find(([n]) => n === name);
    if (!childMap) return false;

    const [, childId] = childMap;
    const sel = getSelect(`qs_${name}_${slot}`);
    if (!sel || sel.value === "") return false;

    saveQuadDeviceSetting(slot, name);
    setChildSelectValue(slot, childId, sel.value, true);

    return true;
}

async function resetQuadSlotSettingsToDefault(slot) {
    const group = getSelectedGroupId();
    const deviceId = quadDeviceId(slot, group);

    if (!deviceId) {
        return false;
    }

    const api = S();
    if (!api) {
        return false;
    }

    // 固定選項若目前是空的，先補回來
    fillParentFixedSettingOptions(slot);

    // 1. Resolution 先處理，因為 FPS 清單可能跟解析度有關
    setParentSelectToDefault(slot, "resolution");
    saveAndApplyParentSettingToChild(slot, "resolution");

    // 等 child 套用解析度後，再重新抓 FPS option
    await sleep(250);
    copyVideoOptionsFromChild(slot);

    // 2. Framerate
    setParentSelectToDefault(slot, "framerate");
    saveAndApplyParentSettingToChild(slot, "framerate");

    // 3. 其他 device setting
    const restNames = [
        "rotate",
        "mouse_report_mode",
        "relative_mouse_speed",
        "scrollspeed",
        "direction",
        "topbar"
    ];

    for (const name of restNames) {
        setParentSelectToDefault(slot, name);
        saveAndApplyParentSettingToChild(slot, name);
    }

    // 4. 再把目前實際選到的值寫入 local setting
    //    注意：resolution / framerate 如果預設值不存在，這裡會存實際 fallback 值。
    for (const [name] of QUAD_DEVICE_SETTING_MAP) {
        const sel = getSelect(`qs_${name}_${slot}`);
        if (!sel || sel.value === "") continue;

        api.setDeviceSetting(deviceId, name, sel.value);
    }

    return true;
}

async function resetCurrentQuadSettingsToDefault() {
    const group = getSelectedGroupId();

    if (!group) {
        statusLine.textContent = t("quad.status.selectGroup");
        return false;
    }

    console.log("[QUAD_PARENT] reset default:", group);

    // 4 個 slot 依序 reset，避免同時切解析度造成過多 UVC apply
    for (let slot = 1; slot <= SLOT_COUNT; slot++) {
        await resetQuadSlotSettingsToDefault(slot);
    }

    // group setting：Sync toolbar 回到預設 checked
    const topbarLinkEl = getSelect("qs_topbar_link");
    if (topbarLinkEl) {
        topbarLinkEl.checked = QUAD_GROUP_DEFAULTS.topbar_link === "1";
        saveTopbarLinkForCurrentGroup();
    }

    refreshAllSlotStatusFromChildren();

    statusLine.textContent = t("quad.status.currentGroup", { group });

    return true;
}

function loadSharedSettings() {
    const lang = window.KVIM_UI.getInitialLang("zh-TW");
    const theme = window.KVIM_UI.getInitialTheme("dark");

    currentLang = lang;

    applySelectSetting(getSelect("qs_lang"), lang, "zh-TW");
    applySelectSetting(getSelect("qs_theme"), theme, "dark");
}

function saveSharedSetting(parentId) {
    const api = S();
    if (!api) return;

    const el = getSelect(parentId);
    if (!el) return;

    if (parentId === "qs_lang") api.setSharedSetting("lang", el.value);
    if (parentId === "qs_theme") api.setSharedSetting("theme", el.value);
}

function loadTopbarLinkForGroup(group) {
    const api = S();
    const el = getSelect("qs_topbar_link");
    if (!api || !el || !group) return;
    const v = api.getGroupSetting(group, "topbar_link", "1");
    el.checked = (v === "1" || v === "true");
}

function saveTopbarLinkForCurrentGroup() {
    const api = S();
    const group = getSelectedGroupId();
    const el = getSelect("qs_topbar_link");
    if (!api || !group || !el) return;
    api.setGroupSetting(group, "topbar_link", el.checked ? "1" : "0");
}

function updateGroupPlaceholderText() {
    const opt = groupSelect.querySelector(`option[value="${GROUP_PLACEHOLDER_VALUE}"]`);
    if (opt) opt.textContent = t("setting.selectDeviceHolder");
}

function refreshQuadStatusTextByState() {
    if (quadState === "running" && currentGroup) {
        statusLine.textContent = t("quad.status.currentGroup", { group: currentGroup });
    } else if (quadState === "applying" && currentGroup) {
        statusLine.textContent = t("quad.status.applyingGroup", { group: currentGroup });
    } else if (!currentGroup) {
        statusLine.textContent = t("quad.status.selectGroup");
    }
}

function buildChildUrl(slot) {
    const url = new URL(childPage, location.href);
    const api = S();

    let theme = api?.getSharedSetting("theme", "dark") || "dark";
    let lang = api?.getSharedSetting("lang", "zh-TW") || "zh-TW";

    if (theme !== "light" && theme !== "dark") {
        theme = "dark";
    }

    if (!I18N_DICT[lang]) {
        lang = "zh-TW";
    }

    url.searchParams.set("slot", String(slot));
    url.searchParams.set("theme", theme);
    url.searchParams.set("lang", lang);

    // 這版不再從 URL 傳 uvcSerial，避免 child 自己自動進入或自動確認。
    // 裝置選擇統一由本頁中央設定頁控制。
    return url.toString();
}

function buildIframes() {
    for (let slot = 1; slot <= SLOT_COUNT; slot++) {
        const cell = document.createElement("div");
        cell.className = "quad-cell";
        cell.id = `quad-cell-${slot}`;
        cell.dataset.slot = String(slot);

        const iframe = document.createElement("iframe");
        iframe.id = `iframe${slot}`;
        iframe.setAttribute("allowfullscreen", "true");
        iframe.setAttribute("webkitallowfullscreen", "true");

        iframe.setAttribute(
            "allow",
            [
                "camera *",
                "microphone *",
                "serial *",
                "clipboard-read *",
                "clipboard-write *",
                "fullscreen *",
                "picture-in-picture *"
            ].join("; ")
        );

        iframe.addEventListener("load", () => {
            console.log("[QUAD_PARENT] iframe loaded:", slot);

            setTimeout(() => {
                hideChildSettingsModal(slot);
                clearParentSlotSettingOptions(slot);
                syncAllSharedSettingsToChildren();

                // 改成事件式監看狀態，不再靠 setInterval polling
                observeChildStatus(slot);

                if (currentGroup) {
                    applyGroupToSlot(slot, currentGroup);
                }
            }, 800);
        });

        iframe.src = buildChildUrl(slot);

        cell.appendChild(iframe);
        root.appendChild(cell);
    }
}

function buildSlotPanels() {
    slotGrid.innerHTML = "";

    const titlePanel = document.createElement("div");
    titlePanel.className = "quad-title-panel";

    titlePanel.innerHTML = `
        <div class="quad-slot-header">&nbsp;</div>

        <div class="quad-title-row" data-i18n="setting.deviceSelect">裝置</div>
        <div class="quad-state-row"><div></div><div>UVC:</div></div>
        <div class="quad-state-row"><div></div><div>UAC:</div></div>
        <div class="quad-state-row"><div></div><div>COM:</div></div>
        <div class="quad-value-row quad-com-auth-value-row"></div>

        <div class="quad-title-row" data-i18n="setting.resolution">解析度</div>
        <div class="quad-title-row" data-i18n="setting.framerate">幀率</div>
        <div class="quad-title-row" data-i18n="setting.rotate">旋轉</div>
        <div class="quad-title-row" data-i18n="setting.mouseReportMode">滑鼠回報率</div>
        <div class="quad-title-row" data-i18n="setting.relCursorSpeed">相對指標速度</div>
        <div class="quad-title-row" data-i18n="setting.scrollSpeed">滾輪速度</div>
        <div class="quad-title-row" data-i18n="setting.scrollDirection">滾輪方向</div>
        <div class="quad-title-row" data-i18n="setting.topbar">工具列</div>
    `;

    slotGrid.appendChild(titlePanel);

    for (let slot = 1; slot <= SLOT_COUNT; slot++) {
        const panel = document.createElement("div");
        panel.className = "quad-slot-panel";
        panel.id = `qs_slot_panel_${slot}`;

        panel.innerHTML = `
            <div class="quad-slot-header">JVK202-${slot}</div>

            <div class="quad-value-row">
                <div id="qs_device_text_${slot}" class="quad-name">-</div>
            </div>

            <div class="quad-value-row quad-state-row">
                <div id="qs_uvc_name_${slot}" class="quad-name">-</div>
                <div id="qs_uvc_state_${slot}" class="quad-state unknown">-</div>
            </div>

            <div class="quad-value-row quad-state-row">
                <div id="qs_uac_name_${slot}" class="quad-name">-</div>
                <div id="qs_uac_state_${slot}" class="quad-state unknown">-</div>
            </div>

            <div class="quad-value-row quad-state-row">
                <div id="qs_com_name_${slot}" class="quad-name">-</div>
                <div id="qs_com_state_${slot}" class="quad-state unknown">-</div>
            </div>

            <div class="quad-value-row quad-com-auth-value-row">
                <div></div>
                <div
                    id="qs_com_auth_${slot}"
                    class="quad-com-auth"
                    data-i18n="device.auth"
                    style="visibility:hidden; pointer-events:none;"
                ></div>
            </div>

            <div class="quad-value-row">
                <select id="qs_resolution_${slot}"></select>
            </div>

            <div class="quad-value-row">
                <select id="qs_framerate_${slot}"></select>
            </div>

            <div class="quad-value-row">
                <select id="qs_rotate_${slot}"></select>
            </div>

            <div class="quad-value-row">
                <select id="qs_mouse_report_mode_${slot}"></select>
            </div>

            <div class="quad-value-row">
                <select id="qs_relative_mouse_speed_${slot}"></select>
            </div>

            <div class="quad-value-row">
                <select id="qs_scrollspeed_${slot}"></select>
            </div>

            <div class="quad-value-row">
                <select id="qs_direction_${slot}"></select>
            </div>

            <div class="quad-value-row">
                <select id="qs_topbar_${slot}"></select>
            </div>
        `;

        slotGrid.appendChild(panel);
        bindSlotPanelEvents(slot);
    }

    if (typeof applyQuadI18N === "function") {
        applyQuadI18N(currentLang);
    }
}

function bindSlotPanelEvents(slot) {
    for (const [name, childId] of QUAD_DEVICE_SETTING_MAP) {
        const parentEl = getSelect(`qs_${name}_${slot}`);
        if (!parentEl) continue;

        parentEl.addEventListener("change", () => {
            saveQuadDeviceSetting(slot, name);
            setChildSelectValue(slot, childId, parentEl.value, true);
        });
    }

    const comAuthEl = document.getElementById(`qs_com_auth_${slot}`);
    if (comAuthEl) {
        comAuthEl.addEventListener("click", async () => {
            await requestQuadComAuth(slot);
        });
    }
}

function bindSharedSettingEvents() {
    for (const [parentId, childId] of SHARED_MAP) {
        const parentEl = getSelect(parentId);
        if (!parentEl) continue;

        parentEl.addEventListener("change", () => {
            saveSharedSetting(parentId);

            if (parentId === "qs_lang") {
                applyQuadI18N(parentEl.value);
            }

            if (parentId === "qs_theme" && typeof applyQuadTheme === "function") {
                applyQuadTheme(parentEl.value);
            }

            syncOneSharedSettingToChildren(parentId, childId);
        });
    }

    const topbarLinkEl = getSelect("qs_topbar_link");
    if (topbarLinkEl) {
        topbarLinkEl.addEventListener("change", saveTopbarLinkForCurrentGroup);
    }
}

function getFrame(slot) {
    return document.getElementById(`iframe${slot}`);
}

function getChildDoc(slot) {
    const iframe = getFrame(slot);
    if (!iframe) return null;

    try {
        return iframe.contentDocument || iframe.contentWindow.document;
    } catch (e) {
        console.warn("[QUAD_PARENT] cannot access iframe:", slot, e);
        return null;
    }
}


// Keyboard Lock API must be called from top-level page, not iframe.
let quadKeyboardLockedSlot = 0;

function isParentFullscreen() {
    return document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.msFullscreenElement;
}

async function parentRequestFullscreen(el) {
    const req = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
    if (req) {
        await req.call(el);
        return true;
    }
    return false;
}

window.quadEnterKeyboardControlMode = async function (slot) {
    slot = Number(slot);
    if (!Number.isInteger(slot) || slot < 1 || slot > SLOT_COUNT) return false;

    const frame = getFrame(slot);
    if (!frame) return false;

    try {
        if (!isParentFullscreen()) await parentRequestFullscreen(frame);
        if ("keyboard" in navigator && navigator.keyboard && navigator.keyboard.lock) {
            await navigator.keyboard.lock();
            quadKeyboardLockedSlot = slot;
        }
        return true;
    } catch (err) {
        console.warn("[QUAD_PARENT] keyboard lock failed:", err);
        return false;
    }
};

window.quadExitKeyboardControlMode = async function (slot) {
    try {
        if ("keyboard" in navigator && navigator.keyboard && navigator.keyboard.unlock) {
            navigator.keyboard.unlock();
        }
    } catch (err) {
        console.warn("[QUAD_PARENT] keyboard unlock failed:", err);
    }

    if (!slot || Number(slot) === quadKeyboardLockedSlot) quadKeyboardLockedSlot = 0;

    try {
        if (isParentFullscreen()) {
            const exit = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
            if (exit) await exit.call(document);
        }
    } catch (err) {
        console.warn("[QUAD_PARENT] exit fullscreen failed:", err);
    }

    return true;
};

//Topbar 連動
function isTopbarLinkEnabled() {
    const el = document.getElementById("qs_topbar_link");
    return !!(el && el.checked);
}

function getSlotFromMessageSource(sourceWindow) {
    for (let slot = 1; slot <= SLOT_COUNT; slot++) {
        const frame = getFrame(slot);

        if (frame && frame.contentWindow === sourceWindow) {
            return slot;
        }
    }

    return 0;
}

function sendTopbarCommandToSlot(slot, command) {
    const frame = getFrame(slot);

    if (!frame || !frame.contentWindow) {
        return;
    }

    try {
        frame.contentWindow.postMessage({
            type: "quad-topbar-command",
            command
        }, "*");
    } catch (e) {
        console.warn("[QUAD_PARENT] send topbar command failed:", {
            slot,
            command,
            error: e
        });
    }
}

function broadcastTopbarCommand(sourceSlot, command) {
    if (!isTopbarLinkEnabled()) {
        return;
    }

    if (!command) {
        return;
    }

    for (let slot = 1; slot <= SLOT_COUNT; slot++) {
        if (slot === sourceSlot) {
            continue;
        }

        sendTopbarCommandToSlot(slot, command);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function fireInputChange(el) {
    if (!el) return;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
}

function hideChildSettingsModal(slot) {
    const doc = getChildDoc(slot);
    if (!doc) return;

    const childModal = doc.getElementById("serial-modal");
    if (!childModal) return;

    childModal.style.display = "none";
    childModal.style.visibility = "hidden";
    childModal.style.pointerEvents = "none";
}

function hideAllChildSettingsModals() {
    for (let slot = 1; slot <= SLOT_COUNT; slot++) {
        hideChildSettingsModal(slot);
    }
}

async function confirmAllChildSettings() {
    const results = [];

    for (let slot = 1; slot <= SLOT_COUNT; slot++) {
        const frame = getFrame(slot);
        const cw = frame ? frame.contentWindow : null;

        if (!cw || typeof cw.quadApplySettingsConfirm !== "function") {
            results.push({
                slot,
                ok: false,
                reason: "quadApplySettingsConfirm not found"
            });
            continue;
        }

        try {
            const ret = await cw.quadApplySettingsConfirm();

            results.push({
                slot,
                ok: !!ret?.ok,
                skipped: !!ret?.skipped,
                reason: ret?.reason || ""
            });

        } catch (err) {
            console.warn("[QUAD_PARENT] confirm child settings failed:", {
                slot,
                err
            });

            results.push({
                slot,
                ok: false,
                reason: String(err && err.message ? err.message : err)
            });
        }
    }

    console.log("[QUAD_PARENT] confirmAllChildSettings:", results);

    return results;
}

function copyOptions(srcSel, dstSel) {
    if (!srcSel || !dstSel) return;

    const oldValue = dstSel.value;
    dstSel.innerHTML = "";

    for (const opt of Array.from(srcSel.options || [])) {
        const newOpt = document.createElement("option");
        newOpt.value = opt.value;
        newOpt.textContent = opt.textContent;
        newOpt.selected = opt.selected;
        dstSel.appendChild(newOpt);
    }

    if (Array.from(dstSel.options).some(opt => opt.value === oldValue)) {
        dstSel.value = oldValue;
    } else if (srcSel.value) {
        dstSel.value = srcSel.value;
    }
}

function copyVideoOptionsFromChild(slot) {
    const doc = getChildDoc(slot);
    if (!doc) return;

    const maps = [
        ["selResolution", `qs_resolution_${slot}`],
        ["selFramerate", `qs_framerate_${slot}`]
    ];

    for (const [childId, parentId] of maps) {
        const childSel = doc.getElementById(childId);
        const parentSel = getSelect(parentId);

        if (!childSel || !parentSel) continue;
        if (!childSel.options || childSel.options.length === 0) continue;

        copyOptions(childSel, parentSel);
    }
}

function refreshAllComAuthText() {
    for (let slot = 1; slot <= SLOT_COUNT; slot++) {
        const el = document.getElementById(`qs_com_auth_${slot}`);
        if (!el) continue;

        if (el.style.visibility === "visible") {
            el.textContent = t("device.auth");
        } else {
            el.textContent = "";
        }
    }
}

function setStateText(slot, kind, name, state) {
    const nameEl = document.getElementById(`qs_${kind}_name_${slot}`);
    const stateEl = document.getElementById(`qs_${kind}_state_${slot}`);

    if (nameEl) {
        nameEl.textContent = name || "-";
        nameEl.title = name || "";
    }

    if (stateEl) {
        const text = state || "-";
        stateEl.textContent = text;

        stateEl.classList.remove("ok", "fail", "unknown");

        if (text.toUpperCase() === "OK") {
            stateEl.classList.add("ok");
        } else if (
            text.includes("失敗") ||
            text.toUpperCase().includes("FAIL") ||
            text.toUpperCase().includes("NG")
        ) {
            stateEl.classList.add("fail");
        } else {
            stateEl.classList.add("unknown");
        }
    }
}

function isOkStateText(text) {
    text = String(text || "").trim().toUpperCase();
    return text === "OK";
}

function isFailStateText(text) {
    text = String(text || "").trim().toUpperCase();

    return (
        text.includes("FAIL") ||
        text.includes("NG") ||
        text.includes("失敗")
    );
}

function setComAuthVisible(slot, visible) {
    const el = document.getElementById(`qs_com_auth_${slot}`);
    if (!el) return;

    if (visible) {
        el.textContent = t("device.auth");
        el.style.visibility = "visible";
        el.style.pointerEvents = "";
    } else {
        // 保留該行高度，但內容清空
        el.textContent = "";
        el.style.visibility = "hidden";
        el.style.pointerEvents = "none";
    }
}

async function requestQuadComAuth(slot) {
    const frame = getFrame(slot);
    const cw = frame ? frame.contentWindow : null;

    if (!cw) {
        console.warn("[QUAD_PARENT] iframe not ready for COM auth:", slot);
        return false;
    }

    try {
        if (window.electronSerial) {
            window.electronSerial.setInteractive(true);
        }

        if (typeof cw.quadChooseMatchingComPort === "function") {
            const ok = await cw.quadChooseMatchingComPort();

            setTimeout(() => {
                refreshSlotStatusFromChild(slot);
            }, 300);

            return ok;
        }

        console.warn("[QUAD_PARENT] child quadChooseMatchingComPort API not found:", slot);
        return false;

    } catch (err) {
        console.warn("[QUAD_PARENT] requestQuadComAuth failed:", {
            slot,
            err
        });
        return false;

    } finally {
        if (window.electronSerial) {
            window.electronSerial.setInteractive(false);
        }
    }
}

function refreshSlotStatusFromChild(slot) {
    const doc = getChildDoc(slot);
    if (!doc) return;

    const getText = (id) => {
        const el = doc.getElementById(id);
        return el ? el.textContent.trim() : "-";
    };

    const uvcName = getText("id_status_uvc_name");
    const uvcState = getText("id_status_uvc_state");

    const uacName = getText("id_status_uac_name");
    const uacState = getText("id_status_uac_state");

    const comName = getText("id_status_com_name");
    const comState = getText("id_status_com_state");

    setStateText(slot, "uvc", uvcName, uvcState);
    setStateText(slot, "uac", uacName, uacState);
    setStateText(slot, "com", comName, comState);

    // 跟單機版同邏輯：
    // UVC OK 但 COM Fail → 顯示「按此連線」
    const showComAuth =
        isOkStateText(uvcState) &&
        isFailStateText(comState);

    setComAuthVisible(slot, showComAuth);
}

function refreshAllSlotStatusFromChildren() {
    hideAllChildSettingsModals();

    for (let slot = 1; slot <= SLOT_COUNT; slot++) {
        refreshSlotStatusFromChild(slot);
    }
}

function setChildSelectValue(slot, childId, value, dispatchEvent) {
    const doc = getChildDoc(slot);
    if (!doc) return false;

    const el = doc.getElementById(childId);
    if (!el) return false;

    if (value === undefined || value === null || value === "") return false;

    const hasValue = Array.from(el.options || []).some(opt => opt.value === String(value));

    if (!hasValue) {
        console.warn("[QUAD_PARENT] option value not found:", {
            slot,
            childId,
            value
        });
        return false;
    }

    // 值一樣就不要再觸發 change
    if (el.value === value) {
        return true;
    }

    el.value = String(value);

    if (dispatchEvent) {
        fireInputChange(el);
    }

    return true;
}

function optionSearchText(opt) {
    return [
        opt.value,
        opt.textContent,
        opt.label,
        opt.getAttribute("data-label"),
        opt.getAttribute("data-name"),
        opt.getAttribute("data-uvc")
    ].filter(Boolean).join(" ");
}

function findOptionBySerial(selectEl, serial) {
    if (!selectEl || !serial) return null;

    const upperSerial = serial.toUpperCase();

    return Array.from(selectEl.options || []).find(opt => {
        return optionSearchText(opt).toUpperCase().includes(upperSerial);
    }) || null;
}

async function waitForChildSelect(slot, childId, timeoutMs = 8000) {
    const start = performance.now();

    while (performance.now() - start < timeoutMs) {
        const doc = getChildDoc(slot);
        const sel = doc ? doc.getElementById(childId) : null;

        if (sel && sel.options && sel.options.length > 0) {
            return sel;
        }

        await sleep(200);
    }

    return null;
}

function setParentDeviceText(slot, serial) {
    const el = document.getElementById(`qs_device_text_${slot}`);
    if (!el) return;

    el.textContent = serial || "-";
    el.title = serial || "";
}

async function stopSlot(slot, reason = "") {
    const serialText = document.getElementById(`qs_device_text_${slot}`);

    try {
        const frame = getFrame(slot);
        const cw = frame ? frame.contentWindow : null;

        if (cw && typeof cw.quadStopDevice === "function") {
            await cw.quadStopDevice(reason || "parent stop slot");
        } else {
            const childSel = await waitForChildSelect(slot, "selDevice", 1500);
            if (childSel) {
                childSel.value = "";
                fireInputChange(childSel);
            }
        }
    } catch (err) {
        console.warn("[QUAD_PARENT] stopSlot failed:", { slot, reason, err });
    }

    setParentDeviceText(slot, "");
    setStateText(slot, "uvc", "", "-");
    setStateText(slot, "uac", "", "-");
    setStateText(slot, "com", "", "-");
    setComAuthVisible(slot, false);

    if (serialText) {
        serialText.textContent = "-";
        serialText.title = "";
    }

    clearParentSlotSettingOptions(slot);
}

async function stopAllSlots(reason = "") {
    console.warn("[QUAD_PARENT] stopAllSlots:", reason);

    for (let slot = 1; slot <= SLOT_COUNT; slot++) {
        await stopSlot(slot, reason);
    }

    currentGroup = "";
    quadState = "settings";
    statusLine.textContent = t("quad.status.selectGroup");
}

async function applyGroupToSlot(slot, group) {
    if (!group || group === GROUP_PLACEHOLDER_VALUE) {
        return false;
    }

    const serial = `${slot}${group}`.toUpperCase();

    try {
        const frame = getFrame(slot);
        const cw = frame ? frame.contentWindow : null;

        if (cw && typeof cw.quadSelectDevice === "function") {
            const ok = await cw.quadSelectDevice(serial);

            if (!ok) {
                console.warn("[QUAD_PARENT] child quadSelectDevice failed:", {
                    slot,
                    serial
                });
                return false;
            }

            setParentDeviceText(slot, serial);
            await sleep(100);
            fillParentFixedSettingOptions(slot);
            copyVideoOptionsFromChild(slot);
            loadQuadDeviceSettingsToPanel(slot, serial);
            applyParentSlotSettingsToChild(slot);
            refreshSlotStatusFromChild(slot);

            console.log("[QUAD_PARENT] applyGroupToSlot OK via QuadAPI:", {
                slot,
                serial
            });

            return true;
        }
    } catch (err) {
        console.warn("[QUAD_PARENT] QuadAPI select failed, fallback to selDevice:", {
            slot,
            serial,
            err
        });
    }

    const childSel = await waitForChildSelect(slot, "selDevice", 10000);
    if (!childSel) {
        console.warn("[QUAD_PARENT] child selDevice not ready:", slot);
        return false;
    }

    const matchedOpt = findOptionBySerial(childSel, serial);

    if (!matchedOpt) {
        console.warn("[QUAD_PARENT] target serial option not found:", {
            slot,
            serial
        });
        return false;
    }

    childSel.value = matchedOpt.value;
    fireInputChange(childSel);

    setParentDeviceText(slot, serial);

    await sleep(200);

    fillParentFixedSettingOptions(slot);
    copyVideoOptionsFromChild(slot);
    loadQuadDeviceSettingsToPanel(slot, serial);
    applyParentSlotSettingsToChild(slot);
    refreshSlotStatusFromChild(slot);

    console.log("[QUAD_PARENT] applyGroupToSlot OK:", {
        slot,
        serial,
        optionText: matchedOpt.textContent
    });

    return true;
}

async function applyGroupToAllSlots(group) {
    if (!group || group === GROUP_PLACEHOLDER_VALUE) {
        await stopAllSlots("group placeholder selected");
        return true;
    }

    currentGroup = group;
    groupSelect.value = group;
    loadTopbarLinkForGroup(group);
    quadState = "applying";
    statusLine.textContent = t("quad.status.applyingGroup", { group });

    /*
        原本是：
            slot1 await 完 → slot2 → slot3 → slot4

        改成：
            slot1 / slot2 / slot3 / slot4 同時開始開啟
    */
    const results = await Promise.allSettled(
        Array.from({ length: SLOT_COUNT }, (_, i) => {
            const slot = i + 1;
            return applyGroupToSlot(slot, group);
        })
    );

    const failedSlots = [];

    results.forEach((ret, index) => {
        const slot = index + 1;

        if (ret.status !== "fulfilled" || ret.value !== true) {
            failedSlots.push(slot);
        }
    });

    if (failedSlots.length > 0) {
        quadState = "device_lost";

        await stopAllSlots(`套用群組 ${group} 失敗`);

        currentGroup = "";
        groupSelect.value = GROUP_PLACEHOLDER_VALUE;

        openQuadSettingsModal();
        statusLine.textContent = t("quad.status.groupIncomplete", {
            group,
            slots: failedSlots.join(", ")
        });

        return false;
    }

    currentGroup = group;
    quadState = "running";
    groupSelect.value = group;
    statusLine.textContent = t("quad.status.currentGroup", { group });

    return true;
}

function parseQuadSerialFromLabel(label) {
    if (!label) return null;

    const text = String(label).trim();
    const upper = text.toUpperCase();

    let serial = "";

    // 你的實際 label：
    // JVK202V1000000A (0711:0401)
    const m1 = upper.match(/JVK202V([1-4][0-9A-Z]{7})/);

    if (m1) {
        serial = m1[1];
    }

    // fallback：抓第一段名稱最後 8 碼
    if (!serial) {
        const firstPart = upper.split(/\s|\(/)[0];
        const tail8 = firstPart.slice(-8);

        if (/^[1-4][0-9A-Z]{7}$/.test(tail8)) {
            serial = tail8;
        }
    }

    if (!serial) {
        return null;
    }

    return {
        slot: Number(serial[0]),
        group: serial.slice(1),
        serial,
        sourceLabel: text
    };
}

async function requestCameraLabelPermissionOnce() {
    let stream = null;

    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        });
    } catch (e) {
        console.warn("[QUAD_PARENT] getUserMedia failed:", e);
    } finally {
        if (stream) {
            for (const track of stream.getTracks()) {
                track.stop();
            }
        }
    }
}

function makeGroupPlaceholderOption() {
    const opt = document.createElement("option");
    opt.value = GROUP_PLACEHOLDER_VALUE;
    opt.textContent = t("setting.selectDeviceHolder");
    return opt;
}

async function scanQuadGroups() {
    statusLine.textContent = t("quad.status.scanning");

    await requestCameraLabelPermissionOnce();

    let devices = [];

    try {
        devices = await navigator.mediaDevices.enumerateDevices();
    } catch (e) {
        console.error("[QUAD_PARENT] enumerateDevices failed:", e);
        statusLine.textContent = t("quad.status.enumerateFail");
        return {
            completeGroups: [],
            videoInputCount: 0
        };
    }

    const videoInputs = devices.filter(d => d.kind === "videoinput");

    console.log("[QUAD_PARENT] videoInputs:", videoInputs);

    const groups = {};

    for (const dev of videoInputs) {
        const parsed = parseQuadSerialFromLabel(dev.label);

        if (!parsed) {
            continue;
        }

        if (!groups[parsed.group]) {
            groups[parsed.group] = {
                group: parsed.group,
                slots: {}
            };
        }

        groups[parsed.group].slots[parsed.slot] = {
            label: dev.label,
            deviceId: dev.deviceId,
            serial: parsed.serial
        };
    }

    const completeGroups = Object.values(groups)
        .filter(g => g.slots[1] && g.slots[2] && g.slots[3] && g.slots[4])
        .sort((a, b) => a.group.localeCompare(b.group));

    return {
        completeGroups,
        videoInputCount: videoInputs.length
    };
}

function renderGroupSelect(completeGroups, preferGroup = GROUP_PLACEHOLDER_VALUE, videoInputCount = 0) {
    const prefer = String(preferGroup || GROUP_PLACEHOLDER_VALUE);

    groupSelect.innerHTML = "";
    groupSelect.appendChild(makeGroupPlaceholderOption());

    for (const g of completeGroups) {
        const opt = document.createElement("option");
        opt.value = g.group;
        opt.textContent = g.group;
        groupSelect.appendChild(opt);
    }

    const hasPrefer = completeGroups.some(g => g.group === prefer);
    groupSelect.value = hasPrefer ? prefer : GROUP_PLACEHOLDER_VALUE;

    if (completeGroups.length === 0) {
        statusLine.textContent = t("quad.status.noCompleteGroup", { count: videoInputCount });
    } else if (groupSelect.value === GROUP_PLACEHOLDER_VALUE) {
        statusLine.textContent = t("quad.status.foundGroups", {
            groups: completeGroups.map(g => g.group).join(", ")
        });
    } else {
        statusLine.textContent = t("quad.status.currentGroup", { group: groupSelect.value });
    }
}

async function scanQuadUvcGroups(options = {}) {
    const preferGroup = options.preferGroup ?? GROUP_PLACEHOLDER_VALUE;
    const result = await scanQuadGroups();

    renderGroupSelect(
        result.completeGroups,
        preferGroup,
        result.videoInputCount
    );

    return result.completeGroups;
}

async function handleQuadDeviceChange() {
    const runningGroup = currentGroup;
    const wasRunning = quadState === "running" && !!runningGroup;

    const result = await scanQuadGroups();
    const stillComplete = wasRunning && result.completeGroups.some(g => g.group === runningGroup);

    if (wasRunning && !stillComplete) {
        quadState = "device_lost";
        await stopAllSlots(`group ${runningGroup} lost by devicechange`);
        renderGroupSelect(
            result.completeGroups,
            GROUP_PLACEHOLDER_VALUE,
            result.videoInputCount
        );
        groupSelect.value = GROUP_PLACEHOLDER_VALUE;
        openQuadSettingsModal();
        statusLine.textContent = t("quad.status.groupLost", { group: runningGroup });
        return;
    }

    renderGroupSelect(
        result.completeGroups,
        wasRunning ? runningGroup : GROUP_PLACEHOLDER_VALUE,
        result.videoInputCount
    );

    if (wasRunning) {
        quadState = "running";
        currentGroup = runningGroup;
        statusLine.textContent = t("quad.status.currentGroup", { group: runningGroup });
    }
}

function installParentDeviceChangeListener() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.addEventListener) {
        console.warn("[QUAD_PARENT] mediaDevices.devicechange not supported");
        return;
    }

    navigator.mediaDevices.addEventListener("devicechange", () => {
        console.log("[QUAD_PARENT] media devicechange");

        if (quadDeviceChangeTimer) {
            clearTimeout(quadDeviceChangeTimer);
            quadDeviceChangeTimer = null;
        }

        quadDeviceChangeTimer = setTimeout(async () => {
            try {
                await handleQuadDeviceChange();
            } catch (err) {
                console.warn("[QUAD_PARENT] handleQuadDeviceChange failed:", err);
            } finally {
                quadDeviceChangeTimer = null;
            }
        }, 3000);
    });
}

function syncOneSharedSettingToChildren(parentId, childId) {
    const parentEl = document.getElementById(parentId);
    if (!parentEl) return;

    for (let slot = 1; slot <= SLOT_COUNT; slot++) {
        const doc = getChildDoc(slot);
        if (!doc) continue;

        const childEl = doc.getElementById(childId);
        if (!childEl) continue;

        if (childEl.value !== parentEl.value) {
            childEl.value = parentEl.value;
            fireInputChange(childEl);
        }
    }
}

function syncAllSharedSettingsToChildren() {
    for (const [parentId, childId] of SHARED_MAP) {
        syncOneSharedSettingToChildren(parentId, childId);
    }
}

function applyParentSlotSettingsToChild(slot) {
    for (const [name, childId] of QUAD_DEVICE_SETTING_MAP) {
        const parentEl = getSelect(`qs_${name}_${slot}`);
        if (!parentEl) continue;
        setChildSelectValue(slot, childId, parentEl.value, true);
    }
}

async function confirmQuadSettings() {
    saveAllQuadDeviceSettings();
    saveSharedSetting("qs_lang");
    saveSharedSetting("qs_theme");
    saveTopbarLinkForCurrentGroup();

    // 保險：不要讓 iframe 內部原本的設定頁浮出來
    hideAllChildSettingsModals();

    // 只關閉父層中央設定頁
    modal.style.display = "none";

    await confirmAllChildSettings();
    
    console.log("[QUAD_PARENT] settings modal closed");
}

let quadMaximizedSlot = 0;

function getQuadCell(slot) {
    return document.getElementById(`quad-cell-${slot}`);
}

function notifyChildQuadMaximized(slot, maximized) {
    const frame = getFrame(slot);
    if (!frame || !frame.contentWindow) return;

    try {
        frame.contentWindow.postMessage({
            type: "quad_frame_maximized",
            slot: Number(slot),
            maximized: !!maximized
        }, "*");
    } catch (e) {
        console.warn("[QUAD_PARENT] notifyChildQuadMaximized failed:", e);
    }
}

function resizeChildVideo(slot) {
    const frame = getFrame(slot);
    const cw = frame ? frame.contentWindow : null;

    try {
        if (cw && typeof cw.resizeVideo === "function") {
            cw.resizeVideo();
        }
    } catch (e) {
        console.warn("[QUAD_PARENT] resize child failed:", slot, e);
    }
}

function resizeAllChildVideos() {
    for (let slot = 1; slot <= SLOT_COUNT; slot++) {
        resizeChildVideo(slot);
    }
}

function setQuadIframeMaximized(slot, maximized = true) {
    slot = Number(slot);

    if (!Number.isInteger(slot) || slot < 1 || slot > SLOT_COUNT) {
        return false;
    }

    const oldSlot = quadMaximizedSlot;

    for (const cell of root.querySelectorAll(".quad-cell")) {
        cell.classList.remove("quad-cell-focused");
    }

    if (!maximized) {
        quadMaximizedSlot = 0;

        root.classList.remove("quad-focus-mode");
        document.body.classList.remove("quad-focus-mode");

        if (oldSlot) {
            notifyChildQuadMaximized(oldSlot, false);
        }

        setTimeout(resizeAllChildVideos, 80);
        return false;
    }

    if (oldSlot && oldSlot !== slot) {
        notifyChildQuadMaximized(oldSlot, false);
    }

    const cell = getQuadCell(slot);
    if (!cell) return false;

    quadMaximizedSlot = slot;

    root.classList.add("quad-focus-mode");
    document.body.classList.add("quad-focus-mode");

    cell.classList.add("quad-cell-focused");

    modal.style.display = "none";

    notifyChildQuadMaximized(slot, true);

    setTimeout(() => {
        resizeChildVideo(slot);
    }, 80);

    return true;
}

function toggleQuadIframeMaximized(slot) {
    slot = Number(slot);
    return setQuadIframeMaximized(slot, quadMaximizedSlot !== slot);
}

window.quadSetIframeMaximized = setQuadIframeMaximized;
window.quadToggleIframeMaximized = toggleQuadIframeMaximized;

window.addEventListener("message", (event) => {
    const data = event.data || {};

    // ============================================================
    // iframe 要求父層設定某個 iframe 滿版 / 還原
    // ============================================================
    if (data.type === "quad_set_iframe_maximized") {
        setQuadIframeMaximized(data.slot, data.maximized);
        return;
    }

    // ============================================================
    // iframe 通知父層：使用者按了 topbar hide / toggle / show
    // ============================================================
    if (data.type === "quad-topbar-event") {
        const sourceSlot = getSlotFromMessageSource(event.source);

        if (!sourceSlot) {
            return;
        }

        broadcastTopbarCommand(sourceSlot, data.command);
        return;
    }

    // ============================================================
    // iframe 內原本設定按鈕 → 開啟父層 Quad 設定頁
    // ============================================================
    if (data.type === "quad_open_settings") {
        const sourceSlot = getSlotFromMessageSource(event.source);

        if (!sourceSlot) {
            return;
        }

        openQuadSettingsModal();
        return;
    }
});

function openQuadSettingsModal() {
    if (quadMaximizedSlot) {
        setQuadIframeMaximized(quadMaximizedSlot, false);
    }

    modal.style.display = "flex";
    setTimeout(() => modal.focus(), 0);

    // 只在打開設定頁時讀一次 child 狀態，不要 interval 一直讀
    setTimeout(refreshAllSlotStatusFromChildren, 500);
}

function bindMainEvents() {
    groupSelect.addEventListener("change", async () => {
        const value = groupSelect.value;

        if (!value || value === GROUP_PLACEHOLDER_VALUE) {
            await stopAllSlots("group placeholder selected by user");
            groupSelect.value = GROUP_PLACEHOLDER_VALUE;
            return;
        }

        loadTopbarLinkForGroup(value);
        await applyGroupToAllSlots(value);
    });

    refreshBtn.addEventListener("click", async () => {
        const preferGroup = quadState === "running" ? currentGroup : GROUP_PLACEHOLDER_VALUE;
        await scanQuadUvcGroups({ preferGroup });
        refreshAllSlotStatusFromChildren();
    });

    confirmBtn.addEventListener("click", async () => {
        await confirmQuadSettings();
    });

    resetDefaultBtn.addEventListener("click", async () => {
        await resetCurrentQuadSettingsToDefault();
    });

    backToHomepageBtn.addEventListener("click", async () => {
        if (window.electronSerial)
            await window.electronAppMode.backToModeSelect();
        else
            window.location.href = "https://chingoliu.github.io/webkvm-quad/";
    });

    document.addEventListener("keydown", (e) => {
        if (modal.style.display !== "flex") return;
        if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
            confirmBtn.click();
        }
    }, true);
}

async function initQuadPage() {
    loadSharedSettings();
    buildSlotPanels();
    applyQuadI18N(getSelect("qs_lang")?.value || currentLang);
    buildIframes();
    bindSharedSettingEvents();
    bindMainEvents();
    installParentDeviceChangeListener();

    openQuadSettingsModal();

    const themeSel = document.getElementById("qs_theme");
    if (themeSel && window.KVIM_SETTINGS) {
        const savedTheme = window.KVIM_SETTINGS.getSharedSetting("theme", themeSel.value || "dark");
        themeSel.value = savedTheme;
        applyQuadTheme(savedTheme);
    }

    setTimeout(() => {
        scanQuadUvcGroups({ preferGroup: GROUP_PLACEHOLDER_VALUE });
    }, 1200);
}

function observeChildStatus(slot) {
    const doc = getChildDoc(slot);
    if (!doc) return false;

    if (doc.__quadStatusObserverInstalled) {
        return true;
    }

    const ids = [
        "id_status_uvc_name",
        "id_status_uvc_state",
        "id_status_uac_name",
        "id_status_uac_state",
        "id_status_com_name",
        "id_status_com_state"
    ];

    const targets = ids
        .map(id => doc.getElementById(id))
        .filter(Boolean);

    if (targets.length === 0) {
        return false;
    }

    const observer = new MutationObserver(() => {
        refreshSlotStatusFromChild(slot);
    });

    for (const el of targets) {
        observer.observe(el, {
            childList: true,
            characterData: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["class", "style"]
        });
    }

    doc.__quadStatusObserverInstalled = true;
    doc.__quadStatusObserver = observer;

    // 安裝完成後先讀一次
    refreshSlotStatusFromChild(slot);

    console.log("[QUAD_PARENT] status observer installed:", slot);

    return true;
}

document.addEventListener("DOMContentLoaded", initQuadPage);