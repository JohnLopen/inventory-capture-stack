import 'dart:developer';

import '../../../core/data/base_api.dart';
import 'package:http/http.dart' as http;

class BoxService extends ApiClient {
  BoxService(): super(endpoint: 'inventory/box');
}
