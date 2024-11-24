import User from './user.js'
import { default as loginModal } from './loginModalHtml.js'

const loginModalSelector = '#loginModal';
const loginModalErrorSelector = `${loginModalSelector} .error`;

const user = new User();

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

const loginModalHandler = {
	getLoginModalHtml() {
		return loginModal.html;
	},
	init(selector, bootstrapStyle='bg-fade') {
		// Init Variables
		this.onLoginCallbacks = [];
		this.onCancelCallbacks = [];
		this.successfullyLoggedIn = false;
		
		
		// Append the modal content to the selected element
		if ($(loginModalSelector).length === 0)
			$(selector).append(loginModal.html);
		
		// Set bootstrapStyle
		$(`${loginModalSelector} .modal-content`).addClass(bootstrapStyle);
		
		this.onLoginCallbacks = [];
		this.onCancelCallbacks = [];
		
		this._initLoginForm();
		
		// Call Cancelcallbacks when closing without being logged in
		$(loginModalSelector).on('hide.bs.modal', () => {
			if (this.successfullyLoggedIn !== true)
				for (const callback of this.onCancelCallbacks)
					callback();
		});
	},
	_initLoginForm() {
		const self = this;
		
		$(`${loginModalSelector} form`).submit(function (e) {
			e.preventDefault();

			const formData = getFormData(this);
			
			user.login(formData)
				.then(userData => {
					for (const callback of self.onLoginCallbacks)
						callback(userData);
					self.hideModal();
				})
				.catch(error => {
					const errorText = `Couldn't log in.<br>\nError: ${error}`;
					$(loginModalErrorSelector).html(errorText);
					$(loginModalErrorSelector).removeClass('invisible');
				});
		});
	},
	onLogin(callback) {
		this.onLoginCallbacks.push(callback);
	},
	onCancel(callback) {
		this.onCancelCallbacks.push(callback);
	},
	showModal() {
		$(loginModalSelector).modal('show');
	},
	hideModal() {
		$(loginModalSelector).modal('hide');
	}
}
export default loginModalHandler;
