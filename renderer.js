/**
 * This file is loaded via the <script> tag in the index.html file and will
 * be executed in the renderer process for that window. No Node.js APIs are
 * available in this process because `nodeIntegration` is turned off and
 * `contextIsolation` is turned on. Use the contextBridge API in `preload.js`
 * to expose Node.js functionality from the main process.
 */

async function loadData(){
    let data=await ipc.getWallpapers()
    let tag_list=data.tag_list
    let wallpaper_list=data.list

    let left_ul=document.querySelector('.left')
    tag_list.forEach((item,idx)=>{
        let li=document.createElement('li')
        li.textContent=item.tag_name
        if(idx===2){
            li.className='active'
        }
        left_ul.appendChild(li)
    })
    let main_li=document.querySelector('.main')
    wallpaper_list.forEach((item,idx)=>{
        let li=document.createElement('li')
        if(idx===5){
            li.className='active'
        }
        let img =new Image()
        img.src=item.img
        li.appendChild(img)
        main_li.appendChild(li)
    })

    console.log(data)
}
loadData()