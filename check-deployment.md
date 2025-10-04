# Check Your Deployment Status

Your app appears to be deployed on **Vercel** (not Render) at:
https://jonas-ai.vercel.app

## To Check If Your API Keys Are Set:

1. **Visit the debug endpoint:**
   https://jonas-ai.vercel.app/api/debug-env

   This will show you which API keys are configured in your deployment.

2. **If you need to add/update API keys on Vercel:**
   - Go to https://vercel.com/dashboard
   - Find your `jonas-voice-assistant` project
   - Go to Settings → Environment Variables
   - Add these keys:
     - `OPENAI_API_KEY`
     - `OPENROUTER_API_KEY`
     - `ELEVENLABS_API_KEY`
     - `ELEVENLABS_VOICE_ID`
     - `NEXT_PUBLIC_API_URL`
     - `NEXT_PUBLIC_API_KEY`

3. **If you have a Render deployment too:**
   - Check https://dashboard.render.com
   - Look for environment variables there
   - You might have a different app deployed on Render

## Test Your Live App:

Visit: https://jonas-ai.vercel.app

The text chat should work if your API keys are properly set in Vercel.

## Local Development:

If you want to test locally with the same keys:
1. Copy the keys from Vercel/Render dashboard
2. Add them to `.env.local` file
3. Run `npm run dev`