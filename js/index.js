var SEL = SEL || {};

SEL.intr = $("#intr");
SEL.recr = $("#recr");
SEL.quer = $("#quer");

var recr = function () {
	window.location.assign("recruit.html");
}
var intr = function () {
	window.location.assign("intro.html");
}
var quer = function () {
	window.location.assign("query.html");
}

SEL.intr.click(intr);
SEL.recr.click(recr);
SEL.quer.click(quer);
