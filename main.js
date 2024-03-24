// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron')
const path = require('node:path')
const fs=require('fs')
const { attach, refresh } = require('electron-as-wallpaper')
const {download}=require('electron-dl')

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

async function loadTagList() {
  let url = `https://www.douyin.com/aweme/v1/web/wallpaper/item`
  let res = await fetch(url, { referrer: 'https://www.douyin.com' })
  let data = await res.json()
  return data.tag_list
}

async function loadWallpaperData(id, cursor = 0) {
  let url = `https://www.douyin.com/aweme/v1/web/wallpaper/item/?cookie_enabled=true&screen_width=1920&screen_height=1080&browser_language=zh-CN&browser_platform=Win32&browser_name=Chrome&browser_version=104.0.5112.102&browser_online=true&engine_name=Blink&engine_version=104.0.5112.102&os_name=Windows&os_version=10&cpu_core_num=6&device_memory=8&platform=PC&downlink=9.7&effective_type=4g&round_trip_time=0&device_platform=webapp&aid=6383&channel=channel_pc_web&count=20&cursor=${cursor}&version=2&need_aweme_image=true&tag_id=${id}&sort_type=1&show_type=0`
  let res = await fetch(url, { referrer: 'https://www.douyin.com' })
  let data = await res.json()
  let list = data.wallpaper_list.map(item => {
    let obj = {
      aweme_id:item.aweme.aweme_id,
      desc: item.aweme.desc,
      img: item.aweme.video.cover.url_list[0],
    }
    const filename=path.join(wallpaperPath,obj.aweme_id+'.jpeg')
    if(fs.existsSync(filename)){
      obj.img=filename
    }

    if (item.aweme.images) {
      obj.type = 0
      obj.res = item.aweme.images[0].download_url_list[0]
    } else {
      obj.type = 1
      obj.res = item.aweme.video.download_addr.url_list[0]
    }
    return obj
  })
  cacheImage(list)
  return list
}

const wallpaperPath=path.join(app.getPath('sessionData'),'wallpaper')
if(!fs.existsSync(wallpaperPath)){
  fs.mkdirSync(wallpaperPath)
}


async function cacheImage(list){
  for (const item of list) {
    const filename=path.join(wallpaperPath,item.aweme_id+'.jpeg')
    if(fs.existsSync(filename)){
      continue
    }
    try {
    await download(mainWindow,item.img,{showProgressBar:false,directory:wallpaperPath,filename:item.aweme_id+'.jpeg'})
    } catch (error) {
      console.log(error)
    }
  }
}
