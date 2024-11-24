import { EventEmitter } from './EventEmitter.js'
import MidiPlayerJS from './MidiPlayerJS/index.js'

const MidiPlayer = MidiPlayerJS.Player

// Player
//
// Managing the playing of audio and midi files
//
export class Player extends EventEmitter {
	constructor() {
        super(['load', 'ready', 'play', 'pause', 'stop', 'error', 'frequency', 'note', 'ended'])
		this.buffer = null
		this.songinfo = { duration: 0 }
        this._playing = false
        this._ready = false
		this.startedAtTime = 0
		this.startTime = 0
        this.functionsOnLoad = []

        this.on('ready', () => this._ready = true)
        this.on('load', () => this._ready = false)
        this.on('play', () => this._playing = true)
        this.on('pause', () => this._playing = false)
        this.on('ended', () => this.stop())
	}

	init() {
		console.log('[Player]Init');

		// Load the Audio-Api
		this.loadApi();
        this.updateVolume(0);
        this.midiPlayer = new MidiPlayer()
        this.midiPlayer.on('midiEvent', noteEvent => {
            if (noteEvent.name === 'Note on' || noteEvent.name === 'Note off')
                this.emit('note', noteEvent)
        })
	}

	loadApi() {
		this.loadContext();

		this.loadJsNode();

		this.destination = this.context.destination;

		this.loadAnalyser();
		this.loadGainNode();
		this.initHandlers();

		this.loadSource();
	}

	loadContext() {
		// Close old context
		this.context && this.context.close();
		// Create new context
		window.AudioContext = window.AudioContext || window.webkitAudioContext;
		this.context = new AudioContext();
		this.context.suspend();
	}

	loadJsNode() {
		this.javascriptNode = this.context.createScriptProcessor(2048, 1, 1);
		this.javascriptNode.connect(this.context.destination);
	}

	loadAnalyser() {
		this.analyser = this.context.createAnalyser();
		this.analyser.connect(this.javascriptNode);
		this.analyser.smoothingTimeConstant = 0.6;
		this.analyser.fftSize = 2048;
	}

	loadGainNode() {
		this.gainNode = this.context.createGain();
		this.gainNode.connect(this.analyser);
		this.gainNode.connect(this.destination);
	}

	loadSource() {
        console.log('loadSource')
		// Stop source if already existing
		if (this.source && this.source.constructor == AudioBufferSourceNode && this.sourceStarted)
			this.source.stop();

		this.source = this.context.createBufferSource();
        this.source.connect(this.gainNode);
        // TODO: ended gets called too often
        //       in particular when switching from a currently playing song to another
        // this.source.addEventListener('ended', e => this.emit('ended'))

		if (this.buffer)
			this.source.buffer = this.buffer;

		this.sourceStarted = false;
	}

	initHandlers() {
		this.javascriptNode.addEventListener('audioprocess', () => {
            const frequencyData = new Uint8Array(this.analyser.frequencyBinCount)
            this.analyser.getByteFrequencyData(frequencyData)

            this.emit('frequency', frequencyData)
		})
    }

    // TODO: Handle switching song while loading
	async loadSong(song) {
        this.emit('load')

		// Load and decode audio file
        await Promise.all([
            this._loadAudio(song),
            this._loadMidi(song),
        ])
        this.emit('ready')
    }
    
    _loadAudio(song) {
        return new Promise((resolve, reject) => {
            const request = new XMLHttpRequest();
            const url = song.getFileByExtension("mp3");
            console.log("Loading mp3 file", url);
    
            request.open('GET', url, true);
            request.responseType = 'arraybuffer';
            request.onload = () => {
                // Decode Audio
                this.context.decodeAudioData(request.response, buffer => {
                    console.log('decoded audio data', buffer);
    
                    // Change source.buffer
                    try {
                        this.buffer = buffer;
                        this.loadSource();
                    } catch (e) {
                        this.emit('error', 'Error while processing audio data')
                        reject(e)
                    }
                    this.songinfo.duration = buffer.duration;
    
                    resolve()
                }, e => {
                    this.emit('error', 'Could not decode audio data')
                    reject(e)
                });
            };
            request.send();
        })
    }

    // Load midi file if it exists
    async _loadMidi(song) {
        if (song.hasFile('mid')) {
            console.log('Loading midi file', song.getFileByExtension('mid'))
            const res = await fetch(song.getFileByExtension('mid'))
            const buffer = await res.arrayBuffer()
            this.midiPlayer.loadArrayBuffer(buffer)
        }
    }

    isReady() {
        return this._ready
    }

	isPlaying() {
		return this._playing
	}

	play() {
        if (!this.isPlaying()) {
            this.emit('play')

            // Play audio
            this.context.resume && this.context.resume();
            if (!this.sourceStarted) {
                this.source.start(0, this.startTime);
                this.sourceStarted = true;
                this.startedAtTime = this.context.currentTime - this.startTime;
            }
            // Play MIDI
            this.midiPlayer.play()
        }
	}

	pause() {
        if (this.isPlaying()) {
            this.emit('pause')
            this._pause()
        }
    }
    
    _pause() {
        this.context.suspend();
        this.midiPlayer.pause()
    }

	stop() {
        if (this.isPlaying()) {
            this.pause()
            this.emit('stop')
            this.setTime(0)
            this.midiPlayer.stop()
        }
    }
    
    /** TODO: Workaround for ended event getting called too often */
    triggerEnded() {
        this.emit('ended')
    }

	setTime(seconds) {
		const wasPlaying = this.isPlaying()
        this._pause()
        this._playing = false
		this.loadSource()
		this.startTime = seconds
        this.midiPlayer.skipToSeconds(seconds)
		if (wasPlaying)
			this.play()
	}

	updateVolume(ratio) {
		this.gainNode.gain.value = ratio
	}

	getCurrentTime() {
		return this.context.currentTime - this.startedAtTime
	}

	getDuration() {
		return this.songinfo.duration
	}
}