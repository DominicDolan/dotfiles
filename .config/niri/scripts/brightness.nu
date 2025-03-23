

def main [type: string] {
  if $type == "up" {
    brightnessctl --device=intel_backlight set +10%
  } else if $type == "down" {
    brightnessctl --device=intel_backlight set 10%-
  }
}
