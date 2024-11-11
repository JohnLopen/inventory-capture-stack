import 'dart:convert';
import 'dart:developer';
import 'package:http/http.dart' as http;
import 'package:id_scanner/services/environment.dart';

// From android device
// String _baseUrl = isDev() ? 'http://192.168.1.2:5000' : '';

// From android emulator
String _baseUrl = isDev() ? 'http://10.0.2.2:5000' : '';

const tokenLocal = "2c8db12df8a59300c84c1eb7eddc3748cff03261f622f12fd41d989a27b11cf4";

dynamic headers = {
'Content-Type': 'application/json',
'Authorization': tokenLocal
};

class ApiClient {
  final String baseUrl = _baseUrl;

  ApiClient();

  // GET request
  Future<dynamic> get(String endpoint, {Map<String, String>? headers, Map<String, dynamic>? params}) async {
    try {
      final uri = Uri.parse('$baseUrl/$endpoint').replace(queryParameters: params);
      final response = await http.get(uri, headers: headers);
      return _handleResponse(response);
    } catch (e) {
      log('GET request error: $e');
      rethrow;
    }
  }

  // POST request
  Future<dynamic> post(String endpoint, {Map<String, String>? headers, Map<String, dynamic>? body}) async {
    try {
      final uri = Uri.parse('$baseUrl$endpoint');
      final response = await http.post(
        uri,
        headers: headers ?? {'Content-Type': 'application/json'},
        body: jsonEncode(body),
      );
      return _handleResponse(response);
    } catch (e) {
      log('POST request error: $e');
      rethrow;
    }
  }

  // PUT request
  Future<dynamic> put(String endpoint, {Map<String, String>? headers, Map<String, dynamic>? body}) async {
    try {
      final uri = Uri.parse('$baseUrl$endpoint');
      final response = await http.put(
        uri,
        headers: headers ?? {'Content-Type': 'application/json'},
        body: jsonEncode(body),
      );
      return _handleResponse(response);
    } catch (e) {
      log('PUT request error: $e');
      rethrow;
    }
  }

  // DELETE request
  Future<dynamic> delete(String endpoint, {Map<String, String>? headers}) async {
    try {
      final uri = Uri.parse('$baseUrl$endpoint');
      final response = await http.delete(uri, headers: headers);
      return _handleResponse(response);
    } catch (e) {
      log('DELETE request error: $e');
      rethrow;
    }
  }

  // Helper function to handle responses
  dynamic _handleResponse(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return jsonDecode(response.body);
    } else {
      throw Exception('HTTP Error: ${response.statusCode} - ${response.reasonPhrase}');
    }
  }
}
