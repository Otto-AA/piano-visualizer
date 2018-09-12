import EventHandler from "./EventHandler";

class MidiInput extends EventHandler {
    constructor(additionalEventTypes) {
        super(["event", "loadingStarted", "loadingFinished", "start", "pause", ...additionalEventTypes]);

        this.playing = false;
        this.loaded = false;
        this.loading = false;

        this.addListener("start", () => this.playing = true);
        this.addListener("pause", () => this.playing = false);
        this.addListener("loadingStarted", () => this.loading = true);
        this.addListener("loadingFinished", () => {
            this.loading = false;
            this.loaded = true;
        });
    }

    isPlaying() {
        return this.playing;
    }

    hasLoaded() {
        return this.loaded;
    }

    isLoading() {
        return this.loading;
    }
}

export default MidiInput;