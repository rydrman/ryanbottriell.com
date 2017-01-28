<?php
	$dbuser = "rpbottri"; 			// Connect Login
	$dbpass = "imd2000";//"fC5aHj6u27"; 	// Password for ug.csit.carleton.ca
	$dbname = "rpbottri";			// Connect Login (again, as your DB and your login are the same)

	$resLink = mysql_connect('localhost',$dbuser,$dbpass);
	if(!$resLink) { echo "Connect failed<br/>"; exit(); }

	$resSelect = mysql_select_db($dbname, $resLink);
	if(!$resSelect) { echo "Select failed<br/>"; exit();}
?>
