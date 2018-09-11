<?php

include_once("conn.php");

use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;

require_once __DIR__.'/vendor/phpoffice/phpspreadsheet/src/Bootstrap.php';


   session_start();
   // 判断SESSION
   $name = "";
   if(array_key_exists('name', $_SESSION))
      $name = $_SESSION['name'];
   else
      exit;

   $data = array();
   global $link;
   if($name == "superadmin"){
      $result = $link->query("SELECT * FROM applicant");
      while($row = $result->fetch_assoc())
         $data[] = array($row['name'],$row['sex'],$row['college'],$row['grade'],$row['dorm'],$row['phone'],
            $row['first'],$row['second'],$row['adjust'],$row['introduction']);
   }
   else{
      $name .= "%";
      $stmt = $link->prepare("SELECT * FROM applicant WHERE first LIKE ?");
      $stmt->bind_param("s", $name);
      $stmt->execute();
      $result = $stmt->get_result();

      if($result->num_rows > 0)
         while($row = $result->fetch_assoc()) 
            $data[] = array($row['name'],$row['sex'],$row['college'],$row['grade'],$row['dorm'],$row['phone'],
               $row['first'],$row['second'],$row['adjust'],$row['introduction']);
      $stmt->close();


      $st = $link->prepare("SELECT * FROM applicant WHERE first NOT LIKE ? AND second LIKE ?");
      $st->bind_param("ss", $name, $name);
      $st->execute();
      $res = $st->get_result();

      if($res->num_rows > 0)
         while($row = $res->fetch_assoc())
            $data[] = array($row['name'],$row['sex'],$row['college'],$row['grade'],$row['dorm'],$row['phone'],
               $row['first'],$row['second'],$row['adjust'],$row['introduction']);
      $res->close();
   }

   $letter = array('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J');

   $obj = new Spreadsheet();

   $obj->getActiveSheet()->getColumnDimension('A')->setAutoSize(true);
   $obj->getActiveSheet()->getColumnDimension('B')->setAutoSize(true);
   $obj->getActiveSheet()->getColumnDimension('C')->setAutoSize(true);
   $obj->getActiveSheet()->getColumnDimension('D')->setAutoSize(true);
   $obj->getActiveSheet()->getColumnDimension('E')->setAutoSize(true);
   $obj->getActiveSheet()->getColumnDimension('F')->setAutoSize(true);
   $obj->getActiveSheet()->getColumnDimension('G')->setAutoSize(true);
   $obj->getActiveSheet()->getColumnDimension('H')->setAutoSize(true);
   $obj->getActiveSheet()->getColumnDimension('I')->setAutoSize(true);
   $obj->getActiveSheet()->getColumnDimension('J')->setAutoSize(true);
   
   
   $obj->getProperties()->setCreator("Maarten Balliauw")
                                       ->setLastModifiedBy("Maarten Balliauw")
                                       ->setTitle("Office 2007 XLSX Test Document")
                                       ->setSubject("Office 2007 XLSX Test Document")
                                       ->setDescription("Test document for Office 2007 XLSX, generated using PHP classes.")
                                       ->setKeywords("office 2007 openxml php")
                                       ->setCategory("Test result file");

   $obj->setActiveSheetIndex(0)
               ->setCellValue('A1', '姓名')
               ->setCellValue('B1', '性别')
               ->setCellValue('C1', '学院')
               ->setCellValue('D1', '年级')
               ->setCellValue('E1', '宿舍')
               ->setCellValue('F1', '电话')
               ->setCellValue('G1', '第一志愿')
               ->setCellValue('H1', '第二志愿')
               ->setCellValue('I1', '是否调剂')
               ->setCellValue('J1', '自我介绍');

   for($i=2;$i<=count($data)+1;$i++){
      $j = 0;
      foreach($data[$i-2] as $val) {
         $obj->setActiveSheetIndex(0)->setCellValue($letter[$j].$i, $val);
         $j++;
      }
   }
   if($name == "superadmin")
      $name = "总";
   $obj->getActiveSheet()->setTitle($name.'名单');
   $obj->setActiveSheetIndex(0);

   ob_end_clean();
   header('Content-Type: application/vnd.ms-excel');
   header('Content-Disposition: attachment;filename="bbt2018秋招名单.xls"');
   header('Cache-Control: max-age=0');
   // If you're serving to IE 9, then the following may be needed
   header('Cache-Control: max-age=1');
   // // If you're serving to IE over SSL, then the following may be needed
   header ('Expires: Mon, 26 Jul 1997 05:00:00 GMT'); // Date in the past
   header ('Last-Modified: '.gmdate('D, d M Y H:i:s').' GMT'); // always modified
   header ('Cache-Control: cache, must-revalidate'); // HTTP/1.1
   header ('Pragma: public'); // HTTP/1.0
   $objWriter = IOFactory::createWriter($obj, 'Xls');
   $objWriter->save('php://output');
   exit;

