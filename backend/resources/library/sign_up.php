<?php

require_once("sql.php");
require_once("user.php");

// Send a validation mail and insert user into db
//
function sign_up($username, $email, $password) {
	if (is_valid_username($username) && 
		is_valid_email($email) &&
		is_valid_password($password) &&
	    user_exists($username) == false) {
		
		// Create validation link	
		global $config;
		$token = uniqid();
		$link = $config["urls"]["api"]."?action=validate_account&token=".$token;
		 
		// Create unactivated account
		$sql = "
		INSERT INTO `users`(`email`, `password`, `username`, `validation_token`) 
		VALUES ('$email', '$password', '$username', '$token')";

		$SQL = new SQL;
		$sql_response = $SQL->query("accounts", $sql);
		if ($sql_response == false)
			return array("success"=>false, "error_info"=>"internal error");
		
		// Send validation email		
        $to = $email;
        $subject = "Sign up for the A_A Player";
		$message = "Hey {$username},\nPlease click the following link to finish your sing up process:\n";
		$message .= $link;
		$message .= "\n\n";
		$message .= "In case you get \"Couldn't validate token\": Some email programs want to provide you with a preview of links in emails. To do that they open the link themselves and therefore validate the account. So if you are able to login, it is likely that your email program did the job for you ^^";
        $headers = 'From: noreply@player.bplaced.net' . "\r\n" .
            'Reply-To: noreplay@player.bplaced.net' . "\r\n" .
            'X-Mailer: PHP/' . phpversion();
        
		return array("success" => mail($to, $subject, $message, $headers));
	}
	else
		return array("success"=>false, "error_info"=>array(
			"is_valid_username" => is_valid_username($username),
			"is_valid_email" => is_valid_email($email),
			"is_valid_password" => is_valid_password($password),
			"username_exists" => user_exists($username))
		);
}
		
function is_valid_username($username) {
	$options = array(
		'options' => array(
			'min_range' => 2,
			'max_range' => 16
		)
	);
	return filter_var(strlen($username), FILTER_VALIDATE_INT, $options) !== false;
}
function is_valid_email($email) {
	return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}
function is_valid_password($pass) {
	$options = array(
		'options' => array(
			'min_range' => 6,
			'max_range' => 16
		)
	);
	return filter_var(strlen($pass), FILTER_VALIDATE_INT, $options) !== false;
}


// Check verification link and activate account
//
function verify_sign_up($validation_token) {
	$sql = "
	UPDATE `users` 
	SET `validated`='1' 
	WHERE `validation_token` = '$validation_token'";
	
	return (new SQL)->query("accounts", $sql);
}


function token_is_verified($validation_token) {
	// In case the account was already validated (e.g. by the email preview which "clicked" the link)
	$sql = "
	SELECT *
	FROM users
	WHERE `validation_token` = '$validation_token'
	AND `validated`='1'";
	
	return (new SQL)->query("accounts", $sql);
}


// setup_account
//
function setup_account($validation_token) {
	global $config;
	
	// Get user data
	$sql = "
	SELECT username
	FROM `users`
	WHERE `validation_token` = '$validation_token'";
	
	$SQL = new SQL;
	$response = $SQL->query("accounts", $sql);
	if (count($response) > 0 && isset($response[0]['username'])) {
		$username = $response[0]['username'];
		$user_path = $config["paths"]["root"]."/user/{$username}";
		if (mkdir($user_path) == false)
			return false;
		if (mkdir($user_path."/data") == false)
			return false;
		$songlist_file = fopen($user_path."/data/Songlist.json", "w");
		fwrite($songlist_file, json_encode(json_decode("[]")));
		fclose($songlist_file);
		
		return true;
	}
	else
		return false;
}

?>
