AFRAME.registerComponent('enemy',
{
	dependencies: ['possync'],
	schema:
	{
		health: {type: 'number', default: 100.0}
	},
	init: function()
	{
		this.id = this.el.getAttribute('possync').sync_id;
	},
	update: function(oldData)
	{
		// Health
		if (this.data.health != oldData.health && typeof oldData.health != 'undefined')
		{
			if (this.data.health <= 0)
			{
				//console.log("Enemy " + this.id + " killed.");
				this.el.parentNode.removeChild(this.el);
			}
			/*else
			{
				console.log("Enemy " + this.id + " has " + this.data.health + " health left.");
			}*/
		}
	}
});