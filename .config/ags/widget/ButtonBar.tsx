import {bind, Variable} from "astal";

export function ButtonBar(props: { icon: string, label: Variable<string | undefined>, className?: string, toolPanel: () => any }) {

    const expanded = Variable(false)

    function onClick() {
        expanded.set(!expanded.get())
    }

    // const labelVar = typeof props.label === "string" ? Variable(props.label) : props.label
    return <box vertical className={"" + (props.className ?? "")}>
        <button onClick={onClick}>
            <box className="ButtonBar">
                <box widthRequest={36} heightRequest={36} className={"md-icon"}>
                    <label>{props.icon}</label>
                </box>
                <label className={"ml-4"}>{props.label()}</label>
            </box>
        </button>
        {bind(expanded).as((ex) => ex ? props.toolPanel() : <></>)}
    </box>
}
