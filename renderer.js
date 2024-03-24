/**
 * This file is loaded via the <script> tag in the index.html file and will
 * be executed in the renderer process for that window. No Node.js APIs are
 * available in this process because `nodeIntegration` is turned off and
 * `contextIsolation` is turned on. Use the contextBridge API in `preload.js`
 * to expose Node.js functionality from the main process.
 */

const { createApp, ref, toRaw, onMounted } = Vue

window.addEventListener('DOMContentLoaded', async () => {
    let tag_list = await ipc.loadTagList()
    const videos = ref([])
    const ulElement = ref(null)

    let lastMenu
    async function menuClick(item) {
        if (lastMenu) {
            lastMenu.isActive = false
        }
        item.isActive = true

        if (!item.data) {
            item.data = []
        }

        if (item !== lastMenu) {
            videos.value = item.data
            ulElement.value.scrollTop = 0
        }

        try {
            /** @type {[]} */
            let list = await ipc.loadWallpaperData(item.tag_id, item.data.length)
            list.forEach(element => {
                item.data.push(element)
            });
        } catch (error) {
            console.log('load fail')
        }

        lastMenu = item
    }

    let lastVideo
    function videoClick(item) {
        if (lastVideo) {
            lastVideo.isActive = false
        }
        lastVideo = item
        item.isActive = true

        ipc.setWallpaper(toRaw(item))
    }
    function videoMouseenter(item) {
        item.isHover = true
        console.log('mouseenter')
    }
    function videoMouseLeave(item) {
        item.isHover = false
        console.log('mouseleave')
    }
    createApp({
        setup() {
            onMounted(async () => {
                await menuClick(tag_list[0])
            })
            const categories = ref(tag_list)
            return {
                ulElement,
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
