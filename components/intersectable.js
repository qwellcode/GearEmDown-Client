AFRAME.registerComponent('intersectable', 
{
	schema:
	{
		raycastEntity: { type: 'string', default: 'cursor' },
		hoverInfoTop: { type: 'string' },
		active: { type: 'boolean', default: true }
	},

	update: function(oldData)
	{
		if (oldData.active != this.data.active)
		{
			if (this.data.active)
			{
				this.el.addEventListener('raycaster-intersected', this.func_intersected);
				this.el.addEventListener('raycaster-intersected-cleared', this.func_cleared);
			}
			else
			{
				this.el.removeEventListener('raycaster-intersected', this.func_intersected);
				this.el.emit("raycaster-intersected-cleared");
				this.el.removeEventListener('raycaster-intersected-cleared', this.func_cleared);
			}
		}
	},

	init: function()
	{
		var el = this.el;
		var data = this.data;
		var update = false;

		el.addEventListener("update_HoverInfoTop", function()
		{
			var hoverInfoTop_infoBox = getDirectChildByClassName(el, "infoBox");
			if (hoverInfoTop_infoBox != null) data.hoverInfoTop = hoverInfoTop_infoBox.innerHTML;
			else data.hoverInfoTop = "";
			update = true;
		});
		el.emit("update_HoverInfoTop");

		var raycastEntityEl = document.getElementById(data.raycastEntity);
		var cursorInfoTop = document.getElementById("cursor_info_top");
		var hovering = false;
		this.func_intersected = function(e)
		{
			var intersection = e.detail.intersection.point;
			raycastEntityEl.setAttribute('gamecursor',
				{
					raycastTarget: e.target.id,
					raycastHit: { x: intersection.x, y: intersection.y, z: intersection.z }
				});
			if (cursorInfoTop.innerHTML == "" || update)
			{
				update = false;
				cursorInfoTop.innerHTML = this.getAttribute("intersectable").hoverInfoTop;
			}
			if (hovering == false) this.emit("hover-start");
			hovering = true;
		};
		this.func_cleared =	function()
		{
			raycastEntityEl.setAttribute('gamecursor',
				{
					raycastTarget: 'none',
					raycastHit: { x: 0, y: 0, z: 0 }
				});
			cursorInfoTop.innerHTML = "";
			if (hovering == true) this.emit("hover-end");
			hovering = false;
		};
	}
});

function getDirectChildByClassName(el, classname)
{
	for (var i = 0; i < el.children.length; i++)
	{
		if (Object.values(el.children[i].classList).includes(classname)) return el.children[i];
	}
	return null;
}