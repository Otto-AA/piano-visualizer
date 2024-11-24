<?php
require_once("{$_SERVER["DOCUMENT_ROOT"]}/resources/config.php");
require_once(LIBRARY_PATH."/json_response.php");
require_once(LIBRARY_PATH."/user.php");


function api_user_process($request) {
	switch($request['action']) {
		case "getCurrentUser":
			api_user_get_current();
			break;			
		case "login":
			api_user_login($request);
			break;
		case "logout":
			api_user_logout();
			break;
		case "signup":
			api_user_signup($request);
			break;
		case "searchUser":
			api_user_search_user($request);
			break;
	}
}

function api_user_get_current() {
	$user = get_current_user_basic_info();
	if ($user !== false)
		json_response_success($user);
	json_response_error('no user logged in');
}

function api_user_login($request) {
	if ($_SERVER['REQUEST_METHOD'] !== "POST")
		json_response_error('Use POST method to login');
	
	$credentials = array();
	$possible_credentials = array('password', 'email', 'username');
	foreach($possible_credentials as $possible_credential)
		if (isset($request[$possible_credential]))
			$credentials[$possible_credential] = $request[$possible_credential];
	
	// Try login
	$result = login($credentials);
	if ($result["success"])
		json_response_success($result["user"]);
	else
		json_response_error($result['error']);
}

function api_user_logout() {
	json_response_success(logout());
}

function api_user_signup($request) {
	$username = $request['username'];
	$email = $request['email'];
	$password = $request['password'];
	
	require_once(LIBRARY_PATH."/sign_up.php");
	$sign_up_result = sign_up($username, $email, $password);
	if ($sign_up_result['success'])
		json_response_success("A validation mail has been sent to {$email}");
	else
		json_response_error($sign_up_result['error_info']);
}

function api_user_search_user($request) {
	if (isset($request['search']) == false)
		json_response_error('No search specified');
	$username_search = $request['search'];
	$response = search_user($username_search);
	if (is_array($response))
		json_response_success($response);
	else
		json_response_error($response);
}
?>