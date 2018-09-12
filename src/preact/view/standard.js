import { h, render, Component } from "preact";
import MidiFileInput from "../utils/MidiFileInput";


class App extends Component {
    constructor() {
        super();

        const myRequest = new Request(`https://cors-anywhere.herokuapp.com/${prompt("Url to .mid file") || "player.bplaced.net/user/A_A/data/Hes-Gone.mid"}`);

        fetch(myRequest)
            .then(function (response) {
                return response.arrayBuffer();
            })
            .then(function (buffer) {
                console.log("Loaded buffer", buffer);
                const midiInput = new MidiFileInput();
                midiInput.addListener("loadingFinished", () => midiInput.start());
                midiInput.addListener("start", () => console.log("started"));
                midiInput.addListener("event", event => console.log("event", event));

                midiInput.loadArrayBuffer(buffer);
            })
            .catch((err) => alert(`Error: ${JSON.stringify(err)}`));

    }

    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <h1 className="App-title">Welcome to React</h1>
                </header>
                <p className="App-intro">
                    To get started, edit <code>src/App.js</code> and save to reload.
        </p>
            </div>
        );
    }
}

render(<App />, document.body);

/**
 * 
 * Utils
 * ->Drag and Drop
 * ->Visualization Data Fetcher
 * 
 * MidiInput (File | Live)
 * ->MidiFileLoader
 * ->LiveMidiInput
 * 
 * AudioInput (File | FromMidi)
 * ->AudioFileLoader
 * ->AudioFromMidiInput
 * 
 * KeyboardVisualizer
 * ->(Parent: MidiVisualizer)
 * ->Key
 * 
 * FrequencyCircle
 * ->(Parent: AudioVisualizer)
 * ->Tick/Bar
 * 
 * PlayerControls
 * 
 * Shortcuts
 * 
 * BackgroundImage
 * 
 * 
 */