# Authentication Setup Guide

This document outlines the setup required for Apple and Google Sign-In functionality.

## Features Implemented

✅ **Email/Password Authentication**
- Sign In with email and password validation
- Sign Up with full registration form
- Forgot Password flow with email reset

✅ **Social Authentication**
- Google Sign-In on both SignInScreen and SignUpScreen
- Apple Sign-In on both SignInScreen and SignUpScreen
- Loading states and error handling
- Seamless integration with auth context

## Google Sign-In Setup

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Create OAuth 2.0 credentials:
   - For **Android**: Create credentials for "Android" app type
   - For **iOS**: Create credentials for "iOS" app type
   - For **Web**: Create credentials for "Web" app type

### 2. Update Configuration

Replace the placeholder Google Client ID in both screens:

**Files to update:**
- `src/screens/authentication/SignInScreen.tsx` (line ~51)
- `src/screens/authentication/SignUpScreen.tsx` (line ~51)

Change:
```javascript
webClientId: '1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com'
```

To your actual Google Client ID from Google Cloud Console.

### 3. Android Configuration

The `@react-native-google-signin/google-signin` config plugin is already added to `app.json`.

For production builds, you may need to add your SHA1 fingerprint to Google Cloud Console:
```bash
# Generate SHA1 fingerprint
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

### 4. iOS Configuration

Apple Sign-In is handled by `expo-apple-authentication` which is built into Expo.

For production:
1. Enable "Sign In with Apple" capability in your iOS app
2. Configure your Apple Developer account
3. Create an App ID with Sign In with Apple capability

## Testing

### Local Testing

1. **Email/Password**: Works immediately with mock authentication
2. **Google Sign-In**: 
   - Android: Test with Google Play Services
   - iOS: Test with valid Google credentials
3. **Apple Sign-In**: 
   - iOS: Test with Apple ID
   - Android: Not available (gracefully handled)

### Production Testing

Before releasing:
1. Test with real Google credentials
2. Test with real Apple ID
3. Ensure tokens are properly stored and managed
4. Test logout/session management

## File Locations

**Auth Screens:**
- `src/screens/authentication/SignInScreen.tsx` - Email + Social login
- `src/screens/authentication/SignUpScreen.tsx` - Email + Social signup
- `src/screens/authentication/ForgotPasswordScreen.tsx` - Password reset
- `src/screens/authentication/index.ts` - Barrel export

**Core Auth:**
- `App.tsx` - Auth context and navigation logic
- `src/theme/ThemeContext.tsx` - Theme management

## Future Enhancements

- [ ] Store user tokens in AsyncStorage
- [ ] Implement refresh token logic
- [ ] Add biometric authentication
- [ ] Implement "Remember Me" functionality
- [ ] Add social login state persistence
- [ ] Implement automatic session renewal
- [ ] Add two-factor authentication

## Troubleshooting

### Google Sign-In Not Working

**Issue**: "Google Play Services not available"
- **Solution**: Ensure Google Play Services are installed on Android device

**Issue**: "webClientId is required"
- **Solution**: Update the webClientId in both SignInScreen and SignUpScreen

### Apple Sign-In Not Working

**Issue**: Only shows on iOS
- **Solution**: This is expected. Apple Sign-In is iOS-only

**Issue**: User data not received
- **Solution**: Ensure proper scopes are requested (FULL_NAME, EMAIL)

### Navigation Issues

**Issue**: Users going back to Onboarding
- **Solution**: Back buttons now properly navigate within auth stack using `navigation.navigate()` instead of `navigation.goBack()`

## Environment Variables

Consider adding these to `.env` or your deployment config:
```
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_IOS_CLIENT_ID=your_google_ios_client_id_here
GOOGLE_ANDROID_CLIENT_ID=your_google_android_client_id_here
```

Then update the config to use environment variables:
```javascript
const webClientId = process.env.GOOGLE_CLIENT_ID;
```

## Security Notes

1. **Never commit real credentials** to version control
2. **Use environment variables** for sensitive data
3. **Validate tokens** on your backend before granting access
4. **Implement token expiration** and refresh logic
5. **Use HTTPS** for all authentication requests
6. **Store tokens securely** using AsyncStorage or Secure Storage

## Support

For issues or questions:
1. Check the Expo documentation: https://docs.expo.dev/
2. Google Sign-In docs: https://react-native-google-signin.github.io/
3. Apple Authentication docs: https://docs.expo.dev/versions/latest/sdk/apple-authentication/
