<?php

/* Songlist
/*
/* public:
/* song_exists($name)
/* get_song_as_assoc($name)
/* get_song_index($name)
/* update_song($name, $song|$song_assoc)
/* unshift_song($song|$song_assoc)
/* push_song($song|$song_assoc)
/* remove_song($name)
/* reorder_by_dataname_list($dataname_list)
/* save()
/* save_as($path)
*/

class Songlist {
	private $songlist = array();
	private $songlist_path = '';
	
	
	public function __construct($path=null){
		if (isset($path) && is_string($path))
			$this->load_from_path($path);
	}
	
	public function load_from_path($path) {
		$this->songlist_path = $path;
		$this->load($this->songlist_path);
	}
	
	
	public function get_songlist() {
		return $this->songlist;
	}
	
	public function song_exists($data_name) {
		return $this->get_song_index($data_name) > -1;
	}
	
	public function get_song_as_assoc($data_name) {
		$index = $this->get_song_index($data_name);
		if ($index > -1)
			return $this->songlist[$index];
		else
			return false;
	}
	
	public function get_song_index($data_name) {
		foreach($this->songlist as $index => $song) {
			if ($song['dataName'] === $data_name)
				return $index;
		}
		return -1;
	}
	
	public function unshift_song($song) {
		if (is_a($song, 'Song'))
			$song = $song->get_assoc();
		
		if ($this->song_exists($song['dataName']))
			throw new Exception("A Song with the same dataname already exists");
		
		array_unshift($this->songlist, $song);
		return true;
	}
	
	public function push_song($song) {
		if (is_a($song, 'Song'))
			$song = $song->get_assoc();
		
		if ($this->song_exists($song['dataName']))
			throw new Exception("A Song with the same dataname already exists");
		
		array_push($this->songlist, $song);
		return true;
	}
	
	public function update_song($song) {
		if (is_a($song, 'Song'))
			$song = $song->get_assoc();
		
		$index = $this->get_song_index($song['dataName']);
		if ($index < 0)
			throw new Exception("Song {$song} not found. Can't update non-existing song");
		
		$this->songlist[$index] = $song;
	}
	
	public function remove_song($dataname) {
		if (is_string($dataname) === false)
			throw new Exception("[Songlist|remove_song]Type of \$dataname must be string");
		
		$index = $this->get_song_index($dataname);
		if ($index < 0)
			throw new Exception("Song {$dataname} not found. Can't remove non-existing song");
		
		array_splice($this->songlist, $index, 1);
	}
	
	public function reorder_by_dataname_list($dataname_list) {
		if (count($dataname_list) !== count($this->songlist))
			throw new Exception("The ordered dataname_list has not the same count (".count($dataname_list)." vs ".count($this->songlist).") as the songlist");
		
		foreach($dataname_list as $dataname) {
			if ($this->song_exists($dataname) === false)
				throw new Exception("[Songlist|reorder_by_dataname_list]Can't reorder non-existing song ({$dataname}");
			
			// Move song to the end
			$song = $this->get_song_as_assoc($dataname);
			$this->remove_song($dataname);
			$this->push_song($song);
		}
	}
	
	public function load($path) {
		$songlist_json = file_get_contents($path);
		if ($songlist_json === false)
			throw new Exception("Couldn't load songlist [{$path}]");
		$this->songlist = json_decode($songlist_json, true);	
	}
	
	public function save() {
		$this->save_as($this->songlist_path);
	}
	
	public function save_as($path) {
		$songlist_json = json_encode($this->songlist, JSON_PRETTY_PRINT);
		$songlist_file = fopen($path, "w");
		fwrite($songlist_file, $songlist_json);
		fclose($songlist_file);
	}
}
?>
