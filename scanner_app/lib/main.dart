import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:location/location.dart' as loc;
import 'package:permission_handler/permission_handler.dart';

import 'features/projects/pages/project_list.dart';
import 'features/scanners/pages/scanner_home.dart';

void main() {
  runApp(const IdScannerApp());
}

class IdScannerApp extends StatelessWidget {
  const IdScannerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Inventory Locator',
      theme: ThemeData.light(),
      home: const MainPage(),
    );
  }
}

class MainPage extends StatefulWidget {
  const MainPage({super.key});

  @override
  MainPageState createState() => MainPageState();
}

class MainPageState extends State<MainPage> {
  Position? _currentPosition;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _initializeAsync();
  }

  Future<void> _initializeAsync() async {
    try {
      Position position = await _determinePosition();
      setState(() {
        _currentPosition = position;
        _isLoading = false;
      });
    } catch (e) {
      await _autoLocationService();
      _initializeAsync();
    }
  }

  Future<Position> _determinePosition() async {
    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      return Future.error('Location services are disabled.');
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        return Future.error('Location permissions are denied');
      }
    }

    if (permission == LocationPermission.deniedForever) {
      return Future.error(
          'Location permissions are permanently denied, we cannot request permissions.');
    }

    return await Geolocator.getCurrentPosition();
  }

  Future<bool> _autoLocationService() async {
    loc.Location location = loc.Location();

    // Check if location service is enabled
    bool serviceEnabled = await location.serviceEnabled();
    if (!serviceEnabled) {
      // Request the user to enable the location service
      serviceEnabled = await location.requestService();
    }

    return serviceEnabled;
  }

  Widget circularProgress() {
    return const Scaffold(
      body: Center(child: CircularProgressIndicator()),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return circularProgress();
    }

    return MaterialApp(
      home: FutureBuilder<Map<Permission, PermissionStatus>>(
        future: [
          Permission.camera,
          Permission.locationWhenInUse,
        ].request(),
        builder: (context, snapshot) {
          if (snapshot.hasData) {
            final cameraPermission = snapshot.data![Permission.camera];
            final locationPermission = snapshot.data![Permission.locationWhenInUse];

            if (cameraPermission == PermissionStatus.granted &&
                locationPermission == PermissionStatus.granted) {

              // return ScannerHome(position: _currentPosition);
              return const ProjectListScreen();
            }

            if (cameraPermission == PermissionStatus.permanentlyDenied ||
                locationPermission == PermissionStatus.permanentlyDenied) {
              // The user opted to never again see the permission request dialog for this
              // app. The only way to change the permission's status now is to let the
              // user manually enable it in the system settings.
              openAppSettings();
            }
          }

          return circularProgress();
        },
      ),
    );

  }

}
