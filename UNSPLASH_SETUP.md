# Unsplash API Key Setup

## How to Get Your Unsplash API Key

1. **Sign up for Unsplash** (if you don't have an account):
   - Go to https://unsplash.com/join
   - Create a free account

2. **Create a New Application**:
   - Go to https://unsplash.com/oauth/applications
   - Click "New Application"
   - Fill in the application details:
     - **Application name**: Forks App (or any name you prefer)
     - **Description**: Food image fetching for restaurant menu items
   - Accept the API Use and Access Policy
   - Click "Create application"

3. **Get Your Access Key**:
   - After creating the application, you'll see your **Access Key**
   - Copy this key (it looks like: `abc123def456ghi789...`)

## How to Add the API Key to Your App

### Option 1: Environment Variable (Recommended)

1. Create a `.env` file in the `Forks` directory (if it doesn't exist)
2. Add the following line:
   ```env
   EXPO_PUBLIC_UNSPLASH_ACCESS_KEY=your_access_key_here
   ```
3. Replace `your_access_key_here` with your actual Unsplash Access Key
4. Restart your Expo development server

### Option 2: Direct Configuration (Not Recommended for Production)

You can temporarily add the key directly in `Forks/constants/api.ts`:
```typescript
export const UNSPLASH_ACCESS_KEY = 'your_access_key_here';
```

**⚠️ Warning**: Never commit API keys directly in code. Always use environment variables.

## How It Works

- **With API Key**: Uses the official Unsplash Search API for better, more relevant food images
- **Without API Key**: Falls back to Unsplash Source API (deprecated but still works, may have rate limits)

## Rate Limits

- **With API Key**: 50 requests per hour (free tier)
- **Without API Key**: Limited and less reliable

## Security Notes

- The API key is prefixed with `EXPO_PUBLIC_` which means it will be included in the client bundle
- This is safe for Unsplash API keys as they are designed to be used client-side
- Never share your API key publicly or commit it to version control
- Add `.env` to your `.gitignore` file (it should already be there)

