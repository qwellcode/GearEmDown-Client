// To avoid recalculation at every mouse movement tick
var PI_2 = Math.PI / 2;
var radToDeg = THREE.Math.radToDeg;

/**
 * look-controls. Update entity pose, factoring mouse, and WebVR API data.
 */
AFRAME.registerComponent('custom-look-controls',
{
    dependencies: ['position', 'rotation'],

    schema:
    {
        enabled: {default: true},
        hmdEnabled: {default: true},
        reverseMouseDrag: {default: false},
        standing: {default: true}
    },

    init: function()
    {
        var sceneEl = this.el.sceneEl;
        var el = this.el;

        this.previousHMDPosition = new THREE.Vector3();
        this.hmdQuaternion = new THREE.Quaternion();
        this.hmdEuler = new THREE.Euler();
        this.position = new THREE.Vector3();
        this.rotation = {};

        this.setupMouseControls();
        this.setupHMDControls();
        this.bindMethods();

        // Reset previous HMD position when we exit VR.
        sceneEl.addEventListener('exit-vr', this.onExitVR);

        // Initialize cursor lock
        sceneEl.requestPointerLock = sceneEl.requestPointerLock || sceneEl.mozRequestPointerLock;
        document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock;

        // Toggle pointer lock
        document.addEventListener('keyup', function(event)
        {
            if (event.which == 9) // TAB
            {
                if (document.pointerLockElement == null && document.mozPointerLockElement  == null) sceneEl.requestPointerLock();
                else document.exitPointerLock();
            }
        });

        // Hook pointer lock state change events for different browsers
        document.addEventListener('pointerlockchange', function (e)
        {
            if (document.pointerLockElement != null || document.mozPointerLockElement  != null)
            {
                el.play();
                // TODO
            }
            else
            {
                el.pause();
            }
        }, false);
        /*document.addEventListener('mozpointerlockchange', function (e) {

        }, false);*/
    },

    update: function (oldData)
    {
        var data = this.data;

        // Disable grab cursor classes if no longer enabled.
        if (data.enabled !== oldData.enabled)
        {
            this.updateGrabCursor(data.enabled);
        }

        // Reset pitch and yaw if disabling HMD.
        if (oldData && !data.hmdEnabled && !oldData.hmdEnabled)
        {
            this.pitchObject.rotation.set(0, 0, 0);
            this.yawObject.rotation.set(0, 0, 0);
        }
    },

    tick: function (t)
    {
        var data = this.data;
        if (!data.enabled) return;
        this.controls.standing = data.standing;
        this.controls.userHeight = this.getUserHeight();
        this.controls.update();
        this.updateOrientation();
        this.updatePosition();
    },

    /**
     * Return user height to use for standing poses, where a device doesn't provide an offset.
     */
    getUserHeight: function()
    {
        var el = this.el;
        var userHeight = el.hasAttribute('camera') && el.getAttribute('camera').userHeight || DEFAULT_CAMERA_HEIGHT;
        return userHeight;
    },

    play: function()
    {
        this.addEventListeners();
    },

    pause: function()
    {
        this.removeEventListeners();
    },

    remove: function()
    {
        this.removeEventListeners();
    },

    bindMethods: function()
    {
        this.onMouseMove = AFRAME.utils.bind(this.onMouseMove, this);
        this.onExitVR = AFRAME.utils.bind(this.onExitVR, this);
    },

    /**
     * Set up states and Object3Ds needed to store rotation data.
     */
    setupMouseControls: function()
    {
        this.pitchObject = new THREE.Object3D();
        this.yawObject = new THREE.Object3D();
        this.yawObject.position.y = 10;
        this.yawObject.add(this.pitchObject);
    },

    /**
     * Set up VR controls that will copy data to the dolly.
     */
    setupHMDControls: function()
    {
        this.dolly = new THREE.Object3D();
        this.euler = new THREE.Euler();
        this.controls = new THREE.VRControls(this.dolly);
        this.controls.userHeight = 0.0;
    },

    /**
     * Add mouse event listeners to canvas.
     */
    addEventListeners: function()
    {
        var sceneEl = this.el.sceneEl;
        var canvasEl = sceneEl.canvas;

        // Wait for canvas to load.
        if (!canvasEl)
        {
            sceneEl.addEventListener('render-target-loaded', AFRAME.utils.bind(this.addEventListeners, this));
            return;
        }

        // Mouse events.
        window.addEventListener('mousemove', this.onMouseMove, false);
    },

    /**
     * Remove mouse event listeners from canvas.
     */
    removeEventListeners: function()
    {
        var sceneEl = this.el.sceneEl;
        var canvasEl = sceneEl && sceneEl.canvas;

        if (!canvasEl) { return; }

        // Mouse events.
        canvasEl.removeEventListener('mousemove', this.onMouseMove);
    },

    /**
     * Update orientation for mobile, mouse drag, and headset.
     * Mouse-drag only enabled if HMD is not active.
     */
    updateOrientation: function()
    {
        var currentRotation;
        var deltaRotation;
        var hmdEuler = this.hmdEuler;
        var hmdQuaternion = this.hmdQuaternion;
        var pitchObject = this.pitchObject;
        var yawObject = this.yawObject;
        var sceneEl = this.el.sceneEl;
        var rotation = this.rotation;

        // Calculate HMD quaternion.
        hmdQuaternion = hmdQuaternion.copy(this.dolly.quaternion);
        hmdEuler.setFromQuaternion(hmdQuaternion, 'YXZ');

        if (sceneEl.isMobile)
        {
            // On mobile, do camera rotation with touch events and sensors.
            rotation.x = radToDeg(hmdEuler.x) + radToDeg(pitchObject.rotation.x);
            rotation.y = radToDeg(hmdEuler.y) + radToDeg(yawObject.rotation.y);
            rotation.z = radToDeg(hmdEuler.z);
        }
        else if (!sceneEl.is('vr-mode') || isNullVector(hmdEuler) || !this.data.hmdEnabled)
        {
            // Mouse drag if WebVR not active (not connected, no incoming sensor data).
            currentRotation = this.el.getAttribute('rotation');
            deltaRotation = this.calculateDeltaRotation();
            if (this.data.reverseMouseDrag)
            {
                rotation.x = currentRotation.x - deltaRotation.x;
                rotation.y = currentRotation.y - deltaRotation.y;
                rotation.z = currentRotation.z;
            }
            else
            {
                rotation.x = currentRotation.x + deltaRotation.x;
                rotation.y = currentRotation.y + deltaRotation.y;
                rotation.z = currentRotation.z;
            }
        }
        else
        {
            // Mouse rotation ignored with an active headset. Use headset rotation.
            rotation.x = radToDeg(hmdEuler.x);
            rotation.y = radToDeg(hmdEuler.y);
            rotation.z = radToDeg(hmdEuler.z);
        }

        this.el.setAttribute('rotation', rotation);
    },

    /**
     * Calculate delta rotation for mouse-drag and touch-drag.
     */
    calculateDeltaRotation: function()
    {
        var currentRotationX = radToDeg(this.pitchObject.rotation.x);
        var currentRotationY = radToDeg(this.yawObject.rotation.y);
        var deltaRotation;
        deltaRotation = {
            x: currentRotationX - (this.previousRotationX || 0),
            y: currentRotationY - (this.previousRotationY || 0)
        };
        // Store current rotation for next tick.
        this.previousRotationX = currentRotationX;
        this.previousRotationY = currentRotationY;
        return deltaRotation;
    },

    /**
     * Handle positional tracking.
     */
    updatePosition: function()
    {
        var el = this.el;
        var currentHMDPosition;
        var currentPosition;
        var position = this.position;
        var previousHMDPosition = this.previousHMDPosition;
        var sceneEl = this.el.sceneEl;

        if (!sceneEl.is('vr-mode')) return;

        // Calculate change in position.
        currentHMDPosition = this.calculateHMDPosition();

        currentPosition = el.getAttribute('position');

        position.copy(currentPosition).sub(previousHMDPosition).add(currentHMDPosition);
        el.setAttribute('position', position);
        previousHMDPosition.copy(currentHMDPosition);
    },

    /**
     * Get headset position from VRControls.
     */
    calculateHMDPosition: (function()
    {
        var position = new THREE.Vector3();
        return function() {
            this.dolly.updateMatrix();
            position.setFromMatrixPosition(this.dolly.matrix);
            return position;
        };
    })(),

    /**
     * Translate mouse drag into rotation.
     *
     * Dragging up and down rotates the camera around the X-axis (yaw).
     * Dragging left and right rotates the camera around the Y-axis (pitch).
     */
    onMouseMove: function (event)
    {
        var pitchObject = this.pitchObject;
        var yawObject = this.yawObject;

        // Not enabled.
        if (!this.data.enabled) return;

        // Calculate rotation.
        yawObject.rotation.y -= event.movementX * 0.002;
        pitchObject.rotation.x -= event.movementY * 0.002;
        pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, pitchObject.rotation.x));
    },

    onExitVR: function()
    {
        this.previousHMDPosition.set(0, 0, 0);
    },

    /**
     * Toggle the feature of showing/hiding the grab cursor.
     */
    updateGrabCursor: function (enabled)
    {
        var sceneEl = this.el.sceneEl;

        function enableGrabCursor() { sceneEl.canvas.classList.add('a-grab-cursor'); }
        function disableGrabCursor() { sceneEl.canvas.classList.remove('a-grab-cursor'); }

        if (!sceneEl.canvas)
        {
            if (enabled) sceneEl.addEventListener('render-target-loaded', enableGrabCursor);
            else sceneEl.addEventListener('render-target-loaded', disableGrabCursor);
            return;
        }

        if (enabled)
        {
            enableGrabCursor();
            return;
        }
        disableGrabCursor();
    }
});

function isNullVector (vector)
{
    return vector.x === 0 && vector.y === 0 && vector.z === 0;
}