

const appUrl =
  process.env.CAPACITOR_SERVER_URL || "http://localhost:3000";

const config = {
  appId: "tr.com.zil.app",
  appName: "ZiL",
  webDir: "public",
  server: {
    url: appUrl,
    cleartext: appUrl.startsWith("http://"),
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: "#0F4C5C",
      showSpinner: false,
    },
    StatusBar: {
      style: "LIGHT",
      backgroundColor: "#0F4C5C",
    },
  },
};

export default config;
