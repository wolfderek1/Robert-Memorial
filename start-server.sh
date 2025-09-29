#!/bin/bash

echo "Starting Robert Memorial Server..."
echo "The server will save messages to: /workspaces/Robert-Memorial/data/messages.json"
echo "Access the website at: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

cd /workspaces/Robert-Memorial
node server.js