<?php
require_once("{$_SERVER["DOCUMENT_ROOT"]}/resources/config.php");

// Return the input given with the request
//
function get_request($accept_method=null) {
	
	$request = "";
	
	// Request method
	$request_method = get_request_method();
	if (IS_DEBUG_MODE)
		printf("Request method: %s<br>", $request_method);
	if ($accept_method !== null && $accept_method !== $request_method)
		return false;
	
	switch ($request_method) {
		case "POST":
			$request = request_cleanInputs($_POST);
			$rawData = json_decode(file_get_contents("php://input"), true);
			if ($rawData && count($rawData) > 0) {
				$request = array_merge($request, $rawData);
			}
			break;
		case "GET":
		case "DELETE":
			$request = request_cleanInputs($_GET);
			$rawData = json_decode(file_get_contents("php://input"), true);
			if ($rawData && count($rawData) > 0)
				$request = array_merge($request, $rawData);
			break;
		case "PUT":
			// TODO: Fail gracefully
			parse_str(file_get_contents("php://input"), $this->_request);
			$request = request_cleanInputs($this->_request);
			break;
		default:
			break;
	}
	
	if (IS_DEBUG_MODE) {
		echo "Input: ";
		var_dump($request);
		echo "<br>";
	}
	
	return $request;
}

function get_request_method() {
	return $_SERVER['REQUEST_METHOD'];
}

// Clean Input
function request_cleanInputs($data) {
	$clean_input = array();
	if (is_array($data)) {
		foreach ($data as $k => $v) {
			$clean_input[$k] = request_cleanInputs($v);
		}
	} 
	else {
		$clean_input = trim($data);
	}
	return $clean_input;
}

?>
