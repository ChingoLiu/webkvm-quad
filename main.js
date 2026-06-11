const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");

let serialInteractive = false;
let lastVidPid = null; // e.g. "1a86:55d3"

ipcMain.on("serial:setInteractive", (_e, v) => {
    serialInteractive = !!v;
});

function vidpidKey(p) {
    const vid = (p.vendorId ?? 0).toString(16).padStart(4, "0");
    const pid = (p.productId ?? 0).toString(16).padStart(4, "0");
    return `${vid}:${pid}`.toLowerCase();
}

function makeSerialPortLabel(p) {
    const name = p.displayName || "Serial Port";
    const portName = p.portName || "";

    if (portName) {
        return `${name} ${portName}`;
    }

    return name;
}

async function pickPortWithDialog(win, portList) {
    const items = portList.map((p) => {
        return makeSerialPortLabel(p);
    });

    const { response } = await dialog.showMessageBox(win, {
        type: "question",
        buttons: [...items, "Cancel"],
        defaultId: 0,
        cancelId: items.length,
        title: "Select COM Port",
        message: "Choose a serial device:",
        noLink: true,
    });

    if (response >= 0 && response < portList.length) return portList[response];
    return null;
}

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 800,
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"), // 加入 preload（給 electronSerial.setInteractive 用）
            nodeIntegration: false,
            contextIsolation: true,

            // 保留你 fullscreen 正常版本的關鍵設定
            sandbox: false,
            webSecurity: true,
            allowRunningInsecureContent: false,

            enableBlinkFeatures: "Serial",
             // 讓 preload 也載入 iframe
            nodeIntegrationInSubFrames: true
        },
    });

    win.loadFile(path.join(__dirname, "index.html"));

    // 開發工具（debug視窗）
    //win.webContents.openDevTools({ mode: "detach" });

    const ses = win.webContents.session;

    // 權限：camera/mic/serial + pointerLock + fullscreen（這是你 fullscreen 正常的關鍵）
    ses.setPermissionRequestHandler((_webContents, permission, callback) => {
        if (
            permission === "media" ||
            permission === "serial" ||
            permission === "pointerLock" ||
            permission === "fullscreen" ||
            permission === "keyboardLock"
        ) {
            return callback(true);
        }
        callback(false);
    });

    ses.setPermissionCheckHandler((_webContents, permission) => {
        if (
            permission === "media" ||
            permission === "serial" ||
            permission === "pointerLock" ||
            permission === "fullscreen" ||
            permission === "keyboardLock"
        ) {
            return true;
        }
        return false;
    });

    // 裝置層權限（有些 Electron 版本會走這個）
    if (ses.setDevicePermissionHandler) {
        ses.setDevicePermissionHandler((details) => {
            if (details.deviceType === "serial") return true;
            if (details.deviceType === "camera" || details.deviceType === "microphone") return true;
            return false;
        });
    }

    // Web Serial：select-serial-port（加入你「comport 正常版本」的互動/自動邏輯）
    ses.on("select-serial-port", async (event, portList, _webContents, callback) => {
        event.preventDefault();

        console.log("=== select-serial-port ===");
        console.log("interactive =", serialInteractive, "portList =", portList.length);
        portList.forEach((p, i) => {
            console.log(i, { portId: p.portId, vidpid: vidpidKey(p), displayName: p.displayName });
        });

        // 先：如果不是互動模式，且 lastVidPid 還在 → 自動選它
        if (!serialInteractive && lastVidPid) {
            const hit = portList.find((p) => vidpidKey(p) === lastVidPid);
            if (hit) {
                console.log("[serial] auto-pick last =", lastVidPid);
                callback(hit.portId);
                return;
            }
        }

        // 再：如果你想保留「自動挑 CH340」當 fallback（避免每次都跳 dialog）
        // 你原本 fullscreen 正常版本有做 auto-pick CH340，這裡我保留當 fallback
        const TARGET_VID = 0x1a86;
        const TARGET_PID = 0x55d3;
        const ch340 = portList.find((p) => p.vendorId === TARGET_VID && p.productId === TARGET_PID);

        // 如果「非互動模式」且有 CH340，就直接挑（跟你第一份一致）
        if (!serialInteractive && ch340) {
            lastVidPid = vidpidKey(ch340);
            console.log("[serial] auto-pick CH340 =", lastVidPid);
            callback(ch340.portId);
            return;
        }

        // 互動模式 or 沒命中 → 跳選擇對話框
        const picked = await pickPortWithDialog(win, portList);
        if (!picked) {
            console.log("[serial] user canceled");
            callback(""); // renderer 會看到 NotFoundError
            return;
        }

        lastVidPid = vidpidKey(picked);
        console.log("[serial] user picked =", lastVidPid);
        callback(picked.portId);
    });

    // Pointer Lock：允許/處理 requestPointerLock()（你 fullscreen 正常版本保留）
    win.webContents.on("request-pointer-lock", () => {
        console.log("[electron] request-pointer-lock");
    });

    win.webContents.on("lost-pointer-lock", () => {
        console.log("[electron] lost-pointer-lock");
    });

    return win;
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("window:set-fullscreen", (event, enable) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return false;

    win.setFullScreen(!!enable);
    return win.isFullScreen();
});

ipcMain.handle("window:toggle-fullscreen", (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return false;

    const next = !win.isFullScreen();
    win.setFullScreen(next);
    return win.isFullScreen();
});

ipcMain.handle("window:is-fullscreen", (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return false;

    return win.isFullScreen();
});
