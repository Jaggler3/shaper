function game_init()
{
	if(init) { init(); }
    CURRENT_STATE.initFunc();
	
	DE_GAME_UPDATE_EXT_FUNC = update || (function() {});
    
    DE_START_LOOP(); 
}