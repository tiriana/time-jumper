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
sudo date "$NEW_TIME"

sleep 1

echo "Reverting system time to original: $CURRENT_TIME"
sudo date "$CURRENT_TIME"

$SYNC && toggle_time_sync on
