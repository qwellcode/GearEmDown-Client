AFRAME.registerComponent("towerradius",
{
    schema:
    {
        radius: { type: 'number', default: 0.01 },
        thickness: { type: 'number', default: 0.07 },
        offsetY: { type: 'number', default: 0.5},
        scaleFactor: { type: 'number', default: 1},
        visible: { type: 'boolean', default: false }
    },
    init: function()
    {
        // Create ring
        var ring = document.createElement('a-entity');
        ring.setAttribute("geometry", { primitive: "ring", segmentsTheta: 64, radiusInner: 0.09, radiusOuter: 0.1 });
        ring.setAttribute("material", { color: "yellow" });
        ring.setAttribute("position", { x: 0, y: this.data.offsetY, z: 0 });
        ring.setAttribute("rotation", { x: -90, y: 0, z: 0 });
        ring.setAttribute("visible", this.data.visible);
        this.el.appendChild(ring);
        this.ring = ring;
    },
    update: function(oldData)
    {
        if (this.data.radius != oldData.radius || this.data.thickness != oldData.thickness)
        {
            this.ring.setAttribute("geometry", { radiusInner: this.data.radius - this.data.thickness, radiusOuter: this.data.radius });
        }
        if (this.data.offsetY != oldData.offsetY)
        {
            // TODO
        }
        if (this.data.scaleFactor != oldData.scaleFactor)
        {
            this.ring.setAttribute("scale", { x: this.data.scaleFactor, y: this.data.scaleFactor, z: 1 });
        }
        if (this.data.visible != oldData.visible)
        {
            this.ring.setAttribute("visible", this.data.visible);
        }
    }
});