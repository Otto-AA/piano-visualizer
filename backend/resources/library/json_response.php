<?php

function json_response($data) {
	if (is_array($data))
		$data = json_encode($data);

	header("HTTP/1.1 200 OK");
	header("Content-Type: application/json");
	
	// JSONP
	if (isset($_GET['callback']))
		echo $_GET['callback']."({$data})";

	// JSON
	else
		echo "{$data}";
	
	exit();
}

function json_response_error($error_data) {
	$response = array(
		"success"=>false,
		"error_data"=>$error_data
	);
	return json_response($response);
}

function json_response_success($success_data) {
	$response = array(
		"success"=>true,
		"success_data"=>$success_data
	);
	return json_response($response);
}
?>
