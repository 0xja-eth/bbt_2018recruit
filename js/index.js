var SEL = SEL || {};
SEL.blurBar = $("#swipe");
SEL.swipeBar = $("#swipe");
SEL.intr = $("#intr");
SEL.recr = $("#recr");

var swiper = new Swiper(".swiper-container",{
		direction: "vertical",
		allowTouchMove: false,
		/*
		navigation: {
      		nextEl: '.bottomBar'
      		//prevEl: '.swiper-button-prev',
    	},*/
    	speed: 1500
});
//模糊
var blur = 8.0, maxBlur = 53, minBlur = 8, adder = 0.15;
var sty1 = "0 1px ", sty2 = "px 2px #ff63b2";
var blurKeeper = setInterval(function () {
	if(blur > maxBlur || blur < minBlur) adder *= -1;
	SEL.blurBar.css("box-shadow", sty1 + blur.toString() + sty2);
	blur += adder;
}, 2);
//滑动
SEL.swipeBar.click(function(event) {
	adder = 0.8, maxBlur = 250, blur = 50;
	setTimeout(swipe, 500);
});

var bigBlur = "0 1px 75px 2px #ff7ec9";
SEL.intr.click(function(event) {
	$(this).css("box-shadow", bigBlur);
	window.location.assign("./introduction.html");
});
SEL.recr.click(function(event) {
	$(this).css("box-shadow", bigBlur);
	window.location.assign("./recruit.html");
});

var swipe = function() {
	swiper.slideNext();
}
