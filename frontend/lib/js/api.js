// PlayerAPI
//
export default class PlayerAPI {
	constructor() {
		this.paths = {
			main: '/resources/api/',
//			upload: '/resources/library/update_song.php',
			user: '/user/',
			design: '/user/_default/designs/json/'			
		};
		this._methods = {
			GET: this._get,
			POST: this._post
		}
	}
	async apiCall(args, method='GET') {
		if (!(method in this._methods))
			throw new Error(`Unsupported method: ${method}`)

		const res = await this._methods[method](this.paths.main, args)
		if ('success' in res && !res.success)
			throw res

		return this._formatResponse(res)
	}
	_get(path, args) {
		const parameterString = args ? ('?' + Object.entries(args).map(argPair => argPair.join('=')).join('&')) : ''
		return fetch(path + parameterString)
			.then(res => res.json())
	}
	_post(path, args) {
		return fetch(path, {
			method: 'POST',
			body: JSON.stringify(args)
		})
			.then(res => res.json())
	}
	_formatResponse(response) {
		if ('success' in response) {
			return response.success ? response.success_data : response.error_data
		}
		return response;
	}
	getSonglist(username) {
		const songlistPath = `${this.paths.user + username}/data/Songlist.json`;
		return this._get(songlistPath);
	}
	getDesign(designName) {
		const designPath = `${this.paths.design + designName}.json`;
		return this._get(designPath);
	}
	searchUsers(search) {
		const args = {
			search,
			action: 'searchUser'
		};
		return this.apiCall(args);
	}
	deleteSong(dataname) {
		const args = {
			dataname,
			action: 'deleteSong'
		};
		return this.apiCall(args);
	}
	uploadSong(formData) {
		const url = this.paths.main;
		const uploadNotification = $.notify('Uploading Song', {
			allow_dismiss: false,
			showProgressbar: true,
			delay: 0
		});
		formData.append('action', 'uploadSong');
		$.ajax({
			url,
			type: 'POST',
			data: formData,
			processData: false,
			contentType: false,
			xhr() {
				const xhr = new window.XMLHttpRequest();
				xhr.upload.addEventListener('progress', function (event) {
					if (event.lengthComputable) {
						const percent = (event.loaded / event.total) * 100;
						uploadNotification.update('progress', percent);
					}
				}, false);
				xhr.addEventListener('progress', function (event) {
					if (event.lengthComputable) {
						const percent = (event.loaded / event.total) * 100;
						uploadNotification.update('progress', percent);
					}
				}, false);

				return xhr;
			},
			success({ success, success_data=[], error_data=''}, textStatus, jqXHR) {
				if (success) {
					let successMessage = 'Success: true<br>';
					if (Object.prototype.hasOwnProperty.call(success_data, 'warnings') && success_data.warnings.length)
						successMessage += 'Warnings: ' + success_data.warnings.join('<br>') + '<br>';
					successMessage += '<br>Actions performed:<br>';
					successMessage += success_data.actions_performed.join('<br>');
					
					// Notify
					uploadNotification.close();					
					$.notify({
						message: successMessage
					}, {
						type: 'success',						
						delay: 0,
						allow_dismiss: true,
						placement: {
							align: 'center'
						}
					});
				} else {
					let errorMessage = 'Success: FALSE<br>';
					errorMessage += error_data;
					alert(errorMessage);

					// Notify
					uploadNotification.close();
					$.notify({
						message: errorMessage
					}, {
						type: 'danger',
						delay: 0,
						allow_dismiss: true,
						placement: {
							align: 'center'
						}
					});
				}
			},
			error(jqXHR, textStatus, errorThrown) {
				alert(textStatus);
				console.log(jqXHR);
				console.log(textStatus);
				console.log(errorThrown);
				$.notify({
					message: `An unexpected error occured.<br>"${textStatus}"<br>It would be nice of you to inform the creators of the page about this bug, so future uploads won't fail the same way :)`
				}, {
					type: 'danger',
					delay: 0,
					allow_dismiss: true,
					placement: {
						align: 'center'
					}
				});
			}
		});
	}
}