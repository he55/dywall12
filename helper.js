const { app } = require('electron')
const path = require('node:path')
const fs = require('fs')
const { finished } = require('node:stream/promises')
const { Readable } = require('node:stream')

const dataPath = path.join(app.getPath('sessionData'), 'data')
if (!fs.existsSync(dataPath)) {
  fs.mkdirSync(dataPath)
}

const cachePath = path.join(dataPath, 'cache')
if (!fs.existsSync(cachePath)) {
  fs.mkdirSync(cachePath)
}

const wallpaperPath = path.join(dataPath, 'wallpaper')
if (!fs.existsSync(wallpaperPath)) {
  fs.mkdirSync(wallpaperPath)
}

async function loadTagList() {
  let url = `https://www.douyin.com/aweme/v1/web/wallpaper/item`
  let res = await fetch(url, { referrer: 'https://www.douyin.com' })
  let data = await res.json()
  for (const item of data.tag_list) {
    item.data = []
  }
  return data.tag_list
}

async function loadWallpaperData(id, cursor = 0) {
  let url = `https://www.douyin.com/aweme/v1/web/wallpaper/item/?cookie_enabled=true&screen_width=1920&screen_height=1080&browser_language=zh-CN&browser_platform=Win32&browser_name=Chrome&browser_version=104.0.5112.102&browser_online=true&engine_name=Blink&engine_version=104.0.5112.102&os_name=Windows&os_version=10&cpu_core_num=6&device_memory=8&platform=PC&downlink=9.7&effective_type=4g&round_trip_time=0&device_platform=webapp&aid=6383&channel=channel_pc_web&count=20&cursor=${cursor}&version=2&need_aweme_image=true&tag_id=${id}&sort_type=1&show_type=0`
  let res = await fetch(url, { referrer: 'https://www.douyin.com' })
  let data = await res.json()
  if (!data.wallpaper_list) {
    return []
  }
  let list = data.wallpaper_list.map(item => {
    let obj = {
      aweme_id: item.aweme.aweme_id,
      desc: item.aweme.desc,
      img: item.aweme.video.cover.url_list[0],
    }

    if (item.aweme.images) {
      obj.type = 0
      obj.res = item.aweme.images[0].download_url_list[0]
    } else {
      obj.type = 1
      obj.res = item.aweme.video.download_addr.url_list[0]
    }

    const cachefile = path.join(cachePath, obj.aweme_id + '.jpeg')
    if (fs.existsSync(cachefile)) {
      obj.img = cachefile
    }

    const filepath = path.join(wallpaperPath, obj.aweme_id + (obj.type === 0 ? '.jpeg' : '.mp4'))
    if (fs.existsSync(filepath)) {
      obj.res = filepath
    }

    return obj
  })
  cacheImage(list)
  return list
}

async function cacheImage(list) {
  for (const item of list) {
    const filename = path.join(cachePath, item.aweme_id + '.jpeg')
    if (fs.existsSync(filename)) {
      continue
    }
    try {
      await download_file(item.img, filename)
    } catch (error) {
      console.error('cache image error', filename, error)
    }
  }
}

async function download_file(url, path) {
  const res = await fetch(url)
  const stream = fs.createWriteStream(path)
  await finished(Readable.fromWeb(res.body).pipe(stream))
}

async function download_wallpaper(item) {
  const filepath = path.join(wallpaperPath, item.aweme_id + (item.type === 0 ? '.jpeg' : '.mp4'))
  if (fs.existsSync(filepath)) {
    return
  }
  try {
    await download_file(item.res, filepath)
  } catch (error) {
    console.error('download wallpaper error', item.res, error)
  }
}

module.exports = {
  loadTagList,
  loadWallpaperData,
  download_wallpaper
}
