import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.thebreakery.pos',
  appName: 'The Breakery POS',
  webDir: 'dist',

  // Server configuration for development
  server: {
    // For development, you can use live reload
    // url: 'http://192.168.x.x:3000',
    cleartext: true, // Allow HTTP connections (needed for local Supabase dev)
  },

  // Android specific configuration
  android: {
    allowMixedContent: true, // Allow HTTP and HTTPS
    captureInput: true, // Better input handling for POS
    webContentsDebuggingEnabled: true, // Enable debugging in dev
  },

  // iOS specific configuration
  ios: {
    contentInset: 'automatic', // Handle safe areas automatically
    allowsLinkPreview: false, // Disable link previews for POS
    scrollEnabled: true,
    webContentsDebuggingEnabled: true, // Enable Safari debugging in dev
  },

  // Plugin configurations
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#1a1a2e', // Dark theme background
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      iosSpinnerStyle: 'large',
      showSpinner: true,
      spinnerColor: '#BA90A2', // Brand color
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#1a1a2e',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
    App: {
      // Deep linking configuration
      // url: 'thebreakery://',
    },
  },
};

export default config;
