import PlayerAPI from './api.js';
const api = new PlayerAPI();

const convertToUrlencoded = function (text) {
	text = text.replace(/ /g, '_');
	text = text.replace(/'|`|´|"|–|\?|=|\(|\)|!|\./g, '');
	text = encodeURIComponent(text);
	return text;
}

// User
//
// constructor
// loadActiveUser()
// 

// export
export default class User {
	constructor() {
		this.username = undefined;
		this.id = undefined;
		this.email = undefined;
		this.userIsLoggedIn = undefined;
	}
	getUrlencodedUser() {
		return convertToUrlencoded(this.username);
	}
	getUserSongId(songname) {
		return convertToUrlencoded(this.username) + '_' + convertToUrlencoded(songname);
	}
	login({ password, email=false, username=false}) {
		if (email !== false || username !== false) {
			let credentials = { password };
			if (email !== false)
				credentials.email = email;
			if (username !== false)
				credentials.username = username;
			
			const args = {
				...credentials,
				action: 'login'
			};
			return new Promise((resolve, reject) => {
				api.apiCall(args, 'POST')
					.then(loggedInUser => {
						this.setUser(loggedInUser);
						this.setLoginStatus(true);
						resolve(loggedInUser);
					})
					.catch(response => reject(response));
			});
		}
		else
			return new Promise((resolve, reject) => reject('unsufficient parameters'));
	}
	logout() {
		this.setLoginStatus(false);
		this.setUser( { id: undefined, username: undefined, email: undefined});
		const args = { action: 'logout' };
		return api.apiCall(args, 'POST');
	}
	isLoggedIn() {
		if (this.userIsLoggedIn === undefined)
			return this.checkLogin();
		else
			return new Promise(resolve => resolve(this.userIsLoggedIn));
	}
	checkLogin() {
		return new Promise((resolve, reject) => {
			this.getActiveUser()
				.then(currentUser => {
					if (Object.prototype.hasOwnProperty.call(currentUser, 'username')) {
						this.userIsLoggedIn = currentUser.username === this.username;
					}
					else
						this.userIsLoggedIn = false;
					this._processLoginStatus();
					resolve(this.userIsLoggedIn);
				})
				.catch(error => reject(false));
		});
	}
	_processLoginStatus() {
		const placeholderSelector = '.placeholder-username';
		
		if (this.userIsLoggedIn && typeof this.username === 'string') {
			const username = this.username;
			
			// Replace text placeholders
			$(placeholderSelector).text(username);
			
			// Replace anchor href placeholders
			const placeholderAnchors = '{username}';	
			const anchorSelector = `a[href*=${placeholderAnchors.replace(/([{}])/g, "\\$1")}]`;
			$(anchorSelector).each(function () {
				const originalHref = $(this).attr('href');
				const unsernameReplacedHref = originalHref.replace(new RegExp(placeholderAnchors, 'g'), username);
				$(this).attr('href', unsernameReplacedHref);
			});
		}
		else
			$(placeholderSelector).text('');
	}
	// loadActiveUser
	// Load, store and return the active (logged in) user
	loadActiveUser() {
		return new Promise((resolve, reject) => {
			this.getActiveUser()
				.then(activeUser => {
					this.setUser(activeUser);
					this.setLoginStatus(true);
					resolve(activeUser);
				})
				.catch(error => reject(error));
		});
	}
	// getActiveUser
	// Load and return the active (logged in) user
	getActiveUser() {
		const args = { action: 'getCurrentUser' };
		return api.apiCall(args);
	}
	// getUser
	// Return the stored user
	getUser() {
		return {
			username: this.username,
			email: this.email,
			id: this.id
		};
	}
	// setLoginStatus
	// set and process the login status
	setLoginStatus(loginStatus) {
		this.userIsLoggedIn = loginStatus;
		this._processLoginStatus();
	}
	// setUser
	// set the stored user
	setUser({ id, username, email }) {
		this.username = username;
		this.id = id;
		this.email = email;
	}
	getUsernameFromUrl() {
		const path = window.location.pathname;
		if (path.includes('/user/') === false)
			return false;
		let username = path.substr(path.indexOf('user/') + 'user/'.length);
		username = username.substr(0, username.indexOf('/'));
		return username;
	}	
}