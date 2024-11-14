import 'package:id_scanner/features/captures/capture.dart';

class Part {
  final int? id;
  final int? send_to_ai;
  String label;
  List<Capture> captures;

  Part({this.id, this.send_to_ai, required this.label, required this.captures});

  factory Part.fromJson(Map<String, dynamic> json) {
    // Debug output to check the structure of json['captures']
    print('Raw captures JSON: ${json['captures']}');

    return Part(
      id: json['id'] as int?,
      label: json['label'] as String,
      send_to_ai: json['send_to_ai'] as int?,
      captures: (json['captures'] as List<dynamic>?)
          ?.map((captureJson) {
        return Capture.fromJson(captureJson);
      })
          .toList() ?? [],
    );
  }
}
