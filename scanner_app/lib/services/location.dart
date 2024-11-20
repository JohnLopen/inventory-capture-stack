import 'dart:io';

import 'package:device_info_plus/device_info_plus.dart';
import 'package:flutter/material.dart';

import 'package:geolocator/geolocator.dart';
import 'package:permission_handler/permission_handler.dart';

Future<String?> getDeviceId() async {
  DeviceInfoPlugin deviceInfoPlugin = DeviceInfoPlugin();
  if (Platform.isIOS) {
    IosDeviceInfo deviceInfo = await deviceInfoPlugin.iosInfo;
    return deviceInfo.identifierForVendor;
  }
  else {
    AndroidDeviceInfo deviceInfo = await deviceInfoPlugin.androidInfo;
    return deviceInfo.id;
  }
}

Future<Position> getCurrentLocation(BuildContext context) async {
  bool serviceEnabled;
  LocationPermission permission;

  // Test if location services are enabled.
  serviceEnabled = await Geolocator.isLocationServiceEnabled();
  if (!serviceEnabled && context.mounted) {
    // Show a dialog asking the user to enable location services.
    bool? dialogResult = await showDialog<bool>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Enable Location Services'),
          content: const Text('Location services are disabled. Please enable them in the device settings.'),
          actions: <Widget>[
            TextButton(
              child: const Text('Cancel'),
              onPressed: () {
                Navigator.of(context).pop(false);
              },
            ),
            TextButton(
              child: const Text('Settings'),
              onPressed: () {
                openAppSettings();
                Navigator.of(context).pop(true);
              },
            ),
          ],
        );
      },
    );

    if (dialogResult == true) {
      // Wait for user to return from settings
      await Future.delayed(const Duration(seconds: 5));
      if(context.mounted) {
        return await getCurrentLocation(context); // Recursively call to retry getting location
      }
    } else {
      return Future.error('Location services are disabled.');
    }
  }

  permission = await Geolocator.checkPermission();
  if (permission == LocationPermission.denied) {
    permission = await Geolocator.requestPermission();
    if (permission == LocationPermission.denied) {
      return Future.error('Location permissions are denied');
    }
  }

  if (permission == LocationPermission.deniedForever) {
    return Future.error('Location permissions are permanently denied, we cannot request permissions.');
  }

  try {
    Position position = await Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.high,
      forceAndroidLocationManager: true,
      timeLimit: const Duration(seconds: 30),
    );

    return position;
  } catch (e) {
    return Future.error('Failed to get location: $e');
  }
}
