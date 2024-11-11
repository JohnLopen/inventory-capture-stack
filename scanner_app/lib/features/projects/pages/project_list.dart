import 'package:flutter/material.dart';
import 'package:id_scanner/features/projects/pages/project_detail.dart';

import '../project.dart';

class ProjectListScreen extends StatefulWidget {
  const ProjectListScreen({super.key});

  @override
  ProjectListScreenState createState() => ProjectListScreenState();
}

class ProjectListScreenState extends State<ProjectListScreen> {
  final List<Project> projects = []; // Replace with actual data source

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Projects')),
      body: ListView.builder(
        itemCount: projects.length,
        itemBuilder: (context, index) {
          final project = projects[index];
          return ListTile(
            title: Text(project.label),
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => ProjectDetailScreen(project)),
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        child: const Icon(Icons.add),
        onPressed: () => _createNewProject(context),
      ),
    );
  }

  void _createNewProject(BuildContext context) {
    final controller = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('New Project'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(hintText: 'Enter project label'),
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
                // Create a new project and add it to the list
                setState(() {
                  projects.add(Project(id: DateTime.now().toString(), label: label));
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
