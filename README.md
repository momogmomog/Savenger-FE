To build for web usage:
ng build --configuration production --aot 

The output is not the standard angular dist folder, but in "www"


To build for android usage:
ionic capacitor build android

Then open the project with Android Studio and build the app again (the java/cordova portion) for your phone
