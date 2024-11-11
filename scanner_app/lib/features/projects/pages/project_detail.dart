import 'package:flutter/material.dart';

import '../../boxes/box.dart';
import '../project.dart';

class ProjectDetailScreen extends StatefulWidget {
  final Project project;

  const ProjectDetailScreen(this.project, {super.key});

  @override
  ProjectDetailScreenState createState() => ProjectDetailScreenState();
}

class ProjectDetailScreenState extends State<ProjectDetailScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.project.label)),
      body: ListView.builder(
        itemCount: widget.project.boxes.length,
        itemBuilder: (context, index) {
          final box = widget.project.boxes[index];
          return ListTile(
            title: Text(box.label),
            // Additional actions or navigation can be added if needed
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        child: const Icon(Icons.add_box),
        onPressed: () => _createNewBox(context),
      ),
    );
  }

  void _createNewBox(BuildContext context) {
    final controller = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('New Box'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(hintText: 'Enter box label'),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              final label = controller.text;
              if (label.isNotEmpty) {
                // Create a new box and add it to the project's list of boxes
                setState(() {
                  widget.project.boxes.add(Box(id: DateTime.now().toString(), label: label));
                });
              }
              Navigator.pop(context);
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }
}
