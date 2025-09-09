/*
Waffle2D is a minimalist 2D game-making framework based on HTML canvas
*/
export function $(query) { return document.querySelector(query) }  // Helper

function Actor(tags, state) {
    this.tags = tags
    this.state = state
    this.with = function (tagList) {
        for (const i of tagList) {
            let flag = false
            for (const tg of this.tags) {
                if (tg == i) {
                    flag = true
                }
            }
            if (!flag) return false
        }
        return true
    }
}
function Query(objList) {
    this.with = function (tagList) {
        let nList = []
        for (const o of objList) {
            if (o.with(tagList)) {
                nList.push(o)
            }
        }
        return new Query(nList)
    }
    this.array = function () {
        return objList
    }
}
export function Input(canvas, { worldFromScreen = null } = {}) {
    const codeDown = new Set();
    const actionBindings = new Map();
    let axes = new Map();

    let lastActionsDown = new Set();
    let actionsDown = new Set();
    let actionsPressed = new Set();
    this.mouse = {
        screen: { x: 0, y: 0 },
        world: { x: 0, y: 0 },
        buttons: new Set(), // "MouseLeft" | "MouseMiddle" | "MouseRight"
    };
    this.bind = function (action, codes) {
        actionBindings.set(action, new Set(codes));
        recomputeActionsDown();
    };
    this.bindAdd = function (action, codes) {
        const s = actionBindings.get(action) ?? new Set();
        for (const c of codes) s.add(c);
        actionBindings.set(action, s);
        recomputeActionsDown();
    };
    this.unbind = function (action) {
        actionBindings.delete(action);
        actionsDown.delete(action);
        actionsPressed.delete(action);
    };
    this.addAxis = function (name, negativeActions, positiveActions) {
        axes.set(name, {
            neg: new Set(negativeActions),
            pos: new Set(positiveActions),
        });
    };

    this.down = function (action) {
        return actionsDown.has(action);
    };
    this.pressed = function (action) {
        return actionsPressed.has(action);
    };


    this.sample = function () {
        actionsPressed.clear();
        for (const a of actionsDown) {
            if (!lastActionsDown.has(a)) actionsPressed.add(a);
        }
        lastActionsDown = new Set(actionsDown);
    };

    this.axis = function (name) {
        const ax = axes.get(name);
        if (!ax) return 0;
        const neg = anyActionDown(ax.neg);
        const pos = anyActionDown(ax.pos);
        if (neg && !pos) return -1;
        if (pos && !neg) return +1;
        return 0;
    };


    this.setWorldFromScreen = function (fn) {
        worldFromScreen = typeof fn === 'function' ? fn : null;
        updateWorldFromScreen();
    };
    this.destroy = function () {
        detach();
    };

    function anyActionDown(actionSet) {
        for (const a of actionSet) if (actionsDown.has(a)) return true;
        return false;
    }
    function recomputeActionsDown() {
        actionsDown.clear();
        for (const [action, codes] of actionBindings) {
            for (const c of codes) {
                if (codeDown.has(c)) {
                    actionsDown.add(action);
                    break;
                }
            }
        }
    }
    function updateMouseScreen(e) {
        const r = canvas.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        thisObj.mouse.screen.x = x;
        thisObj.mouse.screen.y = y;
        updateWorldFromScreen();
    }
    function updateWorldFromScreen() {
        if (worldFromScreen) {
            const p = worldFromScreen(thisObj.mouse.screen);
            if (p && typeof p.x === 'number' && typeof p.y === 'number') {
                thisObj.mouse.world.x = p.x;
                thisObj.mouse.world.y = p.y;
            }
        } else {
            thisObj.mouse.world.x = thisObj.mouse.screen.x;
            thisObj.mouse.world.y = thisObj.mouse.screen.y;
        }
    }
    function mouseButtonCode(button) {
        return button === 0 ? "MouseLeft"
            : button === 1 ? "MouseMiddle"
            : button === 2 ? "MouseRight"
            : `Mouse${button}`;
    }
    function clearAllStates() {
        codeDown.clear();
        thisObj.mouse.buttons.clear();
        recomputeActionsDown();
        actionsPressed.clear();
        lastActionsDown.clear();
    }

    const thisObj = this;

    function onKeyDown(e) {
        if (document.activeElement !== canvas) return;
        if (e.repeat) return;
        codeDown.add(e.code);
        recomputeActionsDown();
    }
    function onKeyUp(e) {
        if (document.activeElement !== canvas) return;
        codeDown.delete(e.code);
        recomputeActionsDown();
    }
    function onMouseDown(e) {
        canvas.focus();
        const code = mouseButtonCode(e.button);
        thisObj.mouse.buttons.add(code);
        codeDown.add(code);
        recomputeActionsDown();
    }
    function onMouseUp(e) {
        const code = mouseButtonCode(e.button);
        thisObj.mouse.buttons.delete(code);
        codeDown.delete(code);
        recomputeActionsDown();
    }
    function onMouseMove(e) {
        updateMouseScreen.call(thisObj, e);
    }
    function onContextMenu(e) {
        e.preventDefault();
    }
    function onCanvasBlur() {
        clearAllStates();
    }
    function onWindowBlur() {
        clearAllStates();
    }

    function attach() {
        canvas.addEventListener("keydown", onKeyDown);
        canvas.addEventListener("keyup", onKeyUp);
        canvas.addEventListener("blur", onCanvasBlur);
        canvas.addEventListener("mousedown", onMouseDown);
        canvas.addEventListener("mouseup", onMouseUp);
        canvas.addEventListener("mousemove", onMouseMove);
        canvas.addEventListener("contextmenu", onContextMenu);
        window.addEventListener("blur", onWindowBlur);
    }
    function detach() {
        canvas.removeEventListener("keydown", onKeyDown);
        canvas.removeEventListener("keyup", onKeyUp);
        canvas.removeEventListener("blur", onCanvasBlur);
        canvas.removeEventListener("mousedown", onMouseDown);
        canvas.removeEventListener("mouseup", onMouseUp);
        canvas.removeEventListener("mousemove", onMouseMove);
        canvas.removeEventListener("contextmenu", onContextMenu);
        window.removeEventListener("blur", onWindowBlur);
    }

    attach();
}


export function World(canvas, fps = 60) {
    let id2Object = new Map()
    let id = 0
    let systems = []
    const dt = 1000.0 / fps

    this.canvas = canvas
    this.input = new Input(canvas)

    this.spawn = function ({
        tags, state
    }) {
        id2Object.set(id, new Actor(tags, state))
        id += 1
        return id - 1
    }

    this.q = function () {
        return new Query([ ...id2Object.values() ])
    }

    this.system = function (fn, priority) {
        systems.push([fn, priority])
        systems.sort((a, b) => a[1] - b[1])
    }

    this.flush = function () {
        for (const i of systems) {
            i[0](dt, { q: this.q(), input: this.input })
        }
        this.input.sample()
    }

    this.start = function () {
        setInterval(this.flush.bind(this), dt)
    }
}