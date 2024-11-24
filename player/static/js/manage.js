import PlayerAPI from '/lib/js/api.js'
import User from '/lib/js/user.js'
import PlayerPreview from '/lib/js/playerPreview.js'
import loginModal from '/lib/js/loginModal.js'

const api = new PlayerAPI();
const activeUser = new User();
loginModal.init('body');

const loadSampleSonglist = function () {
	return new Promise((resolve, reject) => {	   
		$.getJSON('js/A_A_Songlist.json')
			.done(songlist => resolve(songlist))
			.fail(reject);
	});
};

$(document).ready(function () {
	activeUser.loadActiveUser()
		.then(onLogin)
		.catch(() => {
			loginModal.onLogin(onLogin);
			loginModal.showModal();
		});	
});

const onLogin = function (userData) {
	console.log('Logged in', userData);
	activeUser.setUser(userData);
	const username = activeUser.getUser().username;
	if (username !== activeUser.getUsernameFromUrl())
		alert(`It seems that you are on the wrong page. Please move to that one instead:\nhttp://player.bplaced.net/user/${username}/manage/`);

	reloadSonglist()
		.then(songlist => {
			const sortable = Sortable.create(document.getElementById('songlist'), {
				draggable: 'a',
				onEnd() {
					saveSonglistOrder();
				}
			});
		})
		.catch(error => console.error('Couldn\'t load songlist', error));
};

const songlistSelector = '#songlist';
const emptySonglist = function () {
	$(songlistSelector).empty();
};
const insertSonglist = function (songlist) {
	for (const song of songlist) {
		const dataName = song.dataName;
		const name = song.name;
		const $anchor = $(`<a href="../?v=${dataName}" target="_blank" class="song list-group-item flex-column align-items-start" data-dataname="${dataName}">`);
		const $flexWrap = $('<div class="d-flex w-100 justify-content-between">');
		const $title = $(`<h5 class="my-auto">${name}</h5>`);
		const $buttons = $(`
			<div>
				<a href="../upload/?action=edit&dataname=${dataName}"><button class="btn btn-info cursor-pointer">Edit</button></a>
				<button class="btn btn-danger delete-song">Delete</button>
			</div>
		`);
		
		$flexWrap.append($title);
		$flexWrap.append($buttons);
		$anchor.append($flexWrap);
		
		$(songlistSelector).append($anchor);
	}
};
const reloadSonglist = function () {
	return new Promise((resolve, reject) => {
		api.getSonglist(activeUser.username)
			.then(songlist => {
				console.log('Reloaded songlist', songlist);
				emptySonglist();
				insertSonglist(songlist);

				$('.delete-song').click(function (e) {
					e.preventDefault();
					const dataname = $(this).parentsUntil('.song').parent().attr('data-dataname');
					deleteSong(dataname);
				});
				resolve(songlist);
			})
			.catch(reject);
	});
};

const saveSonglistOrder = function () {
	// get ordered array of datanames
	let orderedDataNames = [];
	$(songlistSelector).children().each(function () {
		const dataname = $(this).attr('data-dataname');
		orderedDataNames.push(dataname);
	});
	
	const args = {
		orderedDataNames,
		action: 'reorderSonglist'
	};
	api.apiCall(args)
		.then(response => {
			$.notify('Saved the order of the songs', {
				type: 'success',
				delay: 3000
			});
		})
		.catch(error => {
			console.error(error);
			$.notify('Error while saving the order of the songs', {
				type: 'danger',
				delay: 3000
			});
		});
}


const deleteSong = function (dataname) {
	if (confirm(`Are you sure you want to delete ${dataname}?`) !== true)
		return false;
	
	api.deleteSong(dataname)
		.then(() => {
			$.notify('Successfully deleted the song', {
				type: 'success',
				delay: 3000
			});
			reloadSonglist();
		})
		.catch(error => {
			console.error(error);
			$.notify('Error while saving the order of the songs', {
				type: 'danger',
				delay: 3000
			});
		});
}