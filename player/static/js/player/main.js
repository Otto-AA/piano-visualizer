import { Player } from './Player.js'
import { Framer, Scene, Tracker } from './audioVisualization.js'
import { Song, EmbedSong } from './song.js'

/** @type {Design} */
var design // Currently also used in playerPreview

const userId = Number(location.pathname.match(/users\/(\d+)\//)[1])
const defaultUserPath = `/users/${userId}/`;
const dataDir = `${defaultUserPath}/files/`;
const designDir = `/designs/`;
const imageDir = `/images/`;
const VIDEO_QUERY_PARAM = 'v'

class PianoKey {
	constructor({ id, note, color }) {
		this.id = id;
		this.note = note;
		this.color = color;
	}
}

// TODO: Replace
const MIDI = {}
MIDI.keyToNote = {}; // C8  == 108
MIDI.noteToKey = {}; // 108 ==  C8

(function() {
	const A0 = 0x15; // first note
	const C8 = 0x6C; // last note
	const number2key = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
	for (let n = A0; n <= C8; n++) {
		const octave = (n - 12) / 12 >> 0;
		const name = number2key[n % 12] + octave;
		MIDI.keyToNote[name] = n;
		MIDI.noteToKey[n] = name;
	}
})();

class Piano {
	constructor() {
		this.numKeys = 88;
		this.pianoSelector = '.piano';
		/** @type {PianoKey[]} */
		this.keys = [];
		this.whiteKeyWidth = 0;
		this.blackKeyWidth = 0;
		this.configureKeys();
	}

	configureKeys() {
		for (let i = 1; i <= this.numKeys; i++) {
			const note = MIDI.noteToKey[i + 20];
			const color = note.length === 2 ? "white" : "black";
			this.keys.push(new PianoKey({ id: i, note, color }));
		}
		// Calculate key width
		const numWhiteKeys = this.keys.filter(key => key.color === "white").length;
		const numBlackKeys = this.keys.filter(key => key.color === "black").length;

		this.whiteKeyWidth = 100 / numWhiteKeys;
		this.blackKeyWidth = 50 / numBlackKeys;

		$('.key.white').css('width', this.whiteKeyWidth + "%");
		$('.key.black').css('width', this.blackKeyWidth + "%");
	}

	insertKeys() {
		console.log('[Piano]Inserting Keys');
		$('.piano .black_keys, .piano .white_keys').empty();

		this.keys.forEach(key => {
			$(`${this.pianoSelector} .${key.color}_keys`).append(`<div class="key ${key.color}" id="key_${key.id}" data-key="${key.note}"></div>`);

			if (key.color === "black") {
				let offsetLeft = 0;
				const octave = Math.floor((key.id + 8) / 12);
				switch ((key.id + 8) % 12) {
					case 1:
					case 3:
						offsetLeft = ((key.id - 1 + octave * 2) * this.whiteKeyWidth / 2);
						break;
					case 6:
					case 8:
					case 10:
						offsetLeft = ((key.id - 1 + octave * 2 + 1) * this.whiteKeyWidth / 2);
						break;
				}
				$(`${this.pianoSelector} .black_keys .key:last-child`).css("left", offsetLeft + "%");
			}
		});
	}

	handleNoteEvent(noteEvent) {
		const note = noteEvent.noteNumber - 21 + 1;
		if (noteEvent.name === 'Note on' && noteEvent.velocity) {
			$('#key_' + note).addClass('pressed');
		} else {
			$('#key_' + note).removeClass('pressed');
		}
	}

	/**
	 * Reset the status for all keys
	 */
	clearKeys() {
		this.keys.forEach(key => this.hideKey(key))
	}

	/**
	 * @param {PianoKey} key
	 */
	showKey(key) {
		$('#key_' + key.id).addClass('pressed');
	}

	/**
	 * @param {PianoKey} key
	 */
	hideKey(key) {
		console.log(key.note)
		$('#key_' + key.id).removeClass('pressed')
	}

	show() {
		$(this.pianoSelector).addClass('visible');
	}
	hide() {
		$(this.pianoSelector).removeClass('visible');
	}
}

class Interface {
	constructor() {
		this.timerInterval = null
	}

	/**
	 * @param {Design} design
	 * @param {Player} player
	 * @param {Song[]} songlist
	 */
	init(design, player, songlist, currentSongIndex) {
		console.log("[Interface]Init");
		this.design = design
		this.player = player
		this.songlist = songlist
		this.currentSongIndex = currentSongIndex

		// Controls toggle
		$('#toggleControls').click(() => {
			$('.controls').toggleClass('visible');
		});

		// Create Songlist
		$('.songlist').empty();
		for (let i = 0; i < songlist.length; i++) {
			const $li = '<li data-song="' + (songlist.length - i) + '"><span class="title">' + songlist[i].name + '</span></li>';
			$('.songlist').append($li);
		}

		// Add active-status to current song
		$('.songlist li:nth-child(' + (this.currentSongIndex + 1) + ')').addClass('active');

		// Change background
		this.currentSong.loadDesign()
			.then(design => this.design.applyDesign(design))

		// Buttons
		$('.songlist li').click(({ currentTarget }) => {
			if ($(currentTarget).hasClass('active'))
				return false;

			this.changeSong($(currentTarget).index())
		});
		$('#play').click(() => this.player.play());
		$('#pause').click(() => this.player.pause());
		$('#stop').click(() => this.player.stop());
		$('#volume').change(() => this.player.updateVolume($('#volume').val() / 100));
	}

	changeSong(newSongIndex) {
		this.currentSongIndex = newSongIndex
		// Change background
		this.currentSong.loadDesign()
			.then(design => this.design.applyDesign(design))

		// Load song
		this.player.stop();
		this.player.onNext('ready', () => this.player.play());
		this.player.loadSong(this.currentSong);
	}

	get currentSong() {
		return this.songlist[this.currentSongIndex]
	}

	updateDescription() {
		const song = this.currentSong;
		console.log('updateDescription', song)

		// Update Description (menu and center)
		$('.description .title, #trackinfo .title').text(song.name);
		$('.description .type').text(song.type);
		$('.description .composer').text(song.composer);

		// Update songlist active
		$('.songlist li').removeClass('active');
		$('.songlist li:nth-child(' + (this.currentSongIndex + 1) + ')').addClass('active');

		// Update links
		$('.links .YT a').attr("href", "https://youtube.com/watch?v=" + song.youtubeLink);
		$('.links ul').empty();

		for (const fileExtension of ["mp3", "mid", "pdf"])
			if (song.hasFile(fileExtension))
				$('.links ul').append('<li class="' + fileExtension + '"><a href="' + song.getFileByExtension(fileExtension) + '" target="blank">' + fileExtension + '</a></li>');

		// Change url
		setSearchKey(VIDEO_QUERY_PARAM, this.currentSong.dataName);
	}

	updateTimer() {
		const time = this.player.getCurrentTime();
		if (time < this.player.getDuration()) {
			this.setTime(time)
		} else {
			this.player.triggerEnded()
		}
	}

	setTime(seconds) {
		// Bring the seconds into min:sec format
		let min = Math.floor(seconds / 60).toString();
		let sec = Math.floor(seconds % 60).toString();
		while (min.length < 2)
			min = "0" + min;
		while (sec.length < 2)
			sec = "0" + sec;

		// Change the visuals
		$('#trackinfo .min').text(min);
		$('#trackinfo .sec').text(sec);
	}

	startTimer() {
		this.timerInterval = setInterval(() => this.updateTimer(), 300);
		this.setStatus("showTimer");
	}

	stopTimer() {
		clearInterval(this.timerInterval);
		this.timerInterval = false;
	}

	setStatus(status) {
		$('#trackinfo .status').attr("data-status", status);
		if (status === "loading")
			$('canvas').addClass('loading');
		else
			$('canvas').removeClass('loading');
	}

	showError(msg) {
		alert("Sorry, an error occured :/\n" + msg);
		this.setStatus("error");
	}
}

class Design {
	/**
	 * @param {Framer} framer
	 */
	init(framer) {
		this.framer = framer
	}

	applyDesign(design) {
		console.log('Applying design', design)
		this._setBackgroundStyle({
			gradient: {
				color: design.background_color,
			},
			image: {
				name: design.image_file_name,
				credit: {
					name: design.image_creator,
					link: design.image_link,
				}
			}
		});
		this._setPianoStyle({
			key: {
				border: {
					white: design.piano_border_white,
					black: design.piano_border_black,
					color: design.piano_border_color,
				},
				pressed: design.key_pressed_color,
			}
		});
		this._setAudioVisualizationStyle({
			tick: {
				gradient: design.tick_gradient,
				width: design.tick_width,
			}
		});
		this._setGeneralStyle({
			font: {
				color: design.font_color
			}
		});
	}

	_setBackgroundStyle(background) {
		let backgroundGradient = 'radial-gradient(circle, #000,' + background.gradient.color + ' 25%, #000)';

		// Background picture?
		if (background.image) {
			let backgroundImagePath = `${imageDir}${background.image.name}`
			if (background.image.data && background.image.data.includes('data:image'))
				backgroundImagePath = background.image.data;

			backgroundGradient += ', url("' + backgroundImagePath + '")';

			// Credits
			if ('credit' in background.image) {
				const backgroundImageCreator = background.image.credit.name || '[Unknown]';
				const backgroundImageLink = background.image.credit.link || '';
				this._setBackgroundImageCredits(backgroundImageCreator, backgroundImageLink);
			} else
				this._setBackgroundImageCredits('[Unknown]', backgroundImagePath);
		}

		// Set new background
		$('.background.fadedOut').css('background-image', backgroundGradient);

		// Switch between the two backgrounds
		$('.background').toggleClass('fadedOut');
	}

	_setBackgroundImageCredits(creditName, creditLink) {
		const creditText = 'Picture by ' + creditName;
		const html = creditLink ?
			'<a href="' + creditLink + '" target="_blank">' + creditText + '</a>'
			: creditText;
		$('.credits').html(html);
	}

	_setPianoStyle(pianoStyle) {
		if ('key' in pianoStyle) {
			if ('border' in pianoStyle.key) {
				/* TODO: Add border color */
				const borderWhite = (pianoStyle.key.border.white) ? 'none solid solid' : 'none';
				const borderBlack = (pianoStyle.key.border.black) ? 'none solid solid' : 'none';
				$('.key.white').css('border-style', borderWhite);
				$('.key.black').css('border-style', borderBlack);

				if ('color' in pianoStyle.key.border) {
					$('.key').css('border-color', pianoStyle.key.border.color);
				}
			}
			if ('pressed' in pianoStyle.key) {
				$("<style>.key:before{background-color: " + pianoStyle.key.pressed + ";}</style>").appendTo("head");
			}
		}
	}

	_setAudioVisualizationStyle(audioVisualizationStyle) {
		if ('tick' in audioVisualizationStyle) {
			const tick = audioVisualizationStyle.tick;
			if ('gradient' in tick) {
				this.framer.tickColor = tick.gradient;
			}
			if ('width' in tick) {
				this.framer.tickWidth = tick.width;
			}
		}
	}

	_setGeneralStyle(generalStyle) {
		if ('font' in generalStyle) {
			const font = generalStyle.font;
			if ('color' in font) {
				const sides = [[1, 1], [1, -1], [-1, 1], [-1, -1]]
					.map(side => side[0] + 'px ' + side[1] + 'px 0 ' + font.color)
				$('#trackinfo .title').css('text-shadow', sides.join(','));
			}
		}
	}
}

// Main
$(document).ready(function () {
	// Get Songlist
	$.getJSON(`${defaultUserPath}/songs`)
		.done(function (data) {
			// Save data as Songlist
			const songlist = data.songs.map(songData => new Song({
				name: songData.name,
				dataName: songData.file_name,
				composer: 'A_A',
				type: songData.type,
				YT: undefined,
				date: songData.date,
				designId: songData.design_id,
				files: songData.files,
				info: ''
			}, { dataDir, designDir }))

			let curSongIndex = 0
			if (!songlist.length)
				return alert('Cannot load page because no songs have been added yet.')

			design = new Design()
			const player = new Player()
			const piano = new Piano()
			const ui = new Interface()
			const framer = new Framer()
			const scene = new Scene()
			const tracker = new Tracker()

			// Initialize the Interface
			ui.init(design, player, songlist, curSongIndex)

			// Initialize the Canvas-Scene
			scene.init(framer, tracker)
			framer.init(scene)
			tracker.init(scene)

			design.init(framer)

			// Render Scene one time
			scene.render();

			// Initialize the Player
			player.init();
			player.updateVolume($('#volume').val() / 100)
			player.on('load', () => ui.setStatus('loading'))
			player.on('load', () => ui.updateDescription())
			player.on('load', () => ui.setTime(0))
			player.on('ready', () => ui.setStatus('ready'));
			player.on('play', () => ui.startTimer())
			player.on('pause', () => ui.stopTimer())
			player.on('error', msg => ui.showError(msg))

			piano.insertKeys()
			player.on('note', note => piano.handleNoteEvent(note))
			player.on('pause', () => piano.clearKeys())

			player.on('play', () => scene.startRender())
			player.on('pause', () => scene.stopRender())
			player.on('ready', () => scene.render())

			player.on('frequency', frequencies => framer.setFrequencies(frequencies))

			player.on('ready', () => tracker.setDuration(player.getDuration()))
			player.on('frequency', () => tracker.setTime(player.getCurrentTime()))

			player.on('ready', () => ui.currentSong.hasFile('mid') ? piano.show() : piano.hide())

			// Start loading the current track
			player.loadSong(ui.currentSong)

			const shortcuts = new Shortcuts()

			// Space    -Play/Pause
			shortcuts.add(32, () => player.isPlaying() ? player.pause() : player.play())
			// T	-Toggle Controls
			shortcuts.add(84, () => $('#toggleControls').trigger('click'))
			// S	-Stop
			shortcuts.add(83, () => player.stop())

			window.addEventListener('message', ({ origin, data: { action, data }}) => {
				console.log('onmessage')
				if (window.origin !== origin)
					return console.error('Invalid origin', origin)
				if (action === 'play-embed-song') {
					console.log('play-embed-song', data)
					const song = EmbedSong.fromJSON(data)
					songlist.push(song)
					const newSongIndex = songlist.length - 1
					ui.changeSong(newSongIndex)
				}
			})
		}).fail(function (error) {
			alert('Couldn\'t load songlist')
			console.log("Fail")
			console.log(error)
		})
})

class Shortcuts {
	constructor() {
		this.shortcuts = {}
		$(document).keydown(e => {
			if (e.which in this.shortcuts)
				this.shortcuts[e.which](e)
		})
	}

	add(which, callback) {
		this.shortcuts[which] = callback
	}

	removeShortcut(which) {
		delete this.shortcuts[which]
	}
}


function setSearchKey(key, value) {
	const params = new URLSearchParams(window.location.search)
	params.set(key, value)
	history.pushState({}, '', '?' + params.toString())
}

function hasSearchKey(key) {
	const params = new URLSearchParams(window.location.search)
	return params.has(key)
}

function getSearchKey(key) {
	const params = new URLSearchParams(window.location.search)
	return params.has(key) ? params.get(key) : null
}