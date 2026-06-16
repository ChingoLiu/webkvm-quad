//==================================================================================Theme
let currentTheme = window.KVIM_UI?.currentTheme || "dark";

function applyTheme(theme) {
    currentTheme = window.KVIM_UI.applyTheme(theme, {
        save: useSingleLocalStorage(),
        selectId: "theme-select"
    });

    updateThemeIcons();
}

function updateThemeIcons() {
    document.querySelectorAll('.div_icon').forEach(img => {

        if (img.getAttribute('id') === 'mute_icon') {
            updateMuteIcon(img, audioElem.muted);
        }
        else if (img.getAttribute('id') === 'topbar_icon') {
            updateTopbarIcon(img, last_topbar);
        }
        else {
            const lightSrc = img.getAttribute('data-icon-light');
            const darkSrc = img.getAttribute('data-icon-dark');

            if (currentTheme === 'dark' && darkSrc) {
                img.src = darkSrc;
            } else if (lightSrc) {
                img.src = lightSrc;
            }
        }
    });

    updateKeyboardStatusIcon(keyboard_status_icon, 0);
    updateMouseStatusIcon(Mouse_status_icon, 8);
}

function updateMuteIcon(img, flag) {
    if (currentTheme === 'light') {
        if (flag)
            img.src = "icon/mute_light.png";
        else
            img.src = "icon/unmute_light.png";
    }
    else {
        if (flag)
            img.src = "icon/mute_dark.png";
        else
            img.src = "icon/unmute_dark.png";
    }
}

function updateTopbarIcon(img, flag) {
    if (currentTheme === 'light') {
        if (flag)
            img.src = "icon/topbar_down_light.png";
        else
            img.src = "icon/topbar_up_light.png";
    }
    else {
        if (flag)
            img.src = "icon/topbar_down_dark.png";
        else
            img.src = "icon/topbar_up_dark.png";
    }
}

function updateKeyboardStatusIcon(img, flag) {
    if (currentTheme === 'light') {
        if (flag)
            img.src = "icon/keyboard_on_light.png";
        else
            img.src = "icon/keyboard_off_light.png";
    }
    else {
        if (flag)
            img.src = "icon/keyboard_on_dark.png";
        else
            img.src = "icon/keyboard_off_dark.png";
    }
}

function updateMouseStatusIcon(img, flag) {
    if (currentTheme === 'light') {
        switch (flag) {
            case 0:
                img.src = "icon/mouse_on_light.png";
                break;
            case 1:
                img.src = "icon/mouse_1_light.png";
                break;
            case 2:
                img.src = "icon/mouse_2_light.png";
                break;
            case 3:
                img.src = "icon/mouse_6_light.png";
                break;
            case 4:
                img.src = "icon/mouse_3_light.png";
                break;
            case 5:
                img.src = "icon/mouse_4_light.png";
                break;
            case 6:
                img.src = "icon/mouse_5_light.png";
                break;
            case 7:
                img.src = "icon/mouse_7_light.png";
                break;
            case 8:
                img.src = "icon/mouse_off_light.png";
                break;
        }
    }
    else {
        switch (flag) {
            case 0:
                img.src = "icon/mouse_on_dark.png";
                break;
            case 1:
                img.src = "icon/mouse_1_dark.png";
                break;
            case 2:
                img.src = "icon/mouse_2_dark.png";
                break;
            case 3:
                img.src = "icon/mouse_6_dark.png";
                break;
            case 4:
                img.src = "icon/mouse_3_dark.png";
                break;
            case 5:
                img.src = "icon/mouse_4_dark.png";
                break;
            case 6:
                img.src = "icon/mouse_5_dark.png";
                break;
            case 7:
                img.src = "icon/mouse_7_dark.png";
                break;
            case 8:
                img.src = "icon/mouse_off_dark.png";
                break;
        }
    }
}

function checkMouseStatusIcon() {
    if (currentTheme === 'light') {
        if (Mouse_status_icon.getAttribute("src") === "icon/mouse_off_light.png")
            return true;
        else
            return false;
    }
    else {
        if (Mouse_status_icon.getAttribute("src") === "icon/mouse_off_dark.png")
            return true;
        else
            return false;
    }
}

//==================================================================================語系
const I18N_DICT = window.KVIM_I18N_DICT || {};

let currentLang = window.KVIM_UI?.currentLang || "en";

function applyI18N(lang) {
    currentLang = window.KVIM_UI.applyI18N(lang, {
        save: useSingleLocalStorage(),
        selectId: "lang-select"
    });

    if (serialStatusKey) {
        serialSetStatus(t(serialStatusKey) + serialStatusVars);
    }

    if (typeof updateQuadFrameMaxButton === "function") {
        updateQuadFrameMaxButton();
    }
}

function t(key, vars = {}) {
    return window.KVIM_UI.t(key, vars, currentLang);
}

//==================================================================================Rotate
let currentRotate = 0;   // 0 / 90 / 180 / 270

function fillRotateOptions() {
    fillSelectWithItems(selRotate, [
        ["0", "0°", "setting.rotate0"],
        ["90", "90°", "setting.rotate90"],
        ["180", "180°", "setting.rotate180"],
        ["270", "270°", "setting.rotate270"]
    ]);

    if (!selRotate.value) {
        selRotate.value = "0";
    }

    selectedRotate = Number(selRotate.value || 0);
    applyRotate(selRotate.value || "0");

    applyI18N(currentLang);
}

function applyRotate(angle) {
    const video = document.getElementById('stream');
    const v = parseInt(angle, 10) || 0;

    currentRotate = v;

    // 先清掉 class，避免殘留
    video.classList.remove('rot0', 'rot90', 'rot180', 'rot270');

    switch (v) {
        case 90:
            video.classList.add('rot90');
            break;
        case 180:
            video.classList.add('rot180');
            break;
        case 270:
            video.classList.add('rot270');
            break;
        case 0:
        default:
            video.classList.add('rot0');
            break;
    }

    // 旋轉後重新計算大小/位置
    resizeVideo();
}

function isHorizontal() {
    return currentRotate === 0 || currentRotate === 180;
}

document.getElementById('selRotate').addEventListener('change', (e) => {
    applyRotate(e.target.value);
    saveCurrentDeviceSetting("rotate", e.target.value);
});

//==================================================================================網頁初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('[common-ui] DOMContentLoaded');

    const ui = window.KVIM_UI;

    if (!ui) {
        console.error('[common-ui] window.KVIM_UI not found. Check script order: dictionary.js -> settingsStorage.js -> commonUi.js -> kvim202.js');
        return;
    }

    // =============== 語言初始化 ===============
    const initialLang = ui.currentLang || ui.getInitialLang("zh-TW");

    console.log('[i18n] initialLang =', initialLang);

    applyI18N(initialLang);

    const langSel = document.getElementById('lang-select');

    console.log('[i18n] lang-select element =', langSel);

    if (langSel) {
        langSel.value = currentLang;

        langSel.addEventListener('change', () => {
            console.log('[i18n] select changed =>', langSel.value);

            applyI18N(langSel.value);

            // 單機設定頁的 UVC / UAC / COM 狀態文字需要跟著語系刷新
            refreshDeviceStatusText();
        });
    }

    // =============== Theme 初始化 ===============
    const initialTheme = ui.currentTheme || ui.getInitialTheme("dark");

    console.log('[theme] initialTheme =', initialTheme);

    applyTheme(initialTheme);

    const themeSel = document.getElementById('theme-select');

    console.log('[theme] theme-select element =', themeSel);

    if (themeSel) {
        themeSel.value = currentTheme;

        themeSel.addEventListener('change', () => {
            console.log('[theme] select changed =>', themeSel.value);

            applyTheme(themeSel.value);
        });
    }

    updateSlotLabel();
});

//==================================================================================
let isPIP = false;

let isKeyboardControl = false;
let isMouseControl = false;

let videoWidth = 1920 * 8 / 10;
let videoHeight = 1080 * 8 / 10;
let sendW_coef = 32767 * 1000 / (videoWidth - 1);
let sendH_coef = 32767 * 1000 / (videoHeight - 1);
let mouseButton = 0;
let abs_last_x = 0;
let abs_last_y = 0;
let start_of_43x = 0;
let stop_of_43x = 0;

const video = document.getElementById("stream");
const videoBox = document.getElementById("videoBox");
const fsBtn = document.getElementById("fullscreen-btn");
const kb = document.getElementById("virtualKeyboard");

const serialModal = document.getElementById("serial-modal");
const deviceStatusEl = document.getElementById("device-status");
const serialStatusEl = document.getElementById("serial-status");

video.addEventListener("contextmenu", (e) => e.preventDefault()); // 阻止右鍵選單        

//==================================================================================Window Load
window.addEventListener("load", async () => {
    document.getElementById("id_span_version3").textContent = "2";

    if (!serialModal) return;

    showSettingsModal();

    if (!serialIsSupported()) {
        serialSetStatusKey('serial.notsupported');
        return;
    }

    try {
        await initUvcUacOnStartup();
    } catch (err) {
        console.error("[Init] failed:", err);
        serialSetStatusKey('serial.init_err');
    }
});

serialModal.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault(); // 防止跑出預設行為
        document.getElementById("btn-apply-settings").click();
    }
});

window.addEventListener("beforeunload", async () => {
    await closeSerialSafely();
});

document.addEventListener("dragstart", (e) => {
    if (e.target && e.target.tagName === "IMG") {
        e.preventDefault();
    }
}, true);

navigator.serial.addEventListener("connect", async (event) => {
    console.log("[Serial] connect", event);

    try {
        const id = getSelectedDeviceJvkId();
        if (id) {
            await ensureSerialMatchesDeviceId(id);
        }
    } catch (err) {
        console.warn("[Serial] auto-match on connect failed:", err);
    }
});

navigator.serial.addEventListener("disconnect", async (event) => {
    console.log("[Serial] disconnect", event);

    try {
        if (serialPort && event.target === serialPort) {
            await closeSerialSafely("serial disconnect");

            currentComJvkId = "";

            const expected = expectedComName(getSelectedDeviceJvkId());
            if (expected) {
                serialSetStatusRaw(`請授權${expected}`);
            } else {
                serialSetStatusKey('serial.disconnected');
            }
        }
    } catch (err) {
        console.warn("[Serial] disconnect handle failed:", err);
    }
});

//==================================================================================起始設定
const btnChoosePort = document.getElementById("btn-choose-port");
const selDevice = document.getElementById("selDevice");

//==================================================================================
// Quad iframe slot 對應裝置序號第一碼
// quad.html 會帶入 ?slot=1 / ?slot=2 / ?slot=3 / ?slot=4
// 若沒有 slot，代表單機頁面模式，允許看到所有裝置
//==================================================================================
const SINGLE_DEVICE_DEFAULTS = {
    resolution: "1920x1080",
    framerate: "60",
    rotate: "0",
    mouse_report_mode: "mouse",
    relative_mouse_speed: "1",
    scrollspeed: "1",
    direction: "-1",
    topbar: "auto"
};

const SINGLE_DEVICE_SETTING_MAP = [
    ["resolution", "selResolution"],
    ["framerate", "selFramerate"],
    ["rotate", "selRotate"],
    ["mouse_report_mode", "id_select_mouse_report_mode"],
    ["relative_mouse_speed", "id_select_relative_mouse_speed"],
    ["scrollspeed", "id_select_scrollspeed"],
    ["direction", "id_select_direction"],
    ["topbar", "st_select_topbarmode"]
];

const FRAME_SLOT_INDEX = (() => {
    const slot = new URLSearchParams(location.search).get("slot");
    if (/^[1-4]$/.test(slot || "")) {
        return slot;
    }
    return "";
})();

function isQuadFrameMode() {
    return FRAME_SLOT_INDEX !== "";
}

function useSingleLocalStorage() {
    return !isQuadFrameMode();
}

function settingsApi() {
    return window.KVIM_SETTINGS || null;
}

function loadSharedSetting(name, defaultValue = "") {
    const S = settingsApi();
    return S ? S.getSharedSetting(name, defaultValue) : defaultValue;
}

function saveSharedSetting(name, value) {
    const S = settingsApi();
    if (!S) return false;
    return S.setSharedSetting(name, value);
}

function getCurrentSettingsDeviceId() {
    const id = String(
        (typeof selectedDeviceJvkId !== "undefined" && selectedDeviceJvkId) ||
        (typeof activeDeviceJvkId !== "undefined" && activeDeviceJvkId) ||
        (typeof getSelectedDeviceJvkId === "function" ? getSelectedDeviceJvkId() : "") ||
        ""
    ).trim().toUpperCase();

    return /^[0-9A-Z]{8}$/.test(id) ? id : "";
}

function loadDeviceSetting(deviceId, name, defaultValue = "") {
    const S = settingsApi();
    return (S && deviceId) ? S.getDeviceSetting(deviceId, name, defaultValue) : defaultValue;
}

function saveDeviceSetting(deviceId, name, value) {
    const S = settingsApi();
    if (!S || !deviceId) return false;
    return S.setDeviceSetting(deviceId, name, value);
}

function saveCurrentDeviceSetting(name, value) {
    if (!useSingleLocalStorage()) return false;
    const deviceId = getCurrentSettingsDeviceId();
    if (!deviceId) return false;
    return saveDeviceSetting(deviceId, name, value);
}

function fillSelectWithItems(sel, items) {
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

function ensureDeviceSettingOptionsFilled() {
    fillRotateOptions();

    fillSelectWithItems(document.getElementById("id_select_mouse_report_mode"), [
        ["mouse", t("setting.mouseReportLow"), "setting.mouseReportLow"],
        ["pointer", t("setting.mouseReportHigh"), "setting.mouseReportHigh"]
    ]);

    fillSelectWithItems(document.getElementById("id_select_relative_mouse_speed"), [
        ["2.0", t("setting.relCursorSuperFast"), "setting.relCursorSuperFast"],
        ["1.5", t("setting.relCursorFast"), "setting.relCursorFast"],
        ["1", t("setting.relCursorMedium"), "setting.relCursorMedium"],
        ["0.7", t("setting.relCursorSlow"), "setting.relCursorSlow"],
        ["0.4", t("setting.relCursorSuperSlow"), "setting.relCursorSuperSlow"]
    ]);

    fillSelectWithItems(document.getElementById("id_select_scrollspeed"), [
        ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"],
        ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"]
    ]);

    fillSelectWithItems(document.getElementById("id_select_direction"), [
        ["-1", t("setting.scrollNormal"), "setting.scrollNormal"],
        ["1", t("setting.scrollReverse"), "setting.scrollReverse"]
    ]);

    applyI18N(currentLang);
}

function applyResolutionSelectToState() {
    const v = selResolution.value || "1920x1080";
    const [w, h] = v.split("x").map(Number);
    selectedWidth = Number.isFinite(w) ? w : 1920;
    selectedHeight = Number.isFinite(h) ? h : 1080;
}

function applyFramerateSelectToState() {
    const fps = parseInt(selFramerate.value || "60", 10);
    selectedFps = Number.isFinite(fps) ? fps : 60;
}

function applyStoredDeviceSettings(deviceId) {
    if (!deviceId) return;

    const S = settingsApi();
    ensureDeviceSettingOptionsFilled();

    if (S) {
        for (const [name, id] of SINGLE_DEVICE_SETTING_MAP) {
            const el = document.getElementById(id);
            const def = SINGLE_DEVICE_DEFAULTS[name] ?? "";

            if (el) {
                S.applySelectValue(
                    el,
                    loadDeviceSetting(deviceId, name, def),
                    def
                );
            }
        }
    }

    applyResolutionSelectToState();
    applyFramerateSelectToState();
    applyRotate(selRotate.value || "0");

    const mouseModeSel = document.getElementById("id_select_mouse_report_mode");
    if (mouseModeSel && mouseModeSel.value) bindMouseMoveEvent(mouseModeSel.value);

    const relSel = document.getElementById("id_select_relative_mouse_speed");
    if (relSel && relSel.value) setRelativeMouseSpeed(relSel.value, false);

    const scrollSel = document.getElementById("id_select_scrollspeed");
    if (scrollSel && scrollSel.value) scroll_speed = Number(scrollSel.value) || 1;

    const dirSel = document.getElementById("id_select_direction");
    if (dirSel && dirSel.value) scroll_dir = Number(dirSel.value) || -1;

    const topbarSel = document.getElementById("st_select_topbarmode");
    if (topbarSel && topbarSel.value) setTopbarAutoScale(topbarSel.value === "auto");
}

function saveAllCurrentDeviceSettings() {
    if (!useSingleLocalStorage()) return;
    const deviceId = getCurrentSettingsDeviceId();
    if (!deviceId) return;

    const map = [
        ["resolution", "selResolution"],
        ["framerate", "selFramerate"],
        ["rotate", "selRotate"],
        ["mouse_report_mode", "id_select_mouse_report_mode"],
        ["relative_mouse_speed", "id_select_relative_mouse_speed"],
        ["scrollspeed", "id_select_scrollspeed"],
        ["direction", "id_select_direction"],
        ["topbar", "st_select_topbarmode"]
    ];

    for (const [name, id] of SINGLE_DEVICE_SETTING_MAP) {
        const el = document.getElementById(id);
        if (el && el.value !== "") {
            saveDeviceSetting(deviceId, name, el.value);
        }
    }
}

function setSingleSelectToDefault(name) {
    const mapItem = SINGLE_DEVICE_SETTING_MAP.find(([n]) => n === name);
    if (!mapItem) return "";

    const [, id] = mapItem;
    const el = document.getElementById(id);
    if (!el || !el.options || el.options.length === 0) return "";

    const def = SINGLE_DEVICE_DEFAULTS[name];

    if (def !== undefined && Array.from(el.options).some(opt => opt.value === String(def))) {
        el.value = String(def);
    } else {
        el.selectedIndex = 0;
    }

    return el.value;
}

async function resetSingleCurrentDeviceSettingsToDefault() {
    if (!useSingleLocalStorage()) return false;

    const deviceId = getCurrentSettingsDeviceId();

    if (!deviceId) {
        showToast(t("toast.nodevice"));
        return false;
    }

    const api = settingsApi();
    if (!api) return false;

    ensureDeviceSettingOptionsFilled();

    // 1. 回到預設 UI 值
    setSingleSelectToDefault("resolution");
    setSingleSelectToDefault("framerate");
    setSingleSelectToDefault("rotate");
    setSingleSelectToDefault("mouse_report_mode");
    setSingleSelectToDefault("relative_mouse_speed");
    setSingleSelectToDefault("scrollspeed");
    setSingleSelectToDefault("direction");
    setSingleSelectToDefault("topbar");

    // 2. 套用到目前狀態
    applyResolutionSelectToState();
    applyFramerateSelectToState();
    applyRotate(selRotate.value || "0");

    const mouseModeSel = document.getElementById("id_select_mouse_report_mode");
    if (mouseModeSel && mouseModeSel.value) {
        bindMouseMoveEvent(mouseModeSel.value);
    }

    const relSel = document.getElementById("id_select_relative_mouse_speed");
    if (relSel && relSel.value) {
        setRelativeMouseSpeed(relSel.value, false);
    }

    const scrollSel = document.getElementById("id_select_scrollspeed");
    if (scrollSel && scrollSel.value) {
        scroll_speed = Number(scrollSel.value) || 1;
    }

    const dirSel = document.getElementById("id_select_direction");
    if (dirSel && dirSel.value) {
        scroll_dir = Number(dirSel.value) || -1;
    }

    const topbarSel = document.getElementById("st_select_topbarmode");
    if (topbarSel && topbarSel.value) {
        setTopbarAutoScale(topbarSel.value === "auto");
    }

    // 3. 寫回 localSetting
    // 注意：如果 1920x1080 / 60fps 不存在，會寫入實際 fallback 到的第一個選項。
    for (const [name, id] of SINGLE_DEVICE_SETTING_MAP) {
        const el = document.getElementById(id);
        if (el && el.value !== "") {
            api.setDeviceSetting(deviceId, name, el.value);
        }
    }

    // 4. 立即套用 UVC 設定
    try {
        await applyUvcSettings();
    } catch (e) {
        console.warn("[Settings] reset default applyUvcSettings failed:", e);
    }

    resizeVideo();

    return true;
}

function isDeviceIdAllowedForThisFrame(id) {
    id = String(id || "").toUpperCase();

    // 單 device / 非 quad.html 模式，不限制
    if (!isQuadFrameMode()) {
        return true;
    }

    // Quad 模式：序號第一碼必須等於 iframe slot
    return id.length >= 1 && id[0] === FRAME_SLOT_INDEX;
}

function isProfileAllowedForThisFrame(profile) {
    return !!profile && isDeviceIdAllowedForThisFrame(profile.id);
}

function updateSlotLabel() {
    const el = document.getElementById("slotLabel");
    if (!el) return;

    if (isQuadFrameMode()) {
        el.textContent = `JVK202-${FRAME_SLOT_INDEX}`;
        el.style.display = "";
    } else {
        el.textContent = "";
        el.style.display = "none";
    }
}

//----------------------------------------------
// 全域變數
//----------------------------------------------
let currentStream = null;    // 目前使用的 video stream
let currentTrack = null;     // 目前使用的 video track

let selectedCamId = null;
let selectedAudioId = null;
let selectedWidth = 1920;
let selectedHeight = 1080;
let selectedFps = 60;
let selectedRotate = 0;

let serialPort = null;

let deviceProfiles = [];
let selectedDeviceJvkId = "";
let activeDeviceJvkId = "";

let currentComJvkId = "";
let lastDeviceStatus = null;

const SERIAL_BAUDRATE = 3000000;

let usb_connection = false;
let usb_last_connection = 0xff;

const HID_CMD_GET_DEVICE_ID = 0x0A;   // PC -> COM：要求回報 JVK202CXXXXXXXX
const HID_RSP_DEVICE_ID = 0x8A;       // COM -> PC：回報 JVK202CXXXXXXXX

function serialSetStatusRaw(msg) {
    serialStatusKey = null;
    serialStatusVars = "";
    serialSetStatus(msg);
}

function buildSimpleSerialPacket(cmd) {
    const pkt = new Uint8Array(7);
    pkt[0] = 0x57;
    pkt[1] = 0xAB;
    pkt[2] = 0x00;
    pkt[3] = cmd & 0xFF;
    pkt[4] = 1;
    pkt[5] = 2;

    let sum = 0;
    for (let i = 0; i < 6; i++) {
        sum = (sum + pkt[i]) & 0xFF;
    }

    pkt[pkt.length - 1] = sum;
    return pkt;
}

function parseComJvkIdFromPacket(packet) {
    const cmd = packet[3];
    const len = packet[4];
    const data = packet.slice(7, 7 + len-2);

    const text = new TextDecoder()
        .decode(data)
        .replace(/\0/g, "")
        .trim();

    // 優先接受完整字串：JVK202CXXXXXXXX
    let m = text.match(/JVK202C([A-Za-z0-9]{8})/i);
    if (m) return m[1].toUpperCase();

    // 如果你的韌體只回 8 bytes ID，例如 12345678
    if (cmd === HID_RSP_DEVICE_ID && /^[A-Za-z0-9]{8}$/.test(text)) {
        return text.toUpperCase();
    }

    return "";
}

async function readComJvkIdFromPort(port, timeoutMs = 1200) {
    let reader = null;
    let writer = null;
    let openedHere = false;
    let localRx = new Uint8Array(0);
    let timedOut = false;

    try {
        if (!port.readable || !port.writable) {
            await port.open({ baudRate: SERIAL_BAUDRATE });
            openedHere = true;
        }

        writer = port.writable.getWriter();
        reader = port.readable.getReader();

        // 要求 COM 回報自己的識別碼
        await writer.write(buildSimpleSerialPacket(HID_CMD_GET_DEVICE_ID));

        const deadline = Date.now() + timeoutMs;

        while (Date.now() < deadline) {
            const remain = Math.max(1, deadline - Date.now());

            let ret;
            try {
                ret = await withTimeout(
                    reader.read(),
                    remain,
                    "read COM id timeout"
                );
            } catch (e) {
                timedOut = true;
                break;
            }

            if (ret.done) break;

            if (ret.value && ret.value.length > 0) {
                localRx = concatUint8(localRx, ret.value);

                while (true) {
                    const parsed = tryParseOnePacket(localRx);
                    if (!parsed) break;

                    localRx = localRx.slice(parsed.length);

                    if (!parsed.packet) continue;

                    const id = parseComJvkIdFromPacket(parsed.packet);
                    if (id) {
                        console.log("[SerialProbe] COM ID =", id);
                        return id;
                    }
                }
            }
        }

        return "";
    } catch (err) {
        console.warn("[SerialProbe] readComJvkIdFromPort failed:", err);
        return "";
    } finally {
        if (reader) {
            if (timedOut) {
                try { await reader.cancel(); } catch (e) {}
            }
            try { reader.releaseLock(); } catch (e) {}
        }

        if (writer) {
            try { writer.releaseLock(); } catch (e) {}
        }

        if (openedHere) {
            try { await port.close(); } catch (e) {}
        }
    }
}

async function autoOpenMatchingComForDeviceId(jvkId) {
    jvkId = String(jvkId || "").toUpperCase();

    if (!jvkId) {
        currentComJvkId = "";
        serialSetStatusRaw("未取得裝置識別碼");
        return false;
    }

    const expected = expectedComName(jvkId);

    const ports = await navigator.serial.getPorts();
    const allowedPorts = ports.filter(p => serialIsAllowed(p.getInfo()));

    if (allowedPorts.length === 0) {
        currentComJvkId = "";
        serialSetStatusRaw(`請授權${expected}`);
        return false;
    }

    serialSetStatusRaw(`搜尋${expected}...`);

    for (const port of allowedPorts) {
        const comId = await readComJvkIdFromPort(port);

        console.log("[SerialProbe] expected =", jvkId, "got =", comId);

        if (comId === jvkId) {
            await closeSerialSafely("before_open_matched_serial");

            currentComJvkId = comId;
            await serialOpenWithoutModal(port);

            serialSetStatusRaw(`已開啟: JVK202C${comId}`);
            return true;
        }
    }

    currentComJvkId = "";
    serialSetStatusRaw(`請授權${expected}`);
    return false;
}

async function ensureSerialMatchesDeviceId(jvkId = selectedDeviceJvkId) {
    jvkId = String(jvkId || "").toUpperCase();

    if (!jvkId) {
        currentComJvkId = "";
        serialSetStatusRaw("未取得裝置識別碼");
        return false;
    }

    if (isComPortOpened() && currentComJvkId === jvkId) {
        return true;
    }

    if (isComPortOpened()) {
        await closeSerialSafely("serial not match selected device");
    }

    return await autoOpenMatchingComForDeviceId(jvkId);
}

function cleanDeviceLabel(label) {
    return String(label || "")
        .replace(/\s*\([\da-f]{4}:[\da-f]{4}\)\s*$/i, "")
        .trim();
}

function refreshDeviceStatusText() {
    if (!lastDeviceStatus) return;

    setDeviceStatus(
        lastDeviceStatus.profile,
        lastDeviceStatus.uacOk,
        lastDeviceStatus.comOk,
        lastDeviceStatus.uvcOk
    );
}

function setDeviceStatus(profile, uacOk, comOk, uvcOk = true) {
    if (!profile) return;

    lastDeviceStatus = {
        profile,
        uacOk,
        comOk,
        uvcOk
    };

    const uvcNameEl = document.getElementById("id_status_uvc_name");
    const uvcStateEl = document.getElementById("id_status_uvc_state");

    const uacNameEl = document.getElementById("id_status_uac_name");
    const uacStateEl = document.getElementById("id_status_uac_state");

    const comNameEl = document.getElementById("id_status_com_name");
    const comStateEl = document.getElementById("id_status_com_state");
    const comAuthEl = document.getElementById("id_status_com_state2");

    const uvcName = cleanDeviceLabel(profile.camLabel) || expectedUvcName(profile.id);
    const comName = expectedComName(profile.id);

    // UVC
    if (uvcNameEl) {
        uvcNameEl.textContent = uvcName;
    }

    if (uvcStateEl) {
        if (uvcOk) {
            uvcStateEl.textContent = t('device.ok');
            uvcStateEl.className = "device-status-state ok";
        } else {
            uvcStateEl.textContent = t('device.fail');
            uvcStateEl.className = "device-status-state fail";
        }
    }

    // UAC
    if (uacNameEl) {
        uacNameEl.textContent = expectedAudioName(profile.id);
    }

    if (uacStateEl) {
        if (!uvcOk) {
            uacStateEl.textContent = t('device.none');
            uacStateEl.className = "device-status-state";
        } else if (uacOk) {
            uacStateEl.textContent = t('device.ok');
            uacStateEl.className = "device-status-state ok";
        } else {
            uacStateEl.textContent = t('device.fail');
            uacStateEl.className = "device-status-state fail";
        }
    }

    // COM
    if (comNameEl) {
        comNameEl.textContent = comName;
    }

    if (comStateEl) {
        if (!uvcOk) {
            comStateEl.textContent = t('device.none');
            comStateEl.className = "device-status-state";
            comAuthEl.style.display = "none";
        } else if (comOk) {
            comStateEl.textContent = t('device.ok');
            comStateEl.className = "device-status-state ok";
            comAuthEl.style.display = "none";
        } else {
            comStateEl.textContent = t('device.fail');
            comStateEl.className = "device-status-state fail";
            comAuthEl.style.display = "";
        }
    }
}

document.getElementById("id_status_com_state2").addEventListener("click", async () => {
    await chooseMatchingComPortForCurrentDevice();
});

function clearDeviceStatus() {
    lastDeviceStatus = null;

    const uvcNameEl = document.getElementById("id_status_uvc_name");
    const uvcStateEl = document.getElementById("id_status_uvc_state");

    const uacNameEl = document.getElementById("id_status_uac_name");
    const uacStateEl = document.getElementById("id_status_uac_state");

    const comNameEl = document.getElementById("id_status_com_name");
    const comStateEl = document.getElementById("id_status_com_state");
    const comAuthEl = document.getElementById("id_status_com_state2");

    uvcNameEl.textContent = "";
    uvcStateEl.textContent = "";
    uacNameEl.textContent = "";
    uacStateEl.textContent = "";
    comNameEl.textContent = "";
    comStateEl.textContent = "";
    comAuthEl.style.display = "none";
}

async function openAudioForProfile(profile) {
    if (!profile || !profile.audioDeviceId) {
        console.warn("[UAC] missing:", expectedAudioName(profile?.id));
        setAudioMuteState(true);
        return false;
    }

    try {
        await startUAC(profile.audioDeviceId);
        return true;
    } catch (err) {
        console.warn("[UAC] open failed:", expectedAudioName(profile.id), err);
        setAudioMuteState(true);
        return false;
    }
}

async function openDeviceProfile(profile) {
    if (!profile) {
        clearDeviceStatus();
        return { uvcOk: false, uacOk: false, comOk: false };
    }

    if (!isProfileAllowedForThisFrame(profile)) {
        console.warn(
            "[Device] blocked by iframe slot:",
            "slot =", FRAME_SLOT_INDEX,
            "profile =", profile.id
        );

        clearDeviceStatus();
        serialSetStatusRaw(`此視窗只允許開啟 ${FRAME_SLOT_INDEX}xxxxxxx 裝置`);
        return { uvcOk: false, uacOk: false, comOk: false };
    }

    clearDeviceStatus();

    applyProfileToState(profile);

    console.log("[Device] opening profile:", profile);

    await stopCurrentMediaSafely();

    selectedWidth = 1920;
    selectedHeight = 1080;
    selectedFps = 60;

    try {
        await fillResolutionAndFps(profile.camDeviceId);

        if (useSingleLocalStorage()) {
            applyStoredDeviceSettings(profile.id);
        }

        await startUVC(profile.camDeviceId, selectedWidth, selectedHeight, selectedFps);
    } catch (err) {
        console.warn("[Device] UVC open failed:", expectedUvcName(profile.id), err);

        activeDeviceJvkId = profile.id;

        setDeviceStatus(profile, false, false, false);

        return { uvcOk: false, uacOk: false, comOk: false };
    }

    const uacOk = await openAudioForProfile(profile);
    const comOk = await ensureSerialMatchesDeviceId(profile.id);

    activeDeviceJvkId = profile.id;

    setDeviceStatus(profile, uacOk, comOk);

    resizeVideo();

    return { uvcOk: true, uacOk, comOk };
}

async function openFirstWorkingDevice(startIndex = 0) {
    if (deviceProfiles.length === 0) {
        await handleUvcMissing();
        serialSetStatusRaw("未偵測到 JVK202 裝置");
        return false;
    }

    const total = deviceProfiles.length;
    let firstTriedProfile = null;

    for (let offset = 0; offset < total; offset++) {
        const idx = (startIndex + offset) % total;
        const profile = deviceProfiles[idx];

        if (!profile) continue;

        if (!firstTriedProfile) {
            firstTriedProfile = profile;
        }

        selDevice.value = profile.id;
        applyProfileToState(profile);

        const result = await openDeviceProfile(profile);

        if (result.uvcOk) {
            return true;
        }
    }

    // 全部都失敗：回到第一個裝置，顯示第一個 UVC 無法開啟
    const fallback = deviceProfiles[0];

    if (fallback) {
        selDevice.value = fallback.id;
        applyProfileToState(fallback);
        activeDeviceJvkId = fallback.id;
        setDeviceStatus(fallback, false, false, false);
    }

    serialSetStatusRaw("所有 UVC 都無法開啟");
    return false;
}

async function openSelectedDeviceOnly() {
    const profile = getSelectedProfile();

    if (!profile) {
        showToast(t('toast.nodevice'));
        return false;
    }

    applyProfileToState(profile);

    const result = await openDeviceProfile(profile);

    return result.uvcOk;
}

//----------------------------------------------
// 初始化：一進入頁面 → 拿權限 → enumerate → 自動開 UVC/UAC
//----------------------------------------------
async function initUvcUacOnStartup() {
    if (isQuadFrameMode()) return;

    try {
        const tmp = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });
        tmp.getTracks().forEach(t => t.stop());
    } catch (err) {
        console.warn("[Init] Cannot get default video/audio:", err);
    }

    await sleep(200);

    await refreshDeviceProfiles();

    if (deviceProfiles.length === 0) {
        serialSetStatusRaw("未偵測到 JVK202 裝置");
        clearVideoSettingOptions();
        return;
    }

    await openFirstWorkingDevice(0);

    console.log("[Init] complete");
}

//----------------------------------------------
// 填入 UVC / UAC 選單
//----------------------------------------------
function extractVidPid(label) {
    const m = String(label || "").match(/\(([\da-f]+):([\da-f]+)\)/i);
    return m ? { vid: m[1].toLowerCase(), pid: m[2].toLowerCase() } : null;
}

function extractJvkIdFromLabel(label, prefixChar) {
    const re = new RegExp(`JVK202${prefixChar}([A-Za-z0-9]{8})`, "i");
    const m = String(label || "").match(re);
    return m ? m[1].toUpperCase() : "";
}

function extractUvcJvkId(label) {
    return extractJvkIdFromLabel(label, "V");
}

function extractUacJvkId(label) {
    return extractJvkIdFromLabel(label, "A");
}

function expectedUvcName(id = selectedDeviceJvkId) {
    return id ? `JVK202V${id}` : "";
}

function expectedAudioName(id = selectedDeviceJvkId) {
    return id ? `JVK202A${id}` : "";
}

function expectedComName(id = selectedDeviceJvkId) {
    return id ? `JVK202C${id}` : "";
}

function getSelectedDeviceJvkId() {
    return (selDevice?.value || selectedDeviceJvkId || "").toUpperCase();
}

function isTargetMediaDevice(d) {
    const TARGET_VID = "0711";
    const TARGET_PID = "0401";

    const info = extractVidPid(d.label);
    if (!info) return false;

    return info.vid === TARGET_VID && info.pid === TARGET_PID;
}

function buildDeviceProfilesFromDevices(devices) {
    const cams = devices
        .filter(d => d.kind === "videoinput")
        .filter(isTargetMediaDevice);

    const audios = devices
        .filter(d => d.kind === "audioinput")
        .filter(isTargetMediaDevice);

    const audioByJvkId = new Map();

    for (const a of audios) {
        const id = extractUacJvkId(a.label);
        if (!id) continue;

        audioByJvkId.set(id, a);
    }

    const profiles = [];

    for (const c of cams) {
        const id = extractUvcJvkId(c.label);
        if (!id) continue;

        const audio = audioByJvkId.get(id) || null;

        profiles.push({
            id,
            camDeviceId: c.deviceId,
            camLabel: c.label || "",
            audioDeviceId: audio ? audio.deviceId : null,
            audioLabel: audio ? audio.label || "" : ""
        });
    }

    const filteredProfiles = profiles.filter(isProfileAllowedForThisFrame);

    console.log(
        "[DeviceProfiles] slot =",
        FRAME_SLOT_INDEX || "single",
        "all =",
        profiles.map(p => p.id),
        "allowed =",
        filteredProfiles.map(p => p.id)
    );

    return filteredProfiles;
}

function fillDeviceSelect(profiles, preferId = "", options = {}) {
    const fallbackToFirst = options.fallbackToFirst === true;

    selDevice.innerHTML = "";

    // 永遠保留「請選擇裝置」
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = t('setting.selectDeviceHolder');
    selDevice.appendChild(placeholder);

    for (const p of profiles) {
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.textContent = p.id;
        opt.dataset.camDeviceId = p.camDeviceId;

        if (p.audioDeviceId) {
            opt.dataset.audioDeviceId = p.audioDeviceId;
        }

        selDevice.appendChild(opt);
    }

    if (preferId && profiles.some(p => p.id === preferId)) {
        selDevice.value = preferId;
    } else if (fallbackToFirst && profiles.length > 0) {
        selDevice.value = profiles[0].id;
    } else {
        selDevice.value = "";
    }

    selectedDeviceJvkId = selDevice.value || "";
}

function getSelectedProfile() {
    const id = getSelectedDeviceJvkId();
    return deviceProfiles.find(p => p.id === id) || null;
}

function applyProfileToState(profile) {
    if (!profile) {
        selectedDeviceJvkId = "";
        selectedCamId = null;
        selectedAudioId = null;
        return;
    }

    selectedDeviceJvkId = profile.id;
    selectedCamId = profile.camDeviceId;
    selectedAudioId = profile.audioDeviceId || null;

    if (selDevice) {
        selDevice.value = profile.id;
    }
}

async function refreshDeviceProfiles(preferId = "", options = {}) {
    const devices = await navigator.mediaDevices.enumerateDevices();

    deviceProfiles = buildDeviceProfilesFromDevices(devices);

    fillDeviceSelect(deviceProfiles, preferId, options);

    const profile = getSelectedProfile();
    applyProfileToState(profile);

    console.log("[DeviceProfiles]", deviceProfiles);
    console.log("[DeviceProfiles] selected =", selectedDeviceJvkId);

    return deviceProfiles;
}

function hasAvailableUvc() {
    return !!(deviceProfiles.length > 0 && getSelectedProfile());
}

//----------------------------------------------
// 開啟 UVC (重建 video stream)
//----------------------------------------------
let startUvcBusy = false;
let startUvcGeneration = 0;

function withTimeout(promise, ms, tag = "timeout") {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(tag)), ms);

        promise.then(
            v => {
                clearTimeout(timer);
                resolve(v);
            },
            e => {
                clearTimeout(timer);
                reject(e);
            }
        );
    });
}

async function startUVC(camId, w, h, fps) {
    if (!camId) {
        throw new Error("No camId");
    }

    if (startUvcBusy) {
        throw new Error("startUVC busy");
    }

    startUvcBusy = true;
    const myGen = ++startUvcGeneration;

    try {
        console.log(`[UVC] Opening UVC ${camId} @ ${w}x${h}x${fps}`);

        // 1. 先把舊的完整清掉
        try {
            if (currentStream) {
                currentStream.getTracks().forEach(t => t.stop());
            }
        } catch (e) {}

        try {
            const videoElem = document.getElementById("stream");
            videoElem.srcObject = null;
        } catch (e) {}

        currentStream = null;
        currentTrack = null;

        // 2. 清掉後等一下，讓 browser / driver 緩一口氣
        await sleep(250);

        // 如果中途有更新世代，舊任務作廢
        if (myGen !== startUvcGeneration) {
            console.warn("[UVC] startUVC aborted before open");
            return;
        }

        // 3. 第一階段：先用最寬鬆方式把 device 打開
        const stream = await withTimeout(
            navigator.mediaDevices.getUserMedia({
                video: {
                    deviceId: { exact: camId }
                },
                audio: false
            }),
            3000,
            "startUVC open timeout"
        );

        if (myGen !== startUvcGeneration) {
            try {
                stream.getTracks().forEach(t => t.stop());
            } catch (e) {}
            console.warn("[UVC] startUVC aborted after open");
            return;
        }

        const track = stream.getVideoTracks()[0];
        if (!track) {
            try {
                stream.getTracks().forEach(t => t.stop());
            } catch (e) {}
            throw new Error("No video track");
        }

        // 4. 第二階段：再套參數
        try {
            await withTimeout(
                track.applyConstraints({
                    width: { exact: w },
                    height: { exact: h },
                    frameRate: { ideal: fps }
                }),
                2000,
                "applyConstraints timeout"
            );
        } catch (err) {
            console.warn("[UVC] applyConstraints failed, keep opened stream:", err);
        }

        if (myGen !== startUvcGeneration) {
            try {
                stream.getTracks().forEach(t => t.stop());
            } catch (e) {}
            console.warn("[UVC] startUVC aborted before bind");
            return;
        }

        // 5. 最後才綁到畫面與全域狀態
        const videoElem = document.getElementById("stream");
        videoElem.srcObject = stream;

        currentStream = stream;
        currentTrack = track;

        const boundTrack = track;

        boundTrack.addEventListener("ended", () => {
            if (boundTrack !== currentTrack) return;

            console.warn("[UVC] track ended");
            handleActiveUvcEnded("track ended");
        });

        boundTrack.addEventListener("mute", () => {
            if (boundTrack !== currentTrack) return;

            console.warn("[UVC] track muted");
            // 先只 log，不跳設定頁
        });

        boundTrack.addEventListener("unmute", () => {
            if (boundTrack !== currentTrack) return;

            console.warn("[UVC] track unmuted");
        });

        //await fillResolutionAndFpsFromTrack(currentTrack);
        resizeVideo();

        console.log("[UVC] startUVC success");
    } finally {
        if (myGen === startUvcGeneration) {
            startUvcBusy = false;
        }
    }
}

async function stopCurrentMediaSafely() {
    // 停 video
    try {
        if (currentStream) {
            currentStream.getTracks().forEach(t => t.stop());
        }
    } catch (e) {}

    currentStream = null;
    currentTrack = null;

    try {
        video.srcObject = null;
    } catch (e) {}

    // 停 audio
    try {
        const astream = audioElem.srcObject;
        if (astream && typeof astream.getTracks === "function") {
            astream.getTracks().forEach(t => t.stop());
        }
    } catch (e) {}

    try {
        audioElem.srcObject = null;
    } catch (e) {}
}

let handlingUvcEnded = false;

async function handleActiveUvcEnded(reason = "uvc ended") {
    if (handlingUvcEnded) return;
    handlingUvcEnded = true;

    try {
        resetMouseTransportState(reason);

        console.warn("[UVC] active UVC ended:", reason);

        await stopCurrentMediaSafely();

        try {
            await closeSerialSafely("active UVC ended");
        } catch (e) {}

        activeDeviceJvkId = "";
        selectedDeviceJvkId = "";
        selectedCamId = null;
        selectedAudioId = null;
        currentComJvkId = "";

        if (selDevice) {
            selDevice.value = "";
        }

        clearDeviceStatus();
        clearFpsChart();
        clearVideoSettingOptions();
        clearKeyboardMouseStatus();

        try {
            setAudioMuteState(true);
        } catch (e) {}

        showSettingsModal();
        resizeVideo();

    } finally {
        handlingUvcEnded = false;
    }
}

//----------------------------------------------
//
//----------------------------------------------
async function refreshAllDevicesAndReopen() {
    clearDeviceStatus();

    await stopCurrentMediaSafely();

    activeDeviceJvkId = "";
    selectedDeviceJvkId = "";
    selectedCamId = null;
    selectedAudioId = null;
    currentComJvkId = "";

    clearFpsChart();
    clearVideoSettingOptions();
    clearKeyboardMouseStatus();
    
    try {
        setAudioMuteState(true);
    } catch (e) {}
    selDevice.innerHTML = "";

    await sleep(1000);

    await refreshDeviceProfiles();

    if (deviceProfiles.length === 0) {
        await handleUvcMissing();
        serialSetStatusRaw("未偵測到 JVK202 裝置");
        return;
    }

    //await openFirstWorkingDevice(0);

    resizeVideo();
}

async function handleUvcMissing() {
    clearDeviceStatus();

    console.warn("[UVC] active UVC missing, return to settings");

    // 先退出各種模式
    await exitAllVideoModesOnUvcMissing();

    try {
        if (currentStream) {
            currentStream.getTracks().forEach(t => t.stop());
        }
    } catch (e) {}

    currentStream = null;
    currentTrack = null;
    selectedCamId = null;
    selectedAudioId = null;
    activeDeviceJvkId = "";

    try {
        video.srcObject = null;
    } catch (e) {}

    clearFpsChart();
    clearVideoSettingOptions();
    clearKeyboardMouseStatus();

    showSettingsModal();
    //setAudioMuteState(true);    // Set mute

    resizeVideo();
}

//----------------------------------------------
// UVC change event
//----------------------------------------------
let refreshDeviceLockTimer = null;
let refreshDeviceLocked = false;

let deviceChangeTimer = null;

if (!isQuadFrameMode()) {
    navigator.mediaDevices.addEventListener("devicechange", () => {
        console.log("");
        console.log("[Media] devicechange");

        lockRefreshButtonForMs(1500);

        if (deviceChangeTimer) {
            clearTimeout(deviceChangeTimer);
            deviceChangeTimer = null;
        }

        deviceChangeTimer = setTimeout(async () => {
            try {
                await refreshDeviceProfiles(getSelectedDeviceJvkId(), {
                    fallbackToFirst: false
                });

                console.log("[Media] device list updated only");
            } catch (err) {
                console.warn("[Media] device list update failed:", err);
            } finally {
                deviceChangeTimer = null;
            }
        }, 5000);
    });
} else {
    console.log("[Media] Quad iframe mode: devicechange is handled by parent page");
}

//----------------------------------------------
// 開啟 UAC
//----------------------------------------------
async function startUAC(audioId) {
    console.log(`Opening UAC ${audioId}`);

    const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
            deviceId: { exact: audioId },
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false
        },
        video: false
    });

    audioElem.srcObject = audioStream;

    // 每次重新開到音訊裝置，都回到預設 unmute
    setAudioMuteState(false);   //Set unmute

    try {
        await audioElem.play();
    } catch (err) {
        console.warn("[Audio] play failed:", err);
    }
}

//----------------------------------------------
// 設定頁按下「確定」 → 套用新的參數
//----------------------------------------------
let applySettingsBusy = false;

document.getElementById("btn-apply-settings").addEventListener("click", async () => {
    saveAllCurrentDeviceSettings();
    hideSettingsModal();

    try {
        await sendKeyboardReleaseAll("enter main page");
    } catch (e) {}

    video.focus();

    if (!isComPortOpened()) {
        showToast(t('toast.nocomport'));
    } else {
        await HID_send_get_para();
    }
});

//----------------------------------------------
// 設定頁按下「恢復預設」 → 套用新的參數
//----------------------------------------------
document.getElementById("btn-reset-default-settings")?.addEventListener("click", async () => {
    await resetSingleCurrentDeviceSettingsToDefault();
});

//----------------------------------------------
// 設定頁按下「返回首頁」 → 套用新的參數
//----------------------------------------------
document.getElementById("btn-back-to-homepage")?.addEventListener("click", async () => {
    if (window.electronSerial)
        await window.electronAppMode.backToModeSelect();
    else
        window.location.href = "https://chingoliu.github.io/webkvm-quad/";
});

//----------------------------------------------
// 設定頁按下「重新整理」 → 套用新的參數
//----------------------------------------------
function openSelectDropdown(selectEl) {
    if (!selectEl) return;

    selectEl.focus({ preventScroll: true });

    // Chrome / Edge / Electron Chromium 新版可用
    if (typeof selectEl.showPicker === "function") {
        try {
            selectEl.showPicker();
            return;
        } catch (err) {
            console.warn("[Select] showPicker failed:", err);
        }
    }

    // fallback：通常只會 focus，不一定真的展開
    try {
        selectEl.click();
    } catch (err) {
        console.warn("[Select] click fallback failed:", err);
    }
}

document.getElementById("btn-refresh-devices").addEventListener("click", async () => {
    const btn = document.getElementById("btn-refresh-devices");

    if (refreshDeviceLocked) {
        showToast(t('toast.refresh_busy'));
        console.warn("[Settings] refresh blocked: waiting for devicechange settle");
        return;
    }

    try {
        btn.disabled = true;
        await refreshAllDevicesAndReopen();
    } catch (err) {
        console.warn("[Settings] refresh devices failed:", err);
        showToast(t('toast.refresh_fail'));
    } finally {
        btn.disabled = false;

        // 嘗試自動展開裝置選單，讓使用者知道可以選擇裝置了，暫時沒用到
        /*
        const selDevice = document.getElementById("selDevice");

        requestAnimationFrame(() => {
            openSelectDropdown(selDevice);
        });
        */
    }
});

function setRefreshButtonLocked(flag) {
    const btn = document.getElementById("btn-refresh-devices");
    if (!btn) return;

    refreshDeviceLocked = !!flag;
    btn.disabled = !!flag;

    if (flag) {
        btn.classList.add("disabled");
    } else {
        btn.classList.remove("disabled");
    }
}

function lockRefreshButtonForMs(ms = 5000) {
    if (refreshDeviceLockTimer) {
        clearTimeout(refreshDeviceLockTimer);
        refreshDeviceLockTimer = null;
    }

    setRefreshButtonLocked(true);

    refreshDeviceLockTimer = setTimeout(() => {
        setRefreshButtonLocked(false);
        refreshDeviceLockTimer = null;
    }, ms);
}

//----------------------------------------------
// 套用 UVC 設定
//----------------------------------------------
async function applyUvcSettings() {
    const profile = getSelectedProfile();

    if (!profile) {
        throw new Error("No selected device profile");
    }

    selectedCamId = profile.camDeviceId;

    const w = selectedWidth;
    const h = selectedHeight;
    const fps = selectedFps;

    const trackDead =
        !currentStream ||
        currentStream.active === false ||
        !currentTrack ||
        currentTrack.readyState === "ended";

    if (trackDead) {
        console.log("[UVC] track dead → reopen current profile");
        await startUVC(selectedCamId, w, h, fps);
        return;
    }

    console.log("[UVC] applyConstraints:", w, h, fps);

    try {
        await currentTrack.applyConstraints({
            width: { exact: w },
            height: { exact: h },
            frameRate: { ideal: fps }
        });
    } catch (err) {
        console.warn("[UVC] applyConstraints failed → reopen", err);
        await startUVC(selectedCamId, w, h, fps);
    }
}

selResolution.addEventListener("change", async () => {
    applyResolutionSelectToState();
    saveCurrentDeviceSetting("resolution", selResolution.value);
    await applyUvcSettings();
    resizeVideo();
});

selFramerate.addEventListener("change", async () => {
    applyFramerateSelectToState();
    saveCurrentDeviceSetting("framerate", selFramerate.value);
    await applyUvcSettings();
});

//selCam.addEventListener("change", async () => {
//    selectedCamId = selCam.value;
//    await applyUvcSettings();
//});

selDevice.addEventListener("change", async () => {
    clearDeviceStatus();
    clearFpsChart();

    //const id = getSelectedDeviceJvkId();
    const id = selDevice.value;

    if (!id) {
        await stopCurrentMediaSafely();

        try {
            await closeSerialSafely("select placeholder");
        } catch (e) {}

        activeDeviceJvkId = "";
        selectedDeviceJvkId = "";
        selectedCamId = null;
        selectedAudioId = null;
        currentComJvkId = "";

        clearVideoSettingOptions();
        clearKeyboardMouseStatus();

        try {
            setAudioMuteState(true);
        } catch (e) {}

        resizeVideo();
        return;
    }

    try {
        await openSelectedDeviceOnly();
    } catch (err) {
        console.warn("[Device] select change failed:", err);
        showToast(t('toast.nodevice'));
    }
});

//==================================================================================
// Quad parent API
// index.html 會直接呼叫這兩個 API 控制 iframe 開啟/關閉指定裝置。
//==================================================================================
window.quadSelectDevice = async function (jvkId) {
    jvkId = String(jvkId || "").trim().toUpperCase();

    if (!jvkId) {
        return false;
    }

    if (!isDeviceIdAllowedForThisFrame(jvkId)) {
        console.warn("[QuadAPI] jvkId is not allowed for this frame:", {
            slot: FRAME_SLOT_INDEX,
            jvkId
        });
        return false;
    }

    try {
        await refreshDeviceProfiles(jvkId, {
            fallbackToFirst: false
        });

        const profile = deviceProfiles.find(p => p.id === jvkId) || null;

        if (!profile) {
            console.warn("[QuadAPI] profile not found:", jvkId);
            return false;
        }

        selDevice.value = jvkId;
        applyProfileToState(profile);

        const result = await openDeviceProfile(profile);
        return !!result.uvcOk;
    } catch (err) {
        console.warn("[QuadAPI] quadSelectDevice failed:", err);
        return false;
    }
};

window.quadStopDevice = async function (reason = "") {
    try {
        console.warn("[QuadAPI] stop device:", reason);

        clearDeviceStatus();
        clearFpsChart();

        await stopCurrentMediaSafely();

        try {
            await closeSerialSafely(reason || "quad parent stop");
        } catch (e) {}

        activeDeviceJvkId = "";
        selectedDeviceJvkId = "";
        selectedCamId = null;
        selectedAudioId = null;
        currentComJvkId = "";

        if (selDevice) {
            selDevice.value = "";
        }

        clearVideoSettingOptions();
        clearKeyboardMouseStatus();

        try {
            setAudioMuteState(true);
        } catch (e) {}

        resizeVideo();
        return true;
    } catch (err) {
        console.warn("[QuadAPI] quadStopDevice failed:", err);
        return false;
    }
};

window.quadApplySettingsConfirm = async function () {
    try {
        // Quad 模式下，設定儲存由 parent index.html 負責
        // 單機版才由自己儲存
        if (!isQuadFrameMode()) {
            saveAllCurrentDeviceSettings();
        }

        hideSettingsModal();

        try {
            await sendKeyboardReleaseAll("quad settings confirm");
        } catch (e) {}

        video.focus();

        // 沒有選裝置時不要跳 toast
        // 避免 Quad 還沒選 group 時，四個 iframe 同時跳提示
        if (!getSelectedDeviceJvkId()) {
            return {
                ok: true,
                skipped: true,
                reason: "no selected device"
            };
        }

        if (!isComPortOpened()) {
            showToast(t('toast.nocomport'));

            return {
                ok: false,
                reason: "no comport"
            };
        }

        const hidOk = await HID_send_get_para();

        return {
            ok: hidOk !== false,
            reason: hidOk === false ? "hid parameter mismatch" : ""
        };

    } catch (err) {
        console.warn("[QuadAPI] quadApplySettingsConfirm failed:", err);

        return {
            ok: false,
            reason: String(err && err.message ? err.message : err)
        };
    }
};

//----------------------------------------------
// 依照能力填入 Resolution / FPS 選單
//----------------------------------------------
async function fillResolutionAndFps(camId) {
    const tmp = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: camId } }
    });

    const track = tmp.getVideoTracks()[0];
    const caps = track.getCapabilities();
    track.stop();

    fillResolutionAndFpsFromCapabilities(caps);
}

function fillResolutionAndFpsFromCapabilities(caps) {
    selResolution.innerHTML = "";
    selFramerate.innerHTML = "";

    const commonRes = [
        [3840, 2160],
        [2560, 1440],
        [1920, 1080],
        [1280, 720],
        [640, 480]
    ];

    for (const [w, h] of commonRes) {
        if (w <= caps.width.max && w >= caps.width.min &&
            h <= caps.height.max && h >= caps.height.min) {

            const opt = document.createElement("option");
            opt.value = `${w}x${h}`;
            opt.textContent = `${w} × ${h}`;
            selResolution.appendChild(opt);
        }
    }

    const S = settingsApi();
    if (!S || !S.applySelectValue(selResolution, "1920x1080", null)) {
        if (selResolution.options.length > 0) selResolution.selectedIndex = 0;
    }
    applyResolutionSelectToState();

    const fpsList = [60, 30, 24];
    for (const fps of fpsList) {
        if (fps >= caps.frameRate.min && fps <= caps.frameRate.max) {
            const opt = document.createElement("option");
            opt.value = String(fps);
            opt.textContent = `${fps} fps`;
            selFramerate.appendChild(opt);
        }
    }

    if (!S || !S.applySelectValue(selFramerate, "60", null)) {
        if (selFramerate.options.length > 0) selFramerate.selectedIndex = 0;
    }
    applyFramerateSelectToState();

    ensureDeviceSettingOptionsFilled();
}

async function fillResolutionAndFpsFromTrack(track) {
    const caps = track.getCapabilities();
    fillResolutionAndFpsFromCapabilities(caps);
}

function clearVideoSettingOptions() {
    const ids = [
        "selResolution",
        "selFramerate",
        "selRotate",
        "id_select_mouse_report_mode",
        "id_select_relative_mouse_speed",
        "id_select_scrollspeed",
        "id_select_direction"
    ];

    for (const id of ids) {
        const el = document.getElementById(id);
        if (el) el.innerHTML = "";
    }

    selectedWidth = 1920;
    selectedHeight = 1080;
    selectedFps = 60;
    selectedRotate = 0;
    currentRotate = 0;
}

//----------------------------------------------
// 套用 UAC 設定
//----------------------------------------------
async function applyAudioSettings() {
    const profile = getSelectedProfile();

    if (!profile) {
        setAudioMuteState(true);
        return false;
    }

    return await openAudioForProfile(profile);
}

//----------------------------------------------
// 設定按鈕 → 開啟設定頁
//----------------------------------------------
/*
document.getElementById("openSettingsBtn").addEventListener("click", async () => {
    showSettingsModal();

    try {
        await refreshDeviceProfiles(selectedDeviceJvkId || activeDeviceJvkId);
    } catch (err) {
        console.warn("[Settings] refresh list failed:", err);
    }
});
*/
document.getElementById("openSettingsBtn").addEventListener("click", async () => {
    // Quad iframe 模式下，不開啟 iframe 自己的設定頁
    // 改成通知父層 index.html 開啟 Quad 設定頁
    if (isQuadFrameMode()) {
        try {
            keyboardLockOff();
            window.parent.postMessage({
                type: "quad_open_settings",
                slot: FRAME_SLOT_INDEX
            }, "*");
        } catch (e) {
            console.warn("[QUAD_CHILD] request open parent settings failed:", e);
        }

        return;
    }

    // 單機模式維持原本行為
    showSettingsModal();

    try {
        await refreshDeviceProfiles(selectedDeviceJvkId || activeDeviceJvkId);
    } catch (err) {
        console.warn("[Settings] refresh list failed:", err);
    }
});

function showSettingsModal() {
    if (isQuadFrameMode()) {
        hideSettingsModal();
        return;
    }
    
    serialModal.style.display = "flex";
    serialModal.focus();
}

function hideSettingsModal() {
    serialModal.style.display = "none";
}

//----------------------------------------------
// COM Port 按鈕 → 開啟 COM Port 選擇
//----------------------------------------------
btnChoosePort.addEventListener("click", chooseMatchingComPortForCurrentDevice);

async function chooseMatchingComPortForCurrentDevice() {
    try {
        const uvcId = getSelectedDeviceJvkId();
        if (!uvcId) {
            if (deviceStatusEl) deviceStatusEl.textContent = "未取得裝置識別碼";
            return;
        }

        const expectedName = expectedComName(uvcId);

        if (window.electronSerial) {
            window.electronSerial.setInteractive(true);
        }

        const port = await navigator.serial.requestPort({
            filters: SERIAL_ALLOWED_DEVICES
        });

        await closeSerialSafely("manual choose before probe");

        const comId = await readComJvkIdFromPort(port, 1500);

        if (comId !== uvcId) {
            currentComJvkId = "";
            showToast(`${t('toast.comport_not_compatible')} ${expectedName}`);

            const profile = getSelectedProfile();
            setDeviceStatus(profile, !!profile?.audioDeviceId, false);
            return;
        }

        currentComJvkId = comId;

        await serialOpenWithoutModal(port);

        const profile = getSelectedProfile();
        setDeviceStatus(profile, !!profile?.audioDeviceId, true);

    } catch (err) {
        if (err && err.name === "NotFoundError") {
            console.log("[Serial] User cancelled COM device selection");
            return;
        }

        console.error("[Serial] requestPort/open error:", err);

        const profile = getSelectedProfile();
        setDeviceStatus(profile, !!profile?.audioDeviceId, false);
    } finally {
        if (window.electronSerial) {
            window.electronSerial.setInteractive(false);
        }
    }
}

window.quadChooseMatchingComPort = async function () {
    try {
        await chooseMatchingComPortForCurrentDevice();

        return !!(
            isComPortOpened() &&
            currentComJvkId &&
            currentComJvkId === getSelectedDeviceJvkId()
        );
    } catch (err) {
        console.warn("[QuadAPI] quadChooseMatchingComPort failed:", err);
        return false;
    }
};

function updateActiveSerialStatus(port) {
    const info = port.getInfo();

    const vid = info.usbVendorId?.toString(16).padStart(4, "0");
    const pid = info.usbProductId?.toString(16).padStart(4, "0");

    const product = info.usbProductName || "";
    const manu = info.usbManufacturerName || "";

    // 優先顯示產品名稱，其次顯示VID/PID
    let name = product || manu || `VID=${vid} PID=${pid}`;

    serialSetStatusKey('serial.opened', name);
}

async function serialOpenWithoutModal(port) {
    try {
        if (!port) return;

        if (serialPort === port && serialPort.readable && serialWriter) {
            console.log("[Serial] same port already opened");
            updateActiveSerialStatus(port);
            return;
        }

        serialPort = port;

        if (!port.readable) {
            await port.open({ baudRate: 3000000 });
        }

        if (!serialWriter) {
            serialWriter = port.writable.getWriter();
        }

        resetMouseTransportState("serial opened");

        if (!serialReadLoopRunning) {
            startSerialReadLoop();
        }

        updateActiveSerialStatus(port);

        await sendKeyboardReleaseAll("serial open");
    } catch (err) {
        console.error("[Serial] serialOpenWithoutModal failed:", err);
        await closeSerialSafely("open_failed");
    }
}

//==================================================================================ComPort
const SERIAL_ALLOWED_DEVICES = [
    { usbVendorId: 0x0711, usbProductId: 0x0400 },
    //{ usbVendorId: 0x1A86, usbProductId: 0x55D3 },
];

let serialWriter = null;
let serialReader = null;

let serialStatusKey = null;
let serialStatusVars = "";

let serialClosing = false;
let serialMonitorTimer = null;

let serialReadLoopRunning = false;
let serialReadLoopToken = 0;

function serialSetStatus(msg) {
    if (serialStatusEl) serialStatusEl.textContent = msg;
}

function serialSetStatusKey(key, vars = "") {
    serialStatusKey = key;
    serialStatusVars = vars;
    serialSetStatus(t(key) + vars);
}

function serialIsSupported() {
    return ("serial" in navigator);
}

function serialIsAllowed(info) {
    return SERIAL_ALLOWED_DEVICES.some(d =>
        d.usbVendorId === info.usbVendorId &&
        d.usbProductId === info.usbProductId
    );
}

let rxBuffer = new Uint8Array(0);
function handleSerialData(newBytes) {
    rxBuffer = concatUint8(rxBuffer, newBytes);

    while (true) {
        const pkt = tryParseOnePacket(rxBuffer);
        if (!pkt) break;

        const { packet, length } = pkt;

        // 移除用掉的 bytes
        rxBuffer = rxBuffer.slice(length);

        if (packet) {
            processPacket(packet);
        }
    }
}

function tryParseOnePacket(buf) {
    // 尋找頭
    const HEADER = [0x57, 0xAB, 0x00];

    let start = -1;
    const bufLen = buf.length;

    // 快速搜尋 header
    for (let i = 0; i <= bufLen - 3; i++) {
        if (buf[i] === 0x57 && buf[i + 1] === 0xAB && buf[i + 2] === 0x00) {
            start = i;
            break;
        }
    }

    if (start < 0) {
        // 連頭都沒有 → 清空全部
        return null;
    }

    // 若 header 不在最前面 → 直接把垃圾清掉
    if (start > 0) {
        return { packet: null, length: start };
    }

    // buf[0]=57, buf[1]=AB, buf[2]=00
    if (bufLen < 5) return null;

    const cmd = buf[3];
    const dataLen = buf[4];

    const totalLen = 3 + 1 + 1 + dataLen + 1; // Header + CMD + LEN + DATA + CHK

    if (bufLen < totalLen) return null;

    const packet = buf.slice(0, totalLen);

    // checksum
    let sum = 0;
    for (let i = 0; i < totalLen - 1; i++) sum += packet[i];
    sum &= 0xFF;

    if (sum !== packet[totalLen - 1]) {
        console.warn("Checksum mismatch, fast-skip to next header");
        // checksum 錯 → 找下一個 header（整包跳掉，直接 resync）
        return { packet: null, length: 1 };
    }

    return {
        packet,
        length: totalLen
    };
}

function concatUint8(a, b) {
    const c = new Uint8Array(a.length + b.length);
    c.set(a, 0);
    c.set(b, a.length);
    return c;
}

function processPacket(pkt) {
    const cmd = pkt[3];
    const len = pkt[4];
    const data = pkt.slice(5, 5 + len);
    /*
    console.log("RX Packet:",
        "CMD=0x" + cmd.toString(16),
        "LEN=", len,
        "DATA=", data
    );
    */
    switch (cmd) {
        case 0x81:
            // ...
            //console.log("cmd 0x81", data);
            keyboardLed.num = data[2] & 0x01;
            keyboardLed.caps = data[2] & 0x02;
            keyboardLed.scroll = data[2] & 0x04;
            setKeyboardLEDs(keyboardLed);

            usb_connection = data[1] & 0x01;
            //if( data[3]==0x00 ) usb_connection = 1;
            //else usb_connection = 0;

            if (usb_connection != usb_last_connection) {
                usb_last_connection = usb_connection + 10;

                if (usb_connection) {
                    document.getElementById("id_button_keyboard_status").classList.add("active");               //鍵盤橘色框
                    if (isKeyboardControl) updateKeyboardStatusIcon(keyboard_status_icon, 1);                   //鍵盤綠色ICON
                    document.getElementById("id_button_mouse_status").classList.add("active");                  //滑鼠橘色框
                    if (isMouseControl && checkMouseStatusIcon()) updateMouseStatusIcon(Mouse_status_icon, 0);  //滑鼠綠色ICON
                }
                else {
                    document.getElementById("id_button_keyboard_status").classList.remove("active");
                    updateKeyboardStatusIcon(keyboard_status_icon, 0);
                    document.getElementById("id_button_mouse_status").classList.remove("active");
                    updateMouseStatusIcon(Mouse_status_icon, 8);
                }
            }
            break;
        case 0x82:
            break;
        case 0x83:
            break;
        case 0x84:
            //console.log("cmd84");
            //sendMouseFedback = true;
            onMouseFeedback();
            break;
        case 0x85:
            //sendMouseFedback = true;
            onMouseFeedback();
            break;
        case 0x88:
            IsCH9323Configured = uint8ArrayEqual(data, CH9323_EXPECTED_PARA);
            if (!IsCH9323Configured) {
                console.warn("[CH9323] parameter mismatch:", data);
            }
            //console.log("cmd88", data);
            break;
        case 0xC8:
            IsCH9323Configured = false;
            //console.log("cmdC8", data);
            break;
        default:
            console.warn("Unknown CMD:", cmd);
            break;
    }
}

async function startSerialReadLoop() {
    if (!serialPort || !serialPort.readable) {
        console.warn("[Serial] No readable serial port.");
        return;
    }

    if (serialReadLoopRunning) {
        console.warn("[Serial] Read loop already running, skip.");
        return;
    }

    serialReadLoopRunning = true;
    const myToken = ++serialReadLoopToken;

    let reader = null;

    try {
        reader = serialPort.readable.getReader();
        serialReader = reader;

        console.log("[Serial] Read loop started. token =", myToken);

        while (true) {
            const { value, done } = await reader.read();

            // 如果這個 loop 已經不是最新那個，就自己退出
            if (myToken !== serialReadLoopToken) {
                console.warn("[Serial] stale read loop detected, exit. token =", myToken);
                break;
            }

            if (done) {
                console.warn("[Serial] reader done. token =", myToken);
                break;
            }

            if (value && value.length > 0) {
                handleSerialData(value);
            }
        }
    } catch (err) {
        console.warn("[Serial] Read loop error:", err);
    } finally {
        try {
            if (reader) reader.releaseLock();
        } catch (e) {}

        if (serialReader === reader) {
            serialReader = null;
        }

        // 只有自己還是最新 loop 時，才清 running
        if (myToken === serialReadLoopToken) {
            serialReadLoopRunning = false;
        }

        console.warn("[Serial] Read loop ended. token =", myToken);
    }
}

// 對外提供一個簡單的寫入函式：你之後可在任何地方呼叫 window.serialWrite("ABC\r\n")
window.serialWrite = async function (data) {
    if (!serialWriter) {
        console.warn("[Serial] COM port is not connected, cannot send data");
        return;
    }

    try {
        let buf;
        if (data instanceof Uint8Array || data instanceof ArrayBuffer) {
            buf = data instanceof Uint8Array ? data : new Uint8Array(data);
        } else if (typeof data === "string") {
            buf = new TextEncoder().encode(data);
        } else {
            throw new Error("serialWrite only accepts string or Uint8Array / ArrayBuffer");
        }
        await serialWriter.write(buf);
    } catch (e) {
        console.error("[Serial] write error:", e);
    }
};

// 如需要之後也可以補一個關閉函式：
window.serialClose = async function () {
    try {
        if (serialWriter) {
            await serialWriter.close?.();
            serialWriter.releaseLock();
            serialWriter = null;
        }
        if (serialPort) {
            await serialPort.close();
            serialPort = null;
        }
        console.log("[Serial] COM port closed");
    } catch (e) {
        console.error("[Serial] close error:", e);
    }
};

async function closeSerialSafely(reason = "") {
    if (serialClosing) return;
    serialClosing = true;

    try {
        console.warn("[Serial] closing...", reason);

        // 讓所有舊 read loop token 失效
        serialReadLoopToken++;

        if (serialReader) {
            try { await serialReader.cancel(); } catch (e) {}
            try { serialReader.releaseLock(); } catch (e) {}
            serialReader = null;
        }

        serialReadLoopRunning = false;

        if (serialWriter) {
            try { serialWriter.releaseLock(); } catch (e) {}
            serialWriter = null;
        }

        if (serialPort) {
            try { await serialPort.close(); } catch (e) {}
            serialPort = null;
        }

        rxBuffer = new Uint8Array(0);
        resetMouseTransportState("serial closed");
    } catch (e) {
        console.error("[Serial] closeSerialSafely error:", e);
    } finally {
        serialClosing = false;
    }
}

function isComPortOpened() {
    return !!(
        serialPort &&
        serialPort.readable &&
        serialWriter &&
        !serialClosing
    );
}

//==================================================================================HID_932X
let keyboardLed = { num: 0, caps: 0, scroll: 0 };
let lastKeyDisplayCode = null;  // 記住目前顯示的是哪一顆鍵
const pressedNormalKeys = new Map();     // code -> HID usage
const pressedModifierCodes = new Set();  // ControlLeft / ShiftLeft / ...

let IsCH9323Configured = false;
const CH9323_EXPECTED_PARA = new Uint8Array([
    0x02, 0x80, 0x00, 0x00, 0x2D, 0xC6, 0xC0, 0x00,
    0x00, 0x00, 0x00, 0x11, 0x07, 0x04, 0x02, 0x00,
    0x00, 0x00, 0x01, 0x00, 0x0D, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x87, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00
]);

function uint8ArrayEqual(a, b) {
    if (!a || !b) return false;
    if (a.length !== b.length) return false;

    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }

    return true;
}

async function HID_send_get_info() {
    if (!serialWriter) return;   //沒連線就不要送

    const pkt = new Uint8Array([0x57, 0xAB, 0x00, 0x01, 0x00, 0x03]);
    try {
        await serialWriter.write(pkt);
    } catch (e) {
        console.error("[Serial] write error:", e);
    }
}

async function HID_send_get_para() {
    if (!serialWriter) return null;   // 沒連線就不要送

    const pkt = new Uint8Array([0x57, 0xAB, 0x00, 0x08, 0x00, 0x0A]);

    try {
        IsCH9323Configured = false;

        await serialWriter.write(pkt);

        // 等待 processPacket() 收到 0x88 或 0xC8
        await sleep(200);

        if (IsCH9323Configured === false) {
            showToast(t('toast.hid_not_configured'));
            return false;
        }

        return true;
    } catch (e) {
        console.error("[Serial] write error:", e);
        return false;
    }
}

setInterval(() => {
    HID_send_get_info();
    //console.log("mouse:", dbgMouseSent);
    //dbgMouseSent = 0;
}, 1000);

function HID_send_para() {
    const buf = new Uint8Array([0x57, 0xAB, 0x00, 0x88, 0x32,
        0x80,
        0x80,
        0x00,
        0x00, 0x01, 0xC2, 0x00,
        0x08, 0x00,
        0x00, 0x03, 0x86, 0x1A, 0x29, 0xE1, 0x00, 0x00, 0x00, 0x01,
        0x00, 0x0D, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x24]);

    let xx = 0;
    let sum = 0;
    for (let i = 0; i < 55; i++) {
        sum += buf[i];
    }
    buf[55] = sum & 0xFF;

    serialWriter.write(buf);
}

// 協議常數
const HID_HEAD1 = 0x57;
const HID_HEAD2 = 0xAB;
const HID_ADDR = 0x00;
const HID_CMD_KEYBOARD = 0x02;      // 發鍵盤的CMD
const HID_CMD_MEDIAKEY = 0x03;      // 發媒體鍵的CMD
const HID_CMD_MOUSE_ABS = 0x04;     // 發滑鼠絕對座標的CMD
const HID_CMD_MOUSE_REL = 0x05;     // 發滑鼠相對座標的CMD
const HID_REPORT_LEN = 0x08;        // 後續 8 bytes: [mod, reserved, key1..key6]

async function sendMediaKeyToHost(payload) {
    if (serialWriter) {
        if (payload.usage === 0x30) {
            const pkt = new Uint8Array(2 + 1 + 1 + 1 + 2 + 1);

            pkt[0] = HID_HEAD1;
            pkt[1] = HID_HEAD2;
            pkt[2] = HID_ADDR;
            pkt[3] = HID_CMD_MEDIAKEY;
            pkt[4] = 2;
            pkt[5] = 0x01;
            pkt[6] = 0x01;

            // 計算累加和（所有前面 byte 相加取低 8 bit）
            let sum = 0;
            for (let i = 0; i < pkt.length - 1; i++) {
                sum += pkt[i];
            }
            pkt[pkt.length - 1] = sum & 0xFF;

            try {
                await serialWriter.write(pkt);
            } catch (e) {
                console.error("[Serial] write error:", e);
            }
        }
        else {
            const pkt = new Uint8Array(2 + 1 + 1 + 1 + 4 + 1);

            pkt[0] = HID_HEAD1;
            pkt[1] = HID_HEAD2;
            pkt[2] = HID_ADDR;
            pkt[3] = HID_CMD_MEDIAKEY;
            pkt[4] = 4;
            pkt[5] = 0x02;
            pkt[6] = (payload.usage >> 8) & 0xFF;
            pkt[7] = payload.usage & 0xFF;
            pkt[8] = 0x00;

            // 計算累加和（所有前面 byte 相加取低 8 bit）
            let sum = 0;
            for (let i = 0; i < pkt.length - 1; i++) {
                sum += pkt[i];
            }
            pkt[pkt.length - 1] = sum & 0xFF;

            try {
                await serialWriter.write(pkt);
            } catch (e) {
                console.error("[Serial] write error:", e);
            }
        }
    }
}

// 把 KeyboardEvent.code 轉成 HID usage（key1 欄位），沒有對應就回 null
function hidUsageFromCode(code) {
    if (!code) return null;

    // A~Z
    if (/^Key[A-Z]$/.test(code)) {
        const ch = code.charCodeAt(3); // 'A'..'Z'
        return 0x04 + (ch - 65);       // 0x04 = A, 0x05 = B, ...
    }

    // 數字 1~9,0
    if (/^Digit[0-9]$/.test(code)) {
        const d = code[5];
        if (d === "0") return 0x27;
        return 0x1E + (parseInt(d, 10) - 1); // 1→0x1E
    }

    switch (code) {
        case "Enter": return 0x28;
        case "Escape": return 0x29;
        case "Backspace": return 0x2A;
        case "Tab": return 0x2B;
        case "Space": return 0x2C;
        case "Minus": return 0x2D;
        case "Equal": return 0x2E;
        case "BracketLeft": return 0x2F;
        case "BracketRight": return 0x30;
        case "Backslash": return 0x31;
        case "Semicolon": return 0x33;
        case "Quote": return 0x34;
        case "Backquote": return 0x35;
        case "Comma": return 0x36;
        case "Period": return 0x37;
        case "Slash": return 0x38;
        case "CapsLock": return 0x39;

        case "F1": return 0x3A;
        case "F2": return 0x3B;
        case "F3": return 0x3C;
        case "F4": return 0x3D;
        case "F5": return 0x3E;
        case "F6": return 0x3F;
        case "F7": return 0x40;
        case "F8": return 0x41;
        case "F9": return 0x42;
        case "F10": return 0x43;
        case "F11": return 0x44;
        case "F12": return 0x45;

        case "PrintScreen": return 0x46;
        case "ScrollLock": return 0x47;
        case "Pause": return 0x48;
        case "Insert": return 0x49;
        case "Home": return 0x4A;
        case "PageUp": return 0x4B;
        case "Delete": return 0x4C;
        case "End": return 0x4D;
        case "PageDown": return 0x4E;
        case "ArrowRight": return 0x4F;
        case "ArrowLeft": return 0x50;
        case "ArrowDown": return 0x51;
        case "ArrowUp": return 0x52;

        case "NumLock": return 0x53;
        case "NumpadDivide": return 0x54;
        case "NumpadMultiply": return 0x55;
        case "NumpadSubtract": return 0x56;
        case "NumpadAdd": return 0x57;
        case "NumpadEnter": return 0x58;
        case "Numpad1": return 0x59;
        case "Numpad2": return 0x5A;
        case "Numpad3": return 0x5B;
        case "Numpad4": return 0x5C;
        case "Numpad5": return 0x5D;
        case "Numpad6": return 0x5E;
        case "Numpad7": return 0x5F;
        case "Numpad8": return 0x60;
        case "Numpad9": return 0x61;
        case "Numpad0": return 0x62;
        case "NumpadDecimal": return 0x63;

        case "ContextMenu": return 0x65;

        default:
            return null;
    }
}

// 組合一個完整命令包：
// [HEAD1,HEAD2,ADDR,CMD,LEN, 8 bytes 報告, SUM]
function buildHidPacket(modByte, keyUsages = []) {
    const pkt = new Uint8Array(2 + 1 + 1 + 1 + 8 + 1);

    pkt[0] = HID_HEAD1;
    pkt[1] = HID_HEAD2;
    pkt[2] = HID_ADDR;
    pkt[3] = HID_CMD_KEYBOARD;
    pkt[4] = HID_REPORT_LEN;

    // 相容舊用法：buildHidPacket(mod, singleKey)
    if (typeof keyUsages === "number") {
        keyUsages = keyUsages ? [keyUsages] : [];
    }

    const report = new Uint8Array(8);
    report[0] = modByte & 0xFF;
    report[1] = 0x00;

    // 最多 6 顆一般鍵
    for (let i = 0; i < Math.min(keyUsages.length, 6); i++) {
        report[2 + i] = keyUsages[i] || 0;
    }

    pkt.set(report, 5);

    let sum = 0;
    for (let i = 0; i < pkt.length - 1; i++) {
        sum += pkt[i];
    }
    pkt[pkt.length - 1] = sum & 0xFF;

    return pkt;
}

function modifierBitFromCode(code) {
    switch (code) {
        case "ControlLeft":  return 0x01;
        case "ShiftLeft":    return 0x02;
        case "AltLeft":      return 0x04;
        case "MetaLeft":     return 0x08;

        case "ControlRight": return 0x10;
        case "ShiftRight":   return 0x20;
        case "AltRight":     return 0x40;
        case "MetaRight":    return 0x80;

        default:
            return 0;
    }
}

function getCurrentModifierByte() {
    let mod = 0;

    for (const code of pressedModifierCodes) {
        mod |= modifierBitFromCode(code);
    }

    return mod & 0xFF;
}

function getCurrentKeyUsages() {
    return [...pressedNormalKeys.values()].slice(0, 6);
}

function normalizeHidCodeFromPayload(payload) {
    if (!payload) return "";

    // 正常情況：直接用 KeyboardEvent.code
    if (payload.code) return payload.code;

    // code = "" 時，優先用 key 判斷
    switch (payload.key) {
        case "Shift":
            return "ShiftLeft";

        case "Control":
            return "ControlLeft";

        case "Alt":
        case "AltGraph":
            return "AltLeft";

        case "Meta":
            return "MetaLeft";
    }

    // 最後備援：用 modifier flag 判斷
    // 注意：這只適合 code="" 且真的判斷不出 key 的情況
    const candidates = [];

    if (payload.ctrlKey)  candidates.push("ControlLeft");
    if (payload.shiftKey) candidates.push("ShiftLeft");
    if (payload.altKey)   candidates.push("AltLeft");
    if (payload.metaKey)  candidates.push("MetaLeft");

    // 只有一個 modifier flag 時才推定
    // 如果同時多個 true，例如 Ctrl+Shift，就不要亂猜是哪一顆觸發事件
    if (candidates.length === 1) {
        return candidates[0];
    }

    return "";
}

async function serialSendHid(evType, payload) {
    if (!serialWriter) {
        console.warn("[Serial] writer not ready, drop key:", evType, payload);
        return;
    }

    const code = normalizeHidCodeFromPayload(payload);
    
    if (!code) return;

    // 修正 payload.code
    payload = {
        ...payload,
        code
    };

    const modBit = modifierBitFromCode(code);

    if (evType === "keydn") {
        // 避免實體鍵盤長按 auto-repeat 一直重送
        if (payload.repeat) {
            return;
        }

        if (modBit) {
            // Modifier 不放進 report[2..7]
            pressedModifierCodes.add(code);
        } else {
            const usage = hidUsageFromCode(code);
            if (usage !== null) {
                pressedNormalKeys.set(code, usage);
            }
        }

        updateKeyboardStatusLabel(payload);
    }
    else if (evType === "keyup") {
        if (modBit) {
            pressedModifierCodes.delete(code);
        } else {
            pressedNormalKeys.delete(code);
        }

        if (pressedNormalKeys.size === 0) {
            clearKeyboardStatusLabel();
        }
    }

    const packet = buildHidPacket(
        getCurrentModifierByte(),
        getCurrentKeyUsages()
    );

    try {
        await serialWriter.write(packet);
    } catch (e) {
        console.error("[Serial] write error:", e);
    }
}

// 統一出口
function sendKeyToHost(evType, payload) {
    if (hotkeyRecording) {
        collectHotkeyFromVirtualKeyboard(evType, payload);
        return; // 阻止真正送到 HID/COM
    }

    if (serialWriter) {
        serialSendHid(evType, payload);
    }
    else {
        console.warn("[Key] no backend (Serial/WebSocket) ready, drop:", evType, payload);
    }

    // ESC 且沒有任何 modifier 時：解鎖 keyboard lock
    if (document.pointerLockElement === video) {
        if (evType === "keydn") {
            const noMeta =
                !payload.ctrlKey && !payload.altKey && !payload.shiftKey && !payload.metaKey;

            // 你 payload.key 可能是 "Escape"，也可能是 "Esc"（保險做兩個）
            if (noMeta && (payload.code === "Escape" || payload.key === "Escape" || payload.key === "Esc")) {
                //keyboardLockOff();
                document.exitPointerLock();
            }
        }
    }
}

function clearVirtualKeyboardState() {
    modifierState.alt = false;
    modifierState.ctrl = false;
    modifierState.shift = false;
    modifierState.meta = false;

    activeKey = null;
    activeTouches.clear();

    document.querySelectorAll(".vk-key").forEach(k => {
        k.classList.remove("active");
    });
}

async function sendKeyboardReleaseAll(reason = "") {
    pressedNormalKeys.clear();
    pressedModifierCodes.clear();

    const packet = buildHidPacket(0, []);

    try {
        if (serialWriter) {
            await serialWriter.write(packet);
        }

        clearKeyboardStatusLabel();

        if (typeof clearVirtualKeyboardState === "function") {
            clearVirtualKeyboardState();
        }

        console.warn("[Key] release all:", reason);
    } catch (e) {
        console.error("[Key] release all failed:", e);
    }
}

const asciiToHid = {
    'a': { mod: 0, code: 0x04 }, 'b': { mod: 0, code: 0x05 }, 'c': { mod: 0, code: 0x06 },
    'd': { mod: 0, code: 0x07 }, 'e': { mod: 0, code: 0x08 }, 'f': { mod: 0, code: 0x09 },
    'g': { mod: 0, code: 0x0A }, 'h': { mod: 0, code: 0x0B }, 'i': { mod: 0, code: 0x0C },
    'j': { mod: 0, code: 0x0D }, 'k': { mod: 0, code: 0x0E }, 'l': { mod: 0, code: 0x0F },
    'm': { mod: 0, code: 0x10 }, 'n': { mod: 0, code: 0x11 }, 'o': { mod: 0, code: 0x12 },
    'p': { mod: 0, code: 0x13 }, 'q': { mod: 0, code: 0x14 }, 'r': { mod: 0, code: 0x15 },
    's': { mod: 0, code: 0x16 }, 't': { mod: 0, code: 0x17 }, 'u': { mod: 0, code: 0x18 },
    'v': { mod: 0, code: 0x19 }, 'w': { mod: 0, code: 0x1A }, 'x': { mod: 0, code: 0x1B },
    'y': { mod: 0, code: 0x1C }, 'z': { mod: 0, code: 0x1D },

    'A': { mod: 0x02, code: 0x04 }, 'B': { mod: 0x02, code: 0x05 }, 'C': { mod: 0x02, code: 0x06 },
    'D': { mod: 0x02, code: 0x07 }, 'E': { mod: 0x02, code: 0x08 }, 'F': { mod: 0x02, code: 0x09 },
    'G': { mod: 0x02, code: 0x0A }, 'H': { mod: 0x02, code: 0x0B }, 'I': { mod: 0x02, code: 0x0C },
    'J': { mod: 0x02, code: 0x0D }, 'K': { mod: 0x02, code: 0x0E }, 'L': { mod: 0x02, code: 0x0F },
    'M': { mod: 0x02, code: 0x10 }, 'N': { mod: 0x02, code: 0x11 }, 'O': { mod: 0x02, code: 0x12 },
    'P': { mod: 0x02, code: 0x13 }, 'Q': { mod: 0x02, code: 0x14 }, 'R': { mod: 0x02, code: 0x15 },
    'S': { mod: 0x02, code: 0x16 }, 'T': { mod: 0x02, code: 0x17 }, 'U': { mod: 0x02, code: 0x18 },
    'V': { mod: 0x02, code: 0x19 }, 'W': { mod: 0x02, code: 0x1A }, 'X': { mod: 0x02, code: 0x1B },
    'Y': { mod: 0x02, code: 0x1C }, 'Z': { mod: 0x02, code: 0x1D },

    '1': { mod: 0, code: 0x1E }, '2': { mod: 0, code: 0x1F }, '3': { mod: 0, code: 0x20 },
    '4': { mod: 0, code: 0x21 }, '5': { mod: 0, code: 0x22 }, '6': { mod: 0, code: 0x23 },
    '7': { mod: 0, code: 0x24 }, '8': { mod: 0, code: 0x25 }, '9': { mod: 0, code: 0x26 },
    '0': { mod: 0, code: 0x27 },

    ' ': { mod: 0, code: 0x2C },
    '\n': { mod: 0, code: 0x28 },

    '-': { mod: 0, code: 0x2D }, '=': { mod: 0, code: 0x2E },
    '[': { mod: 0, code: 0x2F }, ']': { mod: 0, code: 0x30 },
    '\\': { mod: 0, code: 0x31 },
    ';': { mod: 0, code: 0x33 }, "'": { mod: 0, code: 0x34 },
    '`': { mod: 0, code: 0x35 },
    ',': { mod: 0, code: 0x36 }, '.': { mod: 0, code: 0x37 },
    '/': { mod: 0, code: 0x38 },

    '!': { mod: 0x02, code: 0x1E }, '@': { mod: 0x02, code: 0x1F },
    '#': { mod: 0x02, code: 0x20 }, '$': { mod: 0x02, code: 0x21 },
    '%': { mod: 0x02, code: 0x22 }, '^': { mod: 0x02, code: 0x23 },
    '&': { mod: 0x02, code: 0x24 }, '*': { mod: 0x02, code: 0x25 },
    '(': { mod: 0x02, code: 0x26 }, ')': { mod: 0x02, code: 0x27 },
    '_': { mod: 0x02, code: 0x2D }, '+': { mod: 0x02, code: 0x2E },
    '{': { mod: 0x02, code: 0x2F }, '}': { mod: 0x02, code: 0x30 },
    '|': { mod: 0x02, code: 0x31 }, ':': { mod: 0x02, code: 0x33 },
    '"': { mod: 0x02, code: 0x34 }, '~': { mod: 0x02, code: 0x35 },
    '<': { mod: 0x02, code: 0x36 }, '>': { mod: 0x02, code: 0x37 },
    '?': { mod: 0x02, code: 0x38 },
};

async function sendTextToHost(text) {
    let mod;

    for (const ch of text) {
        const info = asciiToHid[ch];
        if (!info) continue;

        // key down
        if (keyboardLed.caps) {
            mod = info.mod ^ 0x02;
        }
        else {
            mod = info.mod;
        }
        const pktDown = buildHidPacket(mod, info.code);
        await serialWriter.write(pktDown);
        await sleep(12);

        // key up
        const pktUp = buildHidPacket(0, 0);
        await serialWriter.write(pktUp);
        await sleep(12);
    }
}

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

/*
async function sendMouseRelToHost(payload) {
    if (serialWriter && sendMouseFedback) {
        sendMouseFedback = false;
        const pkt = new Uint8Array(2 + 1 + 1 + 1 + 5 + 1);

        pkt[0] = HID_HEAD1;
        pkt[1] = HID_HEAD2;
        pkt[2] = HID_ADDR;
        pkt[3] = HID_CMD_MOUSE_REL;
        pkt[4] = 5;
        pkt[5] = 0x01;
        pkt[6] = payload.button;
        pkt[7] = payload.x;
        pkt[8] = payload.y;
        pkt[9] = payload.wheel;

        // 計算累加和（所有前面 byte 相加取低 8 bit）
        let sum = 0;
        for (let i = 0; i < pkt.length - 1; i++) {
            sum += pkt[i];
        }
        pkt[pkt.length - 1] = sum & 0xFF;

        try {
            await serialWriter.write(pkt);
            if (isMouseControl && usb_connection)
                updateMouseStatusIcon(Mouse_status_icon, payload.button);
            else
                updateMouseStatusIcon(Mouse_status_icon, 8);
        } catch (e) {
            console.error("[Serial] write error:", e);
        }
    }
}
*/

async function sendMouseRelToHost(payload) {
    if (!serialWriter) {
        console.warn("[MouseRel] serialWriter not ready, drop:", payload);
        return false;
    }

    const pkt = new Uint8Array(2 + 1 + 1 + 1 + 5 + 1);

    pkt[0] = HID_HEAD1;
    pkt[1] = HID_HEAD2;
    pkt[2] = HID_ADDR;
    pkt[3] = HID_CMD_MOUSE_REL;
    pkt[4] = 5;
    pkt[5] = 0x01;
    pkt[6] = payload.button;
    pkt[7] = payload.x & 0xFF;
    pkt[8] = payload.y & 0xFF;
    pkt[9] = payload.wheel & 0xFF;

    let sum = 0;
    for (let i = 0; i < pkt.length - 1; i++) {
        sum += pkt[i];
    }
    pkt[pkt.length - 1] = sum & 0xFF;

    try {
        await serialWriter.write(pkt);
        dbgMouseSent++;

        if (isMouseControl && usb_connection)
            updateMouseStatusIcon(Mouse_status_icon, payload.button);
        else
            updateMouseStatusIcon(Mouse_status_icon, 8);

        return true;
    } catch (e) {
        console.error("[MouseRel] serial write error:", e);
        return false;
    }
}

async function sendMouseAbsToHost(payload) {
    if (!serialWriter) {
        console.warn("[MouseAbs] serialWriter not ready, drop:", payload);
        return false;
    }

    const pkt = new Uint8Array(2 + 1 + 1 + 1 + 7 + 1);

    pkt[0] = HID_HEAD1;
    pkt[1] = HID_HEAD2;
    pkt[2] = HID_ADDR;
    pkt[3] = HID_CMD_MOUSE_ABS;
    pkt[4] = 7;
    pkt[5] = 0x02;
    pkt[6] = payload.button;
    pkt[7] = payload.x & 0xFF;
    pkt[8] = (payload.x >> 8) & 0xFF;
    pkt[9] = payload.y & 0xFF;
    pkt[10] = (payload.y >> 8) & 0xFF;
    pkt[11] = payload.wheel;

    let sum = 0;
    for (let i = 0; i < pkt.length - 1; i++) {
        sum += pkt[i];
    }
    pkt[pkt.length - 1] = sum & 0xFF;

    try {
        MouseButtonTooFast = false;
        await serialWriter.write(pkt);

        dbgMouseSent++;

        if (isMouseControl && usb_connection)
            updateMouseStatusIcon(Mouse_status_icon, payload.button);
        else
            updateMouseStatusIcon(Mouse_status_icon, 8);

        return true;
    } catch (e) {
        console.error("[MouseAbs] serial write error:", e);
        return false;
    }
}

//==================================================================================視窗縮放處理
// Android橫向時高度計算會錯誤, 要這樣處理
function fixViewportHeight() {
    document.documentElement.style.setProperty(
        '--vh', (window.innerHeight * 0.01) + 'px'
    );
}

const top_bar_wrapper = document.querySelector(".top-bar-wrapper");
const div_main_css = document.querySelector(".div-main");
const wrapper = document.querySelector(".keyboard-wrapper");
const hotkeymask_css = document.querySelector(".hotkey-mask");
const hotkeymask_css2 = document.querySelector(".hotkey-mask2");

function resizeVideo() {
    // resizeVideo() 可能會在 FPS chart 初始化前被呼叫，例如 topbar 初始化階段。
    // fpsRenderChart 使用 var 宣告，初始化前會是 undefined，這裡要先防呆。
    if (fpsRenderChart && typeof fpsRenderChart.resize === "function") {
        fpsRenderChart.resize(220, 100);
    }

    fixViewportHeight();

    let trans_rate = 1.0;
    let tmp = 0;
    let parentWidth = 0;
    let parentHeight = 0;
    let kbhi = 0;
    let kbReference = 0;

    const define_w = 1914;
    const define_h = 820;
    const define_ratio = define_w / define_h;

    const totalW = document.body.offsetWidth;
    const totalH = document.body.offsetHeight;
    const totalRatio = totalW / totalH;
    
    //主視窗大小
    div_main_css.style.width = totalW - 4 + "px";
    div_main_css.style.height = totalH - 4 + "px";

    // 先計算出topbar大小，然後剩下的空間給video
    let canvsH;
    if (totalRatio < define_ratio) {
        canvsH = totalW * define_h / define_w;   // 寬為準
    }
    else {
        canvsH = totalH;                // 高為準
    }
    
    if (topbarAutoScaleEnabled)
        trans_rate = totalH / define_h;
    else
        trans_rate = 1.0;
    //console.log("trans_rate=", trans_rate);
    topbar.style.transform = `scale(${trans_rate})`;

    const realWidth = topbar.offsetWidth * trans_rate;
    top_bar_wrapper.style.width = realWidth + "px";

    //======================先算出video的寬與高了======================
    if (kb.classList.contains("show")) {
        //======================虛擬鍵盤打開時======================
        parentWidth = video.parentElement.clientWidth + 2;
        parentHeight = video.parentElement.clientHeight - 4;
        if( isHorizontal() ) {
            if (parentWidth * 12 / 16 > parentHeight) {
                tmp = Math.floor(parentHeight / 12);    //以高為準
            }
            else {
                tmp = Math.floor(parentWidth / 16);     //以寬為準
            }
        }
        else {
            if (parentWidth * 17.7 / 9 < parentHeight) {
                tmp = Math.floor(parentWidth / 9);      //以寬為準
            }
            else {
                tmp = Math.floor(parentHeight / 17.7);  //以高為準
            }
        }
    }
    else {
        //======================虛擬鍵盤關閉時======================
        parentWidth = video.parentElement.clientWidth + 2;
        parentHeight = video.parentElement.clientHeight;
        if( isHorizontal() ) {
            if (parentWidth * 9 / 16 > parentHeight) {
                tmp = Math.floor(parentHeight / 9);     //以高為準
            }
            else {
                
                tmp = Math.floor(parentWidth / 16);     //以寬為準
            }
        }
        else {
            if (parentWidth * 16 / 9 < parentHeight) {
                tmp = Math.floor(parentWidth / 9);      //以寬為準
            }
            else {
                tmp = Math.floor(parentHeight / 16);    //以高為準
            }
        }
    }

    //算出video的寬與高了
    videoWidth = tmp * 16;
    videoHeight = tmp * 9;

    if( isHorizontal() ) {
        if (selectedWidth == 640) {
            sendW_coef = 4096 / (3 * videoWidth / 4);
            sendH_coef = 4096 / videoHeight;
        }
        else {
            sendW_coef = 4096 / videoWidth;
            sendH_coef = 4096 / videoHeight;
        }

        kbhi = tmp * 3;
        kbReference = tmp * 16; //就是videoWidth

        hotkeymask_css.style.width = totalW - 4 + "px";
        hotkeymask_css.style.height = videoHeight + "px";

        hotkeymask_css2.style.width = totalW - videoWidth - 4 + "px";
        hotkeymask_css2.style.height = totalH - videoHeight - 4 + "px";

        videoBox.style.setProperty('--video-visual-h', `${videoHeight}px`);
    }
    else {
        if (selectedWidth == 640) {
            sendH_coef = 4096 / (3 * videoWidth / 4);
            sendW_coef = 4096 / videoHeight;
        }
        else {
            sendH_coef = 4096 / videoWidth;
            sendW_coef = 4096 / videoHeight;
        }

        kbhi = tmp * 1.7;
        kbReference = tmp * 9;  //就是videoHeight

        hotkeymask_css.style.width = totalW - 4 + "px";
        hotkeymask_css.style.height = videoWidth + "px";

        hotkeymask_css2.style.width = totalW - videoHeight - 4 + "px";
        hotkeymask_css2.style.height = totalH - videoWidth - 4 + "px";

        videoBox.style.setProperty('--video-visual-h', `${videoWidth}px`);
    }

    //For 虛擬鍵盤
    wrapper.style.width = (kbReference - 4) + "px";
    wrapper.style.height = kbhi + "px";
    let scale = 1;
    scale = kbReference / 1500;
    kb.style.transform = `scale(${scale})`;
    
    //console.log("paren w:", parentWidth, " h:", parentHeight);
    //console.log("video w:", videoWidth, " h:", videoHeight);
    video.style.height = videoHeight + "px";
    video.style.width = videoWidth + "px";
    
    start_of_43x = videoWidth / 8;
    stop_of_43x = videoWidth * 7 / 8;

    if (!topbarAutoScaleEnabled) {
        if( parseFloat(div_main_css.style.height) < topbar.offsetHeight ) {
            div_main_css.style.height = (topbar.offsetHeight) + "px";
        }
    }
}

window.resizeVideo = resizeVideo;

window.addEventListener("resize", resizeVideo);
window.addEventListener("load", resizeVideo);

//==================================================================================代替alert
function showToast(msg) {
    const toast = document.createElement("div");
    toast.textContent = msg;
    toast.style.position = "fixed";
    toast.style.top = "50%";      // 垂直置中
    toast.style.left = "50%";     // 水平置中
    toast.style.transform = "translate(-50%, -50%)"; // 修正偏移
    toast.style.background = "rgba(0,0,0,0.7)";
    toast.style.color = "white";
    toast.style.padding = "12px 24px";
    toast.style.borderRadius = "6px";
    toast.style.fontSize = "16px";
    toast.style.zIndex = "99999";  // 保證在最上層

    toast.style.whiteSpace = "pre-line";

    // ★ 關鍵：若目前在 fullscreen，就加到 fullscreen element 裡
    const host = document.fullscreenElement
        || document.webkitFullscreenElement
        || document.msFullscreenElement
        || document.body;

    host.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
}

//==================================================================================Topbar處理
const topbar = document.querySelector(".top-bar");
const showBtn = document.getElementById("id_button_showTopbar");
const topbarIcon = document.getElementById("topbar_icon");
let last_topbar = 1;
let topbarAutoScaleEnabled = true;

function resetPageScrollToTop(reason = "") {
    try {
        const scrollingEl = document.scrollingElement || document.documentElement;

        if (scrollingEl) {
            scrollingEl.scrollTop = 0;
            scrollingEl.scrollLeft = 0;
        }

        document.documentElement.scrollTop = 0;
        document.documentElement.scrollLeft = 0;

        document.body.scrollTop = 0;
        document.body.scrollLeft = 0;

        window.scrollTo(0, 0);

        console.log("[Scroll] reset page scroll:", reason);
    } catch (e) {
        console.warn("[Scroll] reset failed:", reason, e);
    }
}

// 自動縮放或固定大小的切換
function setTopbarAutoScale(enable) {
    const oldAutoScale = topbarAutoScaleEnabled;

    topbarAutoScaleEnabled = !!enable;

    if (topbarAutoScaleEnabled) {
        document.body.classList.remove("fixed-height");
        topbar.classList.remove("fixed-height");

        // 從固定尺寸切回自動縮放時，必須清掉舊的 scrollTop
        resetPageScrollToTop("switch topbar fixed -> auto");

        requestAnimationFrame(() => {
            resetPageScrollToTop("switch topbar fixed -> auto raf");
        });

        setTimeout(() => {
            resetPageScrollToTop("switch topbar fixed -> auto delayed");
        }, 120);
    } else {
        document.body.classList.add("fixed-height");
        topbar.classList.add("fixed-height");
    }

    resizeVideo();
}
/*
function setTopbarAutoScale(enable) {
    topbarAutoScaleEnabled = !!enable;
    
    if (topbarAutoScaleEnabled) {
        document.body.classList.remove("fixed-height");
        topbar.classList.remove("fixed-height");
    } else {
        document.body.classList.add("fixed-height");
        topbar.classList.add("fixed-height");
    }

    resizeVideo();
}
*/

function initTopbarModeSetting() {
    const sel = document.getElementById('st_select_topbarmode');
    if (!sel) return;

    settingsApi()?.applySelectValue(sel, sel.value || "auto", "auto");
    setTopbarAutoScale(sel.value === "auto");

    sel.addEventListener('change', (e) => {
        setTopbarAutoScale(e.target.value === "auto");
        saveCurrentDeviceSetting("topbar", e.target.value);
    });
}

initTopbarModeSetting();

let applyingRemoteTopbarCommand = false;

function notifyParentTopbarEvent(command) {
    if (applyingRemoteTopbarCommand) {
        return;
    }

    try {
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({
                type: "quad-topbar-event",
                command
            }, "*");
        }
    } catch (e) {
        console.warn("[TopbarSync] notify parent failed:", e);
    }
}

function applyTopbarToggle(notify = true) {
    topbar.classList.toggle("collapsed");

    if (topbar.classList.contains("collapsed")) {
        last_topbar = 0;
    } else {
        last_topbar = 1;
    }

    updateTopbarIcon(topbarIcon, last_topbar);
    animateTopbarResize();

    if (notify) {
        notifyParentTopbarEvent("toggle");
    }
}

function applyTopbarHide(notify = true) {
    topbar.classList.add("hidden");

    if (showBtn) {
        showBtn.style.display = "flex";
    }

    animateTopbarResize();

    if (notify) {
        notifyParentTopbarEvent("hide");
    }
}

function applyTopbarShow(notify = true) {
    topbar.classList.remove("hidden");

    if (showBtn) {
        showBtn.style.display = "none";
    }

    animateTopbarResize();

    if (notify) {
        notifyParentTopbarEvent("show");
    }
}

document.getElementById("toggleTopbarBtn").addEventListener("click", () => {
    applyTopbarToggle(true);
});

document.getElementById("id_button_hideTopbar").addEventListener("click", () => {
    applyTopbarHide(true);
});

if (showBtn) {
    showBtn.addEventListener("click", () => {
        applyTopbarShow(true);
    });
}

function animateTopbarResize() {
    let animating = true;

    function step() {
        resizeVideo();
        if (animating) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);

    function handler(e) {
        if (e.propertyName === "width") {
            setTimeout(() => resizeVideo(), 50);
            animating = false;
            topbar.removeEventListener("transitionend", handler);
        }
    }

    topbar.addEventListener("transitionend", handler);
}

//==================================================================================
// Quad iframe 滿版控制
// 只在 ?slot=1~4 的 iframe 模式顯示
//==================================================================================
const quadFrameMaxBtn = document.getElementById("quad-frame-max-btn");
let quadFrameMaximized = false;

function updateQuadFrameMaxButton() {
    // applyI18N() 可能比下面的 const quadFrameMaxBtn 初始化更早被呼叫。
    // 這裡直接從 DOM 取，避免 TDZ: Cannot access 'quadFrameMaxBtn' before initialization。
    const btn = document.getElementById("quad-frame-max-btn");
    if (!btn) return;

    const textEl = btn.querySelector(".btn-text");

    if (!isQuadFrameMode()) {
        btn.style.display = "none";
        return;
    }

    btn.style.display = "inline-flex";
    btn.classList.toggle("active", quadFrameMaximized);

    if (textEl) {
        textEl.textContent = quadFrameMaximized
            ? t("window.quadRestore")
            : t("window.quadMax");
    }
}

function requestQuadFrameMaximized(enable) {
    if (!isQuadFrameMode()) return false;

    const slot = FRAME_SLOT_INDEX;
    let result = !!enable;

    try {
        if (
            window.parent &&
            window.parent !== window &&
            typeof window.parent.quadSetIframeMaximized === "function"
        ) {
            result = window.parent.quadSetIframeMaximized(slot, !!enable);
        } else if (window.parent && window.parent !== window) {
            window.parent.postMessage({
                type: "quad_set_iframe_maximized",
                slot,
                maximized: !!enable
            }, "*");
        }
    } catch (e) {
        console.warn("[QuadFrame] request parent maximize failed:", e);
    }

    quadFrameMaximized = !!result;
    updateQuadFrameMaxButton();

    setTimeout(() => {
        resizeVideo();
    }, 120);

    return quadFrameMaximized;
}

if (quadFrameMaxBtn) {
    quadFrameMaxBtn.addEventListener("click", () => {
        requestQuadFrameMaximized(!quadFrameMaximized);
    });

    updateQuadFrameMaxButton();
}

window.addEventListener("message", (event) => {
    const data = event.data || {};

    // ============================================================
    // 父層通知：目前 iframe 是否已滿版
    // ============================================================
    if (data.type === "quad_frame_maximized") {
        if (String(data.slot) !== String(FRAME_SLOT_INDEX)) {
            return;
        }

        quadFrameMaximized = !!data.maximized;
        updateQuadFrameMaxButton();

        setTimeout(() => {
            resizeVideo();
        }, 120);

        return;
    }

    // ============================================================
    // 父層通知：Topbar 連動命令
    // ============================================================
    if (data.type === "quad-topbar-command") {
        applyingRemoteTopbarCommand = true;

        try {
            if (data.command === "toggle") {
                applyTopbarToggle(false);
            } else if (data.command === "hide") {
                applyTopbarHide(false);
            } else if (data.command === "show") {
                applyTopbarShow(false);
            }
        } finally {
            applyingRemoteTopbarCommand = false;
        }

        return;
    }
});

//==================================================================================
// App / Browser fullscreen 控制
// Chrome：讓 top document 進入 Fullscreen API
// Electron：優先呼叫 BrowserWindow.setFullScreen()
//==================================================================================
const appFullscreenBtn = document.getElementById("app-fullscreen-btn");

function getElectronWindowApi() {
    if (window.electronWindow) {
        return window.electronWindow;
    }

    try {
        if (window.top && window.top.electronWindow) {
            return window.top.electronWindow;
        }
    } catch (e) {}

    return null;
}

function getAppFullscreenDocument() {
    try {
        // Quad iframe 模式下，盡量讓 parent index.html 進入 fullscreen，
        // 這樣是整個四分割畫面 fullscreen，不是只有 iframe 自己。
        if (window.top && window.top.document) {
            return window.top.document;
        }
    } catch (e) {}

    return document;
}

function getAppFullscreenElement(doc) {
    return doc.fullscreenElement ||
           doc.webkitFullscreenElement ||
           doc.msFullscreenElement;
}

function isBrowserAppFullscreen() {
    const doc = getAppFullscreenDocument();
    return !!getAppFullscreenElement(doc);
}

async function setBrowserAppFullscreen(enable) {
    let doc = getAppFullscreenDocument();
    let el = doc.documentElement;

    try {
        if (enable) {
            if (!getAppFullscreenElement(doc)) {
                const req = el.requestFullscreen ||
                            el.webkitRequestFullscreen ||
                            el.msRequestFullscreen;

                if (req) {
                    await req.call(el);
                }
            }

            return true;
        }

        if (getAppFullscreenElement(doc)) {
            const exit = doc.exitFullscreen ||
                         doc.webkitExitFullscreen ||
                         doc.msExitFullscreen;

            if (exit) {
                await exit.call(doc);
            }
        }

        return false;

    } catch (err) {
        // 如果 top document 被瀏覽器拒絕，就退回 iframe 自己 fullscreen
        if (doc !== document) {
            doc = document;
            el = document.documentElement;

            if (enable) {
                const req = el.requestFullscreen ||
                            el.webkitRequestFullscreen ||
                            el.msRequestFullscreen;

                if (req) {
                    await req.call(el);
                }

                return true;
            }

            const exit = document.exitFullscreen ||
                         document.webkitExitFullscreen ||
                         document.msExitFullscreen;

            if (exit) {
                await exit.call(document);
            }

            return false;
        }

        throw err;
    }
}

async function isAppWindowFullscreen() {
    const api = getElectronWindowApi();

    if (api && typeof api.isFullscreen === "function") {
        try {
            return !!(await api.isFullscreen());
        } catch (e) {
            console.warn("[AppFullscreen] electron isFullscreen failed:", e);
        }
    }

    return isBrowserAppFullscreen();
}

async function setAppWindowFullscreen(enable) {
    const api = getElectronWindowApi();

    // Electron：使用 BrowserWindow native fullscreen
    if (api && typeof api.setFullscreen === "function") {
        try {
            return !!(await api.setFullscreen(!!enable));
        } catch (e) {
            console.warn("[AppFullscreen] electron setFullscreen failed:", e);
        }
    }

    // Chrome / fallback：使用 Fullscreen API
    return await setBrowserAppFullscreen(!!enable);
}

async function updateAppFullscreenButton(forceState = null) {
    if (!appFullscreenBtn) return;

    const isFull = (typeof forceState === "boolean")
        ? forceState
        : await isAppWindowFullscreen();

    appFullscreenBtn.classList.toggle("active", isFull);

    const textEl = appFullscreenBtn.querySelector(".btn-text");
    if (textEl) {
        textEl.textContent = isFull
            ? t("window.appExitFullscreen")
            : t("window.appFullscreen");
    }
}

if (appFullscreenBtn) {
    appFullscreenBtn.addEventListener("click", async () => {
        try {
            const nowFull = await isAppWindowFullscreen();
            const newFull = await setAppWindowFullscreen(!nowFull);

            await updateAppFullscreenButton(newFull);

            setTimeout(() => {
                resizeVideo();
            }, 120);

        } catch (e) {
            console.warn("[AppFullscreen] toggle failed:", e);
            showToast(t("toast.operation_failed") || "Fullscreen failed");
        }
    });

    updateAppFullscreenButton();
}

// Chrome Fullscreen API 狀態變化時更新按鈕
["fullscreenchange", "webkitfullscreenchange", "MSFullscreenChange"].forEach(ev => {
    try {
        getAppFullscreenDocument().addEventListener(ev, () => {
            updateAppFullscreenButton();
            setTimeout(() => resizeVideo(), 120);
        });
    } catch (e) {}
});

// Electron native fullscreen 狀態變化通常會觸發 resize，順手刷新按鈕
window.addEventListener("resize", () => {
    setTimeout(() => {
        updateAppFullscreenButton();
        resizeVideo();
    }, 120);
});

//==================================================================================
// ESC 長按 3.5 秒：離開 Quad Max Mode / App Fullscreen
//==================================================================================
const ESC_HOLD_EXIT_MS = 2000;

let escHoldExitTimer = null;
let escHoldExitRunning = false;

function clearEscHoldExitTimer() {
    if (escHoldExitTimer) {
        clearTimeout(escHoldExitTimer);
        escHoldExitTimer = null;
    }

    escHoldExitRunning = false;
}

async function exitMaxAndAppFullscreenByEscHold() {
    console.log("[ESC_HOLD] exit max/app fullscreen");

    // 1. Quad iframe Max mode
    try {
        if (typeof quadFrameMaximized !== "undefined" && quadFrameMaximized) {
            if (typeof requestQuadFrameMaximized === "function") {
                await requestQuadFrameMaximized(false);
            }
        }
    } catch (e) {
        console.warn("[ESC_HOLD] exit quad max failed:", e);
    }

    // 2. App fullscreen mode
    try {
        if (typeof isAppWindowFullscreen === "function" &&
            typeof setAppWindowFullscreen === "function") {

            const isFull = await isAppWindowFullscreen();

            if (isFull) {
                await setAppWindowFullscreen(false);
            }

            if (typeof updateAppFullscreenButton === "function") {
                await updateAppFullscreenButton(false);
            }

        } else {
            // fallback：如果沒有 app fullscreen helper，就用瀏覽器 Fullscreen API
            const fsEl =
                document.fullscreenElement ||
                document.webkitFullscreenElement ||
                document.msFullscreenElement;

            if (fsEl) {
                const exit =
                    document.exitFullscreen ||
                    document.webkitExitFullscreen ||
                    document.msExitFullscreen;

                if (exit) {
                    await exit.call(document);
                }
            }
        }
    } catch (e) {
        console.warn("[ESC_HOLD] exit app fullscreen failed:", e);
    }

    try {
        scheduleResizeVideo("esc hold exit max/fullscreen");
    } catch (e) {
        try {
            resizeVideo();
        } catch (_) {}
    }
}

function startEscHoldExitTimer() {
    if (escHoldExitRunning) return;

    escHoldExitRunning = true;

    escHoldExitTimer = setTimeout(async () => {
        clearEscHoldExitTimer();
        await exitMaxAndAppFullscreenByEscHold();
    }, ESC_HOLD_EXIT_MS);
}

function installEscHoldExitListener() {
    document.addEventListener("keydown", (e) => {
        if (e.key !== "Escape") return;

        // 避免長按時 repeat 一直重開 timer
        if (e.repeat) return;

        startEscHoldExitTimer();
    }, true);

    document.addEventListener("keyup", (e) => {
        if (e.key !== "Escape") return;
        clearEscHoldExitTimer();
    }, true);

    window.addEventListener("blur", clearEscHoldExitTimer);
}

installEscHoldExitListener();

//==================================================================================PIP按紐
document.getElementById("pip-button").addEventListener("click", async (e) => {
    if (!document.pictureInPictureElement) {
        try {
            await video.requestPictureInPicture();
        } catch (error) {
            console.error("無法進入 PiP 模式:", error);
        }
    } else {
        try {
            await document.exitPictureInPicture();
        } catch (error) {
            console.error("無法離開 PiP 模式:", error);
        }
    }
});

video.addEventListener("enterpictureinpicture", () => {
    document.getElementById("pip-button").classList.add("active");
    isPIP = true;
});

video.addEventListener("leavepictureinpicture", () => {
    document.getElementById("pip-button").classList.remove("active");
    isPIP = false;
});

//==================================================================================截圖按紐
document.getElementById("snapshot-btn").addEventListener("click", () => {
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 產生唯一檔名：YYYYMMDD_HHMMSS_mmm.jpg
    const now = new Date();
    const pad = (n, len = 2) => String(n).padStart(len, "0");
    const filename =
        now.getFullYear() +
        pad(now.getMonth() + 1) +
        pad(now.getDate()) + "_" +
        pad(now.getHours()) +
        pad(now.getMinutes()) +
        pad(now.getSeconds()) + //"_" +
        //pad(now.getMilliseconds(), 3) +
        ".jpg";

    canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }, "image/jpeg", 0.92);  // 🔴 輸出 JPG，壓縮品質 92%
});

//==================================================================================錄影
let mediaRecorder;
let recordedChunks = [];
const recordBtn = document.getElementById("record-btn");

recordBtn.addEventListener("click", async (e) => {
    if (!mediaRecorder || mediaRecorder.state === "inactive") {
        const stream = video.srcObject;
        if (!stream) {
            showToast(t('toast.record_err'));
            return;
        }

        mediaRecorder = new MediaRecorder(stream, {
            mimeType: "video/webm; codecs=vp8,opus"
        });

        recordedChunks = [];
        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) recordedChunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: "video/webm" });
            const url = URL.createObjectURL(blob);

            const now = new Date();
            const pad = (n, len = 2) => String(n).padStart(len, "0");
            const filename =
                now.getFullYear() +
                pad(now.getMonth() + 1) +
                pad(now.getDate()) + "_" +
                pad(now.getHours()) +
                pad(now.getMinutes()) +
                pad(now.getSeconds()) +
                ".webm";

            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        };

        mediaRecorder.start();

        // 🔴 錄影中 → 按鈕顯示紅點閃爍
        document.getElementById("id_span_record_icon").innerHTML = '<span class="record-dot"></span>';
        e.currentTarget.classList.add("active");
    } else {
        mediaRecorder.stop();

        // ⏹ 停止 → 按鈕恢復文字
        if (currentTheme === 'light') {
            document.getElementById("id_span_record_icon").innerHTML =
                '<img data-icon-light="icon/record_light.png" data-icon-dark="icon/record_dark.png" alt="record" class="div_icon" src="icon/record_light.png">';
        }
        else {
            document.getElementById("id_span_record_icon").innerHTML =
                '<img data-icon-light="icon/record_light.png" data-icon-dark="icon/record_dark.png" alt="record" class="div_icon" src="icon/record_dark.png">';
        }
        e.currentTarget.classList.remove("active");
    }
});

//==================================================================================全螢幕
function isFullscreen() {
    return document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
}

async function enterFullscreen() {
    const el = videoBox;
    const req = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
    if (req) await req.call(el);
}

async function exitFullscreen() {
    const exit = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
    if (exit) await exit.call(document);
}

function refreshFSButtonText() {
    if (!isFullscreen()) {
        // 離開全螢幕 → 若之前鍵盤是開的 → 自動重新開啟
        if( !kvmModeOn ) {
            if (keyboardWasOpenBeforeFullscreen) {
                document.getElementById("toggleKeyboardBtn").click();
            }
        }
        kvmModeOn = false;
        keyboardLockOff();
    }
    else{
        keyboardLockOn();

        //Electron環境下，提醒使用者可以按ESC離開全螢幕（因為chrome自己會提醒）
        if (window.electronSerial)
            showToast(t('toast.escToExit'));
    }
    
    //用electron時, 比較慢才會拿到正確的video widht height
    setTimeout(() => resizeVideo(), 150);
}

fsBtn.addEventListener('click', async () => {
    // 進入全螢幕前 → 記住鍵盤是否開啟
    if (!isFullscreen() || kvmModeOn) {
        keyboardWasOpenBeforeFullscreen = isKeyboardOpen();

        // 若鍵盤是開啟的 → 先關閉它
        if (keyboardWasOpenBeforeFullscreen) {
            document.getElementById("toggleKeyboardBtn").click();
        }
    }

    if (isFullscreen() && !kvmModeOn) 
        await exitFullscreen();
    else
        await enterFullscreen();

    kvmModeOn = false;
});

['fullscreenchange', 'webkitfullscreenchange', 'MSFullscreenChange'].forEach(ev =>
    document.addEventListener(ev, refreshFSButtonText)
);

async function exitAllVideoModesOnUvcMissing() {
    // 退出 PIP
    try {
        if (document.pictureInPictureElement) {
            await document.exitPictureInPicture();
        }
    } catch (e) {}

    // 退出 fullscreen
    try {
        if (document.fullscreenElement) {
            await document.exitFullscreen();
        }
    } catch (e) {}

    // 關掉控制模式
    try {
        await keyboardLockOff();
    } catch (e) {}
    kvmModeOn = false;

    // 退出 pointer lock / 相對座標
    try {
        if (document.pointerLockElement === video) {
            document.exitPointerLock();
        }
    } catch (e) {}

    mouse_abs_or_rel = false;
    video.style.cursor = "default";
    document.getElementById("lockMouse-btn").classList.remove("active");

    // 關掉滑鼠抖動
    if (mouseInterval) {
        clearInterval(mouseInterval);
        mouseInterval = null;
    }
    document.getElementById("autoMouse-btn").classList.remove("active");
}

//==================================================================================鍵盤鎖定(如此可以支援大部分的hotkey)
let kvmModeOn = false;

async function keyboardLockOn() {
    if (isQuadFrameMode()) {
        try {
            if (window.parent && window.parent !== window &&
                typeof window.parent.quadEnterKeyboardControlMode === "function") {
                await window.parent.quadEnterKeyboardControlMode(FRAME_SLOT_INDEX);
            }
        } catch (err) {
            console.warn("[KeyboardLock] parent lock failed:", err);
        }

        video.focus();
        document.getElementById("toggleControlModeBtn").classList.add("active");
        return;
    }

    if ("keyboard" in navigator && "lock" in navigator.keyboard) {
        try {
            await navigator.keyboard.lock();
            console.log("Keyboard lock enabled");
        } catch (err) {
            console.warn("Keyboard lock failed:", err);
        }
    } else {
        console.warn("Keyboard Lock API not supported");
    }

    video.focus();
    document.getElementById("toggleControlModeBtn").classList.add("active");
}

async function keyboardLockOff() {
    if (isQuadFrameMode()) {
        try {
            if (window.parent && window.parent !== window &&
                typeof window.parent.quadExitKeyboardControlMode === "function") {
                await window.parent.quadExitKeyboardControlMode(FRAME_SLOT_INDEX);
            }
        } catch (err) {
            console.warn("[KeyboardLock] parent unlock failed:", err);
        }

        document.getElementById("toggleControlModeBtn").classList.remove("active");
        return;
    }

    try {
        if ("keyboard" in navigator && navigator.keyboard && navigator.keyboard.unlock) {
            navigator.keyboard.unlock();
            console.log("Keyboard lock disabled");
        }
    } catch (e) {
        console.warn("Keyboard unlock failed:", e);
    }
    document.getElementById("toggleControlModeBtn").classList.remove("active");
}

document.getElementById("toggleControlModeBtn").addEventListener("click", async (e) => {
    try {
        if (!kvmModeOn) {
            // === ON：進入 fullscreen + lock ===
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
            }
            await keyboardLockOn();

            kvmModeOn = true;
            return;
        }

        // === OFF：unlock + 離開 fullscreen ===
        await keyboardLockOff();

        if (document.fullscreenElement) {
            await document.exitFullscreen();
        }

        kvmModeOn = false;
    } catch (e) {
        console.error("[toggleControlModeBtn] failed:", e);
    }
});

//==================================================================================滑鼠/touch處理
// ***** 滑鼠模式選擇 *****
const MOUSE_MOVE_MODE_KEY = "webkvm_mouse_move_mode";

let mouseMoveMode = "mouse";          // pointer = 高回報率, mouse = 低回報率
let activeMouseMoveEvent = null;
let activeMouseMoveHandler = null;

function getPointerMoveEventName() {
    return ("onpointerrawupdate" in window) ? "pointerrawupdate" : "pointermove";
}

function handleMouseMove_LowRate(e) {
    SendMouseFunc(e);
    updateAbsLastFromEvent(e);
}

function handlePointerMouseMove(e) {
    if (isPIP) return;

    const list = (typeof e.getCoalescedEvents === "function")
        ? e.getCoalescedEvents()
        : [e];

    mouseButton = e.buttons;

    if (mouse_abs_or_rel) {
        // 相對座標：list 有幾個 sample 就 queue 幾個
        for (const ev of list) {
            const dx = ev.movementX || 0;
            const dy = ev.movementY || 0;

            if (dx || dy) {
                sendMouseEvent_Relative(dx, dy, mouseButton, 0);
            }
        }
    } else {
        // 絕對座標：一定要傳 event，不可傳 clientX/clientY 數字
        for (const ev of list) {
            sendMouseEvent_Absolute_ByEvent(ev, mouseButton, 0);
            updateAbsLastFromEvent(ev);
        }
    }
}

function bindMouseMoveEvent(mode) {
    // 先移除舊的，避免重複綁定
    if (activeMouseMoveEvent && activeMouseMoveHandler) {
        video.removeEventListener(activeMouseMoveEvent, activeMouseMoveHandler);
    }

    mouseMoveMode = (mode === "mouse") ? "mouse" : "pointer";

    if (mouseMoveMode === "mouse") {
        // 低回報率：使用傳統 mousemove
        activeMouseMoveEvent = "mousemove";
        activeMouseMoveHandler = handleMouseMove_LowRate;
    } else {
        // 高回報率：優先 pointerrawupdate，沒有就 pointermove
        activeMouseMoveEvent = getPointerMoveEventName();
        activeMouseMoveHandler = handlePointerMouseMove;
    }

    video.addEventListener(activeMouseMoveEvent, activeMouseMoveHandler, {
        passive: true
    });

    updateRelativeMouseTotalGain();

    saveCurrentDeviceSetting("mouse_report_mode", mouseMoveMode);

    console.log("[Mouse] move mode =", mouseMoveMode, "event =", activeMouseMoveEvent);
}

function initMouseMoveModeSetting() {
    const sel = document.getElementById("id_select_mouse_report_mode");
    let saved = (sel && sel.value) ? sel.value : "mouse";

    if (sel) {
        if (sel.options && sel.options.length > 0 && !settingsApi()?.selectHasValue(sel, saved)) {
            saved = "mouse";
        }

        if (sel.options && sel.options.length > 0) {
            settingsApi()?.applySelectValue(sel, saved, "mouse");
            saved = sel.value || "mouse";
        }

        sel.addEventListener("change", (e) => {
            bindMouseMoveEvent(e.target.value);
        });
    }

    bindMouseMoveEvent(saved);
}

// ***** 相對座標加速減速 *****
let relative_mouse_speed = 1.0;
let relative_mouse_totalGain = 1.0;

const RELATIVE_MOUSE_SOURCE_GAIN = {
    mouse: 0.5,             // mousemove 低回報率，但實測移動較快，所以先壓低
    pointermove: 1.0,       // fallback pointermove
    pointerrawupdate: 1.0   // 高回報 raw
};

const RELATIVE_MOUSE_SPEED_KEY = "webkvm_relative_mouse_speed";

function getRelativeMouseSourceGain() {
    if (mouseMoveMode === "mouse") {
        return RELATIVE_MOUSE_SOURCE_GAIN.mouse;
    }

    if (activeMouseMoveEvent === "pointerrawupdate") {
        return RELATIVE_MOUSE_SOURCE_GAIN.pointerrawupdate;
    }

    return RELATIVE_MOUSE_SOURCE_GAIN.pointermove;
}

function updateRelativeMouseTotalGain() {
    const sourceGain = getRelativeMouseSourceGain();

    relative_mouse_totalGain = relative_mouse_speed * sourceGain;

    console.log(
        "[Mouse] relative_mouse_speed =", relative_mouse_speed,
        "sourceGain =", sourceGain,
        "totalGain =", relative_mouse_totalGain,
        "mode =", mouseMoveMode,
        "event =", activeMouseMoveEvent
    );
}

function setRelativeMouseSpeed(value, save = true) {
    const v = Number(value);

    relative_mouse_speed = Number.isFinite(v) && v > 0 ? v : 1.0;

    updateRelativeMouseTotalGain();

    if (save) {
        saveCurrentDeviceSetting("relative_mouse_speed", String(relative_mouse_speed));
    }
}

function ceilAwayFromZero(v) {
    if (v > 0) return Math.ceil(v);
    if (v < 0) return Math.floor(v);
    return 0;
}

function applyRelativeMouseSpeed(dx, dy) {
    return {
        x: ceilAwayFromZero(dx * relative_mouse_totalGain),
        y: ceilAwayFromZero(dy * relative_mouse_totalGain)
    };
}

function initRelativeMouseSpeedSetting() {
    const sel = document.getElementById("id_select_relative_mouse_speed");
    if (!sel) return;

    if (sel.options && sel.options.length > 0) {
        settingsApi()?.applySelectValue(sel, sel.value || "1", "1");
    }

    setRelativeMouseSpeed(sel.value || "1", false);

    sel.addEventListener("change", (e) => {
        setRelativeMouseSpeed(e.target.value, true);
    });
}

initRelativeMouseSpeedSetting();
initMouseMoveModeSetting();

// ***** 滑鼠滾輪速度方向 *****
let scroll_speed = 1;
let scroll_dir = -1;
let mouse_abs_or_rel = false;

function initScrollSettings() {
    const speedSel = document.getElementById('id_select_scrollspeed');
    const dirSel = document.getElementById('id_select_direction');

    if (speedSel) {
        scroll_speed = Number(speedSel.value || 1);
        speedSel.addEventListener('change', (e) => {
            scroll_speed = Number(e.target.value || 1);
            saveCurrentDeviceSetting("scrollspeed", e.target.value);
        });
    }

    if (dirSel) {
        scroll_dir = Number(dirSel.value || -1);
        dirSel.addEventListener('change', (e) => {
            scroll_dir = Number(e.target.value || -1);
            saveCurrentDeviceSetting("direction", e.target.value);
        });
    }
}

initScrollSettings();

// ***** 滑鼠鎖定,相對座標 *****
document.getElementById("lockMouse-btn").addEventListener("click", () => {
    // 如果現在已經是 Pointer Lock，就離開
    if (document.pointerLockElement === video) {
        if (document.exitPointerLock) {
            document.exitPointerLock();
        }
        return;
    }

    // 否則嘗試進入 Pointer Lock
    if (video.requestPointerLock) {
        video.requestPointerLock();
        video.focus();
    } else {
        showToast(t('toast.lockmouse_err'));
    }
});

document.addEventListener("pointerlockchange", () => {
    if (document.pointerLockElement === video) {
        video.style.cursor = "none";
        document.getElementById("lockMouse-btn").classList.add("active");
        mouse_abs_or_rel = true;
        console.log("mouse locked and hidden");
    } else {
        video.style.cursor = "default";
        document.getElementById("lockMouse-btn").classList.remove("active");
        mouse_abs_or_rel = false
        console.log("mouse released");
    }
});

// ***** 滑鼠絕對座標的 queue 機制 *****
const MOUSE_ABS_QUEUE_MAX = 32;

let mouseAbsQueue = [];
let mouseAbsWriting = false;
let sendMouseFedback = true;
let dbgMouseSent = 0;

function queueMouseAbsPayload(payload) {
    // 一定要複製，不能直接塞 pendingMouseAbsPayload
    mouseAbsQueue.push({ ...payload });

    // queue 太長時丟最舊的，保留最新位置
    while (mouseAbsQueue.length > MOUSE_ABS_QUEUE_MAX) {
        mouseAbsQueue.shift();
    }

    flushMouseAbsQueue();
}

async function flushMouseAbsQueue() {
    if (!serialWriter) return;

    if (mouseAbsWriting) return;
    if (!sendMouseFedback) return;

    if (mouseAbsQueue.length === 0) return;

    const payload = mouseAbsQueue.shift();

    mouseAbsWriting = true;
    sendMouseFedback = false;
    startMouseFeedbackWatchdog("abs");

    try {
        await sendMouseAbsToHost(payload);
    } catch (e) {
        console.error("[Mouse] send failed:", e);
        sendMouseFedback = true;
        clearMouseFeedbackWatchdog();
    } finally {
        mouseAbsWriting = false;
    }
}

// ***** 滑鼠相對座標的 queue 機制 *****
const MOUSE_REL_QUEUE_MAX = 64;

let mouseRelQueue = [];
let mouseRelWriting = false;

function queueMouseRelPayload(payload) {
    // 一定要複製
    mouseRelQueue.push({ ...payload });

    // queue 太長時丟最舊的
    while (mouseRelQueue.length > MOUSE_REL_QUEUE_MAX) {
        mouseRelQueue.shift();
    }
    
    flushMouseRelQueue();
}

async function flushMouseRelQueue() {
    if (!serialWriter) return;

    if (mouseRelWriting) return;
    if (!sendMouseFedback) return;

    if (mouseRelQueue.length === 0) return;

    const payload = mouseRelQueue.shift();

    mouseRelWriting = true;
    sendMouseFedback = false;
    startMouseFeedbackWatchdog("rel");

    try {
        await sendMouseRelToHost(payload);
    } catch (e) {
        console.error("[MouseRel] send failed:", e);
        sendMouseFedback = true;
        clearMouseFeedbackWatchdog();
    } finally {
        mouseRelWriting = false;
    }
}

function resetMouseTransportState(reason = "") {
    console.warn("[Mouse] reset transport state:", reason);

    mouseAbsQueue = [];
    mouseRelQueue = [];

    mouseAbsWriting = false;
    mouseRelWriting = false;

    // 重要：解除 feedback gate，避免卡在 feedback=false
    sendMouseFedback = true;

    // 若有 watchdog timer，也一起清掉
    if (typeof mouseFeedbackTimer !== "undefined" && mouseFeedbackTimer) {
        clearTimeout(mouseFeedbackTimer);
        mouseFeedbackTimer = null;
    }

    // 這些變數如果你的版本有才清
    if (typeof lastMouseAbsPayload !== "undefined") {
        lastMouseAbsPayload = null;
    }

    if (typeof lastMouseRelPayload !== "undefined") {
        lastMouseRelPayload = null;
    }

    if (typeof MouseButtonTooFast !== "undefined") {
        MouseButtonTooFast = false;
    }
}

let mouseFeedbackTimer = null;

function startMouseFeedbackWatchdog(reason = "") {
    if (mouseFeedbackTimer) {
        clearTimeout(mouseFeedbackTimer);
        mouseFeedbackTimer = null;
    }

    mouseFeedbackTimer = setTimeout(() => {
        console.warn("[Mouse] feedback timeout, unlock:", reason);

        sendMouseFedback = true;
        mouseAbsWriting = false;
        mouseRelWriting = false;

        if (mouse_abs_or_rel) {
            flushMouseRelQueue();
        } else {
            flushMouseAbsQueue();
        }
    }, 100);
}

function clearMouseFeedbackWatchdog() {
    if (mouseFeedbackTimer) {
        clearTimeout(mouseFeedbackTimer);
        mouseFeedbackTimer = null;
    }
}

function onMouseFeedback() {
    clearMouseFeedbackWatchdog();
    sendMouseFedback = true;

    if (mouse_abs_or_rel) {
        flushMouseRelQueue();
    } else {
        flushMouseAbsQueue();
    }
}

function getScrollValue(deltaY) {
    if (!deltaY) return 0;

    // 方向處理
    deltaY = deltaY * scroll_dir;

    // 速度倍率與限制
    let value = Math.sign(deltaY) * Math.min(scroll_speed, 10);

    return value;
}

function takeInt8Step(v) {
    if (v > 127) return 127;
    if (v < -127) return -127;  //這裡有坑, 他的補數是沒有FF的, XXX
    return Math.trunc(v);
}

/*
function queueMouseRelMovementSplit(x, y, buttonState = 0, wheelState = 0) {
    x = Math.trunc(Number(x) || 0);
    y = Math.trunc(Number(y) || 0);
    wheelState = Math.trunc(Number(wheelState) || 0);

    // 至少要跑一次，才能處理純 button down / button up
    do {
        const sx = takeInt8Step(x);
        const sy = takeInt8Step(y);
        const sw = takeInt8Step(wheelState);

        queueMouseRelPayload({
            x: sx,
            y: sy,
            button: buttonState,
            wheel: sw
        });

        x -= sx;
        y -= sy;
        wheelState -= sw;

    } while (x !== 0 || y !== 0 || wheelState !== 0);
}
*/
function queueMouseRelMovementSplit(x, y, buttonState = 0, wheelState = 0) {
    x = Number(x) || 0;
    y = Number(y) || 0;
    wheelState = Math.trunc(Number(wheelState) || 0);

    const maxAbs = Math.max(Math.abs(x), Math.abs(y));

    if (maxAbs > 127) {
        const scale = 127 / maxAbs;
        x = x * scale;
        y = y * scale;
    }

    const sx = ceilAwayFromZero(x);
    const sy = ceilAwayFromZero(y);
    const sw = takeInt8Step(wheelState);

    queueMouseRelPayload({
        x: takeInt8Step(sx),
        y: takeInt8Step(sy),
        button: buttonState,
        wheel: sw
    });
}

function sendMouseEvent_Relative(x, y, buttonState = 0, wheelState = 0) {
    x = Number(x) || 0;
    y = Number(y) || 0;
    wheelState = Number(wheelState) || 0;

    const moved = applyRelativeMouseSpeed(x, y);
    //const moved = { x, y };

    // wheel 不應該吃 relative mouse speed，所以保持原本 wheelState
    queueMouseRelMovementSplit(
        moved.x,
        moved.y,
        buttonState,
        wheelState
    );
}

function sendMouseEvent_Absolute(x, y, buttonState = 0, wheelState = 0) {
    const rect = video.getBoundingClientRect();

    let localX = x - rect.left;
    let localY = y - rect.top;

    if (selectedWidth == 640) {
        if (isHorizontal()) {
            if (localX < start_of_43x || localX > stop_of_43x)
                return;

            localX = localX - start_of_43x;
        } else {
            if (localY < start_of_43x || localY > stop_of_43x)
                return;

            localY = localY - start_of_43x;
        }
    }

    const payload = {
        x: Math.round(localX * sendW_coef),
        y: Math.round(localY * sendH_coef),
        button: buttonState,
        wheel: wheelState
    };

    queueMouseAbsPayload(payload);
}

function sendMouseEvent_Absolute_ByEvent(e, buttonState = 0, wheelState = 0) {
    let localX;
    let localY;

    if (!e || typeof e !== "object") {
        console.warn("[MouseAbs] invalid event:", e, buttonState, wheelState);
        return;
    }

    /*
        一般 mousemove：
        - offsetX / offsetY 通常正確

        quad iframe + pointerrawupdate：
        - clientX/clientY 可能是外層 quad 座標
        - offsetX/offsetY 也可能跟著偏掉
        - 所以要用 getVideoLocalXYFromPointerEvent() 修正
    */
    if (e.type === "pointerrawupdate") {
        const p = getVideoLocalXYFromPointerEvent(e);
        localX = p.localX;
        localY = p.localY;
    } else if (typeof e.offsetX === "number" && typeof e.offsetY === "number") {
        localX = e.offsetX;
        localY = e.offsetY;
    } else {
        const rect = video.getBoundingClientRect();
        localX = e.clientX - rect.left;
        localY = e.clientY - rect.top;
    }

    if (!Number.isFinite(localX) || !Number.isFinite(localY)) {
        console.warn("[MouseAbs] bad local:", localX, localY, e);
        return;
    }

    // 防止超界送出
    if (localX < 0 || localY < 0 || localX > video.clientWidth || localY > video.clientHeight) {
        return;
    }

    if (selectedWidth == 640) {
        if (isHorizontal()) {
            if (localX < start_of_43x || localX > stop_of_43x)
                return;

            localX = localX - start_of_43x;
        } else {
            if (localY < start_of_43x || localY > stop_of_43x)
                return;

            localY = localY - start_of_43x;
        }
    }

    const payload = {
        x: Math.round(localX * sendW_coef),
        y: Math.round(localY * sendH_coef),
        button: buttonState,
        wheel: wheelState
    };

    queueMouseAbsPayload(payload);
}

function getVideoLocalXYFromPointerEvent(e) {
    const videoRect = video.getBoundingClientRect();

    let clientX = e.clientX;
    let clientY = e.clientY;

    /*
        在 quad iframe + pointerrawupdate 下，
        Chrome / Electron 可能給的是外層 parent viewport 座標。
        slot1 因為 parent offset 接近 0，所以看起來正常；
        slot2/3/4 會偏掉。
    */
    if (
        isQuadFrameMode &&
        typeof isQuadFrameMode === "function" &&
        isQuadFrameMode() &&
        e.type === "pointerrawupdate" &&
        window.frameElement
    ) {
        try {
            const iframeRect = window.frameElement.getBoundingClientRect();

            clientX = e.clientX - iframeRect.left;
            clientY = e.clientY - iframeRect.top;
        } catch (err) {
            console.warn("[MouseAbs] iframe coordinate convert failed:", err);
        }
    }

    return {
        localX: clientX - videoRect.left,
        localY: clientY - videoRect.top,
        clientX,
        clientY,
        videoRect
    };
}

function updateAbsLastFromEvent(e) {
    if (!e) return;

    // Quad + pointerrawupdate 時，使用修正後的 clientX/clientY
    if (
        typeof isQuadFrameMode === "function" &&
        isQuadFrameMode() &&
        e.type === "pointerrawupdate"
    ) {
        const p = getVideoLocalXYFromPointerEvent(e);
        abs_last_x = p.clientX;
        abs_last_y = p.clientY;
        return;
    }

    abs_last_x = e.clientX;
    abs_last_y = e.clientY;
}

function SendMouseFunc(e) {
    if (isPIP) return;

    const wheel = getScrollValue(e.deltaY);
    mouseButton = e.buttons;

    if (mouse_abs_or_rel) {
        sendMouseEvent_Relative(e.movementX, e.movementY, mouseButton, wheel);
    } else {
        //sendMouseEvent_Absolute(e.clientX, e.clientY, mouseButton, wheel);
        sendMouseEvent_Absolute_ByEvent(e, mouseButton, wheel);
    }
}

// 滑鼠事件處理
let MouseButtonTooFast = false;     //Mac會快速送出mousedown + mouseup, 用這個flag避免
/*
video.addEventListener("mousemove", (e) => {
    SendMouseFunc(e);
    abs_last_x = e.clientX;
    abs_last_y = e.clientY;
});
*/

video.addEventListener("mousedown", (e) => {
    MouseButtonTooFast = true;

    SendMouseFunc(e);
    updateAbsLastFromEvent(e);
});

video.addEventListener("mouseup", (e) => {
    if (MouseButtonTooFast) {
        setTimeout(() => {
            SendMouseFunc(e);
            updateAbsLastFromEvent(e);
        }, 30);
        return;
    }

    SendMouseFunc(e);
    updateAbsLastFromEvent(e);
});

video.addEventListener("wheel", (e) => {
    e.preventDefault();  // 避免頁面捲動
    SendMouseFunc(e);
    updateAbsLastFromEvent(e);
});

// Touch事件處理
let touchTimer_FixedWheel = null;
let touchFlag_FixedTimeout = false;
let touchFlag_FixedWheel = false;

let touchTimer_RClick = null;
let touchFlag_RClick = 0;

let touchFlag_Locked = true;
let lastPinchY = null;
let fx = 0, fy = 0;

let touchTimer_Status = null;

function touch_clear_RClick() {
    clearTimeout(touchTimer_RClick);
    touchFlag_RClick = 0;
}

video.addEventListener("touchstart", (e) => {
    e.preventDefault();

    clearTimeout(touchTimer_Status);
    video.focus();
    isMouseControl = true;
    if (usb_connection)
        updateMouseStatusIcon(Mouse_status_icon, 0);

    if (e.touches.length == 1) {
        //Clear all
        clearTimeout(touchTimer_FixedWheel);
        touchFlag_FixedTimeout = false;
        touchFlag_FixedWheel = false;
        touchFlag_Locked = true;
        lastPinchY = null;

        fx = e.touches[0].clientX;
        fy = e.touches[0].clientY;
        abs_last_x = fx;
        abs_last_y = fy;

        touchTimer_FixedWheel = setTimeout(() => {
            console.log("touchTimer_FixedWheel done");
            touchFlag_FixedTimeout = true;
        }, 300);

        touchTimer_RClick = setTimeout(() => {
            console.log("touchTimer_RClick done");
            touchFlag_RClick = 1;
        }, 1000);
    }
    else if (e.touches.length >= 2) {
        // 兩指以上 → 啟用模擬滾輪模式;
        const y1 = e.touches[0].clientY;
        const y2 = e.touches[1].clientY;
        lastPinchY = (y1 + y2) / 2;

        touchFlag_Locked = false;

        touch_clear_RClick();

        clearTimeout(touchTimer_FixedWheel);
        if (!touchFlag_FixedTimeout) {
            touchFlag_FixedWheel = true;
        }
        return;
    }
});

video.addEventListener("touchmove", (e) => {
    e.preventDefault();

    if (touchFlag_Locked) {
        if (Math.abs(e.touches[0].clientX - fx) > 10 || Math.abs(e.touches[0].clientY - fy) > 10) {
            touchFlag_Locked = false;
            touch_clear_RClick();
            touchFlag_FixedTimeout = true;

            touchToMouseFunc(fx, fy, 1, 0);
            //sendMouseEvent_Absolute(fx, fy, 1, 0);
        }
        return;
    }

    if (e.touches.length >= 2) {
        const y1 = e.touches[0].clientY;
        const y2 = e.touches[1].clientY;
        const centerY = (y1 + y2) / 2;
        const deltaY = centerY - lastPinchY;
        if (Math.abs(deltaY) >= 4) { // 避免過小移動造成雜訊
            touchToMouseFunc(fx, fy, !touchFlag_FixedWheel, deltaY);
            //sendMouseEvent_Absolute(fx, fy, !touchFlag_FixedWheel, deltaY);
            lastPinchY = centerY;
        }
        return;
    }

    if (!touchFlag_FixedWheel) {
        fx = e.touches[0].clientX;
        fy = e.touches[0].clientY;
        abs_last_x = fx;
        abs_last_y = fy;
    }
    touchToMouseFunc(fx, fy, !touchFlag_FixedWheel, 0);
    //sendMouseEvent_Absolute(fx, fy, !touchFlag_FixedWheel, 0);
});

video.addEventListener("touchend", (e) => {
    e.preventDefault();

    if (e.touches.length == 0) {
        const touch = e.changedTouches[0];

        if (touchFlag_RClick) {
            touchToMouseFunc(touch.clientX, touch.clientY, 2, 0); // 模擬右鍵 down
            setTimeout(() => {
                touchToMouseFunc(touch.clientX, touch.clientY, 0, 0); // 右鍵 up
            }, 80); // 50ms 延遲
            //sendMouseEvent_Absolute(touch.clientX, touch.clientY, 2, 0); // 模擬右鍵 down
        }
        else if (touchFlag_Locked) {
            touchToMouseFunc(fx, fy, 1, 0);
            setTimeout(() => {
                touchToMouseFunc(fx, fy, 0, 0); // 左鍵 up
            }, 80);
            //sendMouseEvent_Absolute(fx, fy, 1, 0);
        }
        else {
            setTimeout(() => {
                touchToMouseFunc(touch.clientX, touch.clientY, 0, 0); // 右鍵 up
            }, 20); // 50ms 延遲
            //sendMouseEvent_Absolute(touch.clientX, touch.clientY, 0, 0);
        }

        clearTimeout(touchTimer_FixedWheel);
        touchFlag_FixedTimeout = false;
        touchFlag_FixedWheel = false;
        touchFlag_Locked = true;
        lastPinchY = null;

        touchTimer_Status = setTimeout(() => {
            isMouseControl = false;
            updateMouseStatusIcon(Mouse_status_icon, 8);
        }, 800);
    }

    touch_clear_RClick();
});

let lastX = null, lastY = null;
function touchToMouseFunc(x, y, bn, wl) {
    if (isPIP) return;

    const wheel = getScrollValue(wl);
    let deltaX, deltaY;
    if (document.pointerLockElement === video) {
        if (lastX !== null && lastY !== null) {
            deltaX = x - lastX;
            deltaY = y - lastY;
            console.log("移動量:", deltaX, deltaY);
        }
        lastX = x;
        lastY = y;

        // @@@@@@@@@@@@@@@@@@@@@@@@@@@@touch很難完整支援相對座標
        //sendMouseEvent_Relative(deltaX, deltaY, bn, wheel);
    } else {
        sendMouseEvent_Absolute(x, y, bn, wheel);
    }
}

//==================================================================================滑鼠抖動
function SendFakeMouseFunc() {
    const randX = Math.floor(Math.random() * 3) - 1; // 整數 -20 ~ +20
    const randY = Math.floor(Math.random() * 3) - 1; // 整數 -20 ~ +20
    sendMouseEvent_Absolute(abs_last_x + randX, abs_last_y + randY);
}

let mouseInterval = null;
let circleAngle = 0;
let lineOffset = 0;
let lineDir = 1;
const circleStep = 10;   // 每次增加角度 (度數)
let g_settings = {
    mouse: {
        jitter_mode: "circle",
        jitter_speed: 10,
        jitter_range: 20
    },
};

function sendCircleMotion() {
    circleAngle = (circleAngle + g_settings.mouse.jitter_speed) % 360;
    const rad = circleAngle * Math.PI / 180;

    if (document.pointerLockElement === video) {
        // === 相對模式 ===
        const dx = Math.round(g_settings.mouse.jitter_range * Math.cos(rad) * 0.1); // 取差分的小量
        const dy = Math.round(g_settings.mouse.jitter_range * Math.sin(rad) * 0.1);
        sendMouseEvent_Relative(dx, dy, 0, 0);
        //console.log("Relative:", dx, dy);
    } else {
        // === 絕對模式 ===
        const x = Math.round(abs_last_x + g_settings.mouse.jitter_range * Math.cos(rad));
        const y = Math.round(abs_last_y + g_settings.mouse.jitter_range * Math.sin(rad));
        sendMouseEvent_Absolute(x, y, 0, 0);
        //console.log("Absolute:", x, y);
    }
}

function sendLineMotion(horizontal) {
    lineOffset += g_settings.mouse.jitter_speed * lineDir;
    if (Math.abs(lineOffset) >= g_settings.mouse.jitter_range) {
        lineDir *= -1; // 到邊界反向
    }

    if (document.pointerLockElement === video) {
        const dx = horizontal ? g_settings.mouse.jitter_speed * lineDir : 0;
        const dy = horizontal ? 0 : g_settings.mouse.jitter_speed * lineDir;
        sendMouseEvent_Relative(dx, dy, 0, 0);
    } else {
        const x = Math.round(abs_last_x + (horizontal ? lineOffset : 0));
        const y = Math.round(abs_last_y + (horizontal ? 0 : lineOffset));
        sendMouseEvent_Absolute(x, y, 0, 0);
    }
}

function sendJitterMotion() {
    if (document.pointerLockElement === video) {
        const dx = Math.floor(Math.random() * 5) - 2; // -2 ~ +2
        const dy = Math.floor(Math.random() * 5) - 2;
        sendMouseEvent_Relative(dx, dy, 0, 0);
    } else {
        const x = abs_last_x + (Math.floor(Math.random() * 5) - 2);
        const y = abs_last_y + (Math.floor(Math.random() * 5) - 2);
        sendMouseEvent_Absolute(x, y, 0, 0);
    }
}

document.getElementById("autoMouse-btn").addEventListener("click", (e) => {
    if (mouseInterval) {
        clearInterval(mouseInterval);
        mouseInterval = null;
        e.currentTarget.classList.remove("active");
        console.log("auto mouse stopped");
    } else {
        circleAngle = 0;
        lineOffset = 0;
        lineDir = 1;

        const mode = g_settings.mouse.jitter_mode;

        if (mode === "circle") {
            mouseInterval = setInterval(sendCircleMotion, 20);
        } else if (mode === "hline") {
            mouseInterval = setInterval(() => sendLineMotion(true), 50);
        } else if (mode === "vline") {
            mouseInterval = setInterval(() => sendLineMotion(false), 50);
        } else {
            mouseInterval = setInterval(sendJitterMotion, 50);
        }

        e.currentTarget.classList.add("active");
        console.log("Starting auto mouse simulation, mode:", mode);
    }
});

//==================================================================================鍵盤處理
video.addEventListener("keydown", (e) => {
    e.preventDefault();
    e.stopPropagation();

    const payload = {
        key: e.key,
        code: e.code,
        altKey: e.altKey,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
        metaKey: e.metaKey,
        repeat: e.repeat
    };
    highlightVirtualKey(e.code, true);
    sendKeyToHost("keydn", payload);
    //console.log("KeyDown:", e);
});

video.addEventListener("keyup", (e) => {
    const payload = {
        key: e.key,
        code: e.code,
        altKey: e.altKey,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
        metaKey: e.metaKey
    };
    highlightVirtualKey(e.code, false);
    sendKeyToHost("keyup", payload);
});

kb.addEventListener("keydown", (e) => {
    e.preventDefault();
    e.stopPropagation();

    const payload = {
        key: e.key,
        code: e.code,
        altKey: e.altKey,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
        metaKey: e.metaKey,
        repeat: e.repeat
    };
    highlightVirtualKey(e.code, true);
    sendKeyToHost("keydn", payload);
});

kb.addEventListener("keyup", (e) => {
    const payload = {
        key: e.key,
        code: e.code,
        altKey: e.altKey,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
        metaKey: e.metaKey
    };
    highlightVirtualKey(e.code, false);
    sendKeyToHost("keyup", payload);
});

//==================================================================================剪貼簿處理
["sendKeyboardBtn1", "sendKeyboardBtn2", "sendKeyboardBtn3"].forEach((id, idx) => {
    const el = document.getElementById(id);

    el.addEventListener("click", () => {
        const text = document.getElementById(`id_text_clipboard${idx + 1}`).value;
        
        if (!text) {
            showToast(t('toast.clipboard_empty'));
        }
        else {
            sendTextToHost(text);
        }

        video.focus();
    });
});

["id_text_clipboard1", "id_text_clipboard2", "id_text_clipboard3"].forEach((id, idx) => {
    const el = document.getElementById(id);

    el.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault(); // 防止換行（如果是 textarea）
            const text = el.value;
            
            if (!text) {
                showToast(t('toast.clipboard_empty'));
            }
            else {
                sendTextToHost(text);
            }

            video.focus();
        }
    });
});

document.getElementById('sendClipboardBtn').addEventListener('click', async () => {
    try {
        let text = "";

        if (window.electronClipboard && typeof window.electronClipboard.readText === "function") {
            text = await window.electronClipboard.readText();
        } else {
            text = await navigator.clipboard.readText();
        }

        if (text && text.length > 0) {
            //console.log("剪貼簿內容：", text);
            sendTextToHost(text);
        } else {
            showToast(t('toast.clipboard_empty'));
        }
    } catch (err) {
        showToast(t('toast.clipboard_err') + err.message);
    }

    video.focus();
});

//==================================================================================Hotkey處理
let hotkeyRecording = false;
let currentHotkeyIndex = -1;
let hotkeyTargetBox = null;

let hotkeyRecord_tmp = {
    ctrl: false,
    alt: false,
    shift: false,
    meta: false,

    ctrlCode: "",
    altCode: "",
    shiftCode: "",
    metaCode: "",

    key: "",
    code: ""
};

let hotkeyRecord = [
    {
        ctrl: false, alt: false, shift: false, meta: false,
        ctrlCode: "", altCode: "", shiftCode: "", metaCode: "",
        key: "", code: ""
    },
    {
        ctrl: false, alt: false, shift: false, meta: false,
        ctrlCode: "", altCode: "", shiftCode: "", metaCode: "",
        key: "", code: ""
    },
    {
        ctrl: false, alt: false, shift: false, meta: false,
        ctrlCode: "", altCode: "", shiftCode: "", metaCode: "",
        key: "", code: ""
    }
];

// 三個textbox點擊錄製
["id_text_sendHotkey1", "id_text_sendHotkey2", "id_text_sendHotkey3"].forEach((id, idx) => {
    const el = document.getElementById(id);

    el.addEventListener("click", () => {
        startHotkeyRecording(idx, el);
    });
});

// 三個送出按鈕
// =============== 熱鍵按鈕：點擊單發 + 長按 xxx 秒啟動 repeat ===============
const HOTKEY_CHARGE_MS = 2000;   // 長按 xxx 秒啟動
const HOTKEY_REPEAT_MS = 500;   // 啟動後每 xxx 秒送一次

const hotkeyRepeatState = [
    { timer: null, interval: null, repeating: false, justActivated: false },
    { timer: null, interval: null, repeating: false, justActivated: false },
    { timer: null, interval: null, repeating: false, justActivated: false },
];

function isHotkeyEmpty(hotkey) {
    if( !hotkey.key && (!hotkey.ctrl && !hotkey.alt && !hotkey.shift && !hotkey.meta)) 
    {
        showToast(t('toast.hotkey_empty'));
        return true;
    }
    return false;
}

["id_btn_sendHotkey1", "id_btn_sendHotkey2", "id_btn_sendHotkey3"].forEach((id, idx) => {
    const btn = document.getElementById(id);
    const state = hotkeyRepeatState[idx];

    if (!btn) return;

    // 啟動長按充能
    const startCharge = () => {
        // 如果已經是 repeat 狀態，就不要再重來一次
        if (state.repeating || state.timer || isHotkeyEmpty(hotkeyRecord[idx])) return;

        btn.classList.add("charging");  // 外圈開始動畫

        state.timer = setTimeout(() => {
            state.timer = null;
            state.repeating = true;
            state.justActivated = true;   // 用來忽略「啟動完那一下 click」

            btn.classList.remove("charging");
            btn.classList.add("active");  // 橘色高亮，表示正在 repeat

            // 立刻先送一次
            sendHotkey(hotkeyRecord[idx]);
            video.focus();

            // 之後每秒送一次
            state.interval = setInterval(() => {
                sendHotkey(hotkeyRecord[idx]);
            }, HOTKEY_REPEAT_MS);

        }, HOTKEY_CHARGE_MS);
    };

    // 在長按完成前放開 / 滑出 → 取消充能
    const cancelCharge = () => {
        if (state.timer) {
            clearTimeout(state.timer);
            state.timer = null;
            btn.classList.remove("charging");
        }
    };

    // 滑鼠長按
    btn.addEventListener("mousedown", (e) => {
        if (e.button !== 0) return; // 只看左鍵
        startCharge();
    });
    btn.addEventListener("mouseleave", cancelCharge);
    document.addEventListener("mouseup", cancelCharge);

    // 觸控長按
    btn.addEventListener("touchstart", (e) => {
        startCharge();
    });
    ["touchend", "touchcancel"].forEach(ev => {
        btn.addEventListener(ev, (e) => {
            state.justActivated = false;
            cancelCharge();
        });
    });

    // 點擊邏輯：
    // 1. 若剛剛是長按啟動 repeat，第一個 click 只用來「結束長按」→ 直接忽略
    // 2. 如果目前在 repeat 模式 → click = 關掉 repeat
    // 3. 否則就當作一般按鈕：單發一次 hotkey
    btn.addEventListener("click", (e) => {
        if (isHotkeyEmpty(hotkeyRecord[idx])) {
            return;
        }

        video.focus();

        // 忽略長按啟動後，放開那一下 click
        if (state.justActivated) {
            state.justActivated = false;
            return;
        }

        if (state.repeating) {
            // 關閉 repeat
            state.repeating = false;
            btn.classList.remove("active");

            if (state.interval) {
                clearInterval(state.interval);
                state.interval = null;
            }
        } else {
            // 正常單發
            sendHotkey(hotkeyRecord[idx]);
        }
    });
});

/*
["id_btn_sendHotkey1", "id_btn_sendHotkey2", "id_btn_sendHotkey3"].forEach((id, idx) => {
    const el = document.getElementById(id);

    el.addEventListener("click", () => {
        sendHotkey(hotkeyRecord[idx]);
        video.focus();
    });
});
*/

// 儲存hotkey
document.getElementById("hotkeyConfirmBtn").addEventListener("click", () => {
    hotkeyRecord[currentHotkeyIndex] = { ...hotkeyRecord_tmp };
    updateHotkeyTextbox();
    stopHotkeyRecording();
});

// 取消
document.getElementById("hotkeyCancelBtn").addEventListener("click", () => {
    stopHotkeyRecording();
});

function startHotkeyRecording(index, targetBox) {
    hotkeyRecording = true;
    currentHotkeyIndex = index;
    hotkeyTargetBox = targetBox;

    // 清空狀態
    hotkeyRecord_tmp = {
        ctrl: false,
        alt: false,
        shift: false,
        meta: false,

        ctrlCode: "",
        altCode: "",
        shiftCode: "",
        metaCode: "",

        key: "",
        code: "",

        ctrl_click: false,
        alt_click: false,
        shift_click: false,
        meta_click: false,
        normal_click: false
    };

    // 顯示 modal
    showHotkeyMask();

    // 不要顯示LED
    const Led = { num: 0, caps: 0, scroll: 0 };
    setKeyboardLEDs(Led);

    // 打開虛擬鍵盤
    showVirtualKeyboard();

    kb.focus();
}

function stopHotkeyRecording() {
    hotkeyRecording = false;
    currentHotkeyIndex = -1;
    hotkeyTargetBox = null;

    hideHotkeyMask();
    hideVirtualKeyboard();

    document.querySelectorAll(".vk-key").forEach(k => k.classList.remove("active"));
}

function keyNameFromModifierCode(code) {
    if (code.startsWith("Control")) return "Control";
    if (code.startsWith("Shift")) return "Shift";
    if (code.startsWith("Alt")) return "Alt";
    if (code.startsWith("Meta")) return "Meta";
    return "";
}

function sendHotkey(hk) {
    if (isHotkeyEmpty(hk)) {
        return;
    }

    const modifierCodes = [];

    if (hk.ctrl) {
        modifierCodes.push(hk.ctrlCode || "ControlLeft");
    }

    if (hk.shift) {
        modifierCodes.push(hk.shiftCode || "ShiftLeft");
    }

    if (hk.alt) {
        modifierCodes.push(hk.altCode || "AltLeft");
    }

    if (hk.meta) {
        modifierCodes.push(hk.metaCode || "MetaLeft");
    }

    // 1. 先按下 modifier，這裡 code 會是 ControlLeft / AltRight / ShiftRight...
    for (const modCode of modifierCodes) {
        sendKeyToHost("keydn", {
            key: keyNameFromModifierCode(modCode),
            code: modCode,
            ctrlKey: false,
            altKey: false,
            shiftKey: false,
            metaKey: false
        });
    }

    // 2. 再按下一般鍵
    sendKeyToHost("keydn", {
        key: hk.key,
        code: hk.code,
        ctrlKey: hk.ctrl,
        altKey: hk.alt,
        shiftKey: hk.shift,
        metaKey: hk.meta
    });

    setTimeout(() => {
        // 3. 放開一般鍵
        sendKeyToHost("keyup", {
            key: hk.key,
            code: hk.code,
            ctrlKey: false,
            altKey: false,
            shiftKey: false,
            metaKey: false
        });

        // 4. 反向放開 modifier
        for (let i = modifierCodes.length - 1; i >= 0; i--) {
            const modCode = modifierCodes[i];

            sendKeyToHost("keyup", {
                key: keyNameFromModifierCode(modCode),
                code: modCode,
                ctrlKey: false,
                altKey: false,
                shiftKey: false,
                metaKey: false
            });
        }
    }, 80);
}

function showHotkeyMask() {
    document.getElementById("hotkey-video-mask").classList.add("show");
    document.getElementById("hotkey-video-mask2").classList.add("show");
}

function hideHotkeyMask() {
    document.getElementById("hotkey-video-mask").classList.remove("show");
    document.getElementById("hotkey-video-mask2").classList.remove("show");
}

function collectHotkeyFromVirtualKeyboard(type, payload) {
    const code = payload.code;
    const key = payload.key;

    if (type == "keydn") {

        if (code.startsWith("Control")) {
            if (!hotkeyRecord_tmp.ctrl_click) {
                hotkeyRecord_tmp.ctrl_click = true;

                hotkeyRecord_tmp.ctrl = !hotkeyRecord_tmp.ctrl;

                if (hotkeyRecord_tmp.ctrl) {
                    hotkeyRecord_tmp.ctrlCode = code;   // ControlLeft / ControlRight
                } else {
                    hotkeyRecord_tmp.ctrlCode = "";
                }
            }
        }
        else if (code.startsWith("Shift")) {
            if (!hotkeyRecord_tmp.shift_click) {
                hotkeyRecord_tmp.shift_click = true;

                hotkeyRecord_tmp.shift = !hotkeyRecord_tmp.shift;

                if (hotkeyRecord_tmp.shift) {
                    hotkeyRecord_tmp.shiftCode = code;  // ShiftLeft / ShiftRight
                } else {
                    hotkeyRecord_tmp.shiftCode = "";
                }
            }
        }
        else if (code.startsWith("Alt")) {
            if (!hotkeyRecord_tmp.alt_click) {
                hotkeyRecord_tmp.alt_click = true;

                hotkeyRecord_tmp.alt = !hotkeyRecord_tmp.alt;

                if (hotkeyRecord_tmp.alt) {
                    hotkeyRecord_tmp.altCode = code;    // AltLeft / AltRight
                } else {
                    hotkeyRecord_tmp.altCode = "";
                }
            }
        }
        else if (code.startsWith("Meta")) {
            if (!hotkeyRecord_tmp.meta_click) {
                hotkeyRecord_tmp.meta_click = true;

                hotkeyRecord_tmp.meta = !hotkeyRecord_tmp.meta;

                if (hotkeyRecord_tmp.meta) {
                    hotkeyRecord_tmp.metaCode = code;   // MetaLeft / MetaRight
                } else {
                    hotkeyRecord_tmp.metaCode = "";
                }
            }
        }
        else {
            // 一般按鍵只能單一
            if (!hotkeyRecord_tmp.normal_click) {
                hotkeyRecord_tmp.normal_click = true;

                // ⭐ 自動轉大寫（只轉單字元 a~z）
                const upper = (typeof key === "string" && key.length === 1)
                    ? key.toUpperCase()
                    : key;

                hotkeyRecord_tmp.key = upper;
                hotkeyRecord_tmp.code = code;
            }
        }
    } else if (type == "keyup") {
        if (code.startsWith("Control")) {
            hotkeyRecord_tmp.ctrl_click = false;
        }
        else if (code.startsWith("Shift")) {
            hotkeyRecord_tmp.shift_click = false;
        }
        else if (code.startsWith("Alt")) {
            hotkeyRecord_tmp.alt_click = false;
        }
        else if (code.startsWith("Meta")) {
            hotkeyRecord_tmp.meta_click = false;
        }
        else {
            hotkeyRecord_tmp.normal_click = false;
        }
    }

    // ⭐ 這是關鍵：更新虛擬鍵盤 highlight
    hotkeyHighlightUpdate();
}

function hotkeyHighlightUpdate() {
    // 先清除所有按鍵高亮
    document.querySelectorAll(".vk-key").forEach(k => k.classList.remove("active"));

    // 高亮 META keys
    if (hotkeyRecord_tmp.ctrl) {
        document.querySelectorAll(`.vk-key[data-code^="Control"]`).forEach(k => k.classList.add("active"));
    }
    if (hotkeyRecord_tmp.alt) {
        document.querySelectorAll(`.vk-key[data-code^="Alt"]`).forEach(k => k.classList.add("active"));
    }
    if (hotkeyRecord_tmp.shift) {
        document.querySelectorAll(`.vk-key[data-code^="Shift"]`).forEach(k => k.classList.add("active"));
    }
    if (hotkeyRecord_tmp.meta) {
        document.querySelectorAll(`.vk-key[data-code^="Meta"]`).forEach(k => k.classList.add("active"));
    }

    // 高亮一般鍵（只有一個）
    if (hotkeyRecord_tmp.code) {
        const normal = document.querySelector(`.vk-key[data-code="${hotkeyRecord_tmp.code}"]`);
        if (normal) normal.classList.add("active");
    }
}

function updateHotkeyTextbox() {
    let arr = [];
    if (hotkeyRecord_tmp.ctrl) arr.push("Ctrl");
    if (hotkeyRecord_tmp.alt) arr.push("Alt");
    if (hotkeyRecord_tmp.shift) arr.push("Shift");
    if (hotkeyRecord_tmp.meta) arr.push("Win");
    if (hotkeyRecord_tmp.key) arr.push(hotkeyRecord_tmp.key);

    hotkeyTargetBox.value = arr.join(" + ");
}

//==================================================================================虛擬鍵盤
let keyboardWasOpenBeforeFullscreen = false;

function isKeyboardOpen() {
    return kb.classList.contains("show");
}

function showVirtualKeyboard() {
    const wrapper = document.querySelector(".keyboard-wrapper");
    kb.classList.add("show");
    wrapper.classList.add("show");

    // 讓按鈕進入 active 狀態
    document.getElementById("toggleKeyboardBtn").classList.add("active");
    resizeVideo();

    if (hotkeyRecording) {
        document.getElementById("id_div_hotkeyBlock").style.display = "flex";
        document.getElementById("hotkeyConfirmBtn").style.display = "flex";
        document.getElementById("hotkeyCancelBtn").style.display = "flex";
        document.getElementById("virtualRemote").style.display = "none";

    } else {
        document.getElementById("id_div_hotkeyBlock").style.display = "none";
        document.getElementById("hotkeyConfirmBtn").style.display = "none";
        document.getElementById("hotkeyCancelBtn").style.display = "none";
        document.getElementById("virtualRemote").style.display = "flex";
    }
}

function hideVirtualKeyboard() {
    const wrapper = document.querySelector(".keyboard-wrapper");
    kb.classList.remove("show");
    wrapper.classList.remove("show");

    document.getElementById("toggleKeyboardBtn").classList.remove("active");
    resizeVideo();
}

document.getElementById("toggleKeyboardBtn").addEventListener("click", (e) => {
    if (kb.classList.contains("show")) {
        hideVirtualKeyboard();
    }
    else {
        showVirtualKeyboard();
        video.focus();
    }
});

let modifierState = {
    alt: false,
    ctrl: false,
    shift: false,
    meta: false
};

let activeKey = null;

document.querySelectorAll(".vk-key").forEach(key => {
    key.addEventListener("mousedown", () => {
        activeKey = key;
        sendKeyEvent(key, "keydn");
    });
});

// 全域收尾
document.addEventListener("mouseup", () => {
    if (activeKey) {
        sendKeyEvent(activeKey, "keyup");
        activeKey = null;
    }
});

const activeTouches = new Map();
document.querySelectorAll(".vk-key").forEach(key => {
    key.addEventListener("touchstart", (e) => {
        e.preventDefault();
        for (let touch of e.changedTouches) {
            activeTouches.set(touch.identifier, key);
            key.classList.add("active");
            sendKeyEvent(key, "keydn");
        }
    });
});

// 全域觸控放開
document.addEventListener("touchend", (e) => {
    for (let touch of e.changedTouches) {
        const key = activeTouches.get(touch.identifier);
        if (key) {
            key.classList.remove("active");
            sendKeyEvent(key, "keyup");
            activeTouches.delete(touch.identifier);
        }
    }
});

// （可選）處理 touchcancel，避免中斷後卡住
document.addEventListener("touchcancel", (e) => {
    for (let touch of e.changedTouches) {
        const key = activeTouches.get(touch.identifier);
        if (key) {
            key.classList.remove("active");
            sendKeyEvent(key, "keyup");
            activeTouches.delete(touch.identifier);
        }
    }
});

function sendKeyEvent(key, type) {
    const code = key.dataset.code;
    const keyLabel = key.textContent.trim();

    // 修飾鍵狀態管理
    if (type === "keydn") {
        if (code.startsWith("Alt")) modifierState.alt = true;
        if (code.startsWith("Control")) modifierState.ctrl = true;
        if (code.startsWith("Shift")) modifierState.shift = true;
        if (code.startsWith("Meta")) modifierState.meta = true;
    } else if (type === "keyup") {
        if (code.startsWith("Alt")) modifierState.alt = false;
        if (code.startsWith("Control")) modifierState.ctrl = false;
        if (code.startsWith("Shift")) modifierState.shift = false;
        if (code.startsWith("Meta")) modifierState.meta = false;
    }

    const payload = {
        key: keyLabel,
        code: code,
        altKey: modifierState.alt,
        ctrlKey: modifierState.ctrl,
        shiftKey: modifierState.shift,
        metaKey: modifierState.meta
    };

    sendKeyToHost(type, payload);
    //console.log("[VK]", type, payload);
}

function highlightVirtualKey(code, pressed) {
    const el = document.querySelector(`.vk-key[data-code="${code}"]`);
    if (!el) return;
    if (pressed) {
        el.classList.add("active");
    } else {
        el.classList.remove("active");
    }
}

/** 讓你在任何地方都能呼叫，保持全域 */
window.updateLed = function (el, on) {
    if (!el) return;
    if (on) { el.classList.add('on'); }
    else { el.classList.remove('on'); }
};

window.setKeyboardLEDs = function (payload) {
    // 從裝置傳來的格式（aio_cdrom 發送）：
    // { event:"led", num:0/1, caps:0/1, scroll:0/1 }
    var num = !!(payload && payload.num);
    var caps = !!(payload && payload.caps);
    var scroll = !!(payload && payload.scroll);

    var elNum = document.getElementById('led-num');
    var elCaps = document.getElementById('led-caps');
    var elScroll = document.getElementById('led-scroll');

    // 錄製hotkey不需要LED
    if (hotkeyRecording) {
        updateLed(elNum, 0);
        updateLed(elCaps, 0);
        updateLed(elScroll, 0);
    }
    else {
        updateLed(elNum, num);
        updateLed(elCaps, caps);
        updateLed(elScroll, scroll);
    }
};

//==================================================================================虛擬遙控器
document.querySelectorAll(".remote-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const usage = parseInt(btn.dataset.usage, 16);
        const msg = {
            usage: usage
        };
        sendMediaKeyToHost(msg);

        setTimeout(() => {
            const msgUp = {
                usage: 0
            };
            sendMediaKeyToHost(msgUp);
        }, 30);
        //console.log("[Remote] mediakey", usage.toString(16));
    });
});

//==================================================================================聲音 mute
const audioElem = document.getElementById("id_audio");
const muteIconImg = document.getElementById("mute_icon");
const muteBtn = document.getElementById("id_button_mute");

function setAudioMuteState(flag) {
    if (flag) {
        audioElem.muted = true;
        updateMuteIcon(muteIconImg, true);
        muteBtn.classList.remove("active");
    } else {
        audioElem.muted = false;
        updateMuteIcon(muteIconImg, false);
        muteBtn.classList.add("active");
    }
}

muteBtn.addEventListener("click", (e) => {
    audioElem.muted = !audioElem.muted;
    updateMuteIcon(muteIconImg, audioElem.muted);

    if (audioElem.muted) {
        e.currentTarget.classList.remove("active");
    } else {
        e.currentTarget.classList.add("active");
    }
});

//==================================================================================FPS render chart
const el_span_fps = document.getElementById("id_span_fps");
const ctx_fpsRender = document.getElementById('id_chart_fpsRender').getContext('2d');

var fpsRenderChart = new Chart(ctx_fpsRender, {
    type: 'line',
    data: {
        labels: [],        // X 軸 (時間)
        datasets: [
            {
                label: 'Render FPS',
                data: [],
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
                fill: false,
                borderWidth: 2,         // 線條粗細，預設是
                pointRadius: 1,         // 預設點大小
                pointHoverRadius: 4,    // 滑鼠移上去時放大
                //pointBackgroundColor: 'red', // 點的顏色
                pointBorderWidth: 1,    // 點邊框粗細
                pointBorderColor: 'rgb(75, 192, 192)' // 點邊框顏色
            },
        ]
    },
    options: {
        responsive: true,
        animation: false,
        plugins: {
            legend: {
                display: false,   // 改成 false 就完全不顯示圖例
                position: 'top', // 改成 'right' 就靠右
                align: 'end',      // 向右靠
                labels: {
                    boxWidth: 0,  // 把小方框寬度設成 0 → 只顯示文字，沒有方框
                    usePointStyle: false
                }
            },
        },
        scales: {
            x: {
                ticks: { display: false }  // 不顯示時間刻度，保持簡潔
            },
            y: {
                min: 0,          // 最小值固定 0
                max: 90,         // 最大值固定 90
                ticks: {
                    stepSize: 30 // 每格 30 → 就會是 0, 30, 60, 90
                }
            }
        }
    },
    //plugins: [fixedFpsLabelPlugin]
});

function updateRenderFPSChart(renderFPS) {
    const labels = fpsRenderChart.data.labels;
    if (labels.length >= 60) {
        labels.shift();
        fpsRenderChart.data.datasets.forEach(ds => ds.data.shift());
    }

    labels.push(new Date().toLocaleTimeString());
    fpsRenderChart.data.datasets[0].data.push(renderFPS);

    fpsRenderChart.update();
}

function clearFpsChart() {
    try {
        if (!fpsRenderChart) return;

        // 清空 labels / data
        fpsRenderChart.data.labels = [];
        fpsRenderChart.data.datasets.forEach(ds => {
            ds.data = [];
        });

        fpsRenderChart.update();
    } catch (e) {
        console.warn("[Chart] clearFpsChart failed:", e);
    }
}

let lastPresentedFrames = 0;
let lastRenderTime = performance.now();

function onFrame(now, metadata) {
    const diff = now - lastRenderTime;

    if (diff >= 1000) {   // 每秒更新一次
        const deltaFrames = metadata.presentedFrames - lastPresentedFrames;
        let fps = (deltaFrames * 1000) / diff;

        // clamp 防呆
        if (fps < 0) fps = 0;
        if (fps > 80) fps = 80;

        updateRenderFPSChart(fps);
        el_span_fps.textContent = fps.toFixed(0) + "fps";

        // update internal state
        lastRenderTime = now;
        lastPresentedFrames = metadata.presentedFrames;
    }

    video.requestVideoFrameCallback(onFrame);
}
video.requestVideoFrameCallback(onFrame);

//==================================================================================狀態指示
const keyboard_status_icon = document.querySelector("#id_span_keyboard_icon img");
const Mouse_status_icon = document.querySelector("#id_span_mouse_icon img");

video.addEventListener("mouseenter", () => {
    isMouseControl = true;
    if (!usb_connection) return;
    updateMouseStatusIcon(Mouse_status_icon, 0);
});

video.addEventListener("mouseleave", () => {
    isMouseControl = false;
    updateMouseStatusIcon(Mouse_status_icon, 8);
});

video.addEventListener("focus", () => {
    isKeyboardControl = true;
    if (!usb_connection) return;
    updateKeyboardStatusIcon(keyboard_status_icon, 1);
});

video.addEventListener("blur", () => {
    isKeyboardControl = false;
    updateKeyboardStatusIcon(keyboard_status_icon, 0);
    sendKeyboardReleaseAll("window blur");
});

kb.addEventListener("focus", () => {
    isKeyboardControl = true;
    if (!usb_connection) return;
    updateKeyboardStatusIcon(keyboard_status_icon, 1);
});

kb.addEventListener("blur", () => {
    if( hotkeyRecording ) {
        kb.focus();     // 錄製 hotkey 時強制保持焦點
        return;         // 錄製 hotkey 時不因為失去焦點而送出 release all
    }

    isKeyboardControl = false;
    updateKeyboardStatusIcon(keyboard_status_icon, 0);
    sendKeyboardReleaseAll("vkb blur");
});

function updateKeyboardStatusLabel(payload) {
    const span = document.getElementById("id_span_keyboard_status");
    if (!span) return;

    const is_repeating = hotkeyRepeatState[0].repeating || hotkeyRepeatState[1].repeating || hotkeyRepeatState[2].repeating;

    if ( (!isKeyboardControl || !usb_connection) && !is_repeating ) {
        clearKeyboardStatusLabel();
        return;
    }

    let keyLabel = payload.key;

    // 把常見的名稱轉成比較好看的文字
    if (keyLabel === "Control") keyLabel = "Ctrl";
    if (keyLabel === "AltGraph") keyLabel = "Alt";
    if (keyLabel === "Alt") keyLabel = "Alt";
    if (keyLabel === "Meta") keyLabel = "Win";
    if (keyLabel === "Shift") keyLabel = "Shift";

    // 空白鍵另外處理
    if (keyLabel === " ") keyLabel = "Space";

    // 單一字元轉大寫，例如 'p' → 'P'
    if (typeof keyLabel === "string" && keyLabel.length === 1) {
        keyLabel = keyLabel.toUpperCase();
    }

    span.textContent = keyLabel || "";
    lastKeyDisplayCode = payload.code || null;
}

function clearKeyboardStatusLabel() {
    const span = document.getElementById("id_span_keyboard_status");
    if (!span) return;
    span.textContent = "";
    lastKeyDisplayCode = null;
}

function clearKeyboardMouseStatus() {               
    document.getElementById("id_button_keyboard_status").classList.remove("active");
    updateKeyboardStatusIcon(keyboard_status_icon, 0);
    clearKeyboardStatusLabel();
    document.getElementById("id_button_mouse_status").classList.remove("active");
}