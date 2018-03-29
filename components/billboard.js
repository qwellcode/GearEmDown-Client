AFRAME.registerComponent('billboard', 
{
	schema:{
		target: { type: 'string' },
		yOffset: { type: 'number' }
	},

	tick: function()
	{
		var data = this.data;
		var el = this.el;
		var camRot = document.querySelector(data.target).getAttribute('rotation');

		el.setAttribute('rotation', {x: camRot.x, y: camRot.y + data.yOffset, z: camRot.z});
	}
});