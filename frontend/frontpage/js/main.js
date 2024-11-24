import PlayerAPI from '/lib/js/api.js'
import User from '/lib/js/user.js'
import loginModal from '/lib/js/loginModal.js'

const api = new PlayerAPI();
const user = new User();
loginModal.init('body', 'bg-inverse');

const getFormData = function (selector) {
	const unformattedFormData = $(selector).serializeArray();
	if (Array.isArray(unformattedFormData) === false)
		throw new Error(`couldn't get form data (${selector})`);
	let formData = {};
	$(unformattedFormData).each(function (index, obj) {
		formData[obj.name] = obj.value;
	});
	return formData;
};

$(document).ready(function () {
	// Update user to update user-specific links
	user.loadActiveUser();
	loginModal.onLogin(user.loadActiveUser.bind(user));

	initSubmitForm();
	initSearchForm();
	
	// Login modal
	$('*[data-toggle=showLogin]').click(function (e) {
		console.log('Showing login modal');
		e.preventDefault();
		loginModal.showModal();
	});
	
	showPageContent();
});

// Animate page load
const showPageContent = function () {
	$('#background').css('background-image', 'url(/frontpage/img/Background.png)');
	$('#background').addClass('darken darken-fade-in');
	setTimeout(() => $('body').addClass('site-loaded'), 600);
};

// Init the signup form
const initSubmitForm = function () {
	$('#signup').submit(function (e) {
		e.preventDefault();

		const args = getFormData('#signup');

		const showSubmitError = function (errorText) {
			const signupErrorContainerSelector = '#signup .error';
			const signupErrorMessageSelector = '#signup .error-message';
			$(signupErrorContainerSelector).removeClass('hidden');
			$(signupErrorMessageSelector).html(errorText);
		};
		
		if (args.username.length < 2 ||
		   	args.username.length > 16 ||
		   	args.username.includes(' '))
			showSubmitError('Username must has between 2 and 16 characters. It may not contain spaces (\' \')');
		else if (args.password.length < 6 ||
				 args.password.length > 16)
			showSubmitError('Password must has between 6 and 16 characters.');
		else
			api.apiCall(args, 'POST')
				.then(msg => alert(msg))
				.catch(error => showSubmitError('Error\n' + JSON.stringify(error)));
	});
};


// Init the search form
const initSearchForm = function () {
	$('#searchUser').submit(function (e) {
		e.preventDefault();
		const search = $(this).children('input[name=search]').val();
		console.log(search);
		if (search.length > 0) {
			const location = `${window.location.origin}/search/?search=${search}`;
			window.location = location;
		}
	})
}

// Animate scroll
$("nav ul li a[href^='#']").on('click', function (e) {
	const hash = this.hash;
	const $targetElement = $(hash);
	if ($targetElement.length === 0)
		return ;
	
	e.preventDefault();

	// Animate and set hash location afterwards
	$('html, body').animate({
		scrollTop: $targetElement.offset().top
	}, 500, () => window.location.hash = hash);
});