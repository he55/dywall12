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
