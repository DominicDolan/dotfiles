import { App, Gtk, Gdk } from "astal/gtk3"
import style from "./style.scss"
import Bar from "./widget/Bar"
import {NiriEvent} from "./widget/NiriEvent";
import { execAsync } from "astal/process"
import {NiriWindow} from "./widget/NiriWindow";
import {Variable} from "astal";

export const windows = Variable([] as Array<NiriWindow>)
export const windowFocusedId = Variable(-1)
export const focusedWindow = Variable.derive([windows, windowFocusedId], (windows, windowFocusedId) => {
    return windows.find((window) => window.id === windowFocusedId) ?? windows.find((window) => window.is_focused)
})

App.start({
    css: style,
    main() {
        const bars = new Map<Gdk.Monitor, Gtk.Widget>()

        // initialize
        for (const gdkmonitor of App.get_monitors()) {
            bars.set(gdkmonitor, Bar(gdkmonitor))
        }

        App.connect("monitor-added", (_, gdkmonitor) => {
            bars.set(gdkmonitor, Bar(gdkmonitor))
        })

        App.connect("monitor-removed", (_, gdkmonitor) => {
            bars.get(gdkmonitor)?.destroy()
            bars.delete(gdkmonitor)
        })

        loadNiriWindows()
    },
    requestHandler(request: string, res: (response: any) => void) {
        const args = request.split(/\s/)

        switch (args[0].toLowerCase()) {
            case "event":
                handleNiriEvent(args[1])
        }

        res("Hello from astal")
    }
})

function handleNiriEvent(eventString: string) {
    const event = JSON.parse(eventString) as NiriEvent
    if (event.WindowFocusChanged != null) {
        windowFocusedId.set(event.WindowFocusChanged.id)
    }

    if (event.WindowOpenedOrChanged != null || event.WindowClosed != null) {
        loadNiriWindows()
    }
}

function loadNiriWindows() {
    execAsync(["niri", "msg", "--json", "windows"])
        .then((out) => {
            const windowsArray = JSON.parse(out) as Array<NiriWindow>;
            windows.set(windowsArray)
        })
        .catch((err) => console.error(err))
}
