import { $, World } from "./waffle.js";

const app = new World($('#app'), 60)

const obj1 = app.spawn({
    tags: ["pos"],
    state: {
    }
})

console.log(app.q().with(["pos"]).array())
app.input.bind("Jump", ["Space", "MouseLeft"])
app.system((dt, { q, input, painter }) => {
    painter.rect(["fill", "stroke"], 0, 0, 100, 100)
    if (input.pressed("Jump")) {
        console.log("Jump!", input.mouse.world)
    }
}, 0)

app.start()