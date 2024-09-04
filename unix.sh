#!/bin/bash

usage() {
    echo "Usage: $0 [-s|--sync] <minutes>"
    echo "  -s, --sync    Disable and re-enable auto time synchronization"
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

if [ "$EUID" -ne 0 ]; then
    echo "Error: This script requires root or sudo privileges to change the system time."
    exit 1
fi

toggle_time_sync() {
    timedatectl set-ntp $1
}

CURRENT_TIME=$(date +"%Y-%m-%d %H:%M:%S")
echo "Current system time: $CURRENT_TIME"

if [ "$SYNC" = true ]; then
    echo "Disabling time sync..."
    toggle_time_sync false
fi

NEW_TIME=$(date -d "$CURRENT_TIME $MINUTES minutes" +"%Y-%m-%d %H:%M:%S")
echo "Changing system time by $MINUTES minutes to: $NEW_TIME"
date -s "$NEW_TIME" || { echo "Error: Failed to set system time."; exit 1; }

sleep 1

echo "Reverting system time to original: $CURRENT_TIME"
date -s "$CURRENT_TIME" || { echo "Error: Failed to revert system time."; exit 1; }

if [ "$SYNC" = true ]; then
    echo "Re-enabling time sync..."
    toggle_time_sync true
fi

echo "Script completed successfully."
exit 0
