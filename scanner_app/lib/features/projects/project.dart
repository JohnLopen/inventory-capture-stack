import '../boxes/box.dart';

class Project {
  final int? id;              // Made id optional (nullable)
  String label;
  List<Box> boxes;

  Project({this.id, required this.label, required this.boxes});

  factory Project.fromJson(Map<String, dynamic> json) {
    return Project(
      id: json['id'] as int?,             // Parse id as an optional int
      label: json['label'] as String,
      boxes: (json['boxes'] as List<dynamic>?)?.map((boxJson) => Box.fromJson(boxJson)).toList() ?? [],  // Parsing boxes if available
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'label': label,
    };
  }
}
