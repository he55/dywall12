// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('node:path')

let wallpaper_data=loadWallpaperData()
ipcMain.handle('getWallpapers',()=>wallpaper_data)

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
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

async function loadWallpaperData(){
  let url='https://www.douyin.com/aweme/v1/web/wallpaper/item/?cookie_enabled=true&screen_width=1920&screen_height=1080&browser_language=zh-CN&browser_platform=Win32&browser_name=Chrome&browser_version=104.0.5112.102&browser_online=true&engine_name=Blink&engine_version=104.0.5112.102&os_name=Windows&os_version=10&cpu_core_num=6&device_memory=8&platform=PC&downlink=9.7&effective_type=4g&round_trip_time=0&device_platform=webapp&aid=6383&channel=channel_pc_web&count=20&cursor=0&version=2&need_aweme_image=true&tag_id=0&sort_type=1&show_type=0'
  let res=await fetch(url,{referrer:'https://www.douyin.com'})
  let data=await res.json()
  let tag_list=data.tag_list
  let list=data.wallpaper_list.map(item=>{
    let obj={
      desc:item.aweme.desc,
      img:item.aweme.video.cover.url_list[0],
    }
    if(item.aweme.images){
      obj.type=0
      obj.res=item.aweme.images[0].download_url_list[0]
    }else{
      obj.type=1
      obj.res=item.aweme.video.download_addr.url_list[0]
    }
    return obj
  })
  return {tag_list,list}
}