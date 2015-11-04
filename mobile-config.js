App.info({
  id: 'org.communecter.meteor.pixelhumain',
  name: 'PixelHumain',
  description: 'Pixel humain photos',
  author: 'thomas',
  email: 'thomas.craipeau@gmail.com',
  version: '0.0.1'
});

App.icons({
  'android_ldpi': 'ressource/android/drawable-ldpi/appicon.png',
  'android_mdpi': 'ressource/android/drawable-mdpi/appicon.png',
  'android_hdpi': 'ressource/android/drawable-hdpi/appicon.png',
  'android_xhdpi': 'ressource/android/drawable-xhdpi/appicon.png'
});

App.launchScreens({
  'android_ldpi_portrait': 'ressource/android/drawable-ldpi/background.9.png',
  'android_ldpi_landscape': 'ressource/android/drawable-ldpi/background.9.png',
  'android_mdpi_portrait': 'ressource/android/drawable-mdpi/background.9.png',
  'android_mdpi_landscape': 'ressource/android/drawable-mdpi/background.9.png',
  'android_hdpi_portrait': 'ressource/android/drawable-hdpi/background.9.png',
  'android_hdpi_landscape': 'ressource/android/drawable-hdpi/background.9.png',
  'android_xhdpi_portrait': 'ressource/android/drawable-xhdpi/background.9.png',
  'android_xhdpi_landscape': 'ressource/android/drawable-xhdpi/background.9.png'
});

App.setPreference('StatusBarOverlaysWebView', 'false');
App.setPreference('StatusBarBackgroundColor', '#000000');

App.accessRule('*');
