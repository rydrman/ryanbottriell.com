<?php

require 'dbConnect.php';

if(!isset($dbLink)) return "{}";

//////////////////////////////
///        get stuff       ///
//////////////////////////////

//first we get our locations 
$query = "SELECT * FROM locations";
$result = mysqli_query($dbLink, $query);

$locations = array();
while($row = mysqli_fetch_assoc($result))
{
    $location = array(
        'id' => (int)$row['id'],
        'name' => $row['name'],
        'max_count' => (int)$row['max_count'],
        'placed' => 0
    );
    array_push($locations, $location);
}

//get items
$query = "SELECT * FROM items";
$result = mysqli_query($dbLink, $query);

$items = array();
while($row = mysqli_fetch_assoc($result))
{
    $item = $row;
    array_push($items, $item);
}

//get actions
$query = "SELECT * FROM actions";
$result = mysqli_query($dbLink, $query);

$actions = array();
while($row = mysqli_fetch_assoc($result))
{
    $action = $row;
    array_push($actions, $action);
}

//////////////////////////////
///   put world together   ///
//////////////////////////////

$minItems = 30;
$minActions = 30;

$spaces = array();
for($i = 0; $i < 5; ++$i)
{
    $spaces[$i] = array();
    for($j = 0; $j < 5; ++$j)
    {
        $spaces[$i][$j] = null;
    }
}

//to fill
$world = array(
    'locations' => array(),
    'items' => array(),       //<- might not need this one
    'actions' => array()
);

//place locations
//place first location
$locSel = rand(0, count($locations)-1);
$x = 0;
$y = 0;

$cnt = 0; $mainCnt = 0;
do{
    //show that we used it
    $locations[$locSel]['placed'] += 1;
    $loc = $locations[$locSel];
    
    //create data for client
    $newLoc = array(
        'id' => $loc['id'],
        'name' => $loc['name'],
        'x' => $x,
        'y' => $y,
        'items' => array(),
        'actions' => array(),
    );
    //store it
    array_push($world['locations'], $newLoc);
    $spaces[$x][$y] = true;
    
    //find next location
    //start with random and cycle through
    $loc = null;
    $start = rand(0, count($locations)-1);
    for($i = 0; $i < count($locations); ++$i)
    {
        $locSel = ($start + $i) % count($locations);
        /*echo count($locations);
        echo ", ";
        echo $locations[$locSel]['placed'] ;
        echo " | ";*/
        if($locations[$locSel]['placed'] < 1)//$locations[$locSel]['max_count'] )
            break;
        else
            $locSel = null;
    }
    //echo " => ";
    //echo $locSel;
    //echo "</br>";
    if($locSel === null) break;//die("failed to select new location" . (string)count($world['locations']));
    
    //find next position
    //start with random and cycle through
    $x = null; $y = null;
    $locStart = rand(0, count($world['locations'])-1);
    for($j = 0; $j < count($world['locations']); ++$j)
    {
        //pick random placed
        $temp = $world['locations'][ ($locStart + $j) % count($world['locations']) ];
        $newX = $temp['x'];
        $newY = $temp['y'];
        
        $start = rand(0, 3);
        for($i = 0; $i < 4; ++$i)
        {
            $pos = ($start + $i) % 4;
            switch($pos)
            {
                case 0:
                    if($newX < 4  && $spaces[$newX+1][$newY] == null)
                    {
                        $x = $newX + 1;
                        $y = $newY;
                        break 3;
                    }
                    break;
                case 1:
                    if($newY < 4 && $spaces[$newX][$newY+1] == null)
                    {
                        $y = $newY + 1;
                        $x = $newX;
                        break 3;
                    }
                    break;
                case 2: 
                    if($newX > 0 && $spaces[$newX-1][$newY] == null)
                    {
                        $x = $newX - 1;
                        $y = $newY;
                        break 3;
                    }
                    break;
                case 3:
                    if($newY > 0 && $spaces[$newX][$newY-1] == null)
                    {
                        $y = $newY - 1;
                        $x = $newX;
                        break 3;
                    }
                    break;
            }
        }
    }
    if($x === null || $y === null) die("failed to get new placement: $x, $newX | $y, $newY");
    
    if($mainCnt > 100) die("count > 100 in location creation");
    $mainCnt++;
}
// while we have less than 13 or 50% chance of up to 17
while(count($world['locations']) < 14 || ( count($world['locations']) < 17 && rand() / getrandmax() > 0.5 ));
    //place location
    //select random placed
    //pick empty adjacent
    //repeat

//for each location
$toPut = array();
for($i = 0; $i < count($world['locations']); ++$i)
{
    
    //get probabilities
    //get actions
    $query = "SELECT * FROM actions_prob WHERE location=".$world['locations'][$i]['id'];
    $result = mysqli_query($dbLink, $query);

    while($row = mysqli_fetch_assoc($result))
    {   
        //add actions
        if(rand() / getrandmax() < $row['probability'])
        {
            //get action
            $action = mysqli_query($dbLink, "SELECT * FROM actions WHERE id=" . $row['action']);
            $action = mysqli_fetch_assoc($action);
            
            //list on location
            array_push($world['locations'][$i]['actions'], $action['name']);
            
            //add if not in world
            $world['actions'][$action['name']] = $action;
            
            //register toPut
            if($action['requires'] != null) 
                array_push($toPut, $action['requires']);
        }
        
    }
    
    //get items
    $query = "SELECT * FROM items_prob WHERE location=".$world['locations'][$i]['id'];
    $result = mysqli_query($dbLink, $query);

    while($row = mysqli_fetch_assoc($result))
    {   
        //add items
        //get item
        $item = mysqli_query($dbLink, "SELECT * FROM items WHERE id=" . $row['item']);
        $item = mysqli_fetch_assoc($item);
        
        if(rand() / getrandmax() < $row['probability'] || in_array($item['id'], $toPut) )
        {
            //list on location
            array_push($world['locations'][$i]['items'], $item['name']);
        }
    }

    //ensure rules are followed
        //to put empty
        //enough items
        //enough actions
        //completable actions
}

//list all items in world
for($i = 0; $i < count($items); ++$i)
{
    $world['items'][$items[$i]['name']] = $items[$i];
}

//go through actions and list requirements etc as actual name
foreach($world['actions'] as $name => $action)
{
    //get required
    $item = $action['requires'];
    if($item != null)
    {
        $item = mysqli_query($dbLink, "SELECT * FROM items WHERE id=$item");
        $item = mysqli_fetch_assoc($item);
        $world['actions'][$name]['requires'] = $item['name'];
    }
    
    //get result
    $item = $action['results'];
    if($item != null)
    {
        $item = mysqli_query($dbLink, "SELECT * FROM items WHERE id=$item");
        $item = mysqli_fetch_assoc($item);
        $world['actions'][$name]['results'] = $item['name'];
    }
}

echo json_encode($world);

require 'dbClose.php';

?>