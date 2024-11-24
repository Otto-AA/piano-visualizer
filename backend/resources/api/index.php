<?php
require_once("{$_SERVER["DOCUMENT_ROOT"]}/resources/config.php");
require_once(LIBRARY_PATH."/request.php");
require_once(LIBRARY_PATH."/json_response.php");

function process_request() {
	$request = get_request();
	
	if (isset($request['action']) === false)
		json_response_error('no action specified');
	
	$action = $request['action'];
	$action_processors = array(
		"contact" => "contact",
		"getCurrentUser" => "user",
		"login" => "user",
		"logout" => "user",
		"searchUser" => "user",
		"signup" => "signup",
		"validate_account" => "signup",
		"deleteSong" => "manage",
		"updateSong" => "manage",
		"uploadSong" => "manage",
		"reorderSonglist" => "manage"
	);
	
	if (isset($action_processors[$action]) === false)
			json_response_error("invalid action ({$action})");
	
	$log = "Date: ".date("d/m/Y | H:i")."\n";
	$log .= "Referer: ".(isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : 'not set')."\n";
	$log .= json_encode($request)."\n\n";
	$logfile = fopen("../../log/api/{$action}.{$action_processors[$action]}.log.txt", "a");
	fwrite($logfile, $log);
	fclose($logfile);
	
	switch($action_processors[$action]) {
		case "contact":
			require_once("api_contact.php");
			api_contact_process($request);
			break;
		case "user":
			require_once("api_user.php");
			api_user_process($request);
			break;
		case "signup":
			require_once("api_signup.php");
			api_signup_process($request);
			break;
		case "manage":
			require_once("api_manage.php");
			api_manage_process($request);
			break;
		default:
			json_response_error("Internal error. Api-processor \{{$action_processors[$action]}\} not found.");
	}
	json_response_error("unknown error");
}

process_request();
?>