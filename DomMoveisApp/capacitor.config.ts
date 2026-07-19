import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dommoveis.app',
  appName: 'DomMoveisApp',
  webDir: 'dist',
  server: {
    // App servido em http://localhost dentro do WebView, permitindo chamadas
    // cleartext à API local (http://localhost:3000) via `adb reverse`.
    androidScheme: 'http',
    cleartext: true,
  },
};

export default config;