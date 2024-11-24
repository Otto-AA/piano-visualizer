<?php

class Song {
	private $name = '';
	private $data_name = '';
	private $type = '';
	private $composers = array();
	private $info = '';
	private $created_date = '';
	private $design_name = '';
	private $youtube_id = '';
	private $data_files = array();
	
	
	public function __construct($name, $data_name, $composers, $files, $design_name, $optional_arguments = null) {
		if (gettype($name) !== "string" ||
		   gettype($composers) !== "array" ||
			gettype($files) !== "array" ||
			gettype($design_name) !== "string")
			throw new Exception("Couldn't create song. Wrong arguments given.");
		
		$this->name = $name;
		$this->data_name = $data_name;
		$this->composers = $composers;
		$this->data_files = $files;
		$this->design_name = $design_name;
		
		if ($optional_arguments !== null) {
			if (is_array($optional_arguments) === false)
				throw new Exception("Optional arguments must be an associatve array");
			if (isset($optional_arguments['type']))
				$this->type = $optional_arguments['type'];
			if (isset($optional_arguments['info']))
				$this->info = $optional_arguments['info'];
			if (isset($optional_arguments['date'])) {
				if (is_string($optional_arguments['date']))
					$this->date = $optional_arguments['date'];
				else if (is_int($optional_arguments['date']))
					$this->date = date("d_m_Y", $optional_arguments['date']);
			}
			if (isset($optional_arguments['youtube_id']))
				$this->youtube_id = $optional_arguments['youtube_id'];
		}
		if (isset($this->date) === false)
			$this->date = date("d_m_Y");
	}
	
	public function get_name() {
		return $this->name;
	}
	
	public function get_data_name() {
		return $this->data_name;
	}
	
	public function get_json() {
		return json_encode($this->get_assoc());
	}
	
	public function get_assoc() {
		$song_data = array(
			"name" => $this->name,
			"dataName" => $this->data_name,
			"composer" => $this->composers,
			"type" => isset($this->type) ? $this->type : '',
			"info" => isset($this->info) ? $this->info : '',
			"date" => $this->date,
			"design" => $this->design_name,
			"files" => array(
				"mp3" => isset($this->data_files['audio']) && $this->data_files['audio'],
				"mid" => isset($this->data_files['midi']) && $this->data_files['midi'],
				"pdf" => isset($this->data_files['pdf']) && $this->data_files['pdf']
			),
			"YT" => isset($this->youtube_id) ? $this->youtube_id : ""
		);
		return $song_data;	
	}
}
?>
