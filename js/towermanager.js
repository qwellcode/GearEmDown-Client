function updateTowerStats(msg)
{
    var element;
    switch (msg[0])
    {
        // TOWER PREFAB STATS
        case "1": updateTowerPrfbStat("money", msg[1], msg[2]); break;      // price
        case "8": updateTowerPrfbStat("dmg", msg[1], msg[2]); break;        // damage
        case "9": updateTowerPrfbStat("fireRate", msg[1], msg[2]); break;   // fireRate
        case "10": updateTowerPrfbStat("radius", msg[1], msg[2]); break;    // radius
        case "11": updateTowerPrfbStat("slow", msg[1], msg[2]); break;      // slow

        // TOWER PROP STATS
        case "3": updateTowerPropStat("dmg", msg[1], msg[2]); break;        // damage
        case "4": updateTowerPropStat("fireRate", msg[1], msg[2]); break;   // fireRate
        case "5": updateTowerPropStat("radius", msg[1], msg[2]); break;     // radius
        case "6": updateTowerPropStat("slow", msg[1], msg[2]); break;       // slow

        // UPGRADE PREFAB STATS
        case "7": // Price
            initialTowerUpgradePrices[msg[1] - 1][msg[2]] = msg[3];
            break;
        case "12": // Value
            console.warn("Not implemented yet.");
            break;

        // UPGRADE PROP STATS
        case "2": // Price
            element = document.querySelector("#upgradeSelection_" + msg[1] + "_" + msg[2]);
            if (element != null)
            {
                if (msg[3] >= 0)
                {
                    element.querySelector(".money").innerText = msg[3];
                    element.emit("update_HoverInfoTop");
                }
                else
                {
                    element.querySelector(".price").innerText = "Max level reached.";
                    element.emit("update_HoverInfoTop");
                }
            }
            else console.warn("ERROR Tower Upgrade Price: PropID " + msg[1] + " or UpgradeID " + msg[2] + " unknown.");
            break;
        case "13": // Value
            console.warn("Not implemented yet.");
            break;
    }
}

var initialTowerUpgradePrices =
    [
        [-1, -1, -1, -1, -1],   // TowerSingleHitDmg
        [-1, -1, -1, -1, -1],   // TowerAoEDmg
        [-1, -1, -1, -1, -1],   // TowerSlow
        [-1, -1, -1, -1, -1],   // TowerBuff
        [-1, -1, -1, -1, -1]    // TowerSingleConstantDmg
    ];

function updateTowerPrfbStat(statName, prfbID, value)
{
    var element = document.querySelector(".towerSelectOption[data-prefabid=\"" + prfbID + "\"]");
    if (element != null)
    {
        var statLabel = element.querySelector("." + statName);
        if (statLabel != null) element.querySelector("." + statName).innerText = parseFloat(value).toFixed(2);
        else console.warn("\"" + statName + "\" is not available for tower prefabID " + prfbID);
        element.emit("update_HoverInfoTop");
    }
    else console.warn("ERROR Tower Prfb Stat: TowerPrefabID " + prfbID + " unknown.");
}
function updateTowerPropStat(statName, propID, value)
{
    var element = document.querySelector("#tower_" + propID);
    if (element != null)
    {
        if (statName == "radius")
        {
            element.setAttribute("towerradius", { radius: value });
            console.log("New radius for " + propID + " is " + value);
        }
        element.querySelector("." + statName).innerText = parseFloat(value).toFixed(2);
        element.emit("update_HoverInfoTop");
    }
    else console.warn("ERROR Tower Prop Stat: PropID " + propID + " unknown.");
}

function placeTower(msg)
{
    // Packet data
    var data = msg.split(";");
    var prefabId, propId, pos;
    switch (data[0])
    {
        // Success
        case "1":
            prefabId = data[1];
            propId = data[2];
            pos = networkToClientPos(data[3], data[4], data[5]);
            break;

        // Failure
        case "2": // TODO
        case "3": // TODO
        case "4": // TODO
        case "5":
            setCursor(cursorStates.Selection);
            return;
    }

    // Tower
    var towerId = "tower_" + propId;
    var newTower = document.createElement('a-entity');
    newTower.setAttribute('id', towerId);
    newTower.setAttribute('position', { x: pos.x, y: 0.927, z: pos.z });
    newTower.setAttribute('scale', { x: scaleOffset, y: scaleOffset, z: scaleOffset });
    newTower.setAttribute('towerradius', '');
    newTower.addEventListener("hover-start", function()
    {
        var towers = document.querySelectorAll(".tower");
        for (var i = 0; i < towers.length; i++) towers[i].setAttribute("towerradius", { visible: false });
        this.setAttribute("towerradius", { visible: true });
    });
    newTower.addEventListener("hover-end", function() { this.setAttribute("towerradius", { visible: false }); });
    newTower.setAttribute('class', 'tower');
    newTower.setAttribute('data-propId', propId);
    newTower.setAttribute('intersectable', '');

    // Tower InfoBox
    var infoBoxContetnt = document.querySelector(".towerSelectOption[data-prefabid=\"" + prefabId + "\"] .infoBox").innerHTML;
    newTower.innerHTML = "<div class='infoBox'>" + infoBoxContetnt + "</div>";
    var priceEl = newTower.querySelector(".price");
    priceEl.parentNode.removeChild(priceEl);

    // Tower Upgrade Menu
    var upgradeSelection = document.createElement('a-entity');
    upgradeSelection.setAttribute('id', 'upgradeSelection_' + propId);
    upgradeSelection.setAttribute('class', 'upgradeSelection');
    upgradeSelection.setAttribute('visible', false);
    upgradeSelection.setAttribute('position', { x: 0, y: 6.15, z: 0 });
    upgradeSelection.setAttribute('scale', { x: 2, y: 2, z: 1 });
    upgradeSelection.setAttribute('billboard', { target: '#main_camera'	});

    // Append
    document.querySelector('a-scene').appendChild(newTower);
    newTower.appendChild(upgradeSelection);

    // Tower model and upgrade options
    var spacing = 1;
    var model_obj, model_mtl;
    switch(parseInt(prefabId))
    {
        case 1:
            model_obj = "#TowerSingleHitDmg-obj";
            model_mtl = "#TowerSingleHitDmg-mtl";
            newTower.setAttribute('towerradius', { radius: document.querySelector("#selection_TowerSingleHitDmg .radius").innerHTML });
            addUpgradeTypeToMenu(upgradeSelection, prefabId, propId, 1).setAttribute("position", { x: rowPosition(1, 3, spacing), y: 0, z: 0 });
            addUpgradeTypeToMenu(upgradeSelection, prefabId, propId, 2).setAttribute("position", { x: rowPosition(2, 3, spacing), y: 0, z: 0 });
            addUpgradeTypeToMenu(upgradeSelection, prefabId, propId, 0).setAttribute("position", { x: rowPosition(3, 3, spacing), y: 0, z: 0 });
            break;
        case 2:
            model_obj = "#TowerAoEDmg-obj";
            model_mtl = "#TowerAoEDmg-mtl";
            newTower.setAttribute('towerradius', { radius: document.querySelector("#selection_TowerAoEDmg .radius").innerHTML });
            addUpgradeTypeToMenu(upgradeSelection, prefabId, propId, 2).setAttribute("position", { x: rowPosition(1, 3, spacing), y: 0, z: 0 });
            addUpgradeTypeToMenu(upgradeSelection, prefabId, propId, 3).setAttribute("position", { x: rowPosition(2, 3, spacing), y: 0, z: 0 });
            addUpgradeTypeToMenu(upgradeSelection, prefabId, propId, 0).setAttribute("position", { x: rowPosition(3, 3, spacing), y: 0, z: 0 });
            break;
        case 3:
            model_obj = "#TowerSlow-obj";
            model_mtl = "#TowerSlow-mtl";
            newTower.setAttribute('towerradius', { radius: document.querySelector("#selection_TowerSlow .radius").innerHTML });
            addUpgradeTypeToMenu(upgradeSelection, prefabId, propId, 3).setAttribute("position", { x: rowPosition(1, 3, spacing), y: 0, z: 0 });
            addUpgradeTypeToMenu(upgradeSelection, prefabId, propId, 4).setAttribute("position", { x: rowPosition(2, 3, spacing), y: 0, z: 0 });
            addUpgradeTypeToMenu(upgradeSelection, prefabId, propId, 0).setAttribute("position", { x: rowPosition(3, 3, spacing), y: 0, z: 0 });
            break;
        case 4:
            model_obj = "#TowerBuff-obj";
            model_mtl = "#TowerBuff-mtl";
            newTower.setAttribute('towerradius', { radius: document.querySelector("#selection_TowerBuff .radius").innerHTML });
            addUpgradeTypeToMenu(upgradeSelection, prefabId, propId, 1).setAttribute("position", { x: rowPosition(1, 4, spacing), y: 0, z: 0 });
            addUpgradeTypeToMenu(upgradeSelection, prefabId, propId, 2).setAttribute("position", { x: rowPosition(2, 4, spacing), y: 0, z: 0 });
            addUpgradeTypeToMenu(upgradeSelection, prefabId, propId, 3).setAttribute("position", { x: rowPosition(3, 4, spacing), y: 0, z: 0 });
            addUpgradeTypeToMenu(upgradeSelection, prefabId, propId, 0).setAttribute("position", { x: rowPosition(4, 4, spacing), y: 0, z: 0 });
            break;
        case 5:
            model_obj = "#TowerSingleConstantDmg-obj";
            model_mtl = "#TowerSingleConstantDmg-mtl";
            newTower.setAttribute('towerradius', { radius: document.querySelector("#selection_TowerSingleConstantDmg .radius").innerHTML });
            addUpgradeTypeToMenu(upgradeSelection, prefabId, propId, 1).setAttribute("position", { x: rowPosition(1, 3, spacing), y: 0, z: 0 });
            addUpgradeTypeToMenu(upgradeSelection, prefabId, propId, 3).setAttribute("position", { x: rowPosition(2, 3, spacing), y: 0, z: 0 });
            addUpgradeTypeToMenu(upgradeSelection, prefabId, propId, 0).setAttribute("position", { x: rowPosition(3, 3, spacing), y: 0, z: 0 });
            break;
    }
    newTower.setAttribute('obj-model', { obj: model_obj, mtl: model_mtl });

    // Cursor
    if (placementDummy != null) setCursor(cursorStates.Selection);
}

function addUpgradeTypeToMenu(parentNode, prefabId, propId, upgradeId)
{
    var icon = document.createElement('a-image');

    var src;
    if (upgradeId > 0) src = "#upgrade0" + upgradeId + "_icon";
    else src = "#sell_icon";

    var hoverInfoTop, price;
    switch (upgradeId)
    {
        case 0:
            price = initialTowerUpgradePrices[prefabId - 1][0];
            hoverInfoTop = "<p>Sell</p><p>Sell the tower to make space and get some money back.</p><p class='price'>Price:<span class='money positive'>" + price + "</span></p>";
            break;
        case 1:
            price = initialTowerUpgradePrices[prefabId - 1][1];
            hoverInfoTop = "<p>Damage</p><p>Increses the damage the tower does with each attack.</p><p class='price'>Price:<span class='money'>" + price + "</span></p>";
            break;
        case 2:
            price = initialTowerUpgradePrices[prefabId - 1][2];
            hoverInfoTop = "<p>Rate of fire</p><p>Increases the amount of attacks per second.</p><p class='price'>Price:<span class='money'>" + price + "</span></p>";
            break;
        case 3:
            price = initialTowerUpgradePrices[prefabId - 1][3];
            hoverInfoTop = "<p>Radius</p><p>Increases the area in which the tower can attack.</p><p class='price'>Price:<span class='money'>" + price + "</span></p>";
            break;
        case 4:
            price = initialTowerUpgradePrices[prefabId - 1][4];
            hoverInfoTop = "<p>Slow multiplier</p><p>Increases the factor by which enemies are slowed down.</p><p class='price'>Price:<span class='money'>" + price + "</span></p>";
            break;
    }

    icon.setAttribute('id', 'upgradeSelection_' + propId + '_' + upgradeId);
    icon.setAttribute('class', 'upgradeOption');
    icon.setAttribute('src', src);
    icon.setAttribute('data-propId', propId);
    icon.setAttribute('data-upgradeId', upgradeId);
    icon.setAttribute('material', { alphaTest: 0.1 });
    icon.setAttribute('intersectable', '');
    icon.innerHTML = "<div class='infoBox'>" + hoverInfoTop + "</div>";

    parentNode.appendChild(icon);
    return icon;
}

function rowPosition(pos, max, space)
{
    if (max % 2 == 1)
    {
        max++;
        if (pos * 2 == max) return 0;
        else return (pos - max / 2) * space;
    }
    else return (pos - max / 2) * space - space / 2.0;
}