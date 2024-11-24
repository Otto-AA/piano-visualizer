<?php

$config = array(
    "db" => array(
        "accounts" => array(
			"dbname" => "player_accounts",
            "username" => "player_accounts",
            "password" => "qUVkiQsbvQ58YPU",
            "host" => "localhost"
        )
    ),
    "urls" => array(
        "baseUrl" => "http://player.bplaced.net/",
		"api" => "http://player.bplaced.net/resources/api/",
		"relative" => array(
			"baseUrl" => "./",
			"api" => "api/"
		)
    ),
    "paths" => array(
		"root" => $_SERVER["DOCUMENT_ROOT"],
        "resources" => "{$_SERVER["DOCUMENT_ROOT"]}/resources/",
		"libraries" => "{$_SERVER["DOCUMENT_ROOT"]}/resources/library/",
		"default_user" => "{$_SERVER["DOCUMENT_ROOT"]}/user/_default/"
    ),
	"const" => array(
		"MAX_USER_STORAGE" => 100*1024*1024
	)
);

/*
	Constants
*/

defined("RESOURCES_PATH")
	or define("RESOURCES_PATH", realpath(dirname(__FILE__)));
defined("LIBRARY_PATH")
    or define("LIBRARY_PATH", realpath(dirname(__FILE__) . '/library'));
defined("IS_DEBUG_MODE")
	or define("IS_DEBUG_MODE", false);
/*
    Error reporting.
*/
ini_set("error_reporting", "true");
error_reporting(E_ALL|E_STRCT);


/*
	Start Session
*/
session_start();
?>
