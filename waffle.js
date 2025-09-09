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

export function World(canvas) {
    let id2Object = new Map()
    let id = 0
    this.canvas = canvas

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
}