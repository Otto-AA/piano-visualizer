document.getElementById('date').valueAsDate = new Date()

// import PlayerAPI from '/lib/js/api.js'
// import User from '/lib/js/user.js'
// import PlayerPreview from '/lib/js/playerPreview.js'
// import loginModal from '/lib/js/loginModal.js'

const api = new PlayerAPI();
loginModal.init('body');

window.deleteSong = function () {
	const dataname = prompt('Dataname: ');
	return api.deleteSong(dataname);
};

$(document).ready(function () {
	const urlSearch = search_parameters_to_object();
	
	$('#updateSong').submit(UpdateSongFormSubmit);

	initPlayerPreview();
	
	// Import/Export Design
	$('#custom_design_import').click(function () {
		importCustomDesign()
			.then(() => triggerPreviewUpdate())
			.catch(error => alert('An error occured while importing the design :/\n' + error));
	});
	$('#custom_design_export').click(exportCustomDesign);
	
	$('#design').change(loadDefaultDesign);
	loadDefaultDesign();
	
	const user = new User();
	const onLogin = function (activeUser) {
		console.log('Logged in', activeUser);
		user.setUser(activeUser);
		const username = user.getUser().username;
		if (username !== user.getUsernameFromUrl())
			alert(`It seems that you are on the wrong page. Please move to that one instead:\nhttp://player.bplaced.net/user/${username}/manage/`);

		api.getSonglist(username)
			.then(songlist => {
				addSongnameSuggestions(songlist);
				if (Object.prototype.hasOwnProperty.call(urlSearch, 'action') && 
					urlSearch.action === 'edit') {
					const dataname = urlSearch.dataname;
					const targetSong = (() => {
						for (const song of songlist)
							if (song.dataName === dataname)
								return song;
						alert(`Couldn't find song to edit (${dataname})`);
					})();
					console.log('Editing song', targetSong);
					setInputsBySong(targetSong);
				}
			})
			.catch(error => console.error('Couldn\'t load songlist', error));
	};
		
	user.loadActiveUser()
		.then(onLogin)
		.catch(() => {
			loginModal.onLogin(onLogin);
			loginModal.showModal();
		});	
});

const initPlayerPreview = function () {
	// PlayerPreview
	const preview = new PlayerPreview();
	preview.setPreviewContainer('#previewContainer');
	preview.load()
		.then(() => {
			preview.show();
			updatePlayerPreview(preview);
		})
		.catch(error => console.error('Error while loading the preview', error));
	$('#custom_design input, select#design').change(() => updatePlayerPreview(preview));
};

const updatePlayerPreview = function (playerPreview) {
	get_selected_design()
		.then(design => {
			// Check for converting background image name to data url
			if (Object.prototype.hasOwnProperty.call(design.background, 'image')) {
				const backgroundFile = $('#custom_design_background_image').get(0).files[0];
				 input_file_to_data_url(backgroundFile)
					.then(dataUrl => {
						design.background.image.name = dataUrl;
						playerPreview.setDesign(design);
					});
			}
			else
				playerPreview.setDesign(design);
		})
		.catch(error => console.error('Error updating the design', error));
};

const triggerPreviewUpdate = function () {
	$('#custom_design input[type=color]:first').trigger('change');
};

const addSongnameSuggestions = function (songlist) {
	const $datalist = $('<datalist id="songNames">');
	for (const song of songlist) {
		const $option = $(`<option value="${song.name}">`);
		$datalist.append($option);
	}
	$('#songName').after($datalist);
	$('#songName').attr('list', 'songNames');
}

function UpdateSongFormSubmit(event) {
	event.preventDefault();

	console.log($('form *:not(#custom_design)').children('input, textarea, select').serialize());
	const songName = $('#songName').val();
	const songInfo = $('#songInfo').val();
	const youtube_id = get_youtube_video_id($('#youtubeId').val());
	const type = $('#type').children(':selected').val();
	const composers = $('#composers').val().split('\n') || false;
	const audio_file = $('#audio_file').get(0).files[0];
	const midi_file = $('#midi_file').get(0).files[0];
	const pdf_file = $('#pdf_file').get(0).files.length ? $('#pdf_file').get(0).files[0] : undefined;
	const background_image_file = $('#custom_design_background_image').get(0).files[0] ? $('#custom_design_background_image').get(0).files[0] : undefined;
	let design = $('select#design').children(':selected').val();
	if (design.toLowerCase().includes('custom'))
		design = 'custom';
	const custom_design = JSON.stringify(get_custom_design());


	let formData = new FormData();
	formData.append('audio_file', audio_file);
	formData.append('midi_file', midi_file);
	if (pdf_file)
		formData.append('pdf_file', pdf_file);
	if (background_image_file)
		formData.append('background_image_file', background_image_file);
	formData.append('songName', songName);
	if (songInfo)
		formData.append('songInfo', songInfo);
	if (composers)
		formData.append('composers', JSON.stringify(composers));
	if (youtube_id)
		formData.append('youtubeId', youtube_id);
	if (type)
		formData.append('type', type);
	formData.append('design', design);
	if (design === 'custom')
		formData.append('custom_design', custom_design);

	const request_url = $('#updateSong').attr('action');

	api.uploadSong(formData);
}

const setInputsBySong = function (song) {
	alert('The edit feature is still WIP.\nMeanwhile you can overwrite the song (just use the same name) or delete and upload again.');
	$('#songName').val(song.name);
	if (Object.prototype.hasOwnProperty.call(song, 'YT'))
		$('#youtubeId').val(song.YT);
	if (Object.prototype.hasOwnProperty.call(song, 'info'))
		$('#songInfo').val(song.info);
	if (song.design.includes('_custom')) {
		api.getDesign(song.design)
			.then(set_custom_design_inputs)
			.then(triggerPreviewUpdate)
			.catch(error => console.error('Couldn\'t load custom design', error));
	}
};

const loadDefaultDesign = function () {
	const designName = $('select#design').children(':selected').text();
	if (designName.toLowerCase().indexOf('custom') > -1)
		return;
	api.getDesign(designName)
		.then(set_custom_design_inputs)
		.then(triggerPreviewUpdate)
		.catch(error => console.error(error));
}

const importCustomDesign = function () {
	return new Promise(function (resolve, reject) {
		get_local_text_file()
			.then(function (text) {
				const design = JSON.parse(text);
				set_custom_design_inputs(design);
				resolve();
			})
			.catch(function (error) {
				alert('Couldn\'t import design\n' + error);
				reject();
			});
	});
}


const exportCustomDesign = function () {
	const design = get_custom_design();
	user_download_json('Design.json', design);
}


const set_custom_design_inputs = function (design) {
	console.log('Setting custom design');
	const custom_design_id = '#custom_design_';

	if (design.background) {
		if (design.background.gradient.color)
			$(custom_design_id + 'background_gradient_color').val(design.background.gradient.color);
	}
	if (design.visualization) {
		const vis = design.visualization;

		if (vis.audio) {
			if (vis.audio.tick) {
				const tick = vis.audio.tick;
				if (tick.gradient) {
					for (let i = 0; i < tick.gradient.length; i++)
						$(custom_design_id + 'visualization_audio_tick_gradient_' + i).val(tick.gradient[i]);
				}
				if (tick.width)
					$(custom_design_id + 'visualization_audio_tick_width').val(tick.width);
			}
		}
		if (vis.piano) {
			if (vis.piano.key) {
				const key = vis.piano.key;

				if (key.border) {
					const possibleKeyColors = ['white', 'black'];
					possibleKeyColors.forEach(function (keyColor) {
						if (Object.prototype.hasOwnProperty.call(key.border, keyColor))
							$(custom_design_id + 'visualization_piano_key_border_' + keyColor).prop('checked', key.border[keyColor]);
					});
					if (key.border.color)
						$(custom_design_id + 'visualization_piano_key_border_color').val(key.border.color);
				}
				if (key.pressed) {
					$(custom_design_id + 'visualization_piano_key_pressed').val(key.pressed);
				}
			}
		}
	}
	if (design.general) {
		if (design.general.font) {
			const font = design.general.font;
			if (font.color)
				$(custom_design_id + 'general_font_color').val(font.color);
		}
	}
}

const get_selected_design = function () {
	const designName = $('select#design').children(':selected').text();
	if (designName.toLowerCase().indexOf('custom') > -1)
		return new Promise(resolve => resolve(get_custom_design()));
	else
		return api.getDesign(designName);
};

const get_custom_design = function () {
	let design = {};

	// add_value_by_custom_design_id
	//
	// If the input has a value
	// add it to the design
	const add_value_by_custom_design_id = function (selector, design_target=false) {
		design_target = ((design_target) ? design_target : selector).replace(/_/g, '.');
		selector = '#custom_design_' + selector;

		// Get Value
		const new_value = ($(selector).val() !== 'on') ? $(selector).val() : $(selector).is(':checked');
		if (typeof new_value === 'undefined')
			return Error('Value not found');
		else if (Object.prototype.hasOwnProperty.call(new_value, 'length') && new_value.length === 0)
			return;

		const paths = design_target.split('.');
		const num_paths = paths.length;
		let target_object = design;

		for (let i = 0; i < paths.length - 1; i++) {
			const path = paths[i];
			if (Object.prototype.hasOwnProperty.call(target_object, path) === false)
				target_object[path] = {}
			target_object = target_object[path];
		}
		target_object[paths[num_paths - 1]] = new_value;
	};
	add_value_by_custom_design_id('background_image', 'background_image_name');
	add_value_by_custom_design_id('background_image_credit_name');
	add_value_by_custom_design_id('background_image_credit_link');
	add_value_by_custom_design_id('background_gradient_color');
	add_value_by_custom_design_id('visualization_audio_tick_gradient_0');
	add_value_by_custom_design_id('visualization_audio_tick_gradient_1');
	add_value_by_custom_design_id('visualization_audio_tick_gradient_2');
	add_value_by_custom_design_id('visualization_audio_tick_width');
	add_value_by_custom_design_id('visualization_piano_key_border_white');
	add_value_by_custom_design_id('visualization_piano_key_border_black');
	add_value_by_custom_design_id('visualization_piano_key_border_color');
	add_value_by_custom_design_id('visualization_piano_key_pressed');
	add_value_by_custom_design_id('general_font_color');

	// Format design object
	if (design.visualization.audio) {
		let vis = design.visualization.audio;
		if (vis.tick) {
			let tick = vis.tick;
			if (tick.gradient) {
				let arr = [];
				for (const colorkey in tick.gradient) {
					arr.push(tick.gradient[colorkey]);
				};
				tick.gradient = arr;
			}
		}
	}

	return design;
}


const input_file_to_data_url = function (inputFile) {
	return new Promise(function (resolve, reject) {
		if (!inputFile)
			reject();
		const reader = new FileReader();
		reader.onload = function (file) {
			resolve(file.target.result);
		};
		reader.readAsDataURL(inputFile);
	});
}

const get_local_text_file = function (file_types=['*']) {
	return new Promise(function (resolve, reject) {
		// Check for File Api support
		if (!(window.File && window.FileReader)) {
			alert("The File Reader API is not supported by your browser version.");
			reject(Error('Not supported'));
		}
		const accept = (file_types) ? ' accept=".' + file_types.join(',.') + '"' : '';
		const $input = $('<input type="file"' + accept + '>');
		$input.change(() => {
			const input_file = $input.get(0).files[0];
			const reader = new FileReader();
			reader.onload = (file) => {resolve(file.target.result)};
			reader.readAsText(input_file);
		});
		$input.trigger('click');
	});
}

const user_download_json = function (filename, data) {
	const blob = new Blob([JSON.stringify(data)], {
		type: 'application/json'
	});
	if (window.navigator.msSaveOrOpenBlob) {
		window.navigator.msSaveBlob(blob, filename);
	} else {
		let elem = window.document.createElement('a');
		elem.href = window.URL.createObjectURL(blob);
		elem.download = filename;
		document.body.appendChild(elem);
		elem.click();
		document.body.removeChild(elem);
	}
}

const get_youtube_video_id = function (url) {
	// https://www.youtube.com/watch?v=32kYH6XZrIo
	// https://youtu.be/32kYH6XZrIo
	// 32kYH6XZrIo
	if (url.includes('youtube.com/watch?v='))
		return url.substr(url.indexOf('youtube.com/watch?v=') + 'youtube.com/watch?v='.length);
	else if (url.includes('youtu.be/'))
		return url.substr(url.indexOf('youtu.be/') + 'youtu.be/'.length);
	else if (url.length === 11)
		return url;
	else
		return false;
}

const search_parameters_to_object = function () {
	// From https://stackoverflow.com/questions/8648892/convert-url-parameters-to-a-javascript-object#answer-8649003
	if (location.search.length <= 1)
		return {};
	const search = location.search.substring(1);
	return JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
}