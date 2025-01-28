
def main [] {
  let url = wl-paste

  if ($url | str starts-with "http") {
    mpv $url
  }

}
