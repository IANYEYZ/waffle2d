/*
Waffle2D is a minimalist 2D game-making framework based on HTML canvas
*/
export function $(query) { return document.querySelector(query) }  // Helper

function Actor(tags, state) {
    return {tags: tags, state: state} // Placeholder
}
function Query(id2Object) {
    this.with = function (tagList) {
        for (const o of id2Object) {
            flag = false
            for (const i of tagList) {
            }
        }
    }
}

export function World(canvas) {
    id2Object = new Map()
    id = 0
    this.canvas = canvas

    this.spawn() = function ({
        tags, state
    }) {
        id2Object.set(id, Actor(tags, state))
        id += 1
        return id - 1
    }

    this.q = {
    }
}