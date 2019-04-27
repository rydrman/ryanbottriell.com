<?php

//$input = file_get_contents("php://input");

file_put_contents("savedData.json", $_POST['data']);

print_r($_POST['data']);

?>