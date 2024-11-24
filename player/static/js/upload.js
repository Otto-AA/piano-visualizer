import { EmbedPlayer } from './player/embed.js'
import { EmbedSong } from './player/song.js'
import { Mp3Cutter } from './mp3Cutter.js'

function initPreviewButton() {
    const button = document.getElementById('open_preview')
    /**@type {EmbedPlayer} */
    let embedPlayer = null
    button.addEventListener('click', async e => {
        e.preventDefault()
        embedPlayer = embedPlayer ?? new EmbedPlayer(window.open('/users/1/player')) // TODO: fix hardcode
        const song = new EmbedSong(await parseEmbedSong())
        console.log(song)
        setTimeout(() => embedPlayer.playEmbedSong(song), 5000)
    })
}

let mp3Cutter = new Mp3Cutter()
const mp3Input = document.getElementsByName('audio_file')[0]
const updateMp3CutterBuffer = async () => {
    if (mp3Input.files.length) {
        console.log('updating mp3 cutter buffer')
        const file = mp3Input.files[0]
        const buffer = await fileToArrayBuffer(file)
        mp3Cutter.loadBuffer(buffer)
    }
}
mp3Input.onchange = updateMp3CutterBuffer
updateMp3CutterBuffer()

async function parseEmbedSong() {
    const valueByName = name => document.getElementsByName(name)[0].value
    const data = {
        name: valueByName('name'),
        type: valueByName('youtubeId'),
        info: '',
        date: valueByName('date'),
        files: {},
        YT: valueByName('youtubeId'),
    }
    const mp3_offset_ms = Number(valueByName('mp3_cut'))
    const fileInputs = document.querySelectorAll('input[type="file"]')
    for (const input of fileInputs) {
        if (input.files.length) {
            const file = input.files[0]
            const extension = file.name.substr(file.name.lastIndexOf('.')+1)

            if (extension === 'mp3' && mp3_offset_ms > 0) {
                const buffer = await mp3Cutter.cut(mp3_offset_ms)
                const newFile = new File([buffer], file.name, { type: 'audio/mp3' })
                const container = new DataTransfer();
                container.items.add(newFile);
                input.files = container.files
            }
            data.files[extension] = await fileToDataUrl(file)
        }
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

function fileToArrayBuffer(file) {
    return new Promise(resolve => {
        const reader = new FileReader()
        reader.onload = e => resolve(e.target.result)
        reader.readAsArrayBuffer(file)
    })
}

initPreviewButton()
