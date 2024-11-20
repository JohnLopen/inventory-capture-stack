class Capture {
  final int? id;
  String filename;
  String path;
  int isLabelPhoto;

  Capture({this.id, required this.filename, required this.path, required this.isLabelPhoto});

  factory Capture.fromJson(Map<String, dynamic> json) {

    return Capture(
      id: json['id'] as int?,             // Parse id as an optional int
      filename: json['filename'] as String,
      path: json['path'] as String,
      isLabelPhoto: json['is_label_photo'] as int
    );
  }
}
