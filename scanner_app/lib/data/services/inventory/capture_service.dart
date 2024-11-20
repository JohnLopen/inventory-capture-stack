import 'dart:developer';
import '../../../core/data/base_api.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class CaptureService extends ApiClient {

  CaptureService() : super(endpoint: 'inventory/capture');

  // Fetch the token from SharedPreferences
  Future<String> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token'); // Replace with your key
    if (token != null) {
      return token;
    } else {
      throw Exception('Token not found');
    }
  }

  // Function to send image file to API using HTTP
  Future<bool> upload(int partId, String imagePath) async {
    try {
      final token = await _getToken(); // Fetch the token
      final uri = Uri.parse(super.baseUrl);
      final request = http.MultipartRequest('POST', uri);

      // Add token to the Authorization header
      request.headers['Authorization'] = token;

      request.fields.addAll({'partId': partId.toString()});
      request.files.add(await http.MultipartFile.fromPath('file', imagePath));

      final response = await request.send();
      if (response.statusCode == 200) {
        log('Image uploaded successfully');
      } else {
        log('Failed to upload image');
      }

      return response.statusCode == 200;
    } catch (ex) {
      log("Error in upload: $ex");
      return false;
    }
  }
}
