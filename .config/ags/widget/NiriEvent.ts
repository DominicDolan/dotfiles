
export type NiriEvent = {
    WindowFocusChanged?: { id: number }
    WindowClosed?: any
    WindowOpenedOrChanged?: any
    WorkspacesChanged?: any
    WorkspaceActivated?: any
    WorkspaceActiveWindowChanged?: any
    WindowsChanged?: any
    KeyboardLayoutsChanged?: any
    KeyboardLayoutSwitched?: any
}
