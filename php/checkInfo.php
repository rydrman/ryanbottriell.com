<?php

if( !isset($info->{'title'}) )
{
    $info->{'title'} = $result;
    $change = true;
}
if( !isset($info->{'niceTitle'}) )
{
    $info->{'niceTitle'} = $result;
    $change = true;
}
if( !isset($info->{'image'}) )
{
    $info->{'image'} = null;
    $change = true;
}
else if( $info->{'image'} != null )
{
    if(!file_exists($path . $result . "/" . $info->{'image'}))
    {
        $info->{'image'} = null;
        $change = true;
    }
}
if( !isset($info->{'color'}) )
{
    $info->{'color'} = "#0091c6";
    $change = true;
}
if( !isset($info->{'base'}) )
{
    $info->{'base'} = $type . "/" . $result . "/";
    $change = true;
}
if( !isset($info->{'description'}) )
{
    $info->{'description'} = "";
    $change = true;
}

if( !isset($info->{'contentFile'}) )
{
    $info->{'contentFile'} = "index.html";
    $change = true;
}

if( !isset($info->{'tags'}) )
{
    $info->{'tags'} = [];
    $change = true;
}

if( !file_exists( $path . $result . "/" . $info->{'contentFile'} ) )
{
    $contentFile = "";
    
    $contentFile .= "<h1>" . $info->{'niceTitle'} . "</h1>\n";
    $contentFile .= "<p>" . $info->{'description'} . "</p>\n";
    $contentFile .= "<p>Sorry... I haven't had a chance to add any more content here. If you're really curious, send me an email :)</p>";
    $contentFile .= "</br></br><hr></br>";
    $contentFile .= "<img src='images/default.png'/>";
    
    file_put_contents($path . $result . "/" . $info->{'contentFile'}, $contentFile);
    chmod( $path . $result . "/" . $info->{'contentFile'}, 0774 );
}

?>