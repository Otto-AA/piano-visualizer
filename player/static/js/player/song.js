export class Song {
	constructor({ name, dataName, composer, type, info, date, files, YT, designId }, { dataDir, designDir }) {
		this.name = name;
		this.dataName = dataName;
		this.date = date; // TODO: date format

		this._filePath = dataDir + dataName;
		this.files = files;

		this.youtubeLink = YT ?? '';
		this.composer = Array.isArray(composer) ? composer.join(" & ") : (composer ?? "[unknown]")
		this.info = info
		this.type = type;
		this.designId = designId

        this.dataDir = dataDir
        this.designDir = designDir
	}

	getFileByExtension(fileExtension) {
		return `${this._filePath}.${fileExtension}`;
	}

	hasFile(fileExtension) {
		return this.files.includes(fileExtension);
	}

    loadDesign() {
        return fetch(`${this.designDir}${this.designId}`)
    }

    toJSON() {
        return { ...this }
    }

    static fromJSON(json) {
        // we don't care about passing too many properties
        // as it gets destructured anyway in the constructor
        return new Song({ ...json }, { ...json })
    }
}

const defaultDesign = {
    "background_color": "#002e30",
    "tick_gradient": ["#49e3e8","#5f9ea0","#f5f5f5"],
    "tick_width": 2,
    "piano_border_white": true,
    "piano_border_black": true,
    "piano_border_color": "#408080",
    "key_pressed_color": "#74b2b4",
    "font_color": "#92ccca"
}

export class EmbedSong {
    // files is a map of extension => blob url
    constructor({ name, type, info, date, files, YT }, design = defaultDesign) {
		this.name = name;
		this.dataName = 'temporary';
		this.date = date;
		this.files = files;

		this.youtubeLink = YT ?? '';
		this.composer = 'you'
		this.info = info
		this.type = type;
        this.design = design
	}

	getFileByExtension(fileExtension) {
		return this.files[fileExtension]
	}

	hasFile(fileExtension) {
		return fileExtension in this.files
	}

    loadDesign() {
        return Promise.resolve(this.design)
    }

    toJSON() {
        return { ...this }
    }

    static fromJSON(json) {
        // we don't care about passing too many properties
        // as it gets destructured anyway in the constructor
        return new EmbedSong({ ...json }, json.design)
    }
}