import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.breakery.pos',
  appName: 'Breakery POS',
  webDir: 'dist',
  
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#8B4513',
      showSpinner: false
    },
    Keyboard: {
      resize: 'ionic',
      resizeOnFullScreen: true
    }
  },
  
  android: {
    buildOptions: {
      keystorePath: 'release-key.keystore',
      keystoreAlias: 'breakery'
    }
  },
  
  ios: {
    scheme: 'Breakery POS'
  }
};

export default config;