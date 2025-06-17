import {Variable} from "astal";
import {execAsync} from "astal/process";
import {AudioDevice} from "../models/AudioDevice";
import {UsedAudioDevice} from "../models/UsedAudioDevice";

export type DefaultAudioDevice = {
    volume: string
    mute: boolean
    device: AudioDevice
}

export type AudioDeviceType =
    "modules"
    | "sinks"
    | "sources"
    | "sink-inputs"
    | "source-outputs"
    | "clients"
    | "samples"
    | "cards"
    | "message-handlers"

type UsedDevicesFileContent = {
    version: number
    devices: UsedAudioDevice[]
}

export function useAudioDeviceRepository() {
    async function createPactlCommandOld(commandArgs?: AudioDeviceType, pipedInput: string = "") {
        const commandResult = await execAsync(`nu --commands "use '~/.config/ags/nu/pactl_parse.nu'; pactl_parse ${commandArgs ?? ""} | ${pipedInput} | to json"`)
        return JSON.parse(commandResult) as AudioDevice[]
    }

    const loadedAudioDevices = Variable([] as Array<AudioDevice>)
    const loadedUsedAudioDevices = Variable(null as Array<UsedAudioDevice> | null)

    async function pactlListCommand(commandArgs?: AudioDeviceType) {
        const deviceJson = await execAsync(`pactl --format=json list ${commandArgs ?? ""}`)
        const devices = JSON.parse(deviceJson) as AudioDevice[]

        const usedDevices = loadedUsedAudioDevices.get() ?? await loadUsedAudioDevices().catch(() => [])

        const sortedDevices = [] as AudioDevice[]
        for (const usedDevice of usedDevices) {
            const deviceIndex = devices.findIndex(d => d.name === usedDevice.name)

            if (deviceIndex == -1) {
                continue
            }

            const device = devices[deviceIndex]
            devices.splice(deviceIndex, 1)

            sortedDevices.push(device)
        }

        sortedDevices.push(...devices)

        loadedAudioDevices.set(sortedDevices)
        return sortedDevices
    }

    async function loadAllDevices() {
        return pactlListCommand()
    }

    async function loadSources() {
        return pactlListCommand("sources")
    }

    async function loadSinks() {
        return pactlListCommand("sinks")
    }

    async function loadUsableSinks() {
        const devices = await pactlListCommand("sinks")//createPactlCommand("sinks", "filter {|device| ($device | get Driver) == \"PipeWire\"}")
        return devices
            .filter(d => d.driver === "PipeWire")
            .filter(d => d.ports.some(port => port.availability === "available" || port.availability === "unknown"))
    }

    async function loadMuteState() {
        const muteString = await execAsync("pactl get-sink-mute @DEFAULT_SINK@")
        isMuted.set(muteString.includes("yes"))
        return isMuted.get()
    }

    async function getDefaultAudioDevice(): Promise<DefaultAudioDevice> {
        const [defaultDeviceName, volume, mute] = await Promise.all([
            execAsync("pactl get-default-sink"),
            execAsync("pactl get-sink-volume @DEFAULT_SINK@"),
            loadMuteState()
        ])

        if (loadedAudioDevices.get().length === 0) {
            await loadUsableSinks()
        }

        const defaultDevice = loadedAudioDevices.get().find(d => d.name === defaultDeviceName)

        if (defaultDevice == null) {
            throw new Error(`Unable to load default device ${defaultDeviceName}`)
        }

        return {
            volume,
            mute,
            device: defaultDevice
        }
    }

    const isMuted = Variable(false)
    async function toggleMute() {
        await execAsync("pactl set-sink-mute @DEFAULT_SINK@ toggle")
        await loadMuteState()
    }

    async function setDefaultAudioDevice(deviceName: string) {
        const usedDevices = loadedUsedAudioDevices.get() ?? []

        const newDevice = usedDevices.find(d => d.name === deviceName)
        if (newDevice == null) {
            usedDevices.push({
                name: deviceName,
                usages: 1,
                lastUsedDate: new Date().toISOString()
            })
        } else {
            newDevice.usages++
        }

        loadedUsedAudioDevices.set(usedDevices)

        await Promise.all([
            saveUsedDevices(),
            execAsync(`pactl set-default-sink ${deviceName}`)
        ])
    }

    async function loadUsedAudioDevices() {
        let devicesJson: string = "not found"
        let fileContent: UsedDevicesFileContent = { version: -1, devices: []}
        try {
            devicesJson = await execAsync("bash -c 'cat ~/.config/ags/audio_devices.json'")
        } catch (e) {
            console.warn("Error reading audio_devices.json", e)
        }

        if (devicesJson === "not found") {
            loadedUsedAudioDevices.set(fileContent.devices)
            return fileContent.devices
        }

        try {
            fileContent = (JSON.parse(devicesJson) ?? []) as UsedDevicesFileContent
        } catch (e) {
            console.warn("Something went wrong parsing JSON", e)
        }

        const sortedDevices = fileContent.devices.sort((a, b) => a.usages - b.usages)

        loadedUsedAudioDevices.set(sortedDevices)

        return sortedDevices
    }

    async function loadUsedAudioDevicesLazy() {
        const devices = loadedUsedAudioDevices.get()
        if (devices == null) {
            return await loadUsedAudioDevices()
        }

        return devices
    }

    async function saveUsedDevices() {
        const contents: UsedDevicesFileContent = {
            version: 1,
            devices: loadedUsedAudioDevices.get() ?? []
        }

        const json = JSON.stringify(contents)

        await execAsync(`bash -c 'cat > audio_devices.json <<EOF\n${json}\nEOF'`)
    }

    async function setDefaultAudioDeviceToMostUsed() {
        const [defaultAudioDeviceName, usedDevices] = await Promise.all([
            execAsync("pactl get-default-sink"),
            loadUsedAudioDevicesLazy()
        ])

        const mostUsed = usedDevices
            .filter(d => d.name !== defaultAudioDeviceName)
            .reduce((max, current) => {
            return (current.usages > max.usages ? current : max);
        }, usedDevices[0])

        await setDefaultAudioDevice(mostUsed.name)
    }

    return {
        loadedAudioDevices,
        loadAllDevices,
        loadSources,
        loadSinks,
        loadUsableSinks,
        getDefaultAudioDevice,
        setDefaultAudioDevice,
        setDefaultAudioDeviceToMostUsed,
        toggleMute,
        isMuted
    }
}
