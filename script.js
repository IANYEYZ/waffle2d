import { $, World } from "./waffle.js";

const PrimeColor = "#6eb8a8"
const SecondColor = "#2a584f"
const bgColor = "#d9d9d9"

const app = new World($('#app'), 60)

const obj1 = app.spawn({
    tags: ["Transform"],
    state: {
        Transform: {
            x: 0, y: 0
        },
        Body: {
            w: 100, h: 100
        }
    }
})

app.input.bind("Jump", ["Space", "MouseLeft"])
app.system((dt, { q, input, painter }) => {
    painter.pen.fill = bgColor
    painter.rect(["fill"], 0, 0, 1000, 800)
}, -999)
app.system((dt, { q, input, painter }) => {
    painter.image($("#board8x8"), 250, 200, 500, 500)
    if (input.pressed("Jump")) {
        console.log("Jump!", input.mouse.world)
        for (const a of q.with(["Transform"]).array()) {
            console.log(a.inside(input.mouse.world))
        }
    }
}, 1)

app.start()