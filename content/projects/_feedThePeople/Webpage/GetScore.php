<?php 
	include "db_open.php";
	
	$output = "FTP:";
	
	// get global score
	$sql = "SELECT GlobalScore FROM scores";
	$result = mysql_query($sql);
	$data = mysql_fetch_row($result);
	$output = $output."$data[0]";
	
	// current table row
	$sql = "SELECT ID FROM scores WHERE GlobalScore < Milestones ORDER BY Milestones LIMIT 1";
	$result = mysql_query($sql);
	$currentRow = mysql_fetch_row($result);
	//echo($currentRow[0]);

	// get other data
	$sql = "SELECT Milestones, Donation, TotalDonated FROM scores WHERE ID = $currentRow[0]";
	$result = mysql_query($sql);
	$rowData = mysql_fetch_array($result);

	//parse and echo
	$var = $rowData[0];
	$output = $output. ":$var";
	$var = $rowData[1];
	$output = $output. ":$var";
	$var = $rowData[2];
	$output = $output. ":$var";

	$output = $output. ":FTP" ;
	
	echo("$output");
	
	include "db_close.php"; 
?>
