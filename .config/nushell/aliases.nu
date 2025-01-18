alias restart-audio = systemctl --user restart pipewire.service

alias niri-gBar = nu --execute `niri msg --json outputs | from json | each {values} | filter {|x| $x.current_mode != null } | each {|x| gBar bar $x.name }`

