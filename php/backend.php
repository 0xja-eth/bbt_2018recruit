<?php

include_once("config.php");
include_once("conn.php");
include_once("feedback.php");

header('Content-type: applicant/json');
function check_password($data){
   if($data['password'] == NAME[$data['name']]){
      session_start();
      $_SESSION['name'] = $data['name'];
      applicant_value($data['name']);
   }
   else
      feedback(7, "密码错误");
}

function applicant_value($name){
   global $link;
   $data = [];
   if($name == "superadmin"){
      
      $result = $link->query("SELECT * FROM applicant");
      if($result){
         while($row = $result->fetch_assoc())
            $data[] = $row;
      }
   
   }
   else{
      $name .= "%";

      $stmt = $link->prepare("SELECT * FROM applicant WHERE first LIKE ?");
      $stmt->bind_param("s", $name);
      $stmt->execute();
      $result = $stmt->get_result();

      if($result->num_rows > 0)
         while($row = $result->fetch_assoc())
            $data[] = $row;
      $stmt->close();


      $st = $link->prepare("SELECT * FROM applicant WHERE first NOT LIKE ? AND second LIKE ?");
      $st->bind_param("ss", $name, $name);
      $st->execute();
      $res = $st->get_result();

      if($res->num_rows > 0)
         while($second_row = $res->fetch_assoc())
            $data[] = $second_row;
      $res->close();
   }
      
   if($data){
      echo json_encode([
         'code' => 0,
         'data' => $data
      ]);
   }
   else
      feedback(8, "暂无数据");
      

}

check_password($_POST);

