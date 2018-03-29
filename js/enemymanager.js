// Enemy spawns
var spawnMSGs_1 = [], spawnMSGs_2 = [], spawnMSGs_3 = [];
document.getElementById("enemy_kind_1").addEventListener("model-loaded", function()
{
    for (var i = 0; i < spawnMSGs_1.length; i++)
    {
        OnEnemyChanged(spawnMSGs_1[i]);
    }
});
document.getElementById("enemy_kind_2").addEventListener("model-loaded", function()
{
    for (var i = 0; i < spawnMSGs_2.length; i++)
    {
        OnEnemyChanged(spawnMSGs_1[i]);
    }
});
document.getElementById("enemy_kind_3").addEventListener("model-loaded", function()
{
    for (var i = 0; i < spawnMSGs_3.length; i++)
    {
        OnEnemyChanged(spawnMSGs_1[i]);
    }
});

// Enemy Protocol
function OnEnemyChanged(msg)
{
    switch (msg[0])
    {
        // Spawn
        case "1":
            var prefabId = msg[1];
            var propId = msg[2];

            var obj_name;
            switch (prefabId)
            {
                case "1": obj_name = "Cube.002_Cube.003"; break;
                case "2": obj_name = "Cylinder"; break;
                case "3": obj_name = "Cylinder.003_Cylinder.001"; break;
            }

            try
            {
                var newEnemy = document.createElement('a-entity');

                // Clone OBJ for better performance
                var enemyPrfb = document.getElementById("enemy_kind_" + prefabId);
                var obj = enemyPrfb.object3D.getObjectByName(obj_name).clone();
                newEnemy.setObject3D('mesh', obj);

                newEnemy.setAttribute('possync', { sync_id: propId });
                newEnemy.setAttribute('position', { x: 0.666, y: 0.969, z: 0.652 });
                newEnemy.setAttribute('scale', { x: scaleOffset * 0.6, y: scaleOffset * 0.6, z: scaleOffset * 0.6 });
                newEnemy.setAttribute('enemy', 'health: 100;');
                newEnemy.setAttribute('class', 'enemy_kind_' + prefabId);
                document.querySelector('a-scene').appendChild(newEnemy);
            }
            catch(err)
            {
                switch (prefabId)
                {
                    case "1": spawnMSGs_1.push(msg); break;
                    case "2": spawnMSGs_2.push(msg); break;
                    case "3": spawnMSGs_3.push(msg); break;
                }
            }
            break;

        // Damage
        case "2":
            var towerId = msg[1];
            var enemyId = msg[2];
            var health = msg[3];
            var tower = document.getElementById('tower_' + towerId);
            var enemy = getPosSyncObj(enemyId);
            if (enemy == null) return;
            shootVisuals(tower, enemy.el);
            enemy.el.setAttribute('enemy', { health: health });
            break;

        // Despawn
        case "3":
            var despawn = getPosSyncObj(msg[1]);
            if (despawn != null) despawn.el.parentNode.removeChild(despawn.el);
            break;
    }
}

function shootVisuals(tower, enemy)
{
    var newShoot = document.createElement('a-box');
    var enemyPos = enemy.getAttribute('position');
    var towerPos = tower.getAttribute('position');
    var enemy_to_tower = subtractVector(towerPos, enemyPos);
    var shootPos =
    {
        x: enemy_to_tower.x / 2 + enemyPos.x,
        y: enemy_to_tower.y / 2 + enemyPos.y,
        z: enemy_to_tower.z / 2 + enemyPos.z
    };
    newShoot.setAttribute('position', shootPos);
    newShoot.setAttribute('scale', {x: 0.002, y: 0.002, z: vectorLength(enemy_to_tower)});
    newShoot.setAttribute('material', 'color: red;');
    newShoot.setAttribute('look-at', towerPos);
    document.querySelector('a-scene').appendChild(newShoot);
    setTimeout(function()
    {
        newShoot.parentNode.removeChild(newShoot);
    }, 100);
}

function subtractVector(a, b)
{
    return { x: (a.x - b.x), y: (a.y - b.y), z: (a.z - b.z) };
}

function vectorLength(vec)
{
    var xy = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
    return Math.sqrt(xy * xy + vec.z * vec.z);
}