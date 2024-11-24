import { EmbedPlayer } from './player/embed.js'
import { EmbedDesign } from './player/design.js'

function initPreviewButton() {
    const button = document.getElementById('open_preview')
    /**@type {EmbedPlayer} */
    let embedPlayer = null
    button.addEventListener('click', async e => {
        e.preventDefault()
        const urlParams = new URLSearchParams()
        const song = urlParams.get('song')
        embedPlayer = embedPlayer ?? new EmbedPlayer(window.open(`/users/1/player`)) // TODO: fix hardcode
        const design = new EmbedDesign(await parseEmbedDesign())
        console.log(design)
        setTimeout(() => embedPlayer.applyEmbedDesign(design), 5000)
    })
}

async function parseEmbedDesign() {
    const valueByName = name => document.getElementsByName(name)[0].value
    const data = {
        "background_color": valueByName('background_color'), 
        "created_at": "Tue, 01 Mar 2022 18:46:16 GMT", 
        "created_by": "test", 
        "design_id": -1, 
        "font_color": valueByName('font_color'), 
        "id": -1, 
        "key_pressed_color": valueByName('key_pressed_color'), 
        "piano_border_color": valueByName('piano_border_color'), 
        "piano_border_white": valueByName('piano_border_white'), 
        "piano_border_black": valueByName('piano_border_black'), 
        "tick_gradient": [
          valueByName('tick_gradient_0'), 
          valueByName('tick_gradient_1'), 
          valueByName('tick_gradient_2'), 
        ],
        "tick_width": valueByName('tick_width'), 
        "updated_at": "Tue, 01 Mar 2022 18:47:55 GMT",
      }

    const imageFileInput = document.getElementsByName('background_image')[0]
    if (imageFileInput.files.length) {
        const file = imageFileInput.files[0]
        const imgUrl = await fileToDataUrl(file)
        data.image_data = imgUrl
        data.image_creator = valueByName('image_creator')
        data.image_link = valueByName('image_link')

    }
    return data
}

function fileToDataUrl(file) {
    return new Promise(resolve => {
        const reader = new FileReader()
        reader.onload = e => resolve(e.target.result)
        reader.readAsDataURL(file)
    })
}

initPreviewButton()
