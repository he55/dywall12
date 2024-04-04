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
    const categories = ref(tag_list)
    const videos = ref([])
    /** @type {HTMLUListElement} */
    const ulElement = ref(null)
    const categoryIndex = ref(-1)

    async function loadData() {
        const item = tag_list[categoryIndex.value]

        try {
            /** @type {[]} */
            let list = await ipc.loadWallpaperData(item.tag_id, item.data.length)
            list.forEach(element => {
                item.data.push(element)
            });
        } catch (error) {
            console.log('load fail')
        }

        videos.value = item.data
    }

    async function menuClick(index) {
        if (categoryIndex.value !== index) {
            ulElement.value.scrollTop = 0
        }
        categoryIndex.value = index

        if (tag_list[index].data.length === 0) {
            await loadData()
        } else {
            videos.value = tag_list[index].data
        }
    }

    let flag = false
    async function onscroll(e) {
        if (flag) return

        const clientHeight = e.target.clientHeight
        const scrollTop = e.target.scrollTop
        const scrollHeight = e.target.scrollHeight
        if (clientHeight + scrollTop + 5 > scrollHeight) {
            console.log('loaded')
            flag = true
            await loadData()
            flag = false
        }
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
                await menuClick(0)
            })
            return {
                ulElement,
                categories,
                categoryIndex,
                videos,
                menuClick,
                onscroll,
                videoClick,
                videoMouseenter,
                videoMouseLeave,
            }
        }
    }).mount('#app')
})
