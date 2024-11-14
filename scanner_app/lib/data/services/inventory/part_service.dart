import 'dart:developer';

import '../../../core/data/base_api.dart';
import 'package:http/http.dart' as http;

class PartService extends ApiClient {
  PartService(): super(endpoint: 'inventory/part');
}
