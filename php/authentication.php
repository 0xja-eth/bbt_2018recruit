<?php

include_once("check_exist.php");
include_once("feedback.php");

// 验证信息
function authentication($data, $factor=true){
   // 验证姓名
   $len = mb_strlen($data['name'], "utf-8");
   if($len < 2 || $len > 15){
      feedback(6, "名字不规范");
      exit;
   }
   $data['name'] = htmlspecialchars($data['name'], ENT_QUOTES);
   
   // 验证性别
   if($data['sex'] != "男" && $data['sex'] != "女"){
      feedback(6, "性别不明");
      exit;
   }

   // 验证学院
   $len = mb_strlen($data['college'], "utf-8");
   if($len < 3 || $len >15){
      feedback(6, "学院错误");
      exit;
   }
   $data['college'] = htmlspecialchars($data['college'], ENT_QUOTES);

   // 验证年级
   if($data['grade'] != "大一" && $data['grade'] != "大二"){
      feedback(6, "年级错误");
      exit;
   }

   // 验证宿舍
   $pattern = "/^[c|C]\d{1,2}(东|西)?-\d{3}$/";
   if(!preg_match($pattern, $data['dorm'])){
      feedback(6, "宿舍号不规范");
      exit;
   }

   // 验证号码
   if(!preg_match("/^1\d{10}$/", $data['phone'])){
      feedback(6, "号码错误");
      exit;
   }
   if($factor)
      if(check_exist($data['phone'])){
         feedback(6, "号码已经被登记");
         exit;
      }

   // 验证第一,二志愿
   $branch = array("技术部 - 代码组", "技术部 - 设计组", "技术部（北校专业）", "视频部 - 策划导演",
      "视频部 - 摄影摄像", "视频部 - 剪辑特效", "策划推广部", "人力资源部", "综合管理部 - 行政管理", 
      "综合管理部 - 物资财务", "综合新闻部 - 撰文记者", "综合新闻部 - 摄影记者", "视觉设计部", "外联部",
      "节目部 - 国语组", "节目部 - 英语组", "节目部 - 粤语组", "编辑部 - 原创写手", "编辑部 - 摄影", "编辑部 - 可视化设计", "产品运营部（北校专业）");
   if(!in_array($data['first'], $branch)){
      feedback(6, "部门错误");
      exit;
   }
   
   // 验证调剂
   if($data['adjust'] != "是" && $data['adjust'] != "否"){
      feedback(6, "调剂错误");
      exit;
   }

   // 验证自我介绍
   if(mb_strlen($data['introduction'], "utf-8") >60){
      feedback(6, "自我介绍字数超出限制");
      exit;
   }
   $data['introduction'] = htmlspecialchars($data['introduction'], ENT_QUOTES);

   return $data;
}
