// communicate with other frame player dynamically play songs

export class EmbedPlayer {
    constructor(frame) {
        this.frame = frame
    }

    playEmbedSong(song) {
        console.log('play-embed-song', this.frame, song)
        this.frame.postMessage({ 'action': 'play-embed-song', 'data': song.toJSON() })
    }
}