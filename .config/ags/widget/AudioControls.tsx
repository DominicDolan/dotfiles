import {DefaultAudioDevice, useAudioDeviceRepository} from "../service/AudioDeviceRepository";
import {bind, Variable} from "astal";
import {Gtk} from "astal/gtk3";
import {AudioDevice} from "../models/AudioDevice";

function AudioDeviceButton(props: { device: AudioDevice, isDefault: boolean, onClick: (device: AudioDevice) => void }) {

    const icon = (function() {
        const properties = props.device.properties

        if (properties["device.bus"] === "pci") {
            if (properties["node.nick"]?.includes("HDMI") || properties["node.nick"]?.includes("DisplayPort")) {
                return "GOOGLE_HOME_DEVICES"
            }
            return "SPEAKER"
        }

        return "MEDIA_OUTPUT"
    })()

    return <button className={props.isDefault ? "active" : ""} onClick={() => props.onClick(props.device)}>
        <box>
            <label className={"md-icon"} label={icon}/>
            <label label={props.device.properties["node.nick"]} />
        </box>
    </button>
}

export function AudioControls(props: {onClose: () => void}) {
    const {
        loadUsableSinks,
        loadedAudioDevices,
        getDefaultAudioDevice,
        setDefaultAudioDevice,
        toggleMute,
        isMuted,
        setDefaultAudioDeviceToMostUsed,
    } = useAudioDeviceRepository()

    const defaultDevice = Variable<DefaultAudioDevice | null>(null)
    getDefaultAudioDevice().then(device => {
        defaultDevice.set(device);
    })

    loadUsableSinks().catch(() => {
        console.error("Error loading audio devices")
    })

    function isDefaultAudioDevice(device: AudioDevice) {
        return defaultDevice.get()?.device.name === device.name
    }

    const defaultDeviceVolume = Variable.derive([defaultDevice], (value) => {
        const leftString = value?.device.volume["front-left"].value_percent ?? "0%"
        const rightString = value?.device.volume["front-left"].value_percent ?? "0%"

        const left = parseInt(leftString.replace("%", ""))
        const right = parseInt(rightString.replace("%", ""))

        return Math.max(left/100.0, right/100.0)
    })


    const expanded = Variable(false)

    function onMediaClick() {
        expanded.set(!expanded.get())
    }

    function onAudioDeviceClicked(device: AudioDevice) {
        setDefaultAudioDevice(device.name).then(() => {
            props.onClose()
        })
    }

    const audioIcon = Variable.derive([isMuted], (value) => {
        return value ? "VOLUME_OFF" : "VOLUME_UP"
    })

    async function onRecentDeviceClicked() {
        await setDefaultAudioDeviceToMostUsed()
        props.onClose()
    }

    return <box className={"AudioControls"} vertical>
        <box>
            <button className={"md-icon"} onClick={toggleMute}>
                <label label={audioIcon()}></label>
            </button>
            <levelbar valign={Gtk.Align.CENTER} expand value={defaultDeviceVolume()} />
            <button className={"md-icon"} onClick={onMediaClick}>
                <label label={"MEDIA_OUTPUT"}></label>
            </button>
            <button className={"md-icon"} onClick={onRecentDeviceClicked}>
                <label label={"cached"}></label>
            </button>
        </box>
        {bind(expanded).as((ex) => ex ? <box vertical>
            {loadedAudioDevices.get().map(device => {
                return <AudioDeviceButton device={device} isDefault={isDefaultAudioDevice(device)} onClick={onAudioDeviceClicked}/>
            })}
        </box> : <></>)}
    </box>
}
