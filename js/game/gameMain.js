

function Game() {
    throw new Error('This is a static class');
}

Game.Setting = {
	// image settings
	BackgroundImage : 'img/background.png',
	HumanPic : 'img/human.png',
	GameOverPic : 'img/gameover.png',
	ScoreDisplayStyle : {
		fontSize: '28px',
		fill: 'white',
		stroke: 'black',
		strokeThickness: 4,
	},
	ScoreAddDisplayStyle : {
		fontSize: '18px',
		stroke: 'black',
		strokeThickness: 2,
	},

	// color settings
	SelectListBgColor : [0,0.5],
	SelectListBgLineColor : [0x008000,0.75],

	TableBgColor : [0,0.5],
	TableBgLineColor : [0x008000,0.75],

	BlockColor : {
		'null' : [0,0],
		'broken' : [0,0.5],
		'ground' : [0x435B45,1],
		'connection' : [0xffffff,1],
		'connected' : [0x808080,1],
		'normal' : [0x80ff80,1],
		'unjump' : [0x80ff80,1],
		'special' : [0xffff00,1],
	},


	// position settings
	GlobalPadding : 4, // padding
	InnerSpacing : 6, // spacing between selectlist and table
	TableSize : [12,16], // width,height
	HumanPosition : [0,1],
	HumanDirection : 1,
	SelectListInnerPadding : 8,

	// functional settings
	FPS : 60,
	SelectCount : 3,
	InitJumpFreq : 60, // frame per block
	FreqRate : 0.985, // speedup per stage
	InitJumpSpeed : 10, // frame per jump
	SpeedRate : 0.985, // speedup per stage

	ScoreAddDisplayAniWait : 20,
	ScoreAddDisplayAniYRate : 2,
	ScoreAddDisplayAniAlphaRate : 0.04,

	DeathTexts : ['你从高处摔了下来','你落地过猛',
		'你从楼梯上掉了下来','信仰之跃','你感受到了引力'],

	// block settings
	SpecialBlockRate : 0.1,
	StairScore : 5,
	BlockType : {
		'null' : 0,
		'broken' : -1,
		'ground' : 1,
		'connection' : 2,
		'connected' : 3,
		'normal' : 4,
		'unjump' : 5,
		'special' : 6,
	},
	BlockScore : {
		'null' : 0,
		'broken' : 0,
		'ground' : 0,
		'connection' : 5,
		'connected' : 8,
		'normal' : 4,
		'unjump' : 2,
		'special' : 50,
	},

	InitMap : [
		[0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,2,0,0,0,0,0,0],
		[0,0,0,0,1,1,0,0,0,0,0,0],
		[0,0,0,1,1,1,0,0,0,0,0,0],
		[1,1,1,1,1,1,0,0,0,0,0,0],
	],

	StairsSet : [
		// normal right-up short
		[{x:0,y:0,type:2},
		 {x:1,y:1,type:4},
		 {x:2,y:2,type:2},
		],
		// normal left-up short
		[{x:0,y:2,type:2},
		 {x:1,y:1,type:4},
		 {x:2,y:0,type:2},
		],
		// normal right-up middle
		[{x:0,y:0,type:2},
		 {x:1,y:1,type:4},
		 {x:2,y:2,type:4},
		 {x:3,y:3,type:4},
		 {x:4,y:4,type:2},
		],
		// normal left-up middle
		[{x:0,y:4,type:2},
		 {x:1,y:3,type:4},
		 {x:2,y:2,type:4},
		 {x:3,y:1,type:4},
		 {x:4,y:0,type:2},
		],
		// normal up-down
		[{x:0,y:0,type:2},
		 {x:1,y:1,type:4},
		 {x:2,y:2,type:2},
		 {x:3,y:1,type:4},
		 {x:4,y:0,type:2},
		],
		// floor long
		[{x:0,y:0,type:2},
		 {x:1,y:0,type:5},
		 {x:2,y:0,type:5},
		 {x:3,y:0,type:5},
		 {x:4,y:0,type:2},
		],
		// heart*1
		[{x:0,y:4,type:3},
		 {x:1,y:3,type:4},
		 {x:1,y:5,type:4},
		 {x:2,y:2,type:4},
		 {x:2,y:6,type:2},
		 {x:3,y:1,type:4},
		 {x:3,y:6,type:4},
		 {x:4,y:0,type:2},
		 {x:4,y:5,type:4},
		 {x:5,y:1,type:4},
		 {x:5,y:6,type:4},
		 {x:6,y:2,type:4},
		 {x:6,y:6,type:2},
		 {x:7,y:3,type:4},
		 {x:7,y:5,type:4},
		 {x:8,y:4,type:3},
		],
	]
}

Game.initialize = function(){
	this.initDataMembers();
	this.initElements();
    this.requestUpdate();
}
Game.initDataMembers = function(){
    this._skipCount = 0;
    this._maxSkip = 3;
    this._stopped = false;

	this._width = window.innerWidth;
	this._height = window.innerHeight;
}

Game.initElements = function() {
    this._createAllElements();
};

Game._createAllElements = function() {
    this._createCanvas();
    //this._createUpperCanvas();
    this._createRenderer();
    this._createStage();
};
Game._createCanvas = function() {
    this._canvas = document.createElement('canvas');
    this._canvas.id = 'GameCanvas';
    this._updateCanvas();
    document.body.appendChild(this._canvas);
};
Game._createUpperCanvas = function() {
    this._upperCanvas = document.createElement('canvas');
    this._upperCanvas.id = 'UpperCanvas';
    this._updateUpperCanvas();
    document.body.appendChild(this._upperCanvas);
};
Game._createStage = function() {
	this._stage = new PIXI.Container();
	this._stage.interactive = true;

	this._createGameObjects();
};
Game._createRenderer = function() {
    PIXI.dontSayHello = true;
    var width = this._width;
    var height = this._height;
    var options = { view: this._canvas , backgroundColor : 0x000000};
    try {
        this._renderer = PIXI.autoDetectRenderer(width, height, options);
        /*document.body.appendChild(this._renderer.view);*/
		if(this._renderer && this._renderer.textureGC)
            this._renderer.textureGC.maxIdle = 1;
    } catch (e) {
        this._renderer = null;
    }
};

Game._createGameObjects = function() {
    this._createBackground();
    this._createMainSprites();
    this._createScore();
    this._createGameEnd();
};
Game._createBackground = function() {
    var texture = new PIXI.Texture.fromImage(Game.Setting.BackgroundImage);
    this._background = new PIXI.extras.TilingSprite(texture, this._width, this._height);
    this._stage.addChild(this._background); 
};
Game._createScore = function() {
    this._scoreDisplay = new PIXI.Text('',
    	Game.Setting.ScoreDisplayStyle);
    this._stage.addChild(this._scoreDisplay); 
};
Game._createGameEnd = function() {
	this._gameEnd = document.createElement('div');
	this._gameEnd.id = 'game_end';

	this._gameEndImg = document.createElement('img');
	this._gameEndImg.src = Game.Setting.GameOverPic;
	this._gameEndImg.id = 'game_end_img';

	this._gameEndInfo = document.createElement('div');
	this._gameEndInfo.id = 'game_end_info';

	this._resumeGame = document.createElement('div');
	this._resumeGame.className = 'game_end_button';
	this._resumeGame.innerHTML = '再玩一局 >';
	this._resumeGame.addEventListener('click',this.resumeGame.bind(this));

	this._gotoRecruit = document.createElement('div');
	this._gotoRecruit.className = 'game_end_button';
	this._gotoRecruit.innerHTML = '马上报名 >';
	this._gotoRecruit.addEventListener('click',this.gotoRecruit.bind(this));
	
    this._gameEnd.appendChild(this._gameEndImg);
    this._gameEnd.appendChild(this._gameEndInfo);
    this._gameEnd.appendChild(this._resumeGame);
    this._gameEnd.appendChild(this._gotoRecruit);
    document.body.appendChild(this._gameEnd);
};
Game.showGameEnd = function() {	
	var score = this._tableSprite.score();
	var floor = this._tableSprite.maxFloor();
	this._gameOver = true;
	$.post("php/game.php",{ ins: 'upload', score, floor}, 
		this.onUploadFinished.bind(this), 'json');
};
Game.onUploadFinished = function(data) {
	this._gameEnd.style.display = 'block';
	this._gameEnd.style.animationName = 'game_end_show';
	this._gameEnd.style.animationDuration = '0.2s';
	this._gameEnd.style.animationTimingFunction = 'linear';
	this._gameEnd.style.animationDelay = '0';
	this._gameEnd.style.animationFillMode = 'both';

	var textSet = Game.Setting.DeathTexts;
	var index = Math.floor(Math.random()*textSet.length);
	var deathText = textSet[index];

	var score = this._tableSprite.score();
	var floor = this._tableSprite.maxFloor();

	this._gameEndInfo.innerHTML = deathText+'<br>';
	this._gameEndInfo.innerHTML += '到达层数：<span class="floor">'+floor+'</span><br>';
	this._gameEndInfo.innerHTML += '最终分数：<span class="score">'+score+'</span><br>';

	if(!data.status) return alert(data.msg);
	this._gameEndInfo.innerHTML += '<span class="small">你击败了 <span class="percent">'+data.score+'%</span> 的人</span>';

};
Game.resumeGame = function() {
	window.location.reload();
};
Game.gotoRecruit = function() {
	alert('暂时未开通报名！');
};
Game._createMainSprites = function() {
	this._createSelectList();
	this._createTableSprite();
};
Game._createSelectList = function() {
    this._selectList = new SelectList();

};
Game._createTableSprite = function() {
    this._tableSprite = new GameTable();
    this._stage.addChild(this._tableSprite); 
    this._stage.addChild(this._selectList); 
};


Game.update = function() {
    this.updateGame();
    this.renderGame();
    this.requestUpdate();
};
Game.updateGame = function() {
	if(this._gameOver) return;
	this._updateSize();
	this._updateScore();
	this._updateLose();
	this._updateAllElements();
};
Game.requestUpdate = function() {
    if (!this._stopped) {
        requestAnimationFrame(this.update.bind(this));
    }
};

Game.render = function(stage) {
    if (this._skipCount === 0) {
        var startTime = Date.now();
        if (stage) this._renderer.render(stage);
        var endTime = Date.now();
        var elapsed = endTime - startTime;
        this._skipCount = Math.min(
        	Math.floor(elapsed / 15), this._maxSkip);
    } else {
        this._skipCount--;
    }
    this.frameCount++;
};
Game.renderGame = function() {
    this.render(this._stage);
};

Game._updateScore = function() {
	if(this._tableSprite){
		this._scoreDisplay.text = (this._tableSprite.score());
	}
};
Game._updateLose = function() {
	if(this._tableSprite){
		if(this._tableSprite.isLose()) this.showGameEnd();
	}
};

Game._updateAllElements = function() {
    this._updateCanvas();
    //this._updateUpperCanvas();
    this._updateStageChildren();
    this._updateRenderer();
};

Game._updateSize = function() {
	this._updateBaseSize();/*
	this._updateSelectListSize();
	this._updateGameTableSize();*/
};
Game._updateBaseSize = function() {
	this._width = window.innerWidth;
	this._height = window.innerHeight;

	this._padding = Game.Setting.GlobalPadding;
	this._spacing = Game.Setting.InnerSpacing;
	this._realWidth = this._width-this._padding*2;
	this._realHeight = this._height-this._padding*2;
};
/*
Game._updateSelectListSize = function() {
	this._selectListItemWidth = this._realWidth/Game.Setting.SelectCount;
	this._selectListItemHeight = this._selectListItemWidth;
	this._selectListWidth = this._realWidth;
	this._selectListHeight = this._selectListItemWidth;
};
Game._updateGameTableSize = function() {
	var base = this._padding+this._selectListHeight+this._spacing;
	var rest = this._height-this._padding-base;
	var xCount = Game.Setting.TableSize[0];
	var yCount = Game.Setting.TableSize[1];

	this._gameTableBlockSize = Math.min(this._realWidth / xCount, rest / yCount);
	this._gameTableWidth = this._gameTableBlockSize*xCount;
	this._gameTableHeight = this._gameTableBlockSize*yCount;

	var w = this._gameTableWidth;
	var h = this._gameTableHeight;

	this._gameTableX = (this._width-w)/2;
	this._gameTableY = base + (rest+h)/2;
};
*/

Game._updateCanvas = function() {
    this._canvas.width = this._width;
    this._canvas.height = this._height;
    this._canvas.style.zIndex = 1;
    this._canvas.touchAction = 'none';
    this._canvas.cursor = 'inherit';
    this._centerElement(this._canvas);
};
Game._updateUpperCanvas = function() {
    this._upperCanvas.width = this._width;
    this._upperCanvas.height = this._height;
    this._upperCanvas.style.zIndex = 3;
    this._centerElement(this._upperCanvas);
};
Game._updateStageChildren = function() {
    this._stage.children.forEach(function(child) {
        if (child.update) child.update();
    });
};
Game._updateRenderer = function() {
    if (this._renderer) {
        this._renderer.resize(this._width, this._height);
    }
};

Game._centerElement = function(element) {
    var width = element.width;
    var height = element.height;
    element.style.position = 'absolute';
    element.style.margin = 'auto';
    element.style.top = 0;
    element.style.left = 0;
    element.style.right = 0;
    element.style.bottom = 0;
    element.style.width = width + 'px';
    element.style.height = height + 'px';
};

Game.setDraggingStairs = function(stairs){
	if(this._draggingStairs!=stairs)
		this.clearDraggingStairs(false);
	this._draggingStairs = stairs;
}
Game.getDraggingStairs = function(){
	return this._draggingStairs;
}
Game.clearDraggingStairs = function(success){
	if(this._draggingStairs)
		this._draggingStairs.onDragEnd(success);
	this._draggingStairs = undefined;
}

Game.initialize();
