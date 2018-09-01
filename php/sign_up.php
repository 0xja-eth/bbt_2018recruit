<?php

include_once("config.php");
include_once("conn.php");
include_once("feedback.php");
include_once("authentication.php");
include_once("check_exist.php");

function sign_up($data){
   
   $data = authentication($data);

   global $link;
   $stmt = $link->prepare("INSERT INTO applicant (name, sex, college, grade, dorm, phone, first, second, adjust, introduction)
      VALUES (?,?,?,?,?,?,?,?,?,?)");
   $stmt->bind_param("ssssssssss", $data['name'], $data['sex'], $data['college'], $data['grade'], $data['dorm'], $data['phone'], 
                     $data['first'], $data['second'], $data['adjust'], $data['introduction']);
   $result = $stmt->execute();
   
   if($result)
      feedback(0, "报名成功");
   else
      feedback(2, "报名失败，请稍后再试");
   $stmt->close();
}

sign_up($_POST);
