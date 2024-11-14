import 'dart:convert';
import 'dart:developer';
import 'package:http/http.dart' as http;
import 'package:id_scanner/services/environment.dart';
import 'package:shared_preferences/shared_preferences.dart';

String apiBaseUrl = isDev() ? 'http://192.168.254.191:5000' : 'https://inventorycapture.com/api';
// String apiBaseUrl = isDev() ? 'http://10.0.2.2:5000' : 'http://44.244.59.28:3000';

// Test Live
// String apiBaseUrl = 'http://44.244.59.28:3000';

class ApiClient {
  late final String baseUrl;

  ApiClient({String endpoint = ''}) {
    baseUrl = endpoint != '' ? '$apiBaseUrl/$endpoint' : apiBaseUrl;
  }

  // Fetch the token from SharedPreferences
  Future<String> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token'); // Replace with your key
    if (token != null) {
      return token;
    } else {
      return '';
    }
  }

  // GET request
  Future<dynamic> get({String endpoint = '', Map<String, String>? headers, Map<String, dynamic>? params}) async {
    try {
      final token = await _getToken();  // Fetch the token
      final mergedHeaders = {
        'Content-Type': 'application/json',
        'Authorization': token, // Add the token to Authorization header
      };

      final uri = Uri.parse('$baseUrl/$endpoint').replace(queryParameters: params);
      final response = await http.get(uri, headers: mergedHeaders);
      return _handleResponse(response);
    } catch (e) {
      log('GET request error: $e');
      rethrow;
    }
  }

  // POST request
  Future<dynamic> post({String endpoint = '', Map<String, String>? headers, Map<String, dynamic>? body}) async {
    try {
      final token = await _getToken();  // Fetch the token
      final mergedHeaders = {
        'Content-Type': 'application/json',
        'Authorization': token, // Add the token to Authorization header
      };

      final uri = Uri.parse('$baseUrl$endpoint');
      final response = await http.post(
        uri,
        headers: mergedHeaders,
        body: jsonEncode(body),
      );
      return _handleResponse(response);
    } catch (e) {
      log('POST request error: $e');
      rethrow;
    }
  }

  // PUT request
  Future<dynamic> put({String endpoint = '', Map<String, String>? headers, Map<String, dynamic>? body}) async {
    try {
      final token = await _getToken();  // Fetch the token
      final mergedHeaders = {
        'Content-Type': 'application/json',
        'Authorization': token, // Add the token to Authorization header
      };

      final uri = Uri.parse('$baseUrl$endpoint');
      final response = await http.put(
        uri,
        headers: mergedHeaders,
        body: jsonEncode(body),
      );
      return _handleResponse(response);
    } catch (e) {
      log('PUT request error: $e');
      rethrow;
    }
  }

  // DELETE request
  Future<dynamic> delete({String endpoint = '', Map<String, String>? headers}) async {
    try {
      final token = await _getToken();  // Fetch the token
      final mergedHeaders = {
        'Authorization': token, // Add the token to Authorization header
      };

      final uri = Uri.parse('$baseUrl$endpoint');
      final response = await http.delete(uri, headers: mergedHeaders);
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
