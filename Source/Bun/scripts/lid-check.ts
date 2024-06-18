import Bun from "bun";

const result: string = await Bun.$`cat /proc/acpi/button/lid/LID0/state`.text()

const [_, state] = result.split(":").map(x => x.trim())

if (state === "closed") {
}
    // await Bun.$`niri msg output eDP-1 off`
await Bun.$`echo off`