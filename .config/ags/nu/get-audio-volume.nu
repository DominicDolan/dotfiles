
def main [] {
  let current_device = pactl info | grep "Default Sink" | split row ":" | get 1 | str trim
  if $current_device != null {
    let device_info = pactl list sinks | split row  "Sink #" | where ($it | str contains $current_device) | first
    let volume_line = $device_info | grep Volume | split row "\n" | where not ($it | str contains "Base Volume") | first | str trim

    echo $volume_line

    let volumes = $volume_line 
      | split row "," 
      | each {|$it| $it | str trim } 
      | split row "/"
      | where ($it | str contains "%")
      | each {|$it| $it | str trim | str replace "%" "" | into int }

    let avg = $volumes | math avg
    echo $avg
  }
}
