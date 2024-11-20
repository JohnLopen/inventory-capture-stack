import 'dart:developer';

import '../../../core/data/base_api.dart';
import 'package:http/http.dart' as http;

class ProjectService extends ApiClient {
  ProjectService(): super(endpoint: 'inventory/project');
}
