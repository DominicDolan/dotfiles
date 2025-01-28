
def main [app_id: string, exec_command?: string] {
  let val = (niri msg --json windows) | from json

  let list = ($val | filter {|x| $x.app_id == $app_id})

  if ($list | length) > 0 {
    let window_id = $list | first | get id
    niri msg action focus-window --id $window_id
  } else {
    exec ($exec_command | default $app_id)
  }

}
