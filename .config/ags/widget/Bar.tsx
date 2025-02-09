import { App, Astal, Gtk, Gdk } from "astal/gtk3"
import {Variable, bind, GLib, timeout} from "astal"
import Tray from "gi://AstalTray"
import Battery from "gi://AstalBattery"
import Apps from "gi://AstalApps"
import {focusedWindow, windows} from "../app";
import Tools from "./Tools";

const time = Variable("").poll(1000, () => GLib.DateTime.new_now_local().format("%H:%M")!)
const date = Variable("").poll(1000*60*30, () => GLib.DateTime.new_now_local().format("%F")!)

function SysTray() {
    const tray = Tray.get_default()
    return <box className="SysTray" >
        {bind(tray, "items").as(items => items.map(item => (
            <menubutton
                tooltipMarkup={bind(item, "tooltipMarkup")}
                usePopover={false}
                actionGroup={bind(item, "actionGroup").as(ag => ["dbusmenu", ag])}
                menuModel={bind(item, "menuModel")}>
                <icon gicon={bind(item, "gicon")} />
            </menubutton>
        )))}
    </box>
}

function BatteryLevel() {
    const bat = Battery.get_default()

    return <box className="Battery"
                visible={bind(bat, "isPresent")}>
        <icon icon={bind(bat, "batteryIconName")} />
        <label label={bind(bat, "percentage").as(p =>
            p < 0.999 ? `${Math.floor(p * 100)}` : ''
        )} />
    </box>
}

function PowerActions() {
    return <box className="md-icon text-xl">
        <button onClicked={"/usr/bin/niri msg action quit"} className={"mx-4"}>
            <label label={"LOGOUT"}></label>
        </button>
        <button onClicked={"~/.config/scripts/sys.sh lock"} className={"mx-4"}>
            <label label={"LOCK"}></label>
        </button>
        <button onClicked={"systemctl suspend"} className={"mx-4"}>
            <label label={"MODE_STANDBY"}></label>
        </button>
        <button onClicked={"systemctl poweroff"} className={"mx-4"}>
            <label label={"POWER_SETTINGS_NEW"}></label>
        </button>
        </box>
}

function Actions() {
    return <box className="md-icon text-lg">
        <button>
            <box>
                <label className={"mx-1"} label={"VOLUME_UP"}></label>
                <label className={"mx-1"} label={"WIFI"}></label>
                <label className={"mx-1"} label={"BLUETOOTH"}></label>
            </box>
        </button>
        </box>
}


function AppButton({ app }: { app: Apps.Application }) {
    return <button
        className="AppButton text-3xl"
        onClicked={() => { app.launch() }}>
            <icon icon={app.iconName} />
    </button>
}

function Time(props: { align: Gtk.Align, onClick: () => void }) {
    return <button onClick={ props.onClick }>
        <box className="Time mx-2" vertical valign={Gtk.Align.CENTER}>
            <label className={"text-base"} halign={props.align} label={time()}/>
            <label className={"text-xs"} halign={props.align} label={date()}></label>
        </box>
    </button>
}

function getFocusedApps() {

}

function ULauncher() {
    return <button
            className="md-icon text-2xl"
            onClicked="ulauncher-toggle"
            halign={Gtk.Align.CENTER}>
            APPS
        </button>
}

function FocusedApp() {
    return <label label={bind(focusedWindow().as((window) => window?.title ?? ""))}/>
}

function OpenApps() {
    const apps = new Apps.Apps();
    timeout(2000, () => {
        console.log(apps.fuzzy_query("webstorm"))
        console.log(windows.get().map(window => window.app_id))
        console.log(windows.get().map(window => apps.fuzzy_query(window.app_id)[0]))
    })
    return <box>
        {windows().as(windows => windows
            .map(window => apps.fuzzy_query(window.app_id)[0])
            .filter(app => app != null)
            .map(app => <icon icon={app.iconName}></icon>)
        )}
    </box>
}


export default function Bar(gdkmonitor: Gdk.Monitor) {
    const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

    const apps = new Apps.Apps();
    let chrome = apps.fuzzy_query("chrome")[0]
    console.log(chrome.name)
    return <window
        className="Bar"
        name={"bar"}
        gdkmonitor={gdkmonitor}
        exclusivity={Astal.Exclusivity.EXCLUSIVE}
        anchor={TOP | LEFT | RIGHT}
        application={App}>
        <centerbox className={"mx-2"}>
            <box hexpand halign={Gtk.Align.START}>
                <ULauncher/>
            </box>
            <box hexpand halign={Gtk.Align.CENTER}>
            </box>
            <box hexpand halign={Gtk.Align.END}>
                <SysTray className="ml-4"/>
                <BatteryLevel/>
                <Time align={Gtk.Align.END} onClick={() => Tools(gdkmonitor)}/>
                {/*<PowerActions />*/}
            </box>
        </centerbox>
    </window>
}

/*
<box hexpand halign={Gtk.Align.START}>
    <Workspaces />
    <FocusedClient />
</box>
<box>
    <Media />
</box>
<box hexpand halign={Gtk.Align.END} >
    <SysTray />
    <Wifi />
    <AudioSlider />
    <BatteryLevel />
    <Time />
</box>
 */
