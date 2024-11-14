import 'dart:developer';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:id_scanner/data/services/inventory/box_service.dart';
import 'package:id_scanner/data/services/inventory/project_service.dart';
import 'package:id_scanner/features/boxes/pages/box_detail.dart';

import '../../boxes/box.dart';
import '../project.dart';

class ProjectDetailScreen extends StatefulWidget {
  final Project project;

  const ProjectDetailScreen(this.project, {super.key});

  @override
  ProjectDetailScreenState createState() => ProjectDetailScreenState();
}

class ProjectDetailScreenState extends State<ProjectDetailScreen> {
  late List<Box> boxes = []; // Holds the boxes for the current project
  late int boxCount;

  // Method to fetch the boxes and their captures
  void _getBoxes() {
    BoxService().get(params: {'project_id': widget.project.id.toString()}).then((response) {
      if (kDebugMode) {
        print('API Response: $response');  // Debug the response from the API
      }
      setState(() {
        boxCount = response['count'];
        if ((response['boxes'] as List).isNotEmpty) {
          boxes = (response['boxes'] as List)
              .map((boxData) => Box.fromJson(boxData))  // Parse the box data
              .toList();
        }
      });
    }).catchError((error) {
      log('Error fetching boxes: $error');
    });
  }

  // Method to update the project label
  void _updateProjectLabel() {
    TextEditingController labelController = TextEditingController(text: widget.project.label);

    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Edit Project Label'),
          content: TextField(
            controller: labelController,
            decoration: const InputDecoration(hintText: 'Enter new project label'),
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context); // Close the dialog without saving
              },
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () async {
                if (labelController.text.isNotEmpty) {
                  setState(() {
                    widget.project.label = labelController.text;
                  });
                  // Here you can make a request to update the project label on the backend
                  await ProjectService().put(
                    endpoint: '/${widget.project.id}/update',
                    body: {'id': widget.project.id, 'label': widget.project.label},
                  );
                  Navigator.pop(context); // Close the dialog
                }
              },
              child: const Text('Save'),
            ),
          ],
        );
      },
    );
  }

  @override
  void initState() {
    super.initState();
    _getBoxes();  // Fetch boxes on screen initialization
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.blueAccent,  // Matching login color scheme
        title: GestureDetector(
          child: Text(widget.project.label, style: const TextStyle(color: Colors.white)),
          onTap: () => _updateProjectLabel(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit, size: 16, color: Colors.white,),
            onPressed: _updateProjectLabel, // Trigger label update
          ),
        ],
      ),
      body: boxes.isNotEmpty
          ? ListView.builder(
        itemCount: boxes.length,
        itemBuilder: (context, index) {
          final box = boxes[index];
          return Card(
            margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
            elevation: 5,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            child: ListTile(
              contentPadding: const EdgeInsets.symmetric(horizontal: 20),
              title: Text(
                '${box.label} (${box.parts.length} ${box.parts.length > 1 ? 'parts' : 'part'})',
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
              onTap: () async {
                await Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => BoxDetailScreen(box)),
                );
                _getBoxes();  // Refresh box list after navigation
              },
            ),
          );
        },
      )
          : Center(child: GestureDetector(
        child: const Text('Add a new box to begin', style: TextStyle(color: Colors.blueAccent)),
        onTap: () => _createNewBox(context),
      )),
      floatingActionButton: FloatingActionButton(
        backgroundColor: Colors.blueAccent,  // Matching login color scheme
        child: const Icon(Icons.add_box, color: Colors.white),
        onPressed: () => _createNewBox(context),
      ),
    );
  }

  // Method to create a new box
  void _createNewBox(BuildContext context) {
    BoxService()
        .post(body: {'label': 'Box ${boxCount + 1}', 'project_id': widget.project.id})
        .then((data) async {
      if (context.mounted) {
        await Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => BoxDetailScreen(Box.fromJson(data['box']))),
        );
        _getBoxes();  // Fetch the updated list of boxes
      }
    });
  }
}
