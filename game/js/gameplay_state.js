var GameplayState = GameplayState || {
    create: function()
    {
        var state = new State();
        
        var bg = new Sprite();
        var player = new Sprite();
        var captures = [];
        var captureRots = [];
        var scoreText = new Text(new Vec2(DE_WIDTH/2, -DE_HEIGHT/2), "Score: 0");
        
        var pauseButton = new Button(new Rect(DE_WIDTH/2 - 64, -DE_HEIGHT/2, 64, 64), "");
        
        var pausedPanel = new Sprite();
        var pausedTitle = new Text(new Vec2(0, -DE_HEIGHT/2), "Paused");
        var resume = new Button(new Rect(-200, DE_HEIGHT - 300, 400, 120), "Resume");
        var back = new Button(new Rect(-200, DE_HEIGHT - 300, 400, 120), "Back");
        
        var evalPanel = new Sprite();
        var evalTitle = new Text(new Vec2(0, -DE_HEIGHT/2), "Evaluation");
        var evalText = new Text(new Vec2(0, -DE_HEIGHT/2 + 200), "Score: 0");
        var evalRetry = new Button(new Rect(-200, DE_HEIGHT - 300, 400, 120), "Retry");
        var evalBack = new Button(new Rect(-200, DE_HEIGHT - 300, 400, 120), "Back");
        
        var captureSpawnSpeed = 0.25;
        var captureTimer = 0;
        var captureMoveSpeed = 2;
        var deleteTimer = 60;
        var deleteWait = 0;
        
        var shapes = ["triangle", "square", "pentagon", "hexagon", "septagon", "octagon"];
        
        var playerIndex = 0;
        var dwsc = 0;
        var captureIndex = 0;
        var score = 0;
        
        var paused = false;
        var eval = false;
        
        state.initFunc = function() {
            bg.setImage("game/res/bg.png");
    
            bg.size = new Vec2(DE_WIDTH, DE_HEIGHT);
            player.transform.position.x = -DE_WIDTH/4;
            
            player.setImage("game/res/" + shapes[playerIndex] + ".png");
            
            scoreText.centered = true;
            scoreText.font = "75px Questrial";
            scoreText.style = "white";
            
            //pauseButton.textFont = "50px Questrial";
            pauseButton.contentImg = "game/res/pause.png";
            pauseButton.contentImgSize = new Vec2(48, 48);
            
            pausedPanel.enabled = false;
            pausedTitle.visible = false;
            resume.visible = false;
            back.visible = false;
            
            evalPanel.enabled = false;
            evalTitle.visible = false;
            evalText.visible = false;
            evalRetry.visible = false;
            evalBack.visible = false;
            
            pausedTitle.font = "50px Questrial";
            pausedPanel.setImage("game/res/button/normal.png");
            resume.textFont = "75px Questrial";
            back.textFont = "75px Questrial";
            
            evalTitle.font = "50px Questrial";
            evalText.font = "40px Questrial";
            evalPanel.setImage("game/res/button/normal.png");
            evalRetry.textFont = "75px Questrial";
            evalBack.textFont = "75px Questrial";
            
            state.sprites.push(bg);
            state.sprites.push(player);
            
            state.ui.push(scoreText);
            state.ui.push(pauseButton);
            
            state.sprites.push(pausedPanel);
            state.ui.push(pausedTitle);
            state.ui.push(resume);
            state.ui.push(back);
            
            state.sprites.push(evalPanel);
            state.ui.push(evalTitle);
            state.ui.push(evalText);
            state.ui.push(evalRetry);
            state.ui.push(evalBack);
        }
        
        state.updateFunc = function() {
            bg.size = new Vec2(DE_WIDTH, DE_HEIGHT);
            player.transform.position.x = -DE_WIDTH/4;
            player.setImage("game/res/" + shapes[playerIndex] + ".png");
            scoreText.position = new Vec2(-300, -DE_HEIGHT/2 + 100);
            scoreText.text = "Score: " + score;
            
            pauseButton.rect = new Rect(DE_WIDTH/2 - 64, -DE_HEIGHT/2, 64, 64);
            
            pausedTitle.position = new Vec2(0, -DE_HEIGHT/2 + 200);
            pausedPanel.transform.position = new Vec2(0, 0);
            pausedPanel.size = new Vec2(400, DE_HEIGHT - 200);
            resume.rect = new Rect(-200, DE_HEIGHT/2 - 340, 400, 120);
            back.rect = new Rect(-200, DE_HEIGHT/2 - 220, 400, 120);
            
            evalTitle.position = new Vec2(0, -DE_HEIGHT/2 + 200);
            evalText.position = new Vec2(0, -DE_HEIGHT/2 + 250);
            evalPanel.transform.position = new Vec2(0, 0);
            evalPanel.size = new Vec2(400, DE_HEIGHT - 200);
            evalRetry.rect = new Rect(-200, DE_HEIGHT/2 - 340, 400, 120);
            evalBack.rect = new Rect(-200, DE_HEIGHT/2 - 220, 400, 120);
            
            if(pauseButton.clicked)
            {
                paused = true;
                pauseButton.enabled = false;
            } else if(resume.clicked)
            {
                paused = false;
                pauseButton.enabled = true;
                
                resume.visible = false;
                pausedPanel.enabled = false;
                back.visible = false;
                pausedTitle.visible = false;
            } else if(back.clicked)
            {
                DE.ChangeState(MenuState.create());
            } else if(evalRetry.clicked)
            {
                DE.ChangeState(GameplayState.create());
            } else if(evalBack.clicked)
            {
                DE.ChangeState(MenuState.create());
            }
            
            if(!paused && !eval)
            {
                captureMoveSpeed += DE_DELTA_TIME * 0.05;
                captureSpawnSpeed += DE_DELTA_TIME * 0.05;

                for(var i = 0; i < captures.length; i++)
                {
                    captures[i].transform.position.x -= DE_DELTA_TIME * captureMoveSpeed * 100;
                    captures[i].transform.rotation += captureRots[i] * DE_DELTA_TIME;
                }

                if(deleteWait < deleteTimer)
                {
                    deleteWait += DE_DELTA_TIME;
                }

                if(captureTimer < (1/captureSpawnSpeed))
                {
                    captureTimer += DE_DELTA_TIME;
                } else
                {
                    if(deleteWait >= deleteTimer)
                    {
                        if(dwsc == 0) { dwsc = captures.length; }
                        captures[captures.length - dwsc].enabled = false;
                    }
                    captureTimer = 0;
                    captures.push(createCaptureSprite());
                    captureRots.push(Math.random() * 180);
                }

                if(DE_Input.getKeyDown(38))
                {
                    if(playerIndex != shapes.length - 1)
                    {
                        playerIndex++;
                    }
                } else if(DE_Input.getKeyDown(40))
                {
                    if(playerIndex != 0)
                    {
                        playerIndex--;
                    }
                }

                if(captures.length > 0)
                {
                    if(Math.abs(captures[captureIndex].transform.position.x - player.transform.position.x) < 10)
                    {
                        if(playerIndex == shapes.indexOf(captures[captureIndex].name))
                        {
                            score += 2;
                            captureIndex++;
                        } else
                        {
                            eval = true;
                            evalText.text = "Score: " + score;
                        }
                    }
                } 
            } else if(paused)
            {
                pausedPanel.enabled = true;
                pausedTitle.visible = true;
                resume.visible = true;
                back.visible = true;
            } else if(eval)
            {
                evalPanel.enabled = true;
                evalTitle.visible = true;
                evalText.visible = true;
                evalRetry.visible = true;
                evalBack.visible = true;
            }
        }
        
        function parseShape(str)
        {
            if(str == "triangle") { return 0; }
            else if(str == "square") { return 1; }
            else if(str == "pentagon") { return 2; }
            else if(str == "hexagon") { return 3; }
            else if(str == "septagon") { return 4; }
            else if(str == "octagon") { return 5; }
            
            return -1;
        }
        
        function createCaptureSprite()
        {
            var spr = new Sprite();
            
            var shapeIndex = Math.floor(Math.random() * shapes.length);
            
            spr.setImage("game/res/" + shapes[shapeIndex] + ".png");
            
            spr.size = new Vec2(128, 128);
            
            spr.transform.position.x = DE_WIDTH/2;
            
            spr.name = shapes[shapeIndex];
            
            state.sprites.push(spr);
            
            return spr;
        }
        
        state.exitFunc = function() {
            state.sprites = []; //remove the sprites
            state.ui = []; //remove the ui elements
        }
        
        return state;
    },
};