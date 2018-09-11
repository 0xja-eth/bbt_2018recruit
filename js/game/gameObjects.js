
function GameTable() {
    this.initialize.apply(this, arguments);
}

GameTable.prototype = Object.create(PIXI.Graphics.prototype);
GameTable.prototype.constructor = GameTable;

GameTable.prototype.initialize = function(xCount, yCount) {
    this._xCount = xCount || Game.Setting.TableSize[0];
    this._yCount = yCount || Game.Setting.TableSize[1];

    PIXI.Graphics.call(this);

    this.interactive = true;

    this.initDataMembers();
    this.createContentsGraphics();
    this.createUpperGraphics();
    this.createHuman();
};

GameTable.prototype.initDataMembers = function(){
    this.initTable();
    this.initPosition();
    this.initOthers();
}
GameTable.prototype.initTable = function(){
    this._redrawBlocks = [];
    // this._table[y][x];    
    // table : 0 => null, -1 => passed, <=-2 => gold 
    // >=1 => passable, 1 => ground, 2 => connection, >=3 => different type of stair
    this._table = [];
    var init = Game.Setting.InitMap;
    var w = Game.Setting.TableSize[0];
    var h = Game.Setting.TableSize[1];
    for(var y=0;y<h;y++){
        this._table.push([]);
        for(var x=0;x<w;x++) 
            this.changeType(x,y,init[this._yCount-y-1][x]);
    }
}
GameTable.prototype.initPosition = function(){
    this._humanPos = Game.Setting.HumanPosition;
    this._direction = Game.Setting.HumanDirection; 
    this._nextY = 0; 
    this._scroll = 0;
}
GameTable.prototype.initOthers = function(){
    this._score = 0; 
    this._floor = 0;
    this._maxFloor = 0;
    this._scoreAdd = 0;
}
GameTable.prototype.score = function(){
    return this._score;
}
GameTable.prototype.floor = function(){
    return this._floor;
}
GameTable.prototype.maxFloor = function(){
    return this._maxFloor;
}

GameTable.prototype.blockWidth = function(){ 
    return this._width/this._xCount;
}
GameTable.prototype.blockHeight = function(){ 
    return this._height/this._yCount;
}

GameTable.prototype.createContentsGraphics = function(){
    this._contents = new PIXI.Graphics;
    this.addChild(this._contents);
}
GameTable.prototype.createUpperGraphics = function(){
    this._upper = new PIXI.Graphics;
    this.addChild(this._upper);
}

GameTable.prototype.createHuman = function(){
    this._human = new Human(Game.Setting.HumanPic);
    this._human.setGameTable(this);

    this.addChild(this._human);
}

GameTable.prototype.humanDirection = function(){
    return this._direction;
}
GameTable.prototype.humanNextY = function(){
    return this._nextY;
}

GameTable.prototype.blockPosition = function(x,y){ 
    // anchor: 0,1
    var w = this.blockWidth();
    var h = this.blockHeight();
    return {x:x*w, y:(this._yCount-y)*h};
}
GameTable.prototype.innerBlockPosition = function(x,y){ 
    // anchor: 0,0
    var w = this.blockWidth();
    var h = this.blockHeight();
    return {x:x*w, y:(this._yCount-y-1)*h};
}

GameTable.prototype.getType = function(x, y){ 
    if(this.outOfTable(x, y)) return Game.Setting.BlockType['null'];
    return this._table[y][x];
}
GameTable.prototype.changeType = function(x, y, type){ 
    if(this.outOfTable(x, y)) return;
    this._table[y][x] = type;
    this._redrawBlocks.push([x,y]);
}
GameTable.prototype.standable = function(x, y){ 
    if(this.outOfTable(x, y)) return false;
    return this.getType(x,y) >= Game.Setting.BlockType['ground'];
}
GameTable.prototype.turnable = function(x, y){ 
    if(this.outOfTable(x, y)) return false;
    return this.getType(x,y) == Game.Setting.BlockType['connected'];
}
GameTable.prototype.jumpable = function(x, y){ 
    if(this.outOfTable(x, y)) return false;
    return this.getType(x,y) != Game.Setting.BlockType['unjump'];
}
GameTable.prototype.outOfTable = function(x, y){ 
    return x < 0 || y < 0 || x >= this._xCount || y >= this._yCount;
}
GameTable.prototype.isLose = function(){ 
    return this._lose;
}
GameTable.prototype.lose = function(){ 
    this._human.visible = false;
    this._lose = true;
}
GameTable.prototype.scrollUp = function(count){ 
    this._scrolled = true;
    this._table.splice(0,count);
    for(var y=0;y<count;y++){
        this._table.push([]);
        for(var x=0;x<this._xCount;x++)
            this.changeType(x,this._table.length-1,
                Game.Setting.BlockType['null']);
    }
    this._humanPos[1]-=count;
    this.redrawUpperStairs();
}
/* stairsPattern:
    {x,y,type}
*/
GameTable.prototype.stairsAddable = function(x,y,stairsPattern){ 
    var con = false;
    for(var i=0;i<stairsPattern.length;i++){  
        var pattern = stairsPattern[i];
        var conType = Game.Setting.BlockType['connection'];
        var nullType = Game.Setting.BlockType['null'];
        var tx = x+pattern.x, ty = y+pattern.y; 
        if(this.outOfTable(tx, ty)) return false;
        if(pattern.type == conType && this.getType(tx,ty) == conType) con = true;
        else if(this.getType(tx,ty) != nullType) return false;
    }
    return con;
}
GameTable.prototype.addStairs = function(x,y,stairsPattern){ 
    if(this.stairsAddable(x,y,stairsPattern)){
        for(var i=0;i<stairsPattern.length;i++){
            var pattern = stairsPattern[i];
            var conType = Game.Setting.BlockType['connection'];
            var cedType = Game.Setting.BlockType['connected'];
            var norType = Game.Setting.BlockType['normal'];
            var speType = Game.Setting.BlockType['special'];
            var tx = x+pattern.x, ty = y+pattern.y;
            var type = pattern.type;
            if(type == conType && this.getType(tx,ty) == conType){
                this.changeType(tx,ty,cedType);
            }else if(type == norType){  
                if(Math.random()<Game.Setting.SpecialBlockRate) 
                    type = speType;        
                this.changeType(tx,ty,type);
            }else
                this.changeType(tx,ty,type);
        }
        return true;
    }
    return false;
}
GameTable.prototype.dragStairsIn = function(x,y,pattern){
    var valid = this.stairsAddable(x,y,pattern);
    this.drawUpperStairs(x,y,pattern,valid);
    return valid;
}

GameTable.prototype.tableChanged = function(){ 
    return this._redrawBlocks.length > 0;
}
GameTable.prototype.sizeChanged = function(){ 
    return this._lastHeight != this._height || this._lastWidth != this._width;
}

GameTable.prototype.checkType = function(type){ 
    for(var key in Game.Setting.BlockType)
        if(type == Game.Setting.BlockType[key]) return key;
    return 'null';
}

GameTable.prototype.drawBlock = function(x,y){ 
    var bw = this.blockWidth();
    var bh = this.blockHeight();
    var bPos = this.innerBlockPosition(x,y);
    var type = this.getType(x,y);
    var key = this.checkType(type);
    var color = Game.Setting.BlockColor[key];

    this._contents.beginFill(color[0],color[1]);
    this._contents.drawRect(bPos.x,bPos.y,bw,bh);
    this._contents.endFill();
}
GameTable.prototype.drawUpperBlock = function(x,y,type,valid){ 
    var alpha = valid ? 0.75 : 0.6;
    var bw = this.blockWidth();
    var bh = this.blockHeight();
    var bPos = this.innerBlockPosition(x,y);
    var key = this.checkType(type);
    var color = Game.Setting.BlockColor[key];
    var rcolor = valid ? (color[0]+0x00ff00) : (0x808080);
    if(!valid && type == Game.Setting.BlockType['connection']){
        rcolor = Game.Setting.BlockColor['connection'][0];
    }

    this._upper.beginFill(rcolor,color[1]*alpha);
    this._upper.drawRect(bPos.x,bPos.y,bw,bh);
    this._upper.endFill();
}
GameTable.prototype.drawBackground = function(){ 
    var bgColor = Game.Setting.TableBgColor;
    var lineColor = Game.Setting.TableBgLineColor;

    this.clear();
    // draw bg
    this.lineStyle(1,bgColor[0],bgColor[1]);
    this.beginFill(bgColor[0],bgColor[1]);
    this.drawRect(0,0,this._width,this._height);
    this.endFill();
    
    // draw line
    this.lineStyle(1,lineColor[0],lineColor[1]);
    for(var x=0;x<=this._xCount;x++){
        var pos = this.innerBlockPosition(x,-1);
        this.moveTo(pos.x,pos.y);
        this.lineTo(pos.x,0);
    }    
    for(var y=-1;y<this._yCount;y++){
        var pos = this.innerBlockPosition(0,y);
        this.moveTo(pos.x,pos.y);
        this.lineTo(this._width,pos.y);
    }
}

GameTable.prototype.drawTable = function(){ 
    for(var i=0;i<this._redrawBlocks.length;i++){
        var block = this._redrawBlocks[i];
        this.drawBlock(block[0],block[1]);
    }
    this._redrawBlocks = [];
}
GameTable.prototype.redrawAllTable = function(){ 
    this._contents.clear();
    for(var y=0;y<this._yCount;y++)
        for(var x=0;x<this._xCount;x++) this.drawBlock(x,y);

    this._redrawBlocks = [];
}
GameTable.prototype.drawUpperStairs = function(x,y,pattern,valid){ 
    this._upper.clear();
    this._upperX = x;
    this._upperY = y;
    this._upperPattern = pattern;
    for(var i=0;i<pattern.length;i++){
        var patt = pattern[i];
        var tx = x+patt.x, ty = y+patt.y;
        this.drawUpperBlock(tx,ty,patt.type,valid);
    }
}
GameTable.prototype.redrawUpperStairs = function(){ 
    if(!this._upperPattern) return;
    var x = this._upperX, y = this._upperY;
    var pattern = this._upperPattern;
    var valid = this.stairsAddable(x,y,pattern);
    this.drawUpperStairs(x,y,pattern,valid);
}
GameTable.prototype.clearUpperStairs = function(){
    this._upperPattern = undefined;
}

GameTable.prototype.getInnerPosition = function(x,y){ 
    var w = this.blockWidth();
    var h = this.blockHeight();
    return {x:Math.round(x/w), y:this._yCount-Math.round(y/h)-1};
}
GameTable.prototype.onDragEnd = function(event){
    var stairs = Game.getDraggingStairs();
    if(stairs){
        var success = this.onDragging(event,stairs);
        if(success.valid){
            this.addStairs(success.x,success.y,
                stairs.getPattern());
        }
        this._upper.clear();
        this.clearUpperStairs();
        Game.clearDraggingStairs(success.valid);
        return success.valid;
    }
    return false;
}
GameTable.prototype.onDragging = function(event,stairs){
    var data = event.data.global;
    var pos = this.position; 
    var deltaX = data.x-pos.x;
    var deltaY = data.y-pos.y;
    var pos = this.getInnerPosition(deltaX,deltaY);
    var innerPos = stairs._innerPos;
    var rPos = {x:pos.x-innerPos.x, y:pos.y-innerPos.y};
    return {x:rPos.x, y:rPos.y, valid: 
        this.dragStairsIn(rPos.x,rPos.y,stairs.getPattern())};
}

GameTable.prototype.pointerupoutside = GameTable.prototype.onDragEnd;
GameTable.prototype.pointerup = GameTable.prototype.onDragEnd;

GameTable.prototype.pointermove = function(event){
    var stairs = Game.getDraggingStairs();
    if(stairs) this.onDragging(event,stairs);
}

GameTable.prototype.update = function(){ 
    this.updateSize();
    this.updatePosition();
    this.updateTable();
    if(this._human && !this.isLose()) this._human.update();
}
GameTable.prototype.updateSize = function(){ 
    this._lastHeight = this._height;
    this._lastWidth = this._width;
    this.updateTableSize();
    if(this._human && !this.isLose()) 
        this.updateHumanSize();
}
GameTable.prototype.updatePosition = function(){ 
    if(this._human && !this.isLose()) 
        this.updateHumanPosition();
}

GameTable.prototype.updateTableSize = function(){ 
    this.calcSize();
    this.refreshSize();
}
GameTable.prototype.calcSize = function(){
    var width = Game._width, height = Game._height;
    var padding = Game.Setting.GlobalPadding;
    var spacing = Game.Setting.InnerSpacing;
    var selectHeight = Game._selectList._height;
    var base = padding+selectHeight+spacing;
    var rest = height-padding-base;

    var blockSize = Math.min(Game._realWidth / this._xCount, rest / this._xCount);

    var w = this._calcWidth = blockSize*this._xCount;
    var h = this._calcHeight = blockSize*this._yCount;

    this._calcX = (width-w)/2;
    this._calcY = base + (rest+h)/2;
}
GameTable.prototype.refreshSize = function(){ 
    this._width = this._calcWidth;
    this._height = this._calcHeight;
    this.x = this._calcX; this.y = this._calcY-this._height;
    //this.x = 0;
    //this.y = -this._height;
}
GameTable.prototype.updateHumanSize = function(){ 
    if(this._human.valid()){
        var blockW = this.blockWidth();
        var blockH = this.blockHeight();
        this._human.width = Math.min(this._human.width,blockW);
        this._human.height = Math.min(this._human.height,blockH);
    }
}
GameTable.prototype.updateHumanPosition = function(){
    this.updateHumanDataPosition();
    this.updateHumanDisplayPosition();
}
GameTable.prototype.updateHumanDisplayPosition = function(){
    if(this._human.valid()){
        var blockW = this.blockWidth();
        var pos = this._humanPos;
        var realPos = this.blockPosition(pos[0],pos[1]);
        this._human.x = realPos.x+blockW/2+this._human._jumpX;
        this._human.y = realPos.y-this._human._jumpY;
    }
}
GameTable.prototype.updateHumanDataPosition = function(){
    if(this.tableChanged()) this.updateNextDirection();
    if(this._human.isJumpStopped()){
        this._human.clearJumpStopped();
        this.updateNextPosition();
        this.updateNextDirection();
        this.updateScoreAdd();
    }
}
GameTable.prototype.updateNextDirection = function(){
    var hx = this._humanPos[0];
    var hy = this._humanPos[1]-1;
    var dir = this._direction ? 1 : -1;
    this._nextY = -1;
    for(var i=1;i>=-1;i--){
        if(i!=0 && !this.jumpable(hx,hy)) continue;

        if(this.standable(hx+dir,hy+i)) {
            this._nextY = i; return;
        };
        if(this.turnable(hx,hy) && this.standable(hx-dir,hy+i)) {
            this._direction = 1-this._direction;
            this._nextY = i; return;
        };
    }/*
    if(this.turnable(hx,hy))
        for(var i=1;i>=-1;i--){
            if(i!=0 && !this.jumpable(hx,hy)) continue;
            if(this.standable(hx-dir,hy+i)) {
                this._direction = 1-this._direction;
                this._nextY = i; return;
            }
        }*/
}
GameTable.prototype.updateNextPosition = function(){
    var dir = this._direction ? 1 : -1;
    var hx = this._humanPos[0];
    var hy = this._humanPos[1]-1;

    this.changeType(hx,hy,Game.Setting.BlockType['broken']);

    this._humanPos[0] += dir;
    this._humanPos[1] += this._nextY;
    this._floor += this._nextY;
    this._maxFloor = Math.max(this._maxFloor,this._floor);

    var hx = this._humanPos[0];
    var hy = this._humanPos[1]-1;
    var type = this.getType(hx,hy);
    this.processScoreAdd(type);
    if(!this.standable(hx,hy)) return this.lose();

    if(this._nextY>0) this.upStairs();
    if(this._nextY<0) this.downStairs();

    if(this._humanPos[1]>=(this._yCount-5)) {
        this.scrollUp(this._yCount-6);
    }
}
GameTable.prototype.processScoreAdd = function(type){
    var key = this.checkType(type);
    this._scoreAdd += Game.Setting.BlockScore[key];
}
GameTable.prototype.upStairs = function(){ 
    this._scoreAdd += Game.Setting.StairScore;
    this._human.speedUp();
}
GameTable.prototype.downStairs = function(){ 
    this._scoreAdd += -Game.Setting.StairScore;
    this._human.speedDown();
}

GameTable.prototype.updateTable = function(){ 
    if(this.sizeChanged() || this._scrolled){
        this.redrawAllTable(); this._scrolled = false;
        this.drawBackground();
    }
    if(this.tableChanged()) this.drawTable();
}
GameTable.prototype.updateScoreAdd = function(){
    this._score += this._scoreAdd;
    this._human.addScore(this._scoreAdd);
    this._scoreAdd = 0;
}


function Human() {
    this.initialize.apply(this, arguments);
}

Human.prototype = Object.create(PIXI.Sprite.prototype);
Human.prototype.constructor = Human;

Human.FrameXCount = 2;
Human.FrameYCount = 2;

Human.prototype.initialize = function(pic) {
    var texture = new PIXI.Texture.fromImage(Game.Setting.HumanPic);
    PIXI.Sprite.call(this, texture);
    this.anchor = {x:0.5, y:1};
    this.visible = false;
    this._jumpFreq = Game.Setting.InitJumpFreq;
    this._jumpSpd = Game.Setting.InitJumpSpeed;

    if(Game.Newer) this._jumpFreq*=Game.Setting.NewerSpeedDownRate;
    this._pause = Game.Newer;

    this._statusCount = 0;
    this._status = 0; // 0: idle, 1: jump
    this._direction = 1; // 0: left, 1: right
    this._jumpX = this._jumpY = 0;
    this._jumpCount = 0;

    this._scoreAddDisplays = [];
};

Human.prototype.addScore = function(value) {
    if(value==0) return;
    var style = Game.Setting.ScoreAddDisplayStyle;
    style.fill = value<0 ? 'red' : 'white';
    var text = new PIXI.Text(value>0?'+'+String(value):String(value),style);
    text.alpha = 1;
    text._alphaRate = Game.Setting.ScoreAddDisplayAniAlphaRate;
    text._yRate = Game.Setting.ScoreAddDisplayAniYRate;
    text._wait = Game.Setting.ScoreAddDisplayAniWait;
    text.anchor = {x:0.5, y:1};
    text.y = -this.height*1.8;

    this._scoreAddDisplays.push(text);
    this.addChild(text);
};

Human.prototype.setGameTable = function(gt) {
    this._gameTable = gt;
};
Human.prototype.valid = function() {
    return this.texture.valid;
};
Human.prototype.isJumpping = function() {
    return this._status == 1;
};
Human.prototype.isJumpStopped = function() {
    return this._jumpStopped;
};
Human.prototype.clearJumpStopped = function() {
    this._jumpStopped = false;
};
Human.prototype.jump = function() {
    this._status = 1;
};
Human.prototype.stopJump = function() {
    this._status = 0;
    this._jumpX = this._jumpY = 0;
    this._jumpCount = 0;
    this._jumpStopped = true;
};

Human.prototype.speedUp = function() {
    this.jumpFreqUp();
    this.jumpSpdUp();
};
Human.prototype.jumpFreqUp = function() {
    this._jumpFreq *= Game.Setting.FreqRate;
};
Human.prototype.jumpSpdUp = function() {
    this._jumpSpd *= Game.Setting.SpeedRate;
};
Human.prototype.speedDown = function() {
    this.jumpFreqDown();
    this.jumpSpdDown();
};
Human.prototype.jumpFreqDown = function() {
    this._jumpFreq /= Game.Setting.FreqRate;
};
Human.prototype.jumpSpdDown = function() {
    this._jumpSpd /= Game.Setting.SpeedRate;
};

Human.prototype.update = function() {
    this.updateStatus();
    this.updateJump();
    this.updateFrame();
    this.updateScoreAddDisplays();
};
Human.prototype.updateScoreAddDisplays = function() {
    var group = this._scoreAddDisplays;
    for(var i=group.length-1;i>=0;i--){
        var text = group[i];
        if(text._wait-- > 0) continue;
        text.alpha -= text._alphaRate;
        text.y -= text._yRate;
        if(text.alpha <= 0){
            this.removeChild(text);
            group.splice(i,1);
        }
    }
};

Human.prototype.updateStatus = function() {
    if(this._pause) return;
    if(!this._gameTable) return;
    
    if(this.isJumpping()) this._statusCount = 0;
    else this._statusCount++;
    if(this._statusCount>=Math.round(this._jumpFreq)) this.jump();

    this._direction = this._gameTable.humanDirection();
    this._nextY = this._gameTable.humanNextY();
};
Human.prototype.updateJump = function() {
    if(!this._gameTable) return;
    if(this._status == 1){
        this._jumpCount++;
        var s = this._gameTable.blockWidth();
        var v = s/Math.round(this._jumpSpd);
        var x = v*this._jumpCount, y = 0;
        switch(this._nextY){
            case 1: // 向上跳
            case -1: // 向下跳
                var b = 4+2*Math.sqrt(2);
                var a = (1-b)/s;
                if(this._nextY == -1){
                    x = s-x; y = (a*x*x + b*x)-s; x=s-x
                }else y = a*x*x + b*x;
                break;
            case 0: // 向前走
                break;
        }
        if(this._direction == 0) x = -x;
        this._jumpX = x; this._jumpY = y;
        if(this._jumpCount>=Math.round(this._jumpSpd)) this.stopJump();
    }
};
Human.prototype.updateFrame = function() {
    if(this.texture.baseTexture.hasLoaded){
        this.visible = true;
        var w = this.texture.baseTexture.width/Human.FrameXCount;
        var h = this.texture.baseTexture.height/Human.FrameYCount;
        this.width = this.texture.width = w;
        this.height = this.texture.height = h;
        var x = this._status*w;
        var y = this._direction*h;
        var rect = new PIXI.Rectangle(x, y, w, h);
        this.texture.frame = rect;
    }else{
        this.texture.frame = new PIXI.Rectangle(0,0,0,0);
    }
};


function SelectList() {
    this.initialize.apply(this, arguments);
}

SelectList.prototype = Object.create(PIXI.Graphics.prototype);
SelectList.prototype.constructor = SelectList;

SelectList.prototype.initialize = function() {

    PIXI.Graphics.call(this);    

    this.interactive = true;
    this._firstTurn = true;

    this.initDataMembers();
    this.createStairsDisplays();
    this.drawBackground();
};
SelectList.prototype.displayWidth = function() {
    return this.displayHeight();
};
SelectList.prototype.displayHeight = function() {
    return this._calcHeight;
};

SelectList.prototype.initDataMembers = function() {
    this._selectCount = Game.Setting.SelectCount;
    this._data = [];
    for(var i=0;i<this._selectCount;i++) this._data.push([]);
};
SelectList.prototype.setData = function(id,stairs) {
    this._data[id] = stairs;
};
SelectList.prototype.clearData = function(id) {
    this._data[id] = [];
};
SelectList.prototype.refreshData = function(id,stairs) {
    this.setData(id,stairs);
    this._stairsDisplays[id].setPattern(stairs);
};

SelectList.prototype.createStairsDisplays = function() {
    this._stairsDisplays = [];
    for(var i=0;i<this._selectCount;i++){
        var display = new StairsDisplay(i);
        this.addChild(display);
        this._stairsDisplays.push(display);
    }
};
SelectList.prototype.displayPosition = function(id) {
    var dw = this.displayWidth();
    var dh = this.displayHeight();
    return {x:id*dw,y:0};
};
SelectList.prototype.drawBackground = function() {
    var bgColor = Game.Setting.SelectListBgColor;
    var lineColor = Game.Setting.SelectListBgLineColor;

    this.clear();
    // draw bg
    
    this.lineStyle(1,bgColor[0],bgColor[1]);
    this.beginFill(bgColor[0],bgColor[1]);
    this.drawRect(0,0,this._width,this._height);
    this.endFill();
    
    // draw line
    var dh = this.displayHeight();
    this.lineStyle(1,lineColor[0],lineColor[1]);
    for(var x=0;x<this._selectCount;x++){
        var pos = this.displayPosition(x);
        var nextPos = this.displayPosition(x+1);
        this.moveTo(pos.x+1,pos.y+1);
        this.lineTo(nextPos.x-1,pos.y+1);
        this.lineTo(nextPos.x-1,pos.y+dh-1);
        this.lineTo(pos.x+1,pos.y+dh-1);
        this.lineTo(pos.x+1,pos.y+1);
    }    
};
SelectList.prototype.getRandomStairs = function(){
    var set = Game.Setting.StairsSet;
    var max = Game._tableSprite.floor()>15 ? 
        set.length : set.length-1;
    var index = Math.floor(Math.random()*max);
    return set[index];
}

SelectList.prototype.update = function(){ 
    this.updateSize();
    this.updatePosition();
    this.updateBackground();
    this.updateStairs();
}
SelectList.prototype.updateSize = function(){ 
    this._lastHeight = this._height;
    this._lastWidth = this._width;
    this.updateSelectListSize();
}
SelectList.prototype.updatePosition = function(){
    // update display position
}
SelectList.prototype.sizeChanged = function(){ 
    return this._lastHeight != this._height || this._lastWidth != this._width;
}
SelectList.prototype.updateBackground = function(){ 
    if(this.sizeChanged()) this.drawBackground();
}
SelectList.prototype.updateStairs = function(){
    this.updateStairsDisplays();
    this.updateStairsData();
}
SelectList.prototype.updateStairsDisplays = function(){ 
    for(var i=0;i<this._stairsDisplays.length;i++){
        this._stairsDisplays[i].update();
    }
}
SelectList.prototype.updateStairsData = function(){ 
    if(Game.Newer && this._firstTurn) {
        var set = Game.Setting.StairsSet;
        this.refreshData(0,set[2]);
        this.refreshData(1,set[0]);
        this.refreshData(2,set[5]);
        this._firstTurn = false;
    }else
        for(var i=0;i<this._data.length;i++){
            var data = this._data[i];
            if(data.length<=0) {
                var stairs = this.getRandomStairs();
                this.refreshData(i,stairs);
            }
        }
}

SelectList.prototype.updateSelectListSize = function(){ 
    this.calcSize();
    this.refreshSize();
    this.refreshStairsDisplaysSize();
}
SelectList.prototype.calcSize = function(){
    var padding = Game.Setting.GlobalPadding;

    this._calcWidth = Game._realWidth;
    this._calcHeight = Game._realWidth/this._selectCount;

    this._calcX = padding;
    this._calcY = padding;
}
SelectList.prototype.refreshSize = function(){ 
    this._width = this._calcWidth;
    this._height = this._calcHeight;
    this.x = this._calcX; 
    this.y = this._calcY;
}
SelectList.prototype.refreshStairsDisplaysSize = function(){ 
    for(var i=0;i<this._selectCount;i++){
        var padding = Game.Setting.SelectListInnerPadding;
        var obj = this._stairsDisplays[i];
        var dw = this.displayWidth()-padding*2;
        var dh = this.displayHeight()-padding*2;
        var pos = this.displayPosition(i);
        obj._width = dw; obj._height = dh;
        obj.x = pos.x+padding+(dw-obj.width)/2;
        obj.y = pos.y+padding+(dh-obj.height)/2;
    }
}
SelectList.prototype.getInnerPosition = function(x,y){ 
    var w = this.displayWidth();
    return Math.floor(x/w);
}
SelectList.prototype.pointerdown = function(event){ 
    if(!Game.insidePointerRect(event)) return;
    var data = event.data.global;
    var pos = this.position; 
    var deltaX = data.x-pos.x;
    var deltaY = data.y-pos.y;
    var index = this.getInnerPosition(deltaX,deltaY);

    this._stairsDisplays[index].pointerdown(event);
}
SelectList.prototype.pointerup = function(event){ 
    var data = event.data.global;
    var pos = this.position; 
    var deltaX = data.x-pos.x;
    var deltaY = data.y-pos.y;
    var index = this.getInnerPosition(deltaX,deltaY);

    this._stairsDisplays[index].pointerup(event);
}


function StairsDisplay() {
    this.initialize.apply(this, arguments);
}

StairsDisplay.prototype = Object.create(PIXI.Graphics.prototype);
StairsDisplay.prototype.constructor = StairsDisplay;

StairsDisplay.prototype.initialize = function(id) {
    PIXI.Graphics.call(this);

    this.interactive = true;

    this._index = id;
    this.x = this.y = 0;
    this._width = 0; 
    this._height = 0;

    this.initDataMembers();
};
StairsDisplay.prototype.initDataMembers = function() {
    this._stairPattern = [];
    this._xCount = this._yCount = 0;
    this._patternWidth = this._patternHeight = 0;
    this._scale = 0;
};

StairsDisplay.prototype.oriBlockWidth = function() {
    return 48;
};
StairsDisplay.prototype.oriBlockHeight = function() {
    return 48;
};

StairsDisplay.prototype.blockPosition = function(x,y){ 
    // anchor: 0,0
    var w = this.oriBlockWidth();
    var h = this.oriBlockHeight();
    return {x:x*w, y:(this._yCount-y)*h};
}

StairsDisplay.prototype.setPattern = function(pattern) {
    this._stairPattern = pattern;
    this.calcOriPatternSize();
    this.drawStairs();
};
StairsDisplay.prototype.getPattern = function() {
    return this._stairPattern;
};
StairsDisplay.prototype.calcOriPatternSize = function() {
    var pattern = this._stairPattern;
    if(pattern.length>0){
        var obw = this.oriBlockWidth();
        var obh = this.oriBlockHeight();
        var minX = pattern[0].x;
        var maxX = pattern[0].x;
        var minY = pattern[0].y;
        var maxY = pattern[0].y;
        for(var i=1;i<pattern.length;i++){
            var patt = pattern[i];
            minX = Math.min(minX, patt.x);
            minY = Math.min(minY, patt.y);
            maxX = Math.max(maxX, patt.x);
            maxY = Math.max(maxY, patt.y);
        }
        this._xCount = maxX-minX;
        this._yCount = maxY-minY;
        this._patternWidth = (maxX-minX+1)*obw;
        this._patternHeight = (maxY-minY+1)*obh;
        this._scale = Math.min(this._width/this._patternWidth,
            this._height/this._patternHeight);
    }else{
        this._xCount = this._yCount = 0;
        this._patternWidth = this._patternHeight = 0;
        this._scale = 0;
    }
};
StairsDisplay.prototype.drawStairs = function() {
    var pattern = this._stairPattern;
    this.clear();
    /*this.drawBackground();*/
    for(var i=0;i<pattern.length;i++){
        var patt = pattern[i];
        this.drawBlock(patt.x,patt.y,patt.type);
    }
    this.width = this._patternWidth*this._scale;
    this.height = this._patternHeight*this._scale;
};
StairsDisplay.prototype.drawBackground = function() {
    this.beginFill(0,0.25);
    this.drawRect(0,0,this._patternWidth,this._patternHeight);
    this.endFill();
};
StairsDisplay.prototype.drawBlock = function(x,y,type){ 
    var bw = this.oriBlockWidth();
    var bh = this.oriBlockHeight();
    var bPos = this.blockPosition(x,y);
    var color = [0,0];
    for(var key in Game.Setting.BlockType)
        if(type == Game.Setting.BlockType[key]){
            color = Game.Setting.BlockColor[key];
            break;
        }
    this.beginFill(color[0],color[1]);
    this.drawRect(bPos.x,bPos.y,bw,bh);
    this.endFill();
}
StairsDisplay.prototype.update = function(){ 
    if(this.sizeChanged()) this.updateSize();   
}
StairsDisplay.prototype.updateSize = function(){ 
    this._scale = Math.min(this._width/this._patternWidth,
        this._height/this._patternHeight);
    this.width = this._patternWidth*this._scale;
    this.height = this._patternHeight*this._scale;
    this._lastWidth = this._width;
    this._lastHeight = this._height;        
}
StairsDisplay.prototype.sizeChanged = function(){ 
    return this._lastWidth != this._width || this._lastHeight != this._height;
}


StairsDisplay.prototype.pointerdown = function(event){ 
    if(!Game.insidePointerRect(event)) return;
    this.beforeDrag(event);
    this.onDragStart(event);
}
StairsDisplay.prototype.pointerup = function(event){ 
    this.onDragEnd(false);
}

 
StairsDisplay.prototype.beforeDrag = function(event){
    var data = event.data.global;
    var pos = this.position; 
    var deltaX = (data.x-pos.x)/this._scale;
    var deltaY = (data.y-pos.y)/this._scale;
    this._innerPos = this.getInnerPosition(deltaX,deltaY);
}
StairsDisplay.prototype.getInnerPosition = function(x,y){ 
    var w = this.oriBlockWidth();
    var h = this.oriBlockHeight();
    return {x:Math.floor(x/w), y:this._yCount-Math.floor(y/h)-1};
}


StairsDisplay.prototype.onDragStart = function(event) {
    this.alpha = 0.5;
    Game.setDraggingStairs(this);
}

StairsDisplay.prototype.onDragEnd = function(success) {
    this.alpha = 1;
    this._innerPos = null;
    if(success)
        this.parent.clearData(this._index);
}


function NewerGuide() {
    this.initialize.apply(this, arguments);
}

NewerGuide.prototype = Object.create(PIXI.Container.prototype);
NewerGuide.prototype.constructor = NewerGuide;

NewerGuide.prototype.initialize = function() {
    PIXI.Container.call(this); 

    this.interactive = true;

    this._waiting = false;
    this._count = 0;
    this._status = 0;
    this.createSprites();
};
NewerGuide.prototype.createSprites = function() {
    this.createBackground();
    this.createTextSprite();
    this.createArrowSprite();
    this.clearArrow();
    this.clearText();
    this.clearPointerRect();
};
NewerGuide.prototype.createBackground = function() {
    this._background = new PIXI.Graphics();
    this.addChild(this._background);
};
NewerGuide.prototype.createTextSprite = function() {
    this._textSprite = new PIXI.Text('',Game.Setting.GuideTextStyle);
    this._textSprite.anchor = {x:0.5,y:0.5};
    this.addChild(this._textSprite);
};
NewerGuide.prototype.createArrowSprite = function() {
    var texture = new PIXI.Texture.fromImage(Game.Setting.GuideArrowPic);
    this._arrowSprite = new PIXI.Sprite(texture);
    this._arrowSprite.anchor = {x:0.5,y:0.5};
    this.addChild(this._arrowSprite);
};
NewerGuide.prototype.update = function() {
    if(!this.visible) return;
    this.updateSize();
    this.updateStatus();
    if(this._arrowSprite.visible) 
        this.updateArrowAni();
};
NewerGuide.prototype.updateSize = function() {
    this._width = Game._width;
    this._height = Game._height;
};
NewerGuide.prototype.updateStatus = function() {
    if(!this._waiting){
        switch(this._status){
            case 0:
            var obj = Game._selectList;
            var x = obj.x, y = obj.y;
            var w = obj.displayWidth();
            var h = obj.displayHeight();
            this.setupPointerRect(x,y,w,h);
            this.setupArrow(x+w,y+h/2,false);
            this.setupText(x+w,y+h,'长按选中楼梯\n拖动其到下方');
            break;
            case 1:
            var obj = Game._tableSprite;
            var x = obj.x, y = obj.y;
            var rPos = obj.innerBlockPosition(8,0);
            var tPos = obj.innerBlockPosition(3,5);
            x += tPos.x; y += tPos.y;
            var w = rPos.x-tPos.x;
            var h = rPos.y-tPos.y;
            this.setupPointerRect(x,y,w,h);
            this.setupArrow(x+w,y+h/2,false);
            this.setupText(x+w/2,y-64,'拖动楼梯\n使得两白色方块重合\n方块变色即已重合');
            break;
            case 2:
            var obj = Game._selectList;
            var w = obj.displayWidth();
            var h = obj.displayHeight();
            var x = obj.x+w*2, y = obj.y;
            this.setupPointerRect(x,y,w,h);
            this.setupArrow(x,y+h/2,true);
            this.setupText(x,y+h,'继续选择楼梯\n引导人物回到中间位置');
            break;
            case 3:
            var obj = Game._tableSprite;
            var x = obj.x, y = obj.y;
            var rPos = obj.innerBlockPosition(12,4);
            var tPos = obj.innerBlockPosition(7,9);
            x += tPos.x; y += tPos.y;
            var w = rPos.x-tPos.x;
            var h = rPos.y-tPos.y;
            this.setupPointerRect(x,y,w,h);
            this.setupArrow(x,y+h/2,true);
            this.setupText(x,y-64,'两个白色方块重合即可接上');
            break;
            case 4:
            var obj = Game._selectList;
            var w = obj.displayWidth();
            var h = obj.displayHeight();
            var x = obj.x+w, y = obj.y;
            this.setupPointerRect(x,y,w,h);
            this.setupArrow(x,y+h/2,true);
            this.setupText(x+w/2,y+h+12,'继续选择楼梯\n引导人物往上爬');
            break;
            case 5:
            var obj = Game._tableSprite;
            var x = obj.x, y = obj.y;
            var w = obj._width;
            this.clearPointerRect();
            this.clearArrow();
            this.setupText(x+w/2,y-12,'选择合适位置接上楼梯');
            break;
            case 6: 
            this.clearText();
            setCookie('new',true);
            Game.Newer = false;
            this.visible = false;
            Game._tableSprite._human._jumpFreq/=Game.Setting.NewerSpeedDownRate;
            break;
        }
        this._waiting = true;
    }else{
        if((this._status==1 || this._status==3 || this._status==5)
             && !Game.getDraggingStairs()){
            this._status--; this._waiting = false;
        }
    }
};
NewerGuide.prototype.updateArrowAni = function() {
    if(this._count<10)
        this._arrowSprite.x += this._arrowSprite.scale.x*1.5;
    else if(this._count<20)
        this._arrowSprite.x -= this._arrowSprite.scale.x*1.5;
    else this._count=-1;
    this._count++;
};
NewerGuide.prototype.setupArrow = function(x,y,dir) {
    // dir : true => right   false => left
    this._arrowSprite.visible = true;
    this._arrowSprite.x = x;
    this._arrowSprite.y = y;
    this._arrowSprite.scale.x = dir ? 1 : -1;
};
NewerGuide.prototype.clearArrow = function() {
    this._arrowSprite.visible = false;
};
NewerGuide.prototype.setupText = function(x,y,text) {
    // dir : true => right   false => left
    this._textSprite.visible = true;
    this._textSprite.x = x;
    this._textSprite.y = y;
    this._textSprite.text = text;
};
NewerGuide.prototype.clearText = function(x,y,text) {
    // dir : true => right   false => left
    this._textSprite.visible = false;
    this._textSprite.text = '';
};
NewerGuide.prototype.setupPointerRect = function(x,y,width,height) {
    this.drawBackground(x,y,width,height);
    this._pointerRect = new PIXI.Rectangle(x,y,width,height);
};
NewerGuide.prototype.clearPointerRect = function() {
    this.clearBackground();
    this._pointerRect = undefined;
    var hlColor = Game.Setting.GuideHighlightColor;
    this._background.beginFill(hlColor[0],hlColor[1]);
    this._background.drawRect(0,0,this._width,this._height);    
    this._background.endFill();
};
NewerGuide.prototype.drawBackground = function(x,y,width,height) {
    this.clearBackground();
    var hlColor = Game.Setting.GuideHighlightColor;
    var bgColor = Game.Setting.GuideBackgroundColor;
    this._background.beginFill(hlColor[0],hlColor[1]);
    this._background.drawRect(x,y,width,height);
    this._background.beginFill(bgColor[0],bgColor[1]);
    this._background.drawRect(0,0,this._width,y);
    this._background.drawRect(0,y,x,this._height);
    this._background.drawRect(x,y+height,this._width,this._height-y-height);
    this._background.drawRect(x+width,y,this._width-x-width,height);
    this._background.endFill();
};
NewerGuide.prototype.clearBackground = function() {
    this._background.clear();
};
NewerGuide.prototype.insidePointerRect = function(event) {
    if(!this._pointerRect) return true;
    var x = event.data.global.x;
    var y = event.data.global.y;
    return this._pointerRect.contains(x,y);
};
NewerGuide.prototype.pointerdown = function(event){ 
    if(!Game.insidePointerRect(event)) return;
    if(this._status==0){
        Game._selectList._stairsDisplays[0].pointerdown(event);
        this._waiting = false;
        this._status++;
    }
    if(this._status==2){
        Game._selectList._stairsDisplays[2].pointerdown(event);
        this._waiting = false;
        this._status++;
    }
    if(this._status==4){
        Game._selectList._stairsDisplays[1].pointerdown(event);
        this._waiting = false;
        this._status++;
    }
}
NewerGuide.prototype.pointerup = function(event){ 
    //if(!Game.insidePointerRect(event)) return;
    if(this._status==1 || this._status==3 || this._status==5){
        if(Game._tableSprite.pointerup(event)){
            Game._tableSprite._human._pause = false;
            this._waiting = false;
            this._status++;
        }
    }    
}