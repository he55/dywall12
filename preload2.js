const { ipcRenderer } = require("electron")

ipcRenderer.on('set-wallpaper', (event, obj) => {
    let container = document.querySelector('.container')
    if (obj.type === 0) {
        container.innerHTML = `<img src=${obj.res}>`
    } else {
        container.innerHTML = `<video src=${obj.res} loop autoplay></video>`
    }
})