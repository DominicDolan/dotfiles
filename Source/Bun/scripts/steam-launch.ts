import Bun from "bun"
import { readdir } from "node:fs/promises";

const [bunDir, cwd, cmd, cmdParam] = Bun.argv

const dir = "/home/doghouse/snap/steam/common/.local/share/Steam/steamapps"
const files = await readdir(dir)

const acfFiles = files
    .filter(f => f.endsWith(".acf"))
    .map(f => Bun.file(dir + "/" + f))

const promises = acfFiles.map(f => f.text())
const texts = await Promise.all(promises)

const ids: Array<{name: string, appid: string }> = []
for (const text of texts) {
    const lines = text.split("\n")

    const [appIdLine, nameLine] = lines.filter(l => l.includes("appid") || l.includes("name"))

    const appid = appIdLine.replaceAll("appid", "").replaceAll("\"", "").trim()
    const name = nameLine.replaceAll("name", "").replaceAll("\"", "").trim()

    ids.push({
        appid, name
    })
}
function nameMatches(name: string) {
    return name.toLowerCase().startsWith(cmdParam.toLowerCase())
}
if (cmd === "ls" || cmd == undefined) {
    const matches = ids
        .filter(x => cmdParam == undefined || nameMatches(x.name))
        .map(x => `${x.name} (${x.appid})`)
        .join("\n")
    console.log(matches)
} else if (cmd === "launch") {
    const matches = ids
        .filter(x => nameMatches(x.name))

    if (matches.length === 1) {
        await Bun.$`cage -- steam -applaunch ${matches[0].appid}`
    } else {
        console.log(matches.map(x => x.name).join("\n"))
    }
}
// await Bun.$`steam`
// console.log(ids)



