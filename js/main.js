var SEL = SEL || {};
SEL.intr = $("#intr");
SEL.quer = $("#quer");
SEL.recr = $("#recr");
/*SEL.bubbleFrame = document.getElementById('bubble-frame');*/
SEL.bubbleFrame = document.getElementById('n');

var bubbles = [];
var bubbleCount = 2;
var bubbleRate = 0.01;
var bubbleSpeed = 0.75;
var bubblePic = 'bubble.png';

SEL.intr.click(function(event) {
	window.location.assign("./introduction.html");
});
SEL.recr.click(function(event) {
	window.location.assign("./recruit.html");
});
SEL.quer.click(function(event) {
	window.location.assign("./query.html");
});

var gotoGame = function() {
	window.location.assign("./game.html");
}

var updateBubbles = function(){
	if(bubbles.length<bubbleCount)
		if(Math.random()<bubbleRate)
			createBubble();
	for(var i=0;i<bubbles.length;i++){
		var bubble = bubbles[i];
			updateBubble(bubble);
	}
	requestAnimationFrame(updateBubbles);
}
var createBubble = function(){
	var bubble = document.createElement('img');
	bubble.src = 'img/'+bubblePic;
	bubble.className = 'bubble';
	bubble.targetLeft = Math.random()*50+25
	bubble.style.left = bubble.targetLeft +'%';
	bubble.style.height = Math.random()*10+10+'%';
	bubble.style.bottom = '1%';
	bubbles.push(bubble);
	bubble.addEventListener('click', gotoGame);
	SEL.bubbleFrame.appendChild(bubble);
}
var destroyBubble = function(bubble){
	bubbles.splice(bubbles.indexOf(bubble),1);
	SEL.bubbleFrame.removeChild(bubble);
}
var updateBubble = function(bubble){
	var bottom = parseFloat(bubble.style.bottom);
	var left = parseFloat(bubble.style.left);
	var height = parseInt(bubble.style.height);
	if(bottom>=100) destroyBubble(bubble)
	/*console.info(bubble.style.left)*/
	bubble.style.bottom = bottom+bubbleSpeed +'%';
	if(Math.abs(left-bubble.targetLeft)<1)
		bubble.targetLeft = left+(Math.round(Math.random()*40)-20);
	bubble.style.left = left+(bubble.targetLeft-left)*0.05+'%';
	/*bubble.style.opacity -= 0.01;*/
}
updateBubbles();