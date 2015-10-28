App.info({
  id: 'org.communecter.meteor.pixelhumain',
  name: 'PixelHumain',
  description: 'Pixel humain photos',
  author: 'thomas',
  email: 'thomas.craipeau@gmail.com',
  version: '0.0.1'
});

App.icons({
  'android_mdpi': 'ressource/res/mipmap-mdpi/ic_launcher.png',
  'android_hdpi': 'ressource/res/mipmap-hdpi/ic_launcher.png',
  'android_xhdpi': 'ressource/res/mipmap-xhdpi/ic_launcher.png'
});

App.launchScreens({
  // Android
  'android_ldpi_portrait': 'ressource/res/res-long-port-ldpi/default.png',
  'android_ldpi_landscape': 'ressource/res/res-long-land-ldpi/default.png',
  'android_mdpi_portrait': 'ressource/res/res-long-port-mdpi/default.png',
  'android_mdpi_landscape': 'ressource/res/res-long-land-mdpi/default.png',
  'android_hdpi_portrait': 'ressource/res/res-long-port-hdpi/default.png',
  'android_hdpi_landscape': 'ressource/res/res-long-land-hdpi/default.png',
  'android_xhdpi_portrait': 'ressource/res/res-long-port-xhdpi/default.png',
  'android_xhdpi_landscape': 'ressource/res/res-long-land-xhdpi/default.png'
});

App.setPreference('StatusBarOverlaysWebView', 'false');
App.setPreference('StatusBarBackgroundColor', '#ffffff');

App.accessRule('*');
