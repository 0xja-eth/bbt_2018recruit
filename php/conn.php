<?php

include_once("config.php");

$link = new mysqli(SERVERNAME, USERNAME, PASSWORD, DATABASE);

if($link->connect_error){
   die("连接数据库失败".mysqli_error());
}

