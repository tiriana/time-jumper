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

CURRENT_TIME=$(date +"%Y-%m-%d %H:%M:%S")

$SYNC && toggle_time_sync off

# Change time by adding minutes
NEW_TIME=$(date -v +"$MINUTES"M +"%Y-%m-%d %H:%M:%S")
sudo date -f "%Y-%m-%d %H:%M:%S" "$NEW_TIME"
sleep 1

# Revert time back
sudo date -f "%Y-%m-%d %H:%M:%S" "$CURRENT_TIME"

$SYNC && toggle_time_sync on
