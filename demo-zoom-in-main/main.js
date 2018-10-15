const { app, BrowserWindow, ipcMain } = require("electron");

// ========================================
// ------------zoom sdk logic-------------
// ========================================
const ZOOMSDKMOD = require("./lib/zoom_sdk.js");

let sdkReady = false;

let zoomsdk = null;
let zoomauth = null;
let zoommeeting = null;

// get sdk instance
zoomsdk = ZOOMSDKMOD.ZoomSDK.getInstance({
  threadsafemode: 0,
  apicallretcb: function(apiname, ret) {
    console.log(`call api, apiname: ${apiname}, ret: ${ret}`);
    if ("InitSDK" == apiname && ZOOMSDKMOD.ZoomSDKError.SDKERR_SUCCESS == ret) {
      // get zoom auth module
      zoomauth = zoomsdk.GetAuth({
        authcb: status => {
          // it's the callback after auth, can be triggered if zoom sdk runs in main process
          console.log("zoom sdk auth cb", status);
          sdkReady =
            status === ZOOMSDKMOD.ZOOMAUTHMOD.ZoomAuthResult.AUTHRET_SUCCESS;
        }
      });
      // get zoom meeting module
      zoommeeting = zoomsdk.GetMeeting({});

      console.log('before call sdk auth');
      zoomauth.SDKAuth(
        "PWT7phpeZP00QnlSCXik2vjEzMgdQIJGWqeN",
        "UG6N5OOSgGUuxb0FSzyJW2gPZItojqoEwImp"
      );
    }
  },
  ostype: ZOOMSDKMOD.ZOOM_TYPE_OS_TYPE.MAC_OS
});

// join a schueled meeting
ipcMain.on("join", () => {
  console.log('join meeting 8700073849');
  sdkReady && zoommeeting.JoinMeeting({
    meetingnum: "8700073849",
    psw: "test",
    username: "2333"
  });
});

ipcMain.on("leave", () => {
  sdkReady && zoommeeting.LeaveMeeting();
});

// ========= electron logic =========

let win;

function createWindow() {
  win = new BrowserWindow({ width: 1200, height: 900 });
  win.loadFile(__dirname + "/index.html");
  win.webContents.openDevTools();
  zoomsdk.InitSDK({
    webdomain: "https://www.zoom.us",
    langid: ZOOMSDKMOD.ZoomSDK_LANGUAGE_ID.LANGUAGE_English
  });
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (win === null) {
    createWindow();
  }
});
