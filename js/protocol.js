// WebSocket
if (websocket_server_addr == "") connectioErrorPrompt();
var connection = new WebSocket(websocket_server_protocol +"://" + websocket_server_addr + ":" + websocket_server_port + "/towerdefense");

// Client List
var clientList = {};
var client = {};

// Coordinate system
var scaleOffset = 0.05;
var posOffset = 
{
	x: 0,
	y: 0.95,
	z: 0
};

// Protocol definition
var PROTOCOLS = 
{
	GamePhase: "1",
	GameStats: "2",
	PlaceTower: "3",
	SellTower: "4",
	Upgrade: "5",
	Enemy: "6",
	PosSync: "7",
	TowerStats: "8",
	Error: "101",
	ClientList: "102",
	Debug: "103"
};

// ============================= Network Events ========================================================
connection.onopen = function(msg)
{
	document.getElementById("connectionStatus").innerHTML = "online";
};
connection.onmessage = function(event)
{
	var protocol = event.data.split("|");
	var tmp;
	switch (protocol[0])
	{
		// Game Phase
		case PROTOCOLS.GamePhase: onGameStateChanged(protocol[1]); break;

		// PositionSync
		case PROTOCOLS.PosSync:
			var splitPos = protocol[1].split(";");
			var syncObj = getPosSyncObj(splitPos[0]);
			if (syncObj == null) return;
			var pos = networkToClientPos(splitPos[1], splitPos[2], splitPos[3]);
			var pitch = splitPos[4].replace(",", ".");
			var yaw = -(splitPos[5].replace(",", "."));
			var roll = splitPos[6].replace(",", ".");
			syncObj.move(pos.x, pos.y, pos.z, pitch, yaw, roll); // pitch and yaw might be flipped?
			break;

		// Enemy
		case PROTOCOLS.Enemy: OnEnemyChanged(protocol[1].split(';')); break;

		// Error Messages
		case PROTOCOLS.Error: alert(protocol[1]); break;

		// Debugging
		case PROTOCOLS.Debug: console.log(protocol[1]); break;
		
		// Game Stats
		case PROTOCOLS.GameStats: updateUI(protocol[1].split(';')); break;

		// Game Stats
		case PROTOCOLS.Upgrade: break; // TODO: Feedback

		// Tower Stats
		case PROTOCOLS.TowerStats: updateTowerStats(protocol[1].split(';')); break;

		// Place Tower
		case PROTOCOLS.PlaceTower: placeTower(protocol[1]); break;

		// Sell Tower
		case PROTOCOLS.SellTower:
			var sellTower = document.getElementById("tower_" + protocol[1]);
			if (sellTower) sellTower.parentNode.removeChild(sellTower);
			else console.warn("A missing tower was sold. Tower with ID \"" + protocol[1]  + "\" can not be found.");
			break;

		// Client List
		case PROTOCOLS.ClientList:
			if (protocol[1].includes(';'))
			{
				var clients = protocol[1].split(";");
				tmp = clients[0].split(',');
				client = { id: tmp[0], nickName: tmp[1] };
				clientList = {};
				document.getElementById("client").innerHTML = client.nickName + " [ID " + client.id + "]";
				var list = "";
				for (var i = 0; i < clients.length; i++)
				{
					tmp = clients[i].split(',');
					if (client.id == tmp[0]) continue;
					clientList["Client_" + tmp[0]] = { id: tmp[0], nickName: tmp[1] };
					list += "<li>" + tmp[1] + " [ID " + tmp[0] + "]</li>";
				}
				document.getElementById("clientList").innerHTML = list;
			}
			else
			{
				tmp = protocol[1].split(',');
				client = { id: tmp[0], nickName: tmp[1] };
				clientList = {};
				document.getElementById("client").innerHTML = client.nickName + " [" + client.id + "]";
				document.getElementById("clientList").innerHTML = "<li>No other clients.</li>";
			}
			break;
			
		// Unknown Protocol
		default: console.warn("Unknown protocol: " + event.data); break;
	}
};
connection.onclose = function(msg)
{
	document.getElementById("connectionStatus").innerHTML = "offline";
	onGameOver();
};
connection.onerror = function(msg)
{
	connectioErrorPrompt();
	document.getElementById("lastErr").innerHTML = "An error occurred.";
};
// ==========================================================================================================

if (show_connection_infos) document.getElementById("connection_infos").style.display = "block";

function connectioErrorPrompt()
{
	var tmp = "NETWORK ERROR\nMaybe there is something wrong with the configuration?\n";
	tmp += "\nServer address: " + (websocket_server_addr == "" ? "no server address configured!" : websocket_server_addr);
	tmp += "\nServer Port: " + websocket_server_port;
	tmp += "\nWebsocket protocol: " + websocket_server_protocol;
	alert(tmp);
}

function fakeMSG(data)
{
	if (data == "") return;
	connection.onmessage({ data: data });
}

function networkToClientPos(n_x, n_y, n_z)
{
	return {
		x: -(n_x.replace(",", ".") * scaleOffset + posOffset.x),
		y: n_y.replace(",", ".") * scaleOffset + posOffset.y,
		z: n_z.replace(",", ".") * scaleOffset + posOffset.z
	};
}
