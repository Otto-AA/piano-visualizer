<?php
require_once("{$_SERVER["DOCUMENT_ROOT"]}/resources/config.php");
require_once(LIBRARY_PATH."/json_response.php");
require_once(LIBRARY_PATH."/foldersize.php");
require_once(LIBRARY_PATH."/user.php");
require_once(LIBRARY_PATH."/song.php");
require_once(LIBRARY_PATH."/songlist.php");

function process_overwrite_song_request($request) {
	global $config;
	
	// Get user data
	if (is_logged_in() === false)
		json_response_error("not logged in");
	$username = get_user_name();
	$user_data_path = $config['paths']['root']."/user/{$username}/data/";
	
	// Save performed actions for log and status
	$actions_performed = array();
	
	// Store warnings for the user
	$user_warnings = array();
	
	// Check foldersize
	$data_folder_size = foldersize($user_data_path);
	array_push($actions_performed, "Checked storage: ".format_size($data_folder_size)." of ".format_size($config['const']['MAX_USER_STORAGE'])." used");
	if ($data_folder_size > $config['const']['MAX_USER_STORAGE'])
		json_response_error("Your storage is already full (".format_size($data_folder_size)." of ".format_size($config['const']['MAX_USER_STORAGE'])." used). Please contact us for further details.");
	if ($data_folder_size > $config['const']['MAX_USER_STORAGE'] * 3/4)
		array_push($user_warnings, "You already use more than 3/4 of your available storage (".format_size($data_folder_size)." of ".format_size($config['const']['MAX_USER_STORAGE'])." used). Feel free to reach out to us for more details.");
	
	// Required parameters
	$song_name = $request['songName'];
	$data_name = convert_to_urlencoded($song_name);
	$design_file_name = $request['design'];
	
	$composers = isset($request['composers']) ? json_decode($request['composers'], true) : array($username);
	if (count($composers) === 1 && 
		strtolower($composers[0]) === strtolower($username) ||
	   strtolower($composers[0]) === "") {
		$composers[0] = $username;
		
		if (isset($request['type']) === false)
			$additional_song_data['type'] = "Composition";
	}
	
	// Optional parameters
	$additional_song_data = array();
	if (isset($request['type']))
		$additional_song_data['type'] = $request['type'];
	if (isset($request['songInfo']))
		$additional_song_data['info'] = $request['songInfo'];
	if (isset($request['date']))
		$additional_song_data['date'] = $request['date'];
	if (isset($request['youtubeId']))
		$additional_song_data['youtube_id'] = $request['youtubeId'];
	
	
	// Save custom design
	if ($design_file_name === 'custom') {
		$custom_design = json_decode($request['custom_design'], true);
		$design_file_name = save_custom_design($custom_design, $username, $song_name, $config['paths']['default_user']);
		array_push($actions_performed, "Added custom design {$design_file_name}");
	}
	
	
	// Get upload files
	$upload_allowed_files = array("audio_file", "midi_file", "pdf_file", "background_image_file");
	$upload_files = array_intersect($upload_allowed_files, array_keys($_FILES));
	$song_files = array();
	foreach($upload_files as $file_name)
		$song_files[str_replace('_file', '', $file_name)] = true;
	
	// Check file size
	$total_files_size = 0;
	foreach($upload_files as $file_name)
		if (isset($_FILES[$file_name]))
			$total_files_size += $_FILES[$file_name]['size'];
	array_push($actions_performed, "Checked uploading files size: ".format_size($total_files_size));
	if ($data_folder_size + $total_files_size > $config['const']['MAX_USER_STORAGE'])
		json_response_error("The files are too big to upload (".format_size($data_folder_size)." + ".format_size($total_files_size)." > ".format_size($config['const']['MAX_USER_STORAGE'])."). Please contact us for further details.");
	
	// Upload files
	foreach($upload_files as $file_name) {
		if (isset($_FILES[$file_name])) {
			$extension = strtolower(pathinfo($_FILES[$file_name]['name'], PATHINFO_EXTENSION));
			$file_path = '';
			switch ($extension) {
				case "jpg":
				case "png":
					$file_path = $config['paths']['default_user']."designs/img/";
					$file_path .= get_background_image_name(".".$extension, $username, $song_name);
					break;
				case "mp3":
				case "mid":
				case "pdf":
					$file_path = $user_data_path.$data_name.".".$extension;
					break;
				default:
					json_response_error("The file type {$extension} is not supported.");					
			}
			//basename($_FILES[$file_name]['name']);
			if (move_uploaded_file($_FILES[$file_name]['tmp_name'], $file_path)) {
				array_push($actions_performed, "Uploaded {$file_name} | {$file_path}");
			}
			else
				json_response_error("Error uploading ({$file_name})");
		}
	}
	
	
	// Create new song
	$song;
	try {
		$song = new Song($song_name, convert_to_urlencoded($song_name), $composers, $song_files, $design_file_name, $additional_song_data);
		array_push($actions_performed, "Retrieved song data: ".$song->get_json());
	}
	catch (Exception $e) {
		json_response_error("Error creating instance of Song. ".json_encode($e));
		die();
	}
	
	// Add song to songlist / update songlist
	$songlist_path = $user_data_path."Songlist.json";
	$songlist = new Songlist($songlist_path);
	
	if ($songlist->song_exists($song->get_data_name())) {
		$songlist->update_song($song);
		array_push($actions_performed, "Updated song ".$song->get_name());
	}
	else {
		$songlist->unshift_song($song);
		array_push($actions_performed, "Added song ".$song->get_name());
	}
	
	$songlist->save();
	array_push($actions_performed, "Saved Songlist");
	
	json_response_success(array(
		"actions_performed" => $actions_performed,
		"warnings" => $user_warnings
	));
}



function save_custom_design($design, $user_name, $song_name, $default_user_path) {
	// Change background url
	if (isset($design['background']) && isset($design['background']['image']['name']))
		$design['background']['image']['name'] = get_background_image_name($design['background']['image']['name'], $user_name, $song_name);
	
	$new_design_name = '_custom_'.get_user_song_urlencoded($user_name, $song_name);
	$new_design_path = $default_user_path."designs/json/".$new_design_name.'.json';
	$new_design_json = json_encode($design);
	$new_design_file = fopen($new_design_path, "w");
	fwrite($new_design_file, $new_design_json);
	fclose($new_design_file);
	
	return $new_design_name;
}

function get_background_image_name($original_name, $user_name, $song_name) {
	$file_extension = substr($original_name, strrpos($original_name, '.'));
	$name = "_background";
	$name .= "_".get_user_song_urlencoded($user_name, $song_name);
	$name .= $file_extension;
	return $name;
}

// Return a string representing the song in urlencoded format
function get_user_song_urlencoded($user_name, $song_name) {
	$user_name = convert_to_urlencoded($user_name);
	$song_name = convert_to_urlencoded($song_name);
	$song_representation = "{$user_name}_{$song_name}";
	return $song_representation;
}

/** TODO: Check if this works */
function convert_to_urlencoded($text) {
	// $text = str_replace(' ', '_', $text);
	// $text = str_replace('_', '-', $text);
	// $text = preg_replace('/\'|`|´|"|–|\?|=|\(|\)|!|\./', "", $text);
	$text = rawurlencode($text);
	return $text;
}

//process_overwrite_song_request();
?>
