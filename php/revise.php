<?php

include_once("config.php");
include_once("conn.php");
include_once("feedback.php");
include_once("check_exist.php");
include_once("authentication.php");


function check($data){
   $result = check_exist($data['phone']);
   if($result){
      if($data['name'] == $result['name']){
         session_start();
         $_SESSION['id'] = $result['id'];
         $result['code'] = 0;
         unset($result['id']);
         unset($result['create_time']);
         echo json_encode($result);
      }
      else
         feedback(3, "信息错误");
   }
   else 
      feedback(4, "尚未报名");
}


function revise($data){
   session_start();
   if(!array_key_exists('id', $_SESSION)){
      feedback(5, "没有权限");
      exit;
   }
   $id = $_SESSION['id'];
   
   authentication($data);
   
   global $link;
   $stmt = $link->prepare("UPDATE applicant SET name=?, sex=?, college=?, grade=?, dorm=?, phone=?, first=?, second=?, 
                           adjust=?, introduction=? WHERE id=?");
   $stmt->bind_param("ssssssssssi", $data['name'], $data['sex'], $data['college'], $data['grade'], $data['dorm'], $data['phone'], 
      $data['first'], $data['second'], $data['adjust'], $data['introduction'], $id);
   $result = $stmt->execute();
   if($result)
      feedback(0, "更新成功");
   else
      feedback(2, "更新失败，请稍后再试");
   $stmt->close();
}

if($_POST['action'] == 'check')
   check($_POST);
elseif($_POST['action'] == 'revise')
   revise($_POST);

