import {Variable} from "astal";

export function ProgressBar({ value }: { value: Variable<number> }) {


    return (
        <box className="OSD">
            <icon icon={iconName()} />
            <levelbar valign={Gtk.Align.CENTER} widthRequest={100} value={value()} />
            <label label={value(v => `${Math.floor(v * 100)}%`)} />
        </box>
    )
}
