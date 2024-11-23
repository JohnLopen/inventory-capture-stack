import 'package:id_scanner/features/part/part.dart';

class Box {
  final int? id;
  String label;
  List<Part> parts;

  Box({this.id, required this.label, required this.parts});

  factory Box.fromJson(Map<String, dynamic> json) {
    // Debug output to check the structure of json['captures']
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
