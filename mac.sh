#!/bin/bash

usage() {
    echo "Usage: $0 [-s|--sync] <minutes>"
    echo "  -s, --sync    Disable and re-enable auto time sync"
    echo "  <minutes>     Number of minutes to jump"
    exit 0
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

CURRENT_TIME=$(date +"%Y-%m-%d %H:%M:%S")
echo "Current system time: $CURRENT_TIME"

$SYNC && toggle_time_sync off

NEW_TIME=$(date -v +"$MINUTES"M +"%Y-%m-%d %H:%M:%S")
echo "Changing system time by $MINUTES minutes to: $NEW_TIME"

sudo date $(date -v +"$MINUTES"M +"%m%d%H%M%Y")
date_exit_code=$?

sleep 1

echo "Reverting system time to original: $CURRENT_TIME"
sudo date $(date -j -f "%Y-%m-%d %H:%M:%S" "$CURRENT_TIME" +"%m%d%H%M%Y")
revert_exit_code=$?

$SYNC && toggle_time_sync on

if [[ $date_exit_code -ne 0 || $revert_exit_code -ne 0 ]]; then
    echo "Warning: The date command returned an error, but the operation may have succeeded."
    exit 0
else
    exit 0
fi
