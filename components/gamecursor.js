var cursorStates =
{
	Selection: 0,
	TowerPlacement: 1,
	TowerSelection: 2,
	TowerInteraction: 3
};
var cursorState = cursorStates.Selection;
var placementDummy;
var targetPosition;
var towerSelection;
var currentRaycastTarget;
var selectedTower;

AFRAME.registerComponent('gamecursor',
{
	dependencies: ['raycaster'],

	schema:
	{
		raycastTarget: { type: 'string' },
		raycastHit: { type: 'vec3' }
	},

	init: function()
	{
		var data = this.data;

		// Tower-placement-dummy
		placementDummy = document.getElementById('placementDummy');
		placementDummy.setAttribute("scale", { x: scaleOffset, y: scaleOffset, z: scaleOffset });
		placementDummy.setAttribute("obj-model", { obj: "#Placeholder-obj", mtl: "#Placeholder-mtl" });
		towerSelection = document.getElementById('tower_selection');

		// Table
		document.getElementById("td_table").setAttribute("scale", { x: scaleOffset, y: scaleOffset, z: scaleOffset });

		// Help menue
		document.querySelector("#help_page button").addEventListener("click", function()
		{ document.getElementById("help_page").style.display = "none"; });
		setTimeout(function() { document.getElementById("tipp").style.display = "none"; }, 3000);

		var towerSelectOptions = document.querySelectorAll('.towerSelectOption');
		for (var i = 0; i < towerSelectOptions.length; i++)
		{
			towerSelectOptions[i].addEventListener('hover-start', function()
			{
				placementDummy.setAttribute("towerradius",
					{
						radius: this.querySelector(".radius").innerHTML,
						visible: true
					});
			});
		}

		/* EVENTS */
		document.getElementById("cursor").addEventListener("mousedown", function(e)
		{
			var target = document.getElementById(currentRaycastTarget);
			var classes_values = null;
			if (target != null && target.classList != null) classes_values = Object.values(target.classList);

			if (isPlayer)
			{
				if (classes_values != null && currentRaycastTarget != "none")
				{
					if (classes_values.includes('tower'))
					{
						selectedTower = target;
						setCursor(cursorStates.TowerInteraction);
					}
					else if (classes_values.includes('towerplacement')) setCursor(cursorStates.TowerSelection);
					else if (classes_values.includes('towerSelectOption'))
					{
						var prefabId = target.getAttribute('data-prefabid');
						if (prefabId == "abort") setCursor(cursorStates.Selection);
						else if (prefabId != null && prefabId != "")
						{
							targetPosition = placementDummy.getAttribute('position');
							var pos = placementDummy.getAttribute('position');
							var server_pos =
							{
								x: -((pos.x - posOffset.x) / scaleOffset),
								y: 0,
								z: (pos.z - posOffset.z) / scaleOffset
							};
							connection.send(PROTOCOLS.PlaceTower + "|" + prefabId + ";" + server_pos.x + ";" + server_pos.z);
							setCursor(cursorStates.Selection);
						}
					}
					else if (classes_values.includes('uiButton'))
					{
						switch (currentRaycastTarget)
						{
							case "btn_start_game": askPromotion(); break;
							case "btn_end_game": endGame(); break;
							case "btn_next_round": startNextRound(); break;
							default: console.warn("Unknown uiButton id"); break;
						}
					}
					else if (classes_values.includes('upgradeOption'))
					{
						var propID = selectedTower.getAttribute("data-propId");
						if (target.getAttribute("data-upgradeId") == 0) connection.send(PROTOCOLS.SellTower + "|" + propID);
						else
						{
							connection.send(PROTOCOLS.Upgrade + "|" + propID + ";" + target.getAttribute("data-upgradeId"));
						}
					}
				}
				else setCursor(cursorStates.Selection);
			}
			else
			{
				if (classes_values != null && currentRaycastTarget != "none" && classes_values.includes('uiButton'))
				{
					switch (currentRaycastTarget)
					{
						case "btn_start_game": askPromotion(); break;
						case "btn_end_game": promtError("Only the player can end the game.", 5); break;
						case "btn_next_round": promtError("Only the player can start the next round.", 5); break;
						default: console.warn("Unknown uiButton id"); break;
					}
				}
			}
		});
		document.addEventListener('keyup', function(event)
		{
			if (event.which == 72) // H (help)
			{
				var help_page = document.getElementById("help_page");
				if (help_page.style.display == "none" || help_page.style.display == "") help_page.style.display = "block";
				else help_page.style.display = "none";
			}

			if (!isPlayer) return;

			if (event.which == 32) // SPACE
			{
				if (cursorState == cursorStates.TowerPlacement) setCursor(cursorStates.Selection);
				else setCursor(cursorStates.TowerPlacement);
			}
		});
		/* /EVENTS */
	},

	tick: function(time, timeDelta)
	{
		var data = this.data;
		if (cursorState == cursorStates.TowerPlacement)
		{
			if (data.raycastTarget == 'towerPlacementLayer') placementDummy.setAttribute('visible', true);
			else placementDummy.setAttribute('visible', false);
		}
	},

	update: function(oldData)
	{
		var entity = this.el;
		var data = this.data;
		
		switch (cursorState)
		{
			case cursorStates.Selection:
				if (data.raycastTarget == 'none') entity.setAttribute('material', { src: '#basiccursor' });
				else if (data.raycastTarget.includes('tower_')) entity.setAttribute('material', { src: '#hammer' });
				else if (data.raycastTarget.includes('btn')) entity.setAttribute('material', { src: '#buttoncursor' });
				break;
			
			case cursorStates.TowerPlacement:
				//placementDummy.setAttribute('position', placementGrid(data.raycastHit));
				placementDummy.setAttribute('position', { x: data.raycastHit.x, y: 0.927, z: data.raycastHit.z });
				break;
			
			case cursorStates.TowerSelection:
				if (data.raycastTarget.includes('_selection')) entity.setAttribute('material', { src: '#buttoncursor' });
				else entity.setAttribute('material', { src: '#basiccursor' });
				break;
		}
		
		currentRaycastTarget = data.raycastTarget;
	}
});

function setCursor(newCursorState)
{
	var cur = document.getElementById("cursor");
	if (newCursorState != cursorStates.TowerPlacement && cursorState == cursorStates.TowerPlacement)
	{
		setTimeout(function()
		{
			if (cursorState == cursorStates.TowerPlacement) return;
			placementDummy.setAttribute("towerradius", "visible: false");
		}, 5000);
	}
	cursorState = newCursorState;

	switch (newCursorState)
	{
		case cursorStates.Selection:
			placementDummy.setAttribute('visible', false);
			towerSelection.setAttribute('visible', false);
			cur.setAttribute('material', { visible: true, src: "#basiccursor" });
			setTimeout(function() // Quickfix
			{ cur.setAttribute('raycaster', { objects: '' }); }, 25);
			setTimeout(function() // Quickfix
			{ cur.setAttribute('raycaster', { objects: '.tower, .uiButton' }); }, 50);
			if (selectedTower)
			{
				selectedTower.getElementsByClassName("upgradeSelection")[0].setAttribute("visible", false);
				selectedTower = null;
			}
			break;

		case cursorStates.TowerPlacement:
			placementDummy.setAttribute('visible', true);
			cur.setAttribute('material', { visible: false });
			cur.setAttribute('raycaster', { objects: '.towerplacement' });
			if (selectedTower)
			{
				selectedTower.getElementsByClassName("upgradeSelection")[0].setAttribute("visible", false);
				selectedTower = null;
			}
			break;

		case cursorStates.TowerSelection:
			towerSelection.setAttribute('visible', true);
			cur.setAttribute('material', { visible: true, src: '#basiccursor' });
			cur.setAttribute('raycaster', { objects: '.towerSelectOption' });
			if (selectedTower)
			{
				selectedTower.getElementsByClassName("upgradeSelection")[0].setAttribute("visible", false);
				selectedTower = null;
			}
			break;

		case cursorStates.TowerInteraction:
			var towers = document.querySelectorAll(".tower");
			for (var i = 0; i < towers.length; i++) towers[i].getElementsByClassName("upgradeSelection")[0].setAttribute("visible", false);
			selectedTower.getElementsByClassName("upgradeSelection")[0].setAttribute("visible", true);
			cur.setAttribute('material', { visible: true, src: '#basiccursor' });
			cur.setAttribute('raycaster', { objects: '.tower, .uiButton' });
			break;

		default:
			console.warn("unknown cursor state: " + cursorState);
			break;
	}
}

function placementGrid(vec)
{
	var factor = Math.pow(10, 1);
	return {
		x: Math.round(vec.x * factor) / factor + posOffset.x + 0.045,
		y: 0.927,
		z: Math.round(vec.z * factor) / factor + posOffset.z + 0.045
	};
}