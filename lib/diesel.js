window.onload = DE_INIT;

//MAIN CONSTANTS
var DE_CANVAS;
var DE_CONTEXT;

var DE_FPS = 60;

var CURRENT_STATE = new State();

var DE_WIDTH;
var DE_HEIGHT;

var DE_GAME_UPDATE_EXT_FUNC = function() {};

var DE_BUTTON_NORMAL = "game/res/button/normal.png";
var DE_BUTTON_HOVER = "game/res/button/hover.png";
var DE_BUTTON_CLICKED = "game/res/button/click.png";
var DE_BUTTON_DISABLED = "game/res/button/disabled.png";

var DE_MOUSE_POS = new Vec2(0, 0);

var DE_MOUSE_DOWN = false;
var DE_FIRST_MOUSE_DOWN = false;

var DE_EXTERNAL_METHODS = [];

var DE_REC_ANIM;
var DE_REC_PRESET;

var DE_DELTA_TIME = 0;

var DE_KEYS_DOWN = [];
var DE_KEYS_FIRST_DOWN = [];

//MAIN FUNCTIONS
function DE_INIT()
{
    canvas = document.getElementById("game_canvas");
    context = canvas.getContext("2d");
    document.getElementById("game_canvas").style.cursor = "default";
    
    // resize the canvas to fill browser window dynamically
    window.addEventListener('resize', DE_RESIZE_CANVAS, false);
    
    DE_RESIZE_CANVAS();
    
    canvas.addEventListener('mousemove', function(evt) {
        DE_MOUSE_POS = new Vec2(evt.clientX - canvas.getBoundingClientRect().left, evt.clientY - canvas.getBoundingClientRect().top);
        DE_MOUSE_POS.x -= DE_WIDTH/2;
        DE_MOUSE_POS.y -= DE_HEIGHT/2;
    }, false);
    
    canvas.addEventListener('mousedown', function(evt) {
        DE_FIRST_MOUSE_DOWN = !DE_MOUSE_DOWN;
        DE_MOUSE_DOWN = true;
    }, false);
    
    canvas.addEventListener('mouseup', function(evt) {
        DE_MOUSE_DOWN = false;
        DE_FIRST_MOUSE_DOWN = false;
    }, false);
    
    window.addEventListener('keydown', function(evt) { DE_PROCESS_KEY_INPUT_DOWN(evt.keyCode); }, false);
    window.addEventListener('keyup', function(evt) { DE_PROCESS_KEY_INPUT_UP(evt.keyCode); }, false);
    
    //animation frame set from the opened browser
    DE_REC_PRESET = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            null ;
    
    var lastFrame = new Date().getTime();
    DE_REC_ANIM = function() {
        DE_DELTA_TIME = (new Date().getTime() - lastFrame)/1000.0;
        lastFrame = new Date().getTime();
        DE_RESIZE_CANVAS();
        DE_FIRST_MOUSE_DOWN = false;
        DE_REC_PRESET( DE_REC_ANIM );
    };
}

function DE_START_LOOP() {
    DE_REC_PRESET( DE_REC_ANIM );
}

function DE_RESIZE_CANVAS() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
	
	DE_WIDTH = canvas.width;
	DE_HEIGHT = canvas.height;
	
    CURRENT_STATE.updateFunc();
	DE_GAME_UPDATE_EXT_FUNC();
    DE_RENDER_FUNC();
}

function DE_RENDER_FUNC()
{
	context.translate(DE_WIDTH/2, DE_HEIGHT/2);
	for(var i = 0; i < CURRENT_STATE.sprites.length; i++)
	{
        if(!(Sprite.prototype.isPrototypeOf(CURRENT_STATE.sprites[i]))) { console.error("Object in sprites list is not a sprite."); return; }
        if(CURRENT_STATE.sprites[i].enabled)
        {
            DE_RENDER_SPRITE( CURRENT_STATE.sprites[i] );
        }
	}
    
    for(var i = 0; i < CURRENT_STATE.ui.length; i++)
    {
        var uiObject = CURRENT_STATE.ui[i];
        if(uiObject.visible)
        {
            if(Text.prototype.isPrototypeOf(uiObject))
            {
                context.font = uiObject.font;
                context.fillStyle = uiObject.style;
                context.textAlign = uiObject.centered ? "center" : "left";
                context.fillText(uiObject.text, uiObject.position.x, uiObject.position.y);
            } else if(Button.prototype.isPrototypeOf(uiObject))
            {
                //draw button image
                var buttonImg = uiObject.normalImg;

                uiObject.clicked = false;

                if(uiObject.enabled)
                {
                    if(DE_Internal.pointInScreenRect(DE_MOUSE_POS, uiObject.rect))
                    {
                        buttonImg = uiObject.hoveredImg;
                        if(DE_FIRST_MOUSE_DOWN)
                        {
                            uiObject.clicked = true;
                            buttonImg = uiObject.clickedImg;
                        }
                    }
                } else
                {
                    buttonImg = uiObject.disabledImg;
                }

                var img = document.getElementById(buttonImg);

                context.drawImage(img,
                    uiObject.rect.x,
                    uiObject.rect.y,
                    uiObject.rect.width,
                    uiObject.rect.height
                );

                //draw button content
                if(uiObject.contentImg != "")
                {
                    var cimg = document.getElementById(uiObject.contentImg);
                    context.drawImage(cimg,
                        uiObject.rect.x + (uiObject.rect.width/2) - (uiObject.contentImgSize.x/2),
                        uiObject.rect.y + (uiObject.rect.height/2) - (uiObject.contentImgSize.y/2),
                        uiObject.contentImgSize.x,
                        uiObject.contentImgSize.y
                    );
                }

                //draw button text
                context.font = uiObject.textFont;
                context.fillStyle = uiObject.textStyle;
                context.textAlign = "center";
                context.textBaseline = "middle";
                context.fillText(uiObject.text, uiObject.rect.x + (uiObject.rect.width/2), uiObject.rect.y + (uiObject.rect.height/2));
            }
        }
    }
}

function DE_RENDER_SPRITE(spr)
{
    if(!(Sprite.prototype.isPrototypeOf(spr))) { console.error("Object in sprites list is not a sprite."); return; }
    
    if(!spr.enabled)
    {
        return;
    }
    
    var img = document.getElementById(spr.imagePath);
    
    context.translate(spr.transform.position.x, spr.transform.position.y);
    context.rotate((Math.PI/180) * spr.transform.rotation);
    context.drawImage(img,
        -((spr.size.x/2) * spr.transform.scale.x),
        -((spr.size.y/2) * spr.transform.scale.y),
        spr.size.x  * spr.transform.scale.x,
        spr.size.y  * spr.transform.scale.y
    );
    
    context.rotate((Math.PI/180) * -spr.transform.rotation);
    context.translate(-spr.transform.position.x, -spr.transform.position.y);
    
    for(var i = 0; i < spr.children.length; i++)
    {
        DE_RENDER_SPRITE( spr.children[i] );
    }
    
    for(var i = 0; i < DE_KEYS_FIRST_DOWN.length; i++)
    {
        DE_KEYS_FIRST_DOWN.splice(i, 1);
    }
}

function DE_PROCESS_KEY_INPUT_DOWN(e)
{
    if(DE_KEYS_DOWN.indexOf(e) == -1)
    {
        console.log("add");
        DE_KEYS_FIRST_DOWN.push(e);
        DE_KEYS_DOWN.push(e);
    }
}

function DE_PROCESS_KEY_INPUT_UP(e)
{
    if(DE_KEYS_DOWN.indexOf(e) != -1)
    {
        DE_KEYS_DOWN.splice(DE_KEYS_DOWN.indexOf(e), 1);
    }
}

//MAIN API NAMESPACE
var DE = DE || {
    ChangeState: function(state)
    {
        CURRENT_STATE.exitFunc();
        CURRENT_STATE = state;
        CURRENT_STATE.initFunc();
    },
};

//INTERNAL FUNCTIONS
var DE_Internal = DE_Internal || {
    pointInScreenRect: function(pos, rect)
    {
        return pos.x >= rect.x && pos.x <= rect.x + rect.width && pos.y >= rect.y && pos.y <= rect.y + rect.height;
    },
};

//MAIN CLASSES
function State()
{
	this.sprites = [];
    this.ui = [];
    
    var DEF_INIT_FUNC = function() {};
    var DEF_UPDATE_FUNC = function() {};
    var DEF_EXIT_FUNC = function() {};
    
    this.initFunc = DEF_INIT_FUNC;
    this.updateFunc = DEF_UPDATE_FUNC;
    this.exitFunc = DEF_EXIT_FUNC;
}

function Sprite()
{
	this.transform = new Transform();
	this.name = "Sprite";
	this.imagePath = "";
	this.size = new Vec2(50, 50);
    this.children = [];
    this.enabled = true;
}

Sprite.prototype.setImage = function(path)
{
	this.imagePath = path;
	this.size = new Vec2(document.getElementById(path).naturalWidth, document.getElementById(path).naturalHeight);
}

function Transform()
{
	this.position = new Vec2(0, 0);
	this.scale = new Vec2(1, 1);
	this.rotation = 0;
}

function Vec2(x, y)
{
	this.x = x;
	this.y = y;
}

function Rect(x, y, width, height)
{
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
}

function Text(position, text)
{
    this.visible = true;
    this.text = text;
    this.position = position;
    this.centered = true;
    this.font = "22px Arial";
    this.style = "black";
}

function Button(rect, text)
{
    this.visible = true;
    this.rect = rect;
    this.text = text;
    this.textFont = "22px Arial";
    this.textStyle = "black";
    this.normalImg = DE_BUTTON_NORMAL;
    this.hoveredImg = DE_BUTTON_HOVER;
    this.clickedImg = DE_BUTTON_CLICKED;
    this.disabledImg = DE_BUTTON_DISABLED;
    this.contentImg = "";
    this.contentImgSize = new Vec2(64, 64);
    this.enabled = true;
    this.clicked = false;
}


var DE_Input = DE_Input || {
    getKey: function(key)
    {
        return DE_KEYS_DOWN.indexOf(key) != -1;
    },
    getKeyDown: function(key)
    {
        return DE_KEYS_FIRST_DOWN.indexOf(key) != -1;
    },
};
