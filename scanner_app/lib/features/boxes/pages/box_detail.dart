import 'dart:developer';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import '../../../data/services/inventory/box_service.dart';
import '../../../data/services/inventory/part_service.dart';
import '../../boxes/box.dart';
import '../../part/pages/scanner_home.dart';
import '../../part/part.dart';

class BoxDetailScreen extends StatefulWidget {
  final Box box;

  const BoxDetailScreen(this.box, {super.key});

  @override
  BoxDetailScreenState createState() => BoxDetailScreenState();
}

class BoxDetailScreenState extends State<BoxDetailScreen> {
  late List<Part> parts = []; // Holds the boxes for the current project
  late int partCount;

  // Method to fetch the boxes and their captures
  void _getParts() {
    PartService().get(params: {'box_id': widget.box.id.toString()}).then((response) {
      if (kDebugMode) {
        print('API Response: $response');  // Debug the response from the API
      }
      setState(() {
        partCount = response['count'];
        if ((response['parts'] as List).isNotEmpty) {
          parts = (response['parts'] as List)
              .map((partData) => Part.fromJson(partData))  // Parse the box data
              .toList();
        }
      });
    }).catchError((error) {
      log('Error fetching parts: $error');
    });
  }

  // Method to update the project label
  void _updateBoxLabel() {
    TextEditingController labelController = TextEditingController(text: widget.box.label);

    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Edit box Label'),
          content: TextField(
            controller: labelController,
            decoration: const InputDecoration(hintText: 'Enter new box label'),
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
                    widget.box.label = labelController.text;
                  });
                  // Here you can make a request to update the project label on the backend
                  await BoxService().put(
                    endpoint: '/${widget.box.id}/update',
                    body: {'id': widget.box.id, 'label': widget.box.label},
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
    _getParts();  // Fetch boxes on screen initialization
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.blueAccent,  // Matching login color scheme
        title: GestureDetector(
          child: Text(widget.box.label, style: const TextStyle(color: Colors.white)),
          onTap: () => _updateBoxLabel(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit, size: 16, color: Colors.white,),
            onPressed: _updateBoxLabel, // Trigger label update
          ),
        ],
      ),
      body: parts.isNotEmpty
          ? ListView.builder(
        itemCount: parts.length,
        itemBuilder: (context, index) {
          final box = parts[index];
          return Card(
            margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
            elevation: 5,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            child: ListTile(
              contentPadding: const EdgeInsets.symmetric(horizontal: 20),
              title: Text(
                '${box.label} (${box.captures.length} ${box.captures.length > 1 ? 'captures' : 'capture'})',
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
              onTap: () async {
                await Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => ScannerHome(part: box)),
                );
                _getParts();  // Refresh box list after navigation
              },
            ),
          );
        },
      )
          : Center(child: GestureDetector(
        child: const Text('Add a new part to begin', style: TextStyle(color: Colors.blueAccent)),
        onTap: () => _createNewPart(context),
      )),
      floatingActionButton: FloatingActionButton(
        backgroundColor: Colors.blueAccent,  // Matching login color scheme
        child: const Icon(Icons.add_box, color: Colors.white),
        onPressed: () => _createNewPart(context),
      ),
    );
  }

  // Method to create a new box
  void _createNewPart(BuildContext context) {
    PartService()
        .post(body: {'box_id': widget.box.id})
        .then((data) async {
      if (context.mounted) {
        await Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => ScannerHome(part: Part.fromJson(data['part']))),
        );
        _getParts();  // Fetch the updated list of boxes
      }
    });
  }
}
