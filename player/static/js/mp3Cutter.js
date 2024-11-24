
// "Typically the load() func might take few seconds to minutes to complete,
// better to do it as early as possible."
const { createFFmpeg, fetchFile } = FFmpeg
const _ffmpeg = createFFmpeg({ log: true })
let finishedLoading = false
const ffmpegLoadingCallbacks = []
const getFFmpeg = () => {
    return new Promise(resolve => {
        if (finishedLoading) {
            resolve(_ffmpeg)
        } else {
            ffmpegLoadingCallbacks.push(resolve)
        }
    })
}
_ffmpeg.load()
    .then(() => {
        finishedLoading = true
        for (const cb of ffmpegLoadingCallbacks)
            cb(_ffmpeg)
    })

/**
 * Mp3 cutter using ffmpeg.wasm
 */
export class Mp3Cutter {

    async loadBuffer(mp3Buffer) {
        const ffmpeg = await getFFmpeg()
        ffmpeg.FS('writeFile', 'uncut.mp3', await fetchFile(mp3Buffer))
    }

    async cut(from_ms) {
        const ffmpeg = await getFFmpeg()
        const s = Math.floor(from_ms/1000)
        const ms = from_ms % 1000
        await ffmpeg.run('-i', 'uncut.mp3', '-ss', `${s}.${ms}`, '-c', 'copy', 'cut.mp3')
        const data = ffmpeg.FS('readFile', 'cut.mp3')
        ffmpeg.FS('unlink', 'cut.mp3')
        return data.buffer
    }

    async removeBuffer() {
        const ffmpeg = await getFFmpeg()
        ffmpeg.FS('unlink', 'uncut.mp3')
    }

}
