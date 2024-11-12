import 'dart:developer';
import 'dart:io';
import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:id_scanner/data/services/inventory/capture_service.dart';
import 'package:path_provider/path_provider.dart';

class CameraXPreview extends StatefulWidget {
  final int boxId;

  const CameraXPreview({super.key, required this.boxId});

  @override
  CameraExampleState createState() => CameraExampleState();
}

class CameraExampleState extends State<CameraXPreview> {
  CaptureService captureService = CaptureService();
  CameraController? _cameraController;
  List<CameraDescription>? cameras;

  @override
  void initState() {
    super.initState();
    _initializeCamera();
  }

  Future<void> _initializeCamera() async {
    // Get the list of available cameras on the device
    cameras = await availableCameras();

    // Select the first camera in the list (typically the back camera)
    if (cameras != null && cameras!.isNotEmpty) {
      _cameraController = CameraController(
        cameras![0],
        ResolutionPreset.high,
      );

      // Initialize the camera controller
      await _cameraController?.initialize();
      setState(() {});
    }
  }

  Future<void> _capturePhoto() async {
    try {
      if (_cameraController != null && _cameraController!.value.isInitialized) {
        // Capture the photo and save it to a temporary directory
        final directory = await getTemporaryDirectory();
        final imagePath = '${directory.path}/${DateTime.now().millisecondsSinceEpoch}.jpg';
        final image = await _cameraController!.takePicture();

        // Save the captured image to the file path
        await image.saveTo(imagePath);

        // Show a dialog to preview the image
        _showImagePreviewDialog(imagePath);
      }
    } catch (e) {
      log("Error capturing photo: $e");
    }
  }

  void _showImagePreviewDialog(String imagePath) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return Dialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20.0),
          ),
          child: Container(
            width: MediaQuery.of(context).size.width * 0.8,
            padding: const EdgeInsets.all(8.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  "Capture Preview",
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 16),
                ClipRRect(
                  borderRadius: BorderRadius.circular(5),
                  child: Image.file(
                    File(imagePath),
                    height: MediaQuery.of(context).size.height * 0.6,
                    fit: BoxFit.cover,
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    IconButton(
                      icon: const Icon(Icons.cloud_upload, color: Colors.green,),
                      onPressed: () {
                        captureService.upload(widget.boxId, imagePath);
                        Navigator.of(context).pop();
                        // ScaffoldMessenger.of(context).showSnackBar(
                        //   const SnackBar(content: Text("Image will be uploaded in the background")),
                        // );
                        // Add your upload function here
                      },
                    ),
                    IconButton(
                      icon: const Icon(Icons.cancel, color: Colors.red),
                      onPressed: () {
                        Navigator.of(context).pop();
                      },
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  void dispose() {
    _cameraController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_cameraController == null || !_cameraController!.value.isInitialized) {
      return const Center(child: CircularProgressIndicator());
    }
    return Scaffold(
      appBar: AppBar(title: const Text('Inventory Capture')),
      body: Column(
        children: [
          Expanded(
            child: Stack(
              children: [
                // The camera preview should take up all available space in the Expanded area
                Positioned.fill(
                  child: CameraPreview(_cameraController!),
                ),
                // Button positioned at the bottom-center
                Positioned(
                  bottom: 20, // Adjust bottom padding if needed
                  left: 0,
                  right: 0,
                  child: Center(
                    child: FloatingActionButton(
                      heroTag: 'camera',
                      backgroundColor: Colors.blueAccent,
                      onPressed: _capturePhoto,
                      child: const Icon(
                        Icons.camera,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
