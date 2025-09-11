#!/bin/bash

# Replace with your GitHub username
GITHUB_USER="jonasquant"

echo "Pushing to GitHub..."
git remote remove origin 2>/dev/null
git remote add origin https://github.com/$GITHUB_USER/jonas-voice-assistant.git
git branch -M main
git add .
git commit -m "Jonas AI Voice Assistant" 2>/dev/null
git push -u origin main

echo "Done! Your repo is at: https://github.com/$GITHUB_USER/jonas-voice-assistant"