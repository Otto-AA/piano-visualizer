import PlayerAPI from '/lib/js/api.js'
const api = new PlayerAPI();

$(document).ready(function () {
	$('input[name=userSearch]').on('input', function () {
		searchUser($(this).val());
	});
	
	const urlSearch = search_parameters_to_object();
	if (Object.prototype.hasOwnProperty.call(urlSearch, 'search')) {
		searchUser(urlSearch.search);
		$('input[name=userSearch]').val(urlSearch.search);
	}
});

const searchUser = function (search) {
	console.log('searching for ' + search);
	api.searchUsers(search)
		.then(showSearchResults)
		.catch(error => alert('An error occured\n' + error));
};

const showSearchResults = function (users) {
	$('#userSearchResults').empty();
	for (const user of users) {
		$('#userSearchResults').append(`<li data-id="${user.id}"><a href="/user/${user.username}/">${user.username}</a></li>`);
	}
};


const search_parameters_to_object = function () {
	// From https://stackoverflow.com/questions/8648892/convert-url-parameters-to-a-javascript-object#answer-8649003
	if (location.search.length <= 1)
		return {};
	const search = location.search.substring(1);
	return JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
}