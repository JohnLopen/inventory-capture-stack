import 'dart:async';
import 'dart:developer';
import 'dart:io';
import 'package:camera/camera.dart';
import 'package:id_scanner/data/services/inventory/capture_service.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:encrypt/encrypt.dart' as encrypt;
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart';

class QueueManager {
  final _storageKey = 'queued_data';
  final _imageDir = 'queued_images';
  late Timer _connectivityCheckTimer;
  late encrypt.Encrypter encrypter;
  late encrypt.IV iv;

  QueueManager() {
    // Initialize timer to periodically check connectivity
    _connectivityCheckTimer = Timer.periodic(const Duration(seconds: 10), (timer) {
      _checkAndAutoSend();
    });

    final key = encrypt.Key.fromLength(32);
    iv = encrypt.IV.fromLength(16);
    encrypter = encrypt.Encrypter(encrypt.AES(key));
  }

  // Method to add text data to queue
  Future<void> addToQueue(String data) async {
    final prefs = await SharedPreferences.getInstance();
    List<String> queuedItems = prefs.getStringList(_storageKey) ?? [];

    // Encrypt and add text data with timestamp
    final encryptedData = encrypter.encrypt(data, iv: iv);
    final timestamp = DateTime.now().toIso8601String();
    queuedItems.add('${encryptedData.base64}|$timestamp');
    await prefs.setStringList(_storageKey, queuedItems);

    await _checkAndAutoSend();
  }

  // Method to add image data to queue
  Future<void> addImageToQueue(XFile image) async {
    // Save image file to temporary directory
    final tempDir = await getTemporaryDirectory();
    final imagePath = join(tempDir.path, _imageDir, basename(image.path));
    await image.saveTo(imagePath);

    // Encrypt image path and timestamp for queuing
    final prefs = await SharedPreferences.getInstance();
    List<String> queuedItems = prefs.getStringList(_storageKey) ?? [];
    final encryptedImagePath = encrypter.encrypt(imagePath, iv: iv);
    final timestamp = DateTime.now().toIso8601String();
    queuedItems.add('${encryptedImagePath.base64}|$timestamp|image');
    await prefs.setStringList(_storageKey, queuedItems);

    await _checkAndAutoSend();
  }

  // Helper function to check connectivity and send queued data
  Future<void> _checkAndAutoSend() async {
    if (await _isConnectedToInternet()) {
      await sendQueuedDataToApi();
    } else {
      log("Not connected to internet");
    }
  }

  Future<bool> _isConnectedToInternet() async {
    try {
      final result = await InternetAddress.lookup('google.com');
      return result.isNotEmpty && result[0].rawAddress.isNotEmpty;
    } catch (e) {
      return false;
    }
  }

  Future<void> sendQueuedDataToApi() async {
    CaptureService captureService = CaptureService();

    final prefs = await SharedPreferences.getInstance();
    List<String> queuedItems = prefs.getStringList(_storageKey) ?? [];
    List<String> itemsToRemove = [];

    for (String item in queuedItems) {
      try {
        final parts = item.split('|');
        final encryptedData = parts[0];
        final type = parts.length > 2 ? parts[2] : 'text';

        if (type == 'image') {
          // Decrypt image path
          final imagePath = encrypter.decrypt64(encryptedData, iv: iv);

          // Send image to API
          await captureService.upload(imagePath);
          itemsToRemove.add(item);

          // Delete image file after successful upload
          final file = File(imagePath);
          if (await file.exists()) {
            await file.delete();
          }
        } else {
          // Decrypt text data
          final decryptedData = encrypter.decrypt64(encryptedData, iv: iv);

          // Send text data to API
          log('Sending text data to API: $decryptedData');
          itemsToRemove.add(item);
        }
      } catch (e) {
        log('Error decrypting or sending data: $e');
      }
    }

    // Update SharedPreferences
    queuedItems.removeWhere((item) => itemsToRemove.contains(item));
    if (queuedItems.isNotEmpty) {
      await prefs.setStringList(_storageKey, queuedItems);
    } else {
      await prefs.remove(_storageKey);
    }
  }

  void dispose() {
    _connectivityCheckTimer.cancel();
  }
}
