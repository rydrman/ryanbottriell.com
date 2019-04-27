<?php
ini_set('display_errors', 1);

//echo $_SERVER['HTTP_HOST'];

$dbLink = new mysqli('ryanbottriell.com', 'machLearn', 'machLearn_pwd', 'machLearn');

if($dbLink->connect_error)
{
    //database connection failed
    unset($dbLink);
    return;
}



?>