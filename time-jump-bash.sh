#!/bin/bash

usage() {
    echo "Usage: $0 [-s|--sync] <minutes>"
    echo "  -s, --sync    Disable and re-enable time synchronization"
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
    timedatectl set-ntp $1
}

CURRENT_TIME=$(date +"%Y-%m-%d %H:%M:%S")

$SYNC && toggle_time_sync false

NEW_TIME=$(date -d "$CURRENT_TIME $MINUTES minutes" +"%Y-%m-%d %H:%M:%S")
date -s "$NEW_TIME"
sleep 1
date -s "$CURRENT_TIME"

$SYNC && toggle_time_sync true