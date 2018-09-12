import MidiInput from "./MidiInput";
import MidiPlayer from "midi-player-js";

class MidiFileInput extends MidiInput {
    constructor() {
        // TODO: Update this stupid super(["stop"])
        super(["stop"]);

        this.player = new MidiPlayer.Player();
        this.player.on("midiEvent", event => this._triggerEvent("event", event));
    }

    loadArrayBuffer(arrayBuffer) {
        this._triggerEvent("loadingStarted");
        this.player.loadArrayBuffer(arrayBuffer);
        this._triggerEvent("loadingFinished");
    }

    start() {
        this.player.play();
        this._triggerEvent("start");
    }
    pause() {
        this.player.pause();
        this._triggerEvent("pause");
    }
    stop() {
        this.player.stop();
        this._triggerEvent("pause");
    }
}

export default MidiFileInput;