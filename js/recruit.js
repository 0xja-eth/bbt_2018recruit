$("#submit").click(function () {
	handleSubmit();
})
$("#rtn").click(function() {
	window.location.assign("index.html");
});
$("input, textarea, div#field").click(function() {
	if($(this).hasClass('warning-field')){
		$(this).removeClass('warning-field');
		$(this).find("input, textarea").val("");
	}
});
var blankMsg = ["还没输入姓名~","","","","还没填写宿舍~","还没填写手机号码~","","","","介绍一下自己呦~"];
var warningMsg = ["宿舍格式不对~", "请填写正确的手机号码~", "自我介绍太长了~"];

function handleSubmit() {
	var ary = checkForm();
	if(ary.length != 0){
		var form = handleSerialize(ary);
		if(form){
			$.ajax({
				url: '#',
				type: 'POST',
				dataType: 'json',
				data: form,
			})
			.done(function() {
				console.log("success");
			})
			.fail(function() {
				console.log("error");
			})
			.always(function() {
				console.log("complete");
			});
		}
		else{
			//error_msg
		}
	}
	/*
	else{
		showWarning();
	}*/
	//var form = new FormData();
	//var name = $("input#name").val();
	//var gender = $("input[name='gender']:checked").val();
}
function checkForm() {
	var aval = true;
	//var element = ['name', 'sex', 'college', 'grade', 'dorm', 'phone', 'first', 'second', 'adjust', 'introduction'];
	var name = $("input[name='name']").val();
	var gender = $("input[name='sex']:checked").val();
	var school = $("select[name='college']").find("option:selected").text();
	var sval = $("select[name='college']").find("option:selected").val();
	var grade = $("select[name='grade']").find("option:selected").text();
	var gval = $("select[name='grade']").find("option:selected").val();
	var dorm = $("input[name='dorm']").val();
	var tele = $("input[name='phone']").val();
	var fir = $("select[name='first']").find("option:selected").text();
	var fval = $("select[name='first']").find("option:selected").val();
	var sec = $("select[name='second']").find("option:selected").text();
	var obey = $("input[name='adjust']:checked").val();
	var intro = $("textarea[name='intro']").val();
	//这里写太烂了 不想改了 先这样吧
	var ary = new Array(name, gender, gval, sval, dorm, tele, fval, sec, obey, intro);
	//未填写
	for(var i = 0; i < ary.length; ++i){
		if(ary[i] == '' || ary[i] == null || ary[i] == 0){
			var selector = $("div#field:eq("+i+")");
			selector.addClass('warning-field');
			if(i == 0 || i == 4 || i == 5)
				selector.find('input').val(blankMsg[i]);
			if(i == 9)
				selector.find('textarea').val(blankMsg[i]);
			aval = false;
		}
	}
	//格式错误
	if(dorm != "" && !checkDorm(dorm)){
		var selector = $("div.dorm");
		selector.addClass('warning-field');
		selector.find("input").val(warningMsg[0]);
		aval = false;
	}
	if(tele != "" && (tele.length != 11 || !Number(tele))){
		var selector = $("div.phone");
		selector.addClass('warning-field');
		selector.find("input").val(warningMsg[1]);
		aval = false;
	}
	if(intro.length > 50){
		var selector = $("div.intro");
		selector.addClass('warning-field');
		selector.find("textarea").val(warningMsg[2]);
	}
	if(!aval)return [];
	if(sec == "选填")sec = "";
	var sex = gender == 1 ? "男" : "女";
	var adjust = obey == 1 ? "是" : "否";
	ary = new Array(name, sex, school, grade, dorm, tele, fir, sec, adjust, intro);
	return ary;
}
function checkDorm(dorm) {
	var rule = /^[c|C]\d{1,2}-\d{3}$/;
	if(dorm.match(rule) == null)
		return false;
	return true;
}
function handleSerialize(ary) {
	var form = new FormData();
	var element = ['name', 'sex', 'college', 'grade', 'dorm', 'phone', 'first', 'second', 'adjust', 'introduction'];
	for(var i = 0; i < element.length; ++i){
		form.append(element[i], ary[i]);
		//console.log(element[i]+" : "+ary[i]+'\n');
	}
	return form;
}