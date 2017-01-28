<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors',1);

$path = "../content/projects/";
$results = scandir($path);
$type = "content/projects";

$out = "[";

foreach ($results as $result) 
{
    if ($result === '.' or $result === '..') continue;
    
    if (substr($result, 0, 1) == '_') continue;

    if (is_dir($path.$result)) 
    {
        $json = "{ \"base\" : \"content/projects/" . $result . "\" }";
        if(!file_exists($path.$result."/info.json"))
        {
            $json = "{}";
        }
        else
        {
            $json = file_get_contents($path.$result."/info.json");
        }
        
        $info = json_decode($json);
        
        $change = false;
        
        require('checkInfo.php');
        
        if($change == true)
        {
            $json = json_encode($info, JSON_PRETTY_PRINT);
            file_put_contents($path.$result."/info.json", $json);
            chmod( $path.$result."/info.json", 0774 );
        }
        
        $out .= $json;
        if($result !== end($results))
            $out .= ",";
        
        //$info = json_decode($json);

        /*$html =  "<div ";
        $html .= "class='project-block'";
        $html .= "style='";
        $html .= "background-image:url(" . $path . $result . "/" . $info->{'image'} .");";
        $html .= "background-color:" . $info->{'color'} . ";";
        $html .= "'";
        $html .= ">";
        $html .= $info->{'title'};
        $html .= "</div>";

        echo($html);*/
    }
}
trim($out);
trim($out, ",");
echo($out."]");

?>