<?php
require_once("{$_SERVER["DOCUMENT_ROOT"]}/resources/config.php");
require_once(LIBRARY_PATH."/json_response.php");


function api_contact_process($request) {
	switch($request['action']) {
		case "contact":
		case "updateSong":
			api_contact($request);
	}
}

function api_contact($request) {
	global $config;
	
	if (isset($request['email']) === false)
		json_response_error('No email specified');
	if (isset($request['message']) === false)
		json_response_error('No message specified');
	
	$name = "Mr/s. Anonym";
	if (isset($request['name']) === true)
		$name = $request['name'];
	$email_address = $request['email'];
	
	// Send validation email		
	$to = "lindrope@hotmail.com";
	$subject = "A_A Player | Contact";
	$message = "{$name} wrote:\n\n";
	$message .= $request['message'];
	$message .= "\n\n";
	$headers = 'From: contact@player.bplaced.net' . "\r\n" .
		"Reply-To: {$email_address}\r\n" .
		'X-Mailer: PHP/' . phpversion();

	if (mail($to, $subject, $message, $headers))
		json_response_success("Contact successful");
	else
		json_response_error("Couldn't write email");
}
?>