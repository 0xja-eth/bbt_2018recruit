<?php
	define("DatabaseName", "bbt_task");
	define("UserName", "root");
	define("Password", "");
	define("GameTableName", "game");

	$times = 0;    
	//这里要注意，因为要“真正的"改变$sql的值，所以用引用传值  
	function bindParam(&$sql, $location, $var, $type) {    
	    global $times; 
	    switch ($type) {    
	        default:                    //默认使用字符串类型    
	        case 'STRING' :    
	            $var = addslashes($var);  //转义    
	            $var = "'".$var."'";      //加上单引号.SQL语句中字符串插入必须加单引号    
	            break;    
	        case 'INTEGER' :    
	        case 'INT' :    
	            $var = (int)$var;         //强制转换成int  
	    }   
		// 寻找问号  
	    for ($i=1, $pos = 0; $i<= $location; $i++)   
	        $pos = strpos($sql, '?', $pos+1);   
	    //替换问号    
	    $sql = substr($sql, 0, $pos) . $var . substr($sql, $pos + 1);   
	}    

	function returnMsg($success,$msg){
		$str = array('status'=>$success ? 1 : 0,'msg'=>$msg);
		$jsonencode = json_encode($str);
		echo $jsonencode;
	}

	function getScoreRank($db, $value){
		$str = "SELECT score FROM ".GameTableName." ORDER BY score ASC";
		$result=$db->query($str);
		if(!$result) die($db->error);
		$rows = $result->num_rows;
		if($rows <= 1) return 100;
		for($i=0;$i<$rows;$i++){
			$result->data_seek($i);
			$sco = $result->fetch_array(MYSQLI_ASSOC)['score'];
			if($sco == $value) return round($i/($rows-1)*100,2);
		}
	}
	function getFloorRank($db, $value){
		$str = "SELECT floor FROM ".GameTableName." ORDER BY floor ASC";
		$result=$db->query($str);
		if(!$result) die($db->error);
		$rows = $result->num_rows;
		if($rows <= 1) return 100;
		for($i=0;$i<$rows;$i++){
			$result->data_seek($i);
			$sco = $result->fetch_array(MYSQLI_ASSOC)['floor'];
			if($sco == $value) return round($i/($rows-1)*100,2);
		}
	}

	function uploadScore($db){
		$score = isset($_POST['score'])? $_POST['score'] : 0;
		$floor = isset($_POST['floor'])? $_POST['floor'] : 0;

		if($score==0 || $floor==0) returnMsg(false,"非法信息，上传分数失败！");
		else{
			$str = "INSERT INTO ".GameTableName."(score,floor,time,ID) 
			VALUES (?,?,CURRENT_TIMESTAMP,NULL);";
			bindParam($str, 1, $score, 'INT'); 
			bindParam($str, 1, $floor, 'INT');

			$result=$db->query($str);
			if($result){
				$ret = array();
				$ret['status'] = 1;
				$ret['score'] = getScoreRank($db,$score);
				$ret['floor'] = getFloorRank($db,$floor);
				echo json_encode($ret);
			}else returnMsg(false,"未知原因，上传分数失败！"); 
		}
	}

	function main(){
		$db = new MySQLi("localhost",UserName,Password,DatabaseName);

		$ins = isset($_POST['ins'])? $_POST['ins'] : '';
		$str = "";
		switch ($ins) {
			case 'upload': uploadScore($db);break;
			default: returnMsg(false,"发生未知错误！");
		}
	}
	main();

?>