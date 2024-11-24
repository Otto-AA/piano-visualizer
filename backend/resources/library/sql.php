<?php

require_once("{$_SERVER["DOCUMENT_ROOT"]}/resources/config.php");

// SQL
//
// Create sql connection and make queries
//
class SQL {
	// Variables
	private $databases = array();
	
	
	// Functions
	/*
	public:
		Constructor
		query		-> makes SQL query; returns assoc of rows
		
	private:
		connect_db			-> Create new connection to database
		SQL_ResponseToAssoc	-> Converts mysqli_query response to assoc array of the rows
		
	*/
	
	
	// Constructor
	//
    public function __construct() {}
	
	// query
	//
	// Make a SQL query to the database
	//
	public function query($dbname, $query) {
		if (IS_DEBUG_MODE) {
			printf("<br>SQL query:<br>db: %s<br>query: %s<br>", $dbname, $query);
		}
		
		// Check if db is connected
		$connection = false;
		for ($i = 0; $i < count($this->databases); $i++) {
			if ($this->databases[$i]["db"]["dbname"] == $dbname) {
				$connection = $this->databases[$i]["db"]["connection"];
			}
		}
		
		// Create new connection if not connected
		if ($connection == false) {
			$connection_response = $this->connect_db($dbname);
			if ($connection_response == true)
				$connection = $this->databases[count($this->databases)-1]["connection"];
			else {
				if (IS_DEBUG_MODE)
					printf("Connection failed: %s", $connection_response);
				exit();
			}
		}
		
		// Make Query
		$response = mysqli_query($connection, $query);
		if (IS_DEBUG_MODE) {
			echo "SQL response:<br>";
			var_dump($response);
			printf("<br>\$connection->errno: %s<br><br>", $connection->errno);
		}
		// Check for success
		if ($connection->errno) {
			if (IS_DEBUG_MODE)
				printf("Connect failed: %s\n", $connection->error);
			return false;
		}
		else if (is_bool($response) && $response == true){
			return $connection->affected_rows > 0;
		}
		else
			return $this->SQL_ResponseToAssoc($response);
	}
	
	// connect_db
	//
	// Create a new connection to the specific database and return connection
	//
	private function connect_db($name) {
		global $config;
		if (isset($config["db"][$name])) {
			$db = $config["db"][$name];
			
			// Connect to SQL database
			$connection = new mysqli($db["host"], $db["username"], $db["password"], $db["username"]);
			
			// Check connection
			if ($connection->connect_error)
				return "Connection failed: ".$conn->connect_error;
			else {
				array_push($this->databases, array("db" => $db, "connection" => $connection));
				return true;
			}
		}
		else
			return "db ({$name}) not existing";
	}
	
	// SQL_QueryToAssoc
	//
	// Convert a mysqli_query response to an assoc array of the rows
	//
	private function SQL_ResponseToAssoc($response) {
		$rows = array();
		while($r = $response->fetch_assoc()) {
			$rows[] = $r;
		}
		$response->free();
		return $rows;
	}
}
?>
