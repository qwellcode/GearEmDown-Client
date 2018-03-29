var player = null;
var isPlayer = false;

// Send Message
function askPromotion()
{
    connection.send("1|1");
}
function endGame()
{
    connection.send("1|2");
}
function startNextRound()
{
    connection.send("1|4");
    setButtonVisibility("btn_next_round", false);
}

// Events
function onRoundOver()
{
    // TODO: Soundeffect oderso
    if (isPlayer) setButtonVisibility("btn_next_round", true);
}
function onGameOver()
{
    player = null;
    isPlayer = false;
    document.getElementById("player").innerHTML = "No Player";
    //for (var obj in posSync_objects) posSync_objects[obj].el.parentNode.removeChild(posSync_objects[obj].el);
    setButtonVisibility("btn_start_game", true);
    setButtonVisibility("btn_end_game", false);
    setButtonVisibility("btn_next_round", false);
}

// Receive Message
function onGameStateChanged(msg)
{
    var subprotocol;
    if (msg.includes(";"))
    {
        msg = msg.split(';');
        subprotocol = msg[0];
        msg = msg[1];
    }
    else subprotocol = msg;

    switch (subprotocol)
    {
        // New Player
        case "1":
            if (clientList.hasOwnProperty("Client_" + msg))
            {
                // Player from client list.
                player = clientList["Client_" + msg];
                isPlayer = false;
                document.getElementById("player").innerHTML = player.nickName;
                setButtonVisibility("btn_start_game", false);
                setButtonVisibility("btn_end_game", true);
                setButtonVisibility("btn_next_round", false);
            }
            else if (msg == client.id)
            {
                // This client is the player.
                player = client;
                isPlayer = true;
                document.getElementById("player").innerHTML = player.nickName;
                setButtonVisibility("btn_start_game", false);
                setButtonVisibility("btn_end_game", true);
                setButtonVisibility("btn_next_round", true);
            }
            else
            {
                // Player not found.
                player = null;
                isPlayer = false;
                document.getElementById("player").innerHTML = "ERROR";
                setButtonVisibility("btn_start_game", true);
                setButtonVisibility("btn_end_game", false);
                setButtonVisibility("btn_next_round", false);
                alert("ERROR: Client with ID \"" + msg + "\" not found.");
            }
            break;
        
        // Game Over
        case "2": onGameOver(); break;
        
        // Start Game Denied
        case "3": promtError("You can not start the game. A game is already in progress.", 3); break;
        
        // Round Over
        case "5": onRoundOver(); break;
        
        // Next Round Denied
        case "6": promtError("You can not start the next round until this round is finished.", 3); break;
    }
}

function setButtonVisibility(btnID, value)
{
    var btn = document.getElementById(btnID);
    if (value)
    {
        btn.setAttribute("visible", "true");
        btn.setAttribute("intersectable", "active: true;");
    }
    else
    {
        btn.setAttribute("visible", "false");
        btn.setAttribute("intersectable", "active: false;");
    }
}

function promtError(msg, duration)
{
    document.getElementById("cursor_info_bottom").innerHTML = msg;
    setTimeout(function(){ document.getElementById("cursor_info_bottom").innerHTML = ""; }, duration * 1000);
}