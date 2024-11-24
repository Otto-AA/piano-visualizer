<?php
require_once("{$_SERVER["DOCUMENT_ROOT"]}/resources/config.php");
require_once(LIBRARY_PATH."/song.php");
require_once(LIBRARY_PATH."/songlist.php");
require_once(LIBRARY_PATH."/user.php");

function remove_song_from_songlist($dataname, $songlist_path) {
	try {
		$songlist = new Songlist($songlist_path);
		$songlist->remove_song($dataname);
		$songlist->save();
		return true;
	}
	catch (Exception $e) {
		return false;
	}
}



?>