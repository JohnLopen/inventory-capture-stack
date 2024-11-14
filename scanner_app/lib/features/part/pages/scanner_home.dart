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
  final bool autoCamera;

  const ScannerHome({super.key,
    required this.part,
    required this.onNextPart,
    required this.autoCamera
  });

  @override
  ScannerHomeState createState() => ScannerHomeState();
}

class ScannerHomeState extends State<ScannerHome> {
  late List<Capture> captures = [];
  late int captureCount;
  bool isLoading = true; // Loading state

  // Method to fetch captures
  Future<void> _getCaptures() async {
    setState(() {
      isLoading = true;
    });
    try {
      final response = await CaptureService().get(params: {'part_id': widget.part.id.toString()});
      if (kDebugMode) {
        print('API Response: $response');
      }
      setState(() {
        captureCount = response['count'];
        captures = (response['captures'] as List)
            .map((captureData) => Capture.fromJson(captureData))
            .toList();
      });
    } catch (error) {
      log('Error fetching captures: $error');
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  Future<void> startCameraPreview() async {
    await Navigator.of(context).push(
      MaterialPageRoute(builder: (context) => CameraXPreview(
        part: widget.part,
        onNextPart: () {
          Navigator.of(context).pop();
          widget.onNextPart();
        },
      )),
    );
    await _getCaptures();
  }

  @override
  void initState() {
    super.initState();
    _getCaptures();

    // Check if autoCamera is true and start the camera preview
    if (widget.autoCamera) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        startCameraPreview();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.blueAccent,
        title: Text(
          widget.part.label,
          style: const TextStyle(color: Colors.white),
        ),
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
        onRefresh: _getCaptures,
        child: captures.isNotEmpty
            ? GridView.builder(
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 3,
            crossAxisSpacing: 4.0,
            mainAxisSpacing: 4.0,
            childAspectRatio: 1.0,
          ),
          itemCount: captures.length,
          itemBuilder: (context, index) {
            final capture = captures[index];
            final imagePath = '$apiBaseUrl/uploads/${capture.filename}';

            return GestureDetector(
              onTap: () {
                // Handle image tap if needed
              },
              child: Card(
                elevation: 4.0,
                child: Stack(
                  alignment: Alignment.bottomCenter,
                  children: [
                    Padding(
                      padding: const EdgeInsets.all(0),
                      child: Image.network(
                        imagePath,
                        fit: BoxFit.cover,
                        width: double.infinity,
                        height: double.infinity,
                        errorBuilder: (context, error, stackTrace) {
                          return const Icon(
                            Icons.broken_image,
                            size: 40,
                            color: Colors.grey,
                          );
                        },
                      ),
                    ),
                    Positioned(
                      bottom: 4.0,
                      left: 4.0,
                      right: 4.0,
                      child: Container(
                        color: Colors.black.withOpacity(0.6),
                        padding: const EdgeInsets.symmetric(vertical: 2.0, horizontal: 4.0),
                        child: Text(
                          capture.isLabelPhoto == 1 ? 'LABEL PICTURE' : 'SUPPLEMENTAL',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        )
            : Center(
          child: GestureDetector(
            child: const Text(
              'Nothing captured for this part.',
              style: TextStyle(color: Colors.blueAccent),
            ),
            onTap: () => startCameraPreview(),
          ),
        ),
      ),
      floatingActionButton: Padding(
        padding: const EdgeInsets.only(bottom: 40.0),
        child: FloatingActionButton(
          heroTag: 'camera',
          backgroundColor: Colors.blueAccent,
          onPressed: () => startCameraPreview(),
          child: const Icon(
            Icons.camera,
            color: Colors.white,
          ),
        ),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
    );
  }
}
