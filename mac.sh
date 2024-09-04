#!/bin/bash

usage() {
    echo "Usage: $0 [-s|--sync] <minutes>"
    echo "  -s, --sync    Disable and re-enable auto time sync"
    echo "  <minutes>     Number of minutes to jump"
    exit 1
}

SYNC=false
MINUTES=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -s|--sync) SYNC=true; shift ;;
        -h|--help) usage ;;
        *) [[ -z "$MINUTES" ]] && MINUTES=$1 || usage; shift ;;
    esac
done

[[ -z "$MINUTES" ]] || ! [[ "$MINUTES" =~ ^[0-9]+$ ]] && usage

[ "$EUID" -ne 0 ] && echo "Run as root or with sudo" && exit 1

toggle_time_sync() {
    sudo systemsetup -setusingnetworktime $1
}

# Get current time and format
CURRENT_TIME=$(date +"%Y-%m-%d %H:%M:%S")
DATE_FORMAT=$(date +"%x %X")  # This will get system date/time format
echo "Current time format: $DATE_FORMAT"

$SYNC && toggle_time_sync off

# Calculate new time by adding minutes
NEW_TIME=$(date -v +"$MINUTES"M +"$DATE_FORMAT")
echo "Changing system time by $MINUTES minutes to: $NEW_TIME"

# Apply the new time
sudo date -f "$DATE_FORMAT" "$NEW_TIME"

sleep 1

# Revert to the original time using system's format
