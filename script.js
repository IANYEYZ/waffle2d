import { $, World } from "./waffle.js";

const app = new World($('#app'))

const obj1 = app.spawn({
    tags: ["pos"],
    state: {
    }
})

console.log(app.q().with(["pos"]).array())