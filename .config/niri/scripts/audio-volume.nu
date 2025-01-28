
def main [type: string] {
  if $type == "up" {
    wpctl set-volume @DEFAULT_AUDIO_SINK@ 0.1+
  } else if $type == "down" {
    wpctl set-volume @DEFAULT_AUDIO_SINK@ 0.1-
  } else if $type == "mute" {
    wpctl set-mute @DEFAULT_AUDIO_SINK@ toggle
  }
  gBar audio
}
