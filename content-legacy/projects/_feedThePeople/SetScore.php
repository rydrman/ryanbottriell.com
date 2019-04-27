<?php 
	include "db_open.php";
	
	$score = $_GET["score"];
	
	// get global score
	$sql = "SELECT GlobalScore FROM scores";
	$result = mysql_query($sql);
	$data = mysql_fetch_row($result);
	$output = $score + $data[0];
	
	// set new score
	$sql = "UPDATE scores SET GlobalScore = $output WHERE ID=1";
	$result = mysql_query($sql);
	echo("$output");
	echo("$result");
	
	
	include "db_close.php"; 
?>
