var bgMusic;

//called when DE is ready
function init()
{
    bgMusic = document.getElementById("game/res/music.mp3");
    bgMusic.play();
    bgMusic.addEventListener("ended", bgMusic.play, false);
    CURRENT_STATE = MenuState.create();
}

//called after current state is updated
function update()
{
    
}