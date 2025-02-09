import { App, Astal, Gtk, Gdk } from "astal/gtk3"
import {Variable, bind} from "astal"
import Network from "gi://AstalNetwork"

function hide() {
    App.get_windows()
        .filter(w => w.name.includes("tools"))
        .forEach(w => w.destroy())
}

function Wifi() {
    const network = Network.get_default()
    const wifi = bind(network, "wifi")

    const name = network.wifi.accessPoints[0].get_ssid()
    console.log(network.wifi.accessPoints.length)

    return <box visible={wifi.as(Boolean)}>
        {wifi.as(wifi => wifi && (
            <icon
                tooltipText={bind(wifi, "ssid").as(String)}
                className="Wifi"
                icon={bind(wifi, "iconName")}
            />
        ))}
        <label>{name}</label>
    </box>

}

function ButtonBar(props: { icon: string, label: string, className?: string }) {
    return <button onClick={hide} className={props.className}>
        <box className="ButtonBar">
            <box widthRequest={36} heightRequest={36} className={"md-icon"}>
                <label>{props.icon}</label>
            </box>
            <label className={"ml-4"}>{props.label}</label>
        </box>
    </button>
}

export default function Tools(gdkmonitor: Gdk.Monitor) {
    const { RIGHT, TOP } = Astal.WindowAnchor

    const width = Variable(1280)
    const height = Variable(1080)

    return <window
        name={"tools." + gdkmonitor.workarea.x + "." + gdkmonitor.workarea.y}
        className={"Tools"}
        anchor={RIGHT | TOP}
        exclusivity={Astal.Exclusivity.IGNORE}
        application={App}
        onShow={(self) => {
            width.set(self.get_current_monitor().workarea.width)
            height.set(self.get_current_monitor().workarea.height)
        }}
        onKeyPressEvent={function (self, event: Gdk.Event) {
            if (event.get_keyval()[1] === Gdk.KEY_Escape)
                self.hide()
        }}>
        <box heightRequest={height(h => h/4)} expand vertical>
            <box hexpand={true} vertical className={"Card mt-12 mb-4 mx-4"}>
                <box className="ButtonBar md-icon text-xl">
                    <button onClicked={"/usr/bin/niri msg action quit"} className={"mx-3"}>
                        <label label={"LOGOUT"}></label>
                    </button>
                    <button onClicked={"~/.config/scripts/sys.sh lock"} className={"mx-3"}>
                        <label label={"LOCK"}></label>
                    </button>
                    <button onClicked={"systemctl reboot"} className={"mx-3"}>
                        <label label={"RESTART_ALT"}></label>
                    </button>
                    <button onClicked={"systemctl suspend"} className={"mx-3"}>
                        <label label={"MODE_STANDBY"}></label>
                    </button>
                    <button onClicked={"systemctl poweroff"} className={"mx-3"}>
                        <label label={"POWER_SETTINGS_NEW"}></label>
                    </button>
                </box>
                <box className="Card ControlPanel mt-4" vertical>
                    <ButtonBar icon={"WIFI"} label={"VM6089549_EXT"}/>
                    <ButtonBar className={"mt-4"} icon={"BLUETOOTH"} label={"Bluetooth"}/>
                    <ButtonBar className={"mt-4"} icon={"BATTERY_6_BAR"} label={"90% Balanced"}/>
                    <box className={"ExtraSettings mt-4"}>
                        <button>
                            <box>
                                <label className={"md-icon"}>SETTINGS</label>
                                <label>Settings</label>
                            </box>
                        </button>
                    </box>
                </box>
            </box>
        </box>
    </window>
}
