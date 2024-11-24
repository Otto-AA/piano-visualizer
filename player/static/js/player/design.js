export class EmbedDesign {
    // background_color, created_at, created_by, design_id, font_color, id, image_creator, image_file_name, image_link, key_pressed_color, piano_border_black, piano_border_color, piano_border_white, tick_gradient, tick_width, updated_at
	constructor(design) {
        Object.entries(design)
            .forEach(([key, val]) => this[key] = val)
	}

    toJSON() {
        return { ...this }
    }

    static fromJSON(json) {
        return new this(json)
    }
}
