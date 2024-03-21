/**
 * This file is loaded via the <script> tag in the index.html file and will
 * be executed in the renderer process for that window. No Node.js APIs are
 * available in this process because `nodeIntegration` is turned off and
 * `contextIsolation` is turned on. Use the contextBridge API in `preload.js`
 * to expose Node.js functionality from the main process.
 */

const { createApp, ref,toRaw } = Vue

window.addEventListener('DOMContentLoaded',async()=>{
    let data = await ipc.getWallpapers()
   
    let lastMenu
    function menuClick(item){
        if(lastMenu){
            lastMenu.isActive=false
        }
        lastMenu=item
        item.isActive=true
    }

    let lastVideo
    function videoClick(item){
        if(lastVideo){
            lastVideo.isActive=false
        }
        lastVideo=item
        item.isActive=true

        ipc.setWallpaper(toRaw(item))
    }
    function videoMouseenter(item){
        item.isHover=true
        console.log('mouseenter')
    }
    function videoMouseLeave(item){
        item.isHover=false
        console.log('mouseleave')
    }
    createApp({
      setup() {
        const categories=ref(data.tag_list)
        const videos=ref(data.list)
        return {
            categories,
            videos,
            menuClick,
            videoClick,
            videoMouseenter,
            videoMouseLeave,
        }
      }
    }).mount('#app')
})


async function loadData() {
    let data = await ipc.getWallpapers()
    let tag_list = data.tag_list
    let wallpaper_list = data.list

    let left_ul = document.querySelector('.left')
    tag_list.forEach((item, idx) => {
        let li = document.createElement('li')
        li.textContent = item.tag_name
        if (idx === 2) {
            li.className = 'active'
        }
        left_ul.appendChild(li)
    })

    let main_li = document.querySelector('.main')
    wallpaper_list.forEach((item, idx) => {
        let li = document.createElement('li')
        li.innerHTML = `<img src=${item.img}>`
        li.onclick = () => {
            ipc.setWallpaper(item)
        }
        if (item.type === 1) {
            function mouseenter() {
                li.onmouseenter = null
                this.innerHTML = `<video src=${item.res} loop autoplay muted></video>`
                console.log('mouseenter', item.res)

                li.onmouseleave = function () {
                    this.innerHTML = `<img src=${item.img}>`
                    console.log('mouseleave')
                    li.onmouseenter = mouseenter
                }
            }
            li.onmouseenter = mouseenter
        }

        if (idx === 5) {
            li.className = 'active'
        }
        main_li.appendChild(li)
    })

    console.log(data)
}
// loadData()
