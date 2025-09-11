#!/bin/bash

# Replace YOUR_GITHUB_USERNAME with your actual GitHub username
GITHUB_USERNAME="YOUR_GITHUB_USERNAME"

git remote add origin https://github.com/$GITHUB_USERNAME/jonas-voice-assistant.git
git branch -M main
git push -u origin main

echo "Done! Now go back to Vercel and use:"
echo "https://github.com/$GITHUB_USERNAME/jonas-voice-assistant"