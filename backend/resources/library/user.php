<?php

require_once("sql.php");


// Login
//
function login($credentials) {
	// Require password + email/username
	if (isset($credentials['password']) === false ||
	   	isset($credentials['username']) === false && 
		isset($credentials['email']) === false)
		json_response_error('unsufficient credentials');
	
	// Search DB for a combination of the credentials
	$sql = "SELECT * FROM users WHERE ";
	$sql .= implode(' AND ', array_map(function($key) use ($credentials) { 
		return $key.'=\''.$credentials[$key].'\'';
	}, array_keys($credentials)));
	
	$SQL = new SQL;
	$result = $SQL->query("accounts", $sql);
	
	if (is_array($result) && count($result)) {
		$user = $result[0];
		if (IS_DEBUG_MODE) {
			echo "got user:<br>";
			var_dump($user);
			echo "<br>";
		}
		// Check if account is validated
		if ($user["validated"] == 0)
			return array("success"=>false, "error"=>"not validated");
		
		$_SESSION['user'] = array(
			"username" => $user["username"],
			"email" => $user["email"]
		);
		
		if (IS_DEBUG_MODE) {
			echo "\$_SESSION<br>";
			var_dump($_SESSION);
			echo "<br>";
		}
		return array("success"=>true, "user"=>get_current_user_basic_info());
	}
	else {
		if (IS_DEBUG_MODE)
			echo "[login.php] query result is no array";
		return array("success"=>false, "error"=>"no match");
	}
}


// Logout
//
function logout() {
	if (IS_DEBUG_MODE) {
		echo "Logout<br>";
		echo "Current user: ".(isset($_SESSION['user']['username']) ? $_SESSION['user']['username'] : "None");
	}
	
	if (isset($_SESSION['user']))
		unset($_SESSION['user']);
	return true;
}


// user_exists
//
function user_exists($username) {
	// Search DB for username
	$sql = "SELECT * FROM users WHERE username = '{$username}';";
	
	$SQL = new SQL;
	$result = $SQL->query("accounts", $sql);
	if (IS_DEBUG_MODE)
		var_dump($result);
	return is_array($result) && count($result) !== 0;
}

// get_current_user_basic_info
//
function get_current_user_basic_info() {
	if (is_logged_in())
		return $_SESSION['user'];
	else
		return false;
}

// is_logged_in
//
function is_logged_in() {
	return isset($_SESSION['user']) && isset($_SESSION['user']['username']);
}

function get_user_name() {
	if (is_logged_in())
		return $_SESSION['user']['username'];
	else
		return false;
}

// search_user
//
// Search the DB for users with a similar username
//
function search_user($username_search) {
	// Search DB for users which name contains the search
	$sql = "
	SELECT username
	FROM users
	WHERE validated = 1
	AND username LIKE '%{$username_search}%'
	";
	
	$SQL = new SQL;
	$result = $SQL->query("accounts", $sql);
	
	return $result;
}
?>
