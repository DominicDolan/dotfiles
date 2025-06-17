

type AudioPort = {
    name: string
    description: string
    type: string
    priority: number,
    availability_group: string
    availability: string
}

export interface AudioDevice {
    type: string
    name: string
    driver: string
    owner_module: string
    volume: {
        "front-left": {
            value: number
            value_percent: string
            db: string
        },
        "front-right": {
            value: number
            value_percent: string
            db: string
        }
    }
    balance: number
    base_volume: {
        value: number
        value_percent: string
        db: string
    }
    properties: {
        "api.acp.auto-port"?: false,
        "api.acp.auto-profile"?: false,
        "api.alsa.card"?: string
        "api.alsa.card.longname"?: string
        "api.alsa.card.name"?: string
        "api.alsa.path"?: string
        "api.alsa.use-acp"?: string
        "api.dbus.ReserveDevice1"?: string
        "device.api"?: string
        "device.bus"?: string
        "device.bus-id"?: string
        "device.bus_path"?: string
        "device.description"?: string
        "device.enum.api"?: string
        "device.icon_name"?: string
        "device.name"?: string
        "device.nick"?: string
        "device.plugged.usec"?: string
        "device.product.id"?: string
        "device.product.name"?: string
        "device.serial"?: string
        "device.subsystem"?: string
        "sysfs.path"?: string
        "device.vendor.id"?: string
        "device.vendor.name"?: string
        "media.class"?: string
        "factory.id"?: string
        "client.id"?: string
        "object.id"?: string
        "object.serial"?: string
        "object.path"?: string
        "alsa.card"?: string
        "alsa.card_name"?: string
        "alsa.long_card_name"?: string
        "alsa.driver_name"?: string
        "alsa.mixer_name"?: string
        "alsa.components"?: string
        "alsa.id"?: string
        "device.string"?: string
        "node.nick"?: string
    },
    ports: AudioPort[]
}
