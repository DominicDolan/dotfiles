def main [] {
  let max_retries = 3
  mut fail_count = 0

  while $fail_count < $max_retries {

    "Starting sevice\n" | save --append /home/doghouse/.config/niri/scripts/ags_run_log.txt

    let result = do {
        try {
            (bash -c $'source ($env.HOME)/.nvm/nvm.sh && ($env.HOME)/.local/bin/ags run -d ($env.HOME)/.config/ags4 --gtk4 2>&1') | complete
        } catch {|err|
            # Return the error message and exit code
            { stdout: $err, exit_code: 1 }
        }
    }

    if $result.exit_code != 0 {
      let msg = $'Command failed with error ($result.stdout)'
      print $msg
      echo $msg | save --append /home/doghouse/.config/niri/scripts/ags_run_log.txt
      $fail_count = $fail_count + 1
    } else {
      break
    }
  }

}
