import 'dart:developer';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:id_scanner/data/services/inventory/capture_service.dart';
import '../../../core/data/base_api.dart';
import '../part.dart';
import '../../captures/capture.dart';
import 'camera_preview.dart';

class ScannerHome extends StatefulWidget {
  final Part part;
  final VoidCallback onNextPart;

  const ScannerHome({super.key, required this.part, required this.onNextPart});

  @override
  ScannerHomeState createState() => ScannerHomeState();
}

class ScannerHomeState extends State<ScannerHome> {
  late List<Capture> captures = []; // Holds the boxes for the current project
  late int captureCount;
  
  // Method to fetch the boxes and their captures
  void _getCaptures() {
    CaptureService().get(params: {'part_id': widget.part.id.toString()}).then((response) {
      if (kDebugMode) {
        print('API Response: $response');  // Debug the response from the API
      }
      setState(() {
        captureCount = response['count'];
        if ((response['captures'] as List).isNotEmpty) {
          captures = (response['captures'] as List)
              .map((captureData) => Capture.fromJson(captureData))  // Parse the box data
              .toList();
        }
      });
    }).catchError((error) {
      log('Error fetching captures: $error');
    });
  }
  
  Future<void> startCameraPreview() async {
    await Navigator.of(context).push(
      MaterialPageRoute(builder: (context) => CameraXPreview(
          partId: widget.part.id!,
      onNextPart: widget.onNextPart,)),
    );
    _getCaptures();
  }

  @override
  void initState() {
    _getCaptures();
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.blueAccent,  // Matching the blue accent color from the login page
        title: Text(
          widget.part.label,
          style: const TextStyle(color: Colors.white),  // White text for the AppBar
        )
      ),
      body: captures.isNotEmpty
          ? GridView.builder(
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 3,  // Number of columns in the grid
          crossAxisSpacing: 4.0,  // Space between columns
          mainAxisSpacing: 4.0,  // Space between rows
          childAspectRatio: 1.0,  // Aspect ratio of the grid items
        ),
        itemCount: captures.length,
        itemBuilder: (context, index) {
          final capture = captures[index];
          final imagePath = '$apiBaseUrl/uploads/${capture.filename}';  // Construct the image path

          return GestureDetector(
            onTap: () {
              // Handle image tap if needed, like viewing full-size image
            },
            child: Card(
              elevation: 4.0,  // Slight elevation for better visibility
              child: Padding(
                padding: const EdgeInsets.all(4.0),
                child: Image.network(
                  imagePath,  // Load image from network
                  fit: BoxFit.cover,  // Ensure the image covers the thumbnail area
                  errorBuilder: (context, error, stackTrace) {
                    return const Icon(
                      Icons.broken_image,  // Material icon for image error
                      size: 50,  // Icon size
                      color: Colors.grey,  // Icon color
                    );
                  },
                ),
              ),
            ),
          );
        },
      )
          :  Center(child: GestureDetector(
        child: const Text('Nothing captured for this part.', style: TextStyle(color: Colors.blueAccent)),
        onTap: () => startCameraPreview(),
      ) ),
      floatingActionButton: Padding(
        padding: const EdgeInsets.only(bottom: 40.0), // Adjust this to elevate the button
        child: FloatingActionButton(
          heroTag: 'camera',
          backgroundColor: Colors.blueAccent,  // Match the color of the AppBar
          onPressed: () => startCameraPreview(),
          child: const Icon(
            Icons.camera,
            color: Colors.white,  // White icon for better contrast
          ),
        ),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked, // Adjust location if needed
    );
  }
}
