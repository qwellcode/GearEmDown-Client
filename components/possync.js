var posSync_objects = {};

AFRAME.registerComponent('possync',
{
    schema:
    {
        sync_id: {type: 'string'},
        interpolation: {type: 'number', default: 0.2}
    },
    init: function()
    {
        // Initialisierung
        this.interpolation_phase = 0;
        this.newPos = this.oldPos = this.el.getAttribute("position");
    },
    update: function()
    {
        // Validierung
        if (this.data.sync_id <= 0) throw "ERROR PosSync: Invalid id \"" + this.data.sync_id + "\"";
        if (typeof posSync_objects[this.data.sync_id] !== 'undefined')
        {
            console.log(posSync_objects[this.data.sync_id]);
            throw "ERROR PosSync: Double initialization \"" + this.data.sync_id + "\"";
        }

        // Initialisierung
        posSync_objects[this.data.sync_id] = this;
    },
    tick: function()
    {
        if (this.newPos == null) return;
        this.interpolation_phase += this.data.interpolation;
        if (this.interpolation_phase > 1) this.interpolation_phase = 1;
        this.el.setAttribute('position',
            {
                x: ((this.newPos.x - this.oldPos.x) * this.interpolation_phase + this.oldPos.x),
                y: ((this.newPos.y - this.oldPos.y) * this.interpolation_phase + this.oldPos.y),
                z: ((this.newPos.z - this.oldPos.z) * this.interpolation_phase + this.oldPos.z)
            });
        if (this.interpolation_phase >= 1)
        {
            this.newPos = null;
            this.interpolation_phase = 0;
        }
    },
    move: function(x, y, z, rotX, rotY, rotZ)
    {
        this.oldPos = this.el.getAttribute("position");
        this.newPos = {x: x, y: y, z: z};
        this.interpolation_phase = 0;
        this.el.setAttribute("rotation", { x: rotX, y: rotY, z: rotZ });
    },
    remove: function()
    {
        delete posSync_objects[this.data.sync_id];
    }
});

function getPosSyncObj(id)
{
    if (typeof posSync_objects[id] === 'undefined')
    {
        //console.warn("Could not find PosSyncObj with ID: " + id);
        return null;
    }
    else return posSync_objects[id];
}