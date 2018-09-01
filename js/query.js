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
var dromReg = /^C([1-9]|1[0-9]) *(东|西)? *-? *[1-9][0-9]{2} *$/i;
var info = {};

var nullTexts = {
	name : '姓名不明',
	sex : '性别不明',
	grade : '年级不明',
	college : '学院不明',
	dorm : '宿舍不明',
	phone : '号码不明',
	first : '志愿不明',
	adjust : '是否调剂',
}
var invalidTexts = {
	phone : '格式错误',
	dorm : '格式错误',
	second : '两志愿相同',
	intro : '字数超过上限',
}

var keys = ['Name','Sex','Grade','College','Dorm','Phone',
	'First','Second','Adjust','Introduction'];
var types = ['text','radio','radio','select','text','text',
	'select','select','radio','text'];

var radioValues = { sex: ['男','女'], grade: ['大一','大二'], adjust: ['是','否'] };

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
			invalid : document.getElementById('i'+key),
			type
		};
		if(field.query) field.query.addEventListener('click',onFieldReviseClick.bind(window,lkey));
		if(field.edit) field.edit.addEventListener('click',onFieldReviseClick.bind(window,lkey));
		if(field.show) field.show.addEventListener('click',onFieldRevise.bind(window,lkey));
		if(type == 'radio')
			field.values = [document.getElementById('e'+key+'_1'),
				document.getElementById('e'+key+'_2')];
		fields[lkey] = field;
	}
}
function onSubmit () {
	var valid = validateQuery();
	if(valid.valid) $.post(phpPath, valid.data, onQuery, 'json');
}
function onRevise () {
	var valid = validateRevise();
	if(valid.valid) $.post(phpPath, valid.data, onEdit, 'json');
}
function onReturn() {
	window.location.assign("index.html");
}

function onQuery(ret) {
	ret.code ? showAlert(ret.message) : showInfo(ret);
}
function onEdit(ret) {
	if(ret.code) showAlert(ret.message);
	else{showAlert('修改成功！'); showInfo(ret);}
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
		var invalid = field.invalid;
		var val = (info[key]=='' ? '无' : info[key]);
		if(ele) ele.className = 'field';
		if(show) {
			show.className = 'value';
			show.innerHTML = val.replace(/\n/g,'<br>');;
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
		if(invalid) invalid.innerHTML = '';
	}
}
function onFieldRevise(key){
	var field = fields[key];
	var show = field.show;
	var edit = field.edit;
	if(show) show.className = 'value hidden';
	if(edit) edit.className = 'input';
}
function onFieldReviseClick(key){
	var field = fields[key];
	var invalid = field.invalid;
	invalid.innerHTML = '';
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
	if(check = checkName(name)){
		fields.name.invalid.innerHTML = check;
		return {valid: false};
	}
	if(check = checkPhone(phone)){
		fields.phone.invalid.innerHTML = check;
		return {valid: false};
	}

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
		if(check = window['check'+key](val)){
			field.invalid.innerHTML = check;
			return {valid: false};
		} 
		data[lkey] = (val=='选填' ? '' : val);
	}
	console.info(data[lkey]);
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
	return intro.length > 50 ? invalidTexts.intro : false;
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