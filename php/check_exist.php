<?php
include_once("config.php");
include_once("conn.php");

function check_exist($phone){
   global $link;
   $stmt = $link->prepare("SELECT * FROM applicant WHERE phone=?");
   $stmt->bind_param("s", $phone);
   $row = $stmt->execute();
   $result = $stmt->get_result();
   $stmt->close();
   if($result->num_rows == 1){
      $row = $result->fetch_assoc();
      return $row;
   }
   else 
      return false;
}
