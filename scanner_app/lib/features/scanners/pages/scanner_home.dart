import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';

import 'camera_preview.dart';

class ScannerHome extends StatefulWidget {
  final Position? position;

  const ScannerHome({super.key, required this.position});

  @override
  ScannerHomeState createState() => ScannerHomeState();
}

class ScannerHomeState extends State<ScannerHome> {
  Future<void> startCameraPreview(int? docType) async {
    await Navigator.of(context).push(
      MaterialPageRoute(builder: (context) => const CameraXPreview()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Inventory Scanner',
          style: TextStyle(color: Colors.white),
        ),
        backgroundColor: Colors.black87, // Use a deep primary color for consistency
      ),
      body: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.qr_code_scanner, // A modern scanner icon
              size: 80,
              color: Colors.deepOrangeAccent, // Icon color
            ),
            SizedBox(height: 20), // Space between icon and text
            Text(
              'Inventory Scanner (Beta)',
              style: TextStyle(
                fontSize: 26, // Larger text size
                fontWeight: FontWeight.bold,
                color: Colors.black87,
                fontFamily: 'Roboto', // Modern font family
                letterSpacing: 1.2, // Slight letter spacing for a clean look
              ),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 10),
            Text(
              'Easily scan and manage your inventory',
              style: TextStyle(
                fontSize: 16,
                color: Colors.grey,
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: const BottomAppBar(
        color: Colors.black12, // Gray background for the bottom bar
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [],
        ),
      ),
      floatingActionButton: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          FloatingActionButton(
            heroTag: 'camera',
            backgroundColor: Colors.deepOrange,
            onPressed: () => startCameraPreview(null),
            child: const Icon(
              Icons.camera,
              color: Colors.white,
            ),
          )
        ],
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
    );
  }

}
