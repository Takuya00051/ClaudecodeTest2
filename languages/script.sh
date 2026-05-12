#!/bin/bash
echo "=== System Info ==="
echo "Date: $(date)"
echo "User: $(whoami)"
echo "Dir:  $(pwd)"
echo "Disk: $(df -h / | tail -1 | awk '{print $5}')"
