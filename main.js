// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron')
const path = require('node:path')
const { attach, refresh } = require('electron-as-wallpaper')
const {loadTagList,loadWallpaperData,download_wallpaper}=require('./helper')

/** @type {BrowserWindow} */
let mainWindow
/** @type {BrowserWindow} */
let videoWindow

ipcMain.handle('load-wallpaper-data', (event, id, cursor) => loadWallpaperData(id, cursor))
ipcMain.handle('load-tag-list', () => loadTagList())

ipcMain.on('set-wallpaper', (event, obj) => {
  if (!videoWindow) {
    createVideoWindow()
  }
  videoWindow.webContents.send('set-wallpaper', obj)
  download_wallpaper(obj)
})

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })
  mainWindow.on('close', (event) => {
    event.preventDefault()
    mainWindow.hide()
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

function createVideoWindow() {
  videoWindow = new BrowserWindow({
    x: 50,
    y: 50,
    width: 800,
    height: 500,
    fullscreen: true,
    backgroundColor: '#161823',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload2.js')
    }
  })
  attach(videoWindow)

  videoWindow.once('closed', () => {
    videoWindow = null
    refresh()
  })

  videoWindow.loadFile('video.html')
}

function createTray() {
  let tray = new Tray(path.join(__dirname, 'icon_mac_tray@2x.png'))
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Wallpaper', enabled: false },
    {
      label: 'Show', click: () => {
        if (!mainWindow.isVisible()) {
          mainWindow.show()
        }
      }
    },
    {
      label: 'Close Wallpaper', click: () => {
        videoWindow?.close()
      }
    },
    {
      label: 'Exit', click: () => {
        app.exit()
      }
    }
  ])
  tray.setToolTip('Wallpaper')
  tray.setContextMenu(contextMenu)

  if (process.platform === 'win32') {
    tray.on('click', () => {
      if (!mainWindow.isVisible()) {
        mainWindow.show()
      }
    })
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createTray()
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
