<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Scores - Feed the People</title>

<link 	rel="stylesheet" 
		type="text/css" 
        href="feed-the-people.css" />

</head>

<body>

<table border="0" width="1000" align="center"
	cellpadding="0" cellspacing="0">
	<tr>
    	<td colspan="2"> </td>
    </tr>
    
    <tr>
    	<td colspan="2"> <div id="bannersection">     <div class="links">
    
    <a href="feed the people.html" id="home"> </a> 
    
    </div>
     
    <div class="links">
    
    <a href="about-ftp.html" id="about"> </a>
    
    </div>

	<div class="links">
    
    <a href="charity-ftp.html" id="charity"> </a>
    
    </div>
    
    <div class="links">
    
    <a href="Scores-ftp.php" id="scores" > </a>
    
    </div>
    
    <div class="links">
    
    <a href="download-ftp.html" id="download" > </a>
    
    </div> </div></td>
    </tr>
    
       <tr>
    	<td colspan="2" id="black"> </td>
    </tr>
     

 <tr>
 <td>
<div id="ScoresSection">
	<div style="height:200px;width:1000px;">
    </div>
    <div style="text-align:center;width:600px;font-family:Verdana, Geneva, sans-serif;">
        <?php 
        include "db_open.php";
            
            // get global score
            $sql = "SELECT GlobalScore FROM scores";
            $result = mysql_query($sql);
            $data = mysql_fetch_row($result);
            $GlobalScore = $data[0];
            
            // current table row
            $sql = "SELECT ID FROM scores WHERE GlobalScore < Milestones ORDER BY Milestones LIMIT 1";
            $result = mysql_query($sql);
            $currentRow = mysql_fetch_row($result);
        
            // get other data
            $sql = "SELECT Milestones, Donation, TotalDonated FROM scores WHERE ID = $currentRow[0]";
            $result = mysql_query($sql);
            $rowData = mysql_fetch_array($result);
        
            //parse and echo
            $milestone = $rowData[0];
            $donation = $rowData[1];
            $totalDonation = $rowData[2];
        
			echo("<div style=\"font-size:30px;\"> Current Global Score: </div>");
            echo("<div style=\"font-size:50px;\"> $GlobalScore </div>");
            echo("<div style=\"font-size:20px;\"> Next Milestone: $milestone </div>");
			echo("<div style=\"font-size:30px;\"> <br/>Current Amount Donated: </div>");
            echo("<div style=\"font-size:50px;\"> \$$totalDonation </div>");
            echo("<div style=\"font-size:20px;\"> Next Donation: \$$donation </div>");
            
            include "db_close.php"; 
        ?>
    </div> 
</div>

</td>
</tr>
<tr>
	<td>
<div id="footer">
	&copy; Feed The People ~ 2012 
</div>
</td>
</tr>

   
</table>

</body>
</html>
