
def parse_property [property_string] {
    let parts = $property_string 
                | str replace -r '\s*=\s*' "====" 
                | split row "===="


    if ($parts | length) >= 2 {
        let part_value = $parts.1 | str replace --all '"' ''
        {($parts.0): $part_value}
    } else if ($parts | length) == 1 {
        {($parts.0): "" }
    } else {
        {}
    }
}

def parse_properties [properties_string] {
    let property_strings = $properties_string
        | str trim
        | str replace --all "\t" "" 
        | str replace --all "    " "" 
        | str replace --all -r '(\n|^)[{}]\n?' ""
        | lines 
        | filter {|x| not ($x | str starts-with "#") }

    if ($property_strings | length) > 0 {
        $property_strings 
            | each {|line| parse_property $line }
            | reduce {|it, acc| $acc | merge $it }
    } else {
        {}
    }
}

def parse_info [info] {
     let parts = $info.item | str replace ":" "::::" | split row "::::"
     if $info.index == 0 {
        {Type: $parts.0}
     } else if ($parts | length) >= 2 {
        if ($parts.1 | describe) == "string" and ($parts.1 | lines | length) > 1 {
            let property = parse_properties $parts.1 
            {($parts.0): $property}
        } else {
            {($parts.0): ($parts.1 | str trim)}
        }
     } else {
        {($parts.0): ""}
     }
}

def parse_device [device_lines] {
    $device_lines 
        | enumerate 
        | each {|info| parse_info $info } 
        | reduce {|it, acc| $acc | merge $it}
}

export def main [arg?] {
    let list = if $arg == null { 
        pactl list
    } else { 
        pactl list $arg
    }

    $list
        | str replace --all -r '\n(\w)' "\n000$1"
        | split row -r '\n000' 
        | each {|device| $device 
            | str replace --all -r '\n\t(\w)' "\n111$1" 
            | split row "\n111"
            | parse_device $in
        }
        | default '' Name
}

