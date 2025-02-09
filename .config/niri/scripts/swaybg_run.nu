
def main [image: string] {

  let result = do {
      try {
          (bash -c $'/usr/bin/swaybg -m fill -i ($image) 2>&1') | complete
      } catch {|err|
          # Return the error message and exit code
          { stdout: $err, exit_code: 1 }
      }
  }

  if $result.exit_code != 0 {
    let msg = $'Command failed with error ($result.stdout)'
    print $msg
    echo $msg | save --append /home/doghouse/.config/niri/scripts/swaybg_run_log.txt
  } else {
    break
  }
}
