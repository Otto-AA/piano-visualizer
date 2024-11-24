<?php
require_once("{$_SERVER["DOCUMENT_ROOT"]}/resources/config.php");
require_once(LIBRARY_PATH."/json_response.php");
require_once(LIBRARY_PATH."/sign_up.php");


function api_signup_process($request) {	
	switch($request['action']) {
		case "signup":
			api_signup($request);
			break;			
		case "validate_account":
			api_signup_validate_account($request);
			break;
	}
}

function api_signup($request) {
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

function api_signup_validate_account($request) {
	$token = $request['token'];
	
	if (verify_sign_up($token)) {
		if (setup_account($token) !== true)
			json_response_error("error while setting up your account. Please try to signup (validating won't work anymore) again or contact the admin.");
		
		// Notify website developers		
        $to = "lindrope@hotmail.com";
        $subject = "A_A Player | Account validation";
		$message = "An account has been validated";
        $headers = 'From: dev@player.bplaced.net' . "\r\n" .
            'Reply-To: dev@player.bplaced.net' . "\r\n" .
            'X-Mailer: PHP/' . phpversion();
		mail($to, $subject, $message, $headers);
		
		
		json_response_success("Account validated");
	}
	else if (token_is_verified($token))
		json_response_success("Account is validated");
	else
		json_response_error("Couldn't validate token ({$token})");
}
?>