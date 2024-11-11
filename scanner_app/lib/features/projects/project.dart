import '../boxes/box.dart';

class Project {
  final String id;
  String label;
  List<Box> boxes;

  Project({required this.id, required this.label, List<Box>? boxes})
      : boxes = boxes ?? [];
}
