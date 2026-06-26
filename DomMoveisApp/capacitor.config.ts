import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dommoveis.app',
  appName: 'DomMoveisApp',
  webDir: 'dist',
  server: {
    url: 'http://192.168.56.1:5173', // ← substitua pelo seu IP
    cleartext: true
  }
};

export default config;