import 'package:id_scanner/features/part/part.dart';
import 'package:id_scanner/features/captures/capture.dart';

class Box {
  final int? id;
  String label;
  List<Part> parts;

  Box({this.id, required this.label, required this.parts});

  factory Box.fromJson(Map<String, dynamic> json) {
    // Debug output to check the structure of json['captures']
    print('Raw captures JSON: ${json['parts']}');

    return Box(
      id: json['id'] as int?,
      label: json['label'] as String,
      parts: (json['parts'] as List<dynamic>?)
          ?.map((partJson) {
        return Part.fromJson(partJson);
      })
          .toList() ?? [],
    );
  }
}
