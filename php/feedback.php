<?php

function feedback($code, $message){
   $data = [
      "code"=> $code,
      "message"=> $message
   ];
   echo json_encode($data);
}
