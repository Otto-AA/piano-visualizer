<?php
require_once("{$_SERVER["DOCUMENT_ROOT"]}/resources/config.php");
require_once(LIBRARY_PATH."/json_response.php");
require_once(LIBRARY_PATH."/user.php");
require_once(LIBRARY_PATH."/song.php");
require_once(LIBRARY_PATH."/songlist.php");


function api_manage_process($request) {
	switch($request['action']) {
		case "uploadSong":
		case "updateSong":
			require_once(LIBRARY_PATH."/update_song.php");
			process_overwrite_song_request($request);
			break;
		case "deleteSong":
			api_manage_delete_song($request);
			break;
		case "reorderSonglist":
			api_reorder($request);
	}
}

function api_manage_delete_song($request) {
	global $config;
	
	$username = get_user_name();
	$user_data_path = $config['paths']['root']."/user/{$username}/data/";
	$song_dataname = $request['dataname'];
	$songlist_path = $user_data_path."Songlist.json";
	$song = array();
	
	// Delete song from songlist
	$songlist;
	try {
		$songlist = new Songlist($songlist_path);
		if ($songlist->song_exists($song_dataname) === false)
			json_response_error("The dataname \"{$song_dataname}\" was not found.");
		$song = $songlist->get_song_as_assoc($song_dataname);
		$songlist->remove_song($song_dataname);
		$songlist->save();
	}
	catch (Exception $e) {
		json_response_error("Error while removing the song from the songlist");
	}
	
	// Delete associated files
	foreach($song['files'] as $file_type => $song_has_file) {
		if ($song_has_file === true) {
			$file_path = $user_data_path.$song_dataname.".".$file_type;
			unlink($file_path);
		}
	}
	
	// Delete custom design (and image)
	if (strpos($song['design'], '_custom') !== false) {
		$design_path = $config['paths']['default_user']."designs/json/".$song['design'];
		
		if (file_exists($design_path)) {
			$design = json_decode(file_get_contents($design_path), true);
			if (isset($design['background']['image']['name'])) {
				$image_path = $config['paths']['default_user']."designs/img/".$design['background']['image']['name'];
				unlink($image_path);
			}
			unlink($design);
		}
	}
	
	json_response_success("Successfully deleted song");
	/*
		remove from songlist
		remove song_files
		remove design (json + img)
		
		return success if removal from songlist works
		email creator if anything else does not work
	*/
}

function api_reorder($request) {
	global $config;
	
	$dataname_list = explode(",", $request['orderedDataNames']);
	
	$username = get_user_name();
	$user_data_path = $config['paths']['root']."/user/{$username}/data/";
	$songlist_path = $user_data_path."Songlist.json";
	
	$songlist;
	try {
		$songlist = new Songlist($songlist_path);
		$songlist->reorder_by_dataname_list($dataname_list);
		$songlist->save();
	}
	catch (Exception $e) {
		json_response_error("Error while reordering songlist: {$e}");
	}
	
	json_response_success("Successflly updated order");
}
?>