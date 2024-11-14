import 'package:id_scanner/features/captures/capture.dart';

class Part {
  final int id;
  final int? sendToAi;
  String label;
  List<Capture> captures;

  Part({required this.id, required this.label, required this.captures, this.sendToAi,});

  factory Part.fromJson(Map<String, dynamic> json) {
    // Debug output to check the structure of json['captures']
    print('Raw captures JSON: ${json['captures']}');

    return Part(
      id: json['id'] as int,
      label: json['label'] as String,
      captures: (json['captures'] as List<dynamic>?)
          ?.map((captureJson) {
        return Capture.fromJson(captureJson);
      })
          .toList() ?? [],
      sendToAi: json['send_to_ai'] as int?,
    );
  }
}
