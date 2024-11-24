// communicate with other frame player dynamically play songs

export class EmbedPlayer {
    constructor(frame) {
        this.frame = frame
    }

    playEmbedSong(song) {
        console.log('play-embed-song', this.frame, song)
        this.frame.postMessage({ 'action': 'play-embed-song', 'data': song.toJSON() })
    }

    applyEmbedDesign(design) {
        console.log('apply-embed-design', this.frame, design)
        this.frame.postMessage({ 'action': 'apply-embed-design', 'data': design.toJSON() })
    }
}