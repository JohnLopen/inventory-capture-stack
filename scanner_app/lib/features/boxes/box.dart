import 'package:id_scanner/features/captures/capture.dart';

class Box {
  final int? id;
  String label;
  List<Capture> captures;

  Box({this.id, required this.label, required this.captures});

  factory Box.fromJson(Map<String, dynamic> json) {
    // Debug output to check the structure of json['captures']
    print('Raw captures JSON: ${json['captures']}');

    return Box(
      id: json['id'] as int?,
      label: json['label'] as String,
      captures: (json['captures'] as List<dynamic>?)
          ?.map((captureJson) {
        return Capture.fromJson(captureJson);
      })
          .toList() ?? [],
    );
  }
}
