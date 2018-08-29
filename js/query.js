function getQueryString(name) { 
	var reg = new RegExp(name+"=([^ ]+)", "g"); 
	var text = window.location.search.replace("%20"," ");
	var r = text.substr(1).match(reg); 
	if (r) return (RegExp.$1); return null; 
} 
function htmlEncodeJQ( str ) {  
    return $('<span/>').text( str ).html();  
}  

var phpPath = 'php/revise.php';
var dromReg = /^[c|C]\d{1,2}-\d{3}$/;
var info = {};

var nullTexts = {
	name : '还没输入姓名~',
	sex : '还没选择性别~',
	grade : '还没选择年级~',
	college : '还没选择学院~',
	dorm : '还没输入宿舍~',
	phone : '还没输入手机~',
	first : '还没选择第一志愿~',
	adjust : '是否服从调剂？',
}
var invalidTexts = {
	phone : '手机号码格式不正确',
	dorm : '宿舍格式不正确',
	second : '两志愿相同！',
}

var keys = ['Name','Sex','Grade','College','Dorm','Phone',
	'First','Second','Adjust','Introduction'];
var types = ['text','radio','select','select','text','text',
	'select','select','radio','text'];

var radioValues = { sex: ['男','女'], adjust: ['是','否'] };

var fields = {};

var centerer = document.getElementById('centerer');
var alertMsg = document.getElementById('alertMsg');

var tips = document.getElementById('tips');

var submit = document.getElementById('submit');
var revise = document.getElementById('revise');
var back = document.getElementById('rtn');

submit.addEventListener('click', onSubmit);
revise.addEventListener('click', onRevise);
back.addEventListener('click', onReturn);

centerer.addEventListener('click', hideAlert);

function onStart(){
	for(var i=0;i<keys.length;i++){
		var key = keys[i];
		var lkey = key.toLowerCase();
		var type = types[i];
		field = {
			field : document.getElementById(lkey),
			query : document.getElementById('q'+key),
			show : document.getElementById('s'+key),
			edit : document.getElementById('e'+key),
			type
		};
		field.show.addEventListener('click',onFieldRevise.bind(window,lkey));
		if(type == 'radio')
			field.values = [document.getElementById('e'+key+'_1'),
				document.getElementById('e'+key+'_2')];
		fields[lkey] = field;
	}
}
function onSubmit () {
	var valid = validateQuery();
	if(!valid.valid) showAlert(valid.msg);
	else $.post(phpPath, valid.data, onQuery, 'json');
}
function onRevise () {
	var valid = validateRevise();
	if(!valid.valid) showAlert(valid.msg);
	else $.post(phpPath, valid.data, onEdit, 'json');
}
function onReturn() {
	window.location.assign("index.html");
}

function onQuery(ret) {
	ret.code ? showAlert(ret.message) : showInfo(ret);
}
function onEdit(ret) {
	if(ret.code) showAlert(ret.message);
	else{
		fields.name.query.value = fields.name.edit.value;
		fields.phone.query.value = fields.phone.edit.value;
		showAlert('修改成功！');
		onSubmit();
	}
}
function hideQueryFields() {
	for(var key in fields){
		var field = fields[key];
		if(field.query) field.query.className = 'input hidden';
	}
}
function setupShowFields() {
	for(var key in fields){
		var field = fields[key];
		var ele = field.field;
		var show = field.show;
		var edit = field.edit;
		var val = info[key];
		if(ele) ele.className = 'field';
		if(show) {
			show.className = 'value';
			show.innerHTML = val;
		}
		if(edit) {
			var type = field.type;
			edit.className = 'input hidden';
			switch(type){
				case 'text': edit.value = val; break;
				case 'select': 
					var option;
					for(var i=0;option=edit[i];i++)
						if(option.text == val){
							edit.value = option.value;
							break;
						}
					break;
				case 'radio': 
					var index = radioValues[key].indexOf(val);
					if(index >= 0)
						for(var i in field.values)
							field.values[i].checked = (i==index);
					break;
			}
		}
	}
}
function onFieldRevise(key){
	var field = fields[key];
	var show = field.show;
	var edit = field.edit;
	if(show) show.className = 'value hidden';
	if(edit) edit.className = 'input';
}
function showInfo(ret) {
	info = ret;
	tips.style.display = 'none';
	hideQueryFields();
	setupShowFields();
	submit.className = 'primary-btn hidden';
	revise.className = 'primary-btn';
}

function validateQuery() {
	var check;
	var name = fields.name.query.value;
	var phone = fields.phone.query.value;
	if(check = checkName(name)) return {valid: false, msg: check};
	if(check = checkPhone(phone)) return {valid: false, msg: check};

	return {valid: true, data: {action:'check', name, phone}};
}
function validateRevise() {
	var check, data = {action:'revise'};

	for(var i in keys){
		var key = keys[i];
		var lkey = key.toLowerCase();
		var field = fields[lkey];
		var edit = field.edit;
		var type = field.type;
		var val = '';
		switch(type){
			case 'text': val = edit.value; break;
			case 'select': val = edit[Number(edit.value)].text; break;
			case 'radio':
				for(var i in field.values)
					if(field.values[i].checked){
						val = radioValues[lkey][i]; break;
					}
		}
		if(check = window['check'+key](val)) return {valid: false, msg: check};
		data[lkey] = val;
	}
	return {valid: true, data};
}

function checkName(name) {
	return name == '' ? nullTexts.name : false;
}
function checkSex(sex) {
	return sex == '' ? nullTexts.sex : false;
}
function checkGrade(grade) {
	return grade == '请选择' ? nullTexts.grade : false;
}
function checkPhone(phone) {
	if(phone == '') return nullTexts.phone;
	if(phone.length != 11 || !Number(phone)) 
		return invalidTexts.phone;
	return false;
}
function checkCollege(college) {
	return college == '请选择' ? nullTexts.college : false;
}
function checkDorm(dorm) {
	if(dorm == '') return nullTexts.dorm;
	if(!dorm.match(dromReg))
		return invalidTexts.dorm;
	return false;
}
function checkFirst(first) {
	return first == '请选择' ? nullTexts.first : false;
}
function checkSecond(second) {
	var first = fields.first.edit;
	first = first[Number(first.value)].text;
	return first == second ? invalidTexts.second : false;
}
function checkAdjust(adjust) {
	return adjust == '' ? nullTexts.adjust : false;
}
function checkIntroduction(intro) {
	return false;
}

function showAlert(msg) {
	centerer.style.display = 'block';
    alertWindow.style.animationName = 'alertShowAni';
    alertWindow.style.animationDuration = '0.2s';
    alertWindow.style.animationTimingFunction = 'linear';
    alertWindow.style.animationDelay = '0';
    alertWindow.style.animationFillMode = 'both';
	alertMsg.innerHTML = msg;
}
function hideAlert() {
    alertWindow.style.animationName = 'alertHideAni';
    alertWindow.style.animationDuration = '0.2s';
    alertWindow.style.animationTimingFunction = 'linear';
    alertWindow.style.animationDelay = '0';
    alertWindow.style.animationFillMode = 'both';
	setTimeout(function(){centerer.style.display = 'none';},200);
}
onStart();