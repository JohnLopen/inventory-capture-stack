import 'dart:developer';
import 'dart:io';
import 'package:camera/camera.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:id_scanner/data/services/inventory/capture_service.dart';
import 'package:path_provider/path_provider.dart';

import '../part.dart';

class CameraXPreview extends StatefulWidget {
  final Part part;
  final VoidCallback onNextPart;

  const CameraXPreview({super.key, required this.part, required this.onNextPart});

  @override
  CameraExampleState createState() => CameraExampleState();
}

class CameraExampleState extends State<CameraXPreview> {
  CaptureService captureService = CaptureService();
  CameraController? _cameraController;
  List<CameraDescription>? cameras;
  late int captureCount = 0;

  // Method to fetch the boxes and their captures
  void _getCaptures() {
    CaptureService().get(params: {'part_id': widget.part.id.toString()}).then((response) {
      setState(() {
        captureCount = response['count'];
      });
    }).catchError((error) {
      log('Error fetching captures: $error');
    });
  }

  @override
  void initState() {
    super.initState();
    _getCaptures();
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
            width: MediaQuery.of(context).size.width * 0.95,
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
                    height: MediaQuery.of(context).size.height * 0.65,
                    fit: BoxFit.cover,
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    TextButton(
                        onPressed: () {
                          captureService.upload(widget.part.id, imagePath);
                          _getCaptures();
                          Navigator.of(context).pop();
                        },
                        child: const Text('Save & Add More')),
                    TextButton(
                        onPressed: () {
                          captureService.upload(widget.part.id, imagePath);
                          Navigator.of(context).pop();
                          widget.onNextPart();
                        },
                        child: const Text('Next Part')),
                    TextButton(
                        onPressed: () => Navigator.of(context).pop(),
                        child: const Text('Cancel')),
                  ],
                )
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
      appBar: AppBar(title: Text('${widget.part.label}: ${captureCount == 0 ? 'LABEL' : 'SUPPLEMENTAL (${captureCount + 1})'}')),
      body: Column(
        children: [
          Expanded(
            child: Stack(
              children: [
                // The camera preview should take up all available space in the Expanded area
                Positioned.fill(
                  child: GestureDetector(
                    child: CameraPreview(_cameraController!),
                    onTap: () => _capturePhoto(),
                  ),
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
