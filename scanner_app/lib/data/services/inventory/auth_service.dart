import 'dart:developer';

import '../../../core/data/base_api.dart';
import 'package:http/http.dart' as http;

class AuthService extends ApiClient {
  AuthService(): super(endpoint: 'auth');
}
