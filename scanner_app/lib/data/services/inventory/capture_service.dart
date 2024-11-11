import 'dart:developer';

import '../../../core/data/base_api.dart';
import 'package:http/http.dart' as http;

class CaptureService extends ApiClient {
  CaptureService();

  // Function to send image file to API using HTTP
  Future<bool> upload(String imagePath) async {
    try {
      final uri = Uri.parse('${super.baseUrl}/inventory/capture');
      final request = http.MultipartRequest('POST', uri);
      request.files.add(await http.MultipartFile.fromPath('file', imagePath));

      final response = await request.send();
      if (response.statusCode == 200) {
        log('Image uploaded successfully');
      } else {
        log('Failed to upload image');
      }

      return response.statusCode == 200;
    }
    catch (ex) {
      log("Error in upload: $ex");
      return false;
    }
  }

}
