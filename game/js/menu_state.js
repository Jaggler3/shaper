var MenuState = MenuState || {
    create: function()
    {
        var state = new State();
        
        var bg = new Sprite();
        var title = new Text(new Vec2(0, -100), "Shaper");
        
        var playButton = new Button(new Rect(-200, 30, 400, 120), "Play");
        
        var credits = new Text(new Vec2(0, 0), "Made with DE2D for Ludum Dare 35");
        
        state.initFunc = function() {
            bg.setImage("game/res/bg.png");
    
            bg.size = new Vec2(DE_WIDTH, DE_HEIGHT);

            title.centered = true;
            title.font = "200px Questrial";
            title.style = "white";
            
            credits.centered = true;
            credits.font = "50px Questrial";
            credits.style = "white";
            
            playButton.textFont = "75px Questrial";
            
            state.sprites.push(bg);
            state.ui.push(title);
            state.ui.push(playButton);
            state.ui.push(credits);
        }
        
        state.updateFunc = function() {
            
            bg.size = new Vec2(DE_WIDTH, DE_HEIGHT);
            
            credits.position = new Vec2(0, DE_HEIGHT/2 - 100);
            
            if(playButton.clicked)
            {
                DE.ChangeState(GameplayState.create());
            }
        }
        
        state.exitFunc = function() {
            state.sprites = []; //remove the sprites
            state.ui = []; //remove the ui elements
        }
        
        return state;
    },
};