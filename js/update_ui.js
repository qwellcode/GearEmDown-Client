var STATSDEF =
{
    wave:
    {
        id: "1",
        label: document.querySelector('#txt_wave')
    },
    money:
    {
        id: "2",
        label: document.querySelector('#txt_money_ui')
    },
    kills:
    {
        id: "3"
        // TODO
    },
    base_health:
    {
        id: "4",
        label: document.querySelector('#txt_baseHealth')
    },
    high_score:
    {
        id: "5"
        // TODO
    }
};

var money = 0;
function updateUI(msg)
{
    switch (msg[0])
    {
        case STATSDEF.wave.id:
            STATSDEF.wave.label.setAttribute('text__wave', {value: "Wave: " + msg[1]});
            break;

        case STATSDEF.money.id:
            money = parseInt(msg[1]);
            STATSDEF.money.label.setAttribute('value', money);
            var infoBoxes = document.querySelectorAll(".infoBox");
            for (var i = 0; i < infoBoxes.length; i++)
            {
                var price_labels = infoBoxes[i].querySelectorAll(".money:not(.positive)");
                for (var j = 0; j < price_labels.length; j++)
                {
                    var price = price_labels[j].innerHTML;
                    if (price > money) price_labels[j].classList.add("negative");
                    else price_labels[j].classList.remove("negative");
                }

                infoBoxes[i].parentNode.emit("update_HoverInfoTop");
            }
            break;

        case STATSDEF.kills.id:
            // TODO
            //console.log("[STATS] Kills: " + msg[1]);
            break;

        case STATSDEF.base_health.id:
            STATSDEF.base_health.label.setAttribute('text__basehealth', {value: "Health: " + msg[1]});
            break;

        case STATSDEF.high_score.id:
            // TODO
            //console.log("[STATS] High Score: " + msg[1]);
            break;
    }
}