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
  late List<Part> parts = [];
  late int partCount;
  bool isLoading = true;

  // Method to fetch parts
  Future<void> _getParts() async {
    setState(() {
      isLoading = true;
    });
    try {
      final response = await PartService().get(params: {'box_id': widget.box.id.toString()});
      if (kDebugMode) {
        print('API Response: $response');  // Debug the response from the API
      }
      setState(() {
        partCount = response['count'];
        parts = (response['parts'] as List).map((partData) => Part.fromJson(partData)).toList();
      });
    } catch (error) {
      log('Error fetching parts: $error');
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  // Method to update the box label
  void _updateBoxLabel() {
    TextEditingController labelController = TextEditingController(text: widget.box.label);

    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Edit Box Label'),
          content: TextField(
            controller: labelController,
            decoration: const InputDecoration(hintText: 'Enter new box label'),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),  // Close dialog without saving
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () async {
                if (labelController.text.isNotEmpty) {
                  setState(() {
                    widget.box.label = labelController.text;
                  });
                  await BoxService().put(
                    endpoint: '/${widget.box.id}/update',
                    body: {'id': widget.box.id, 'label': widget.box.label},
                  );
                  Navigator.pop(context);  // Close dialog
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
    _getParts();  // Fetch parts on screen initialization
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.blueAccent,
        title: GestureDetector(
          child: Text(widget.box.label, style: const TextStyle(color: Colors.white)),
          onTap: () => _updateBoxLabel(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit, size: 16, color: Colors.white),
            onPressed: _updateBoxLabel,
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _getParts,
        child: isLoading
            ? const Center(child: CircularProgressIndicator())
            : parts.isNotEmpty
            ? ListView.builder(
          itemCount: parts.length,
          itemBuilder: (context, index) {
            final part = parts[index];
            return Card(
              margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
              elevation: 5,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              child: ListTile(
                contentPadding: const EdgeInsets.symmetric(horizontal: 20),
                title: Text(
                  '${part.label} (${part.captures.length} ${part.captures.length > 1 ? 'captures' : 'capture'})',
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                onTap: () async {
                  await Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => ScannerHome(
                        part: part,
                        onNextPart: () => _createNewPart(),
                        autoCamera: false,
                      ),
                    ),
                  );
                  _getParts();  // Refresh parts list after returning
                },
              ),
            );
          },
        )
            : Center(
          child: GestureDetector(
            child: const Text('Add a new part to begin', style: TextStyle(color: Colors.blueAccent)),
            onTap: () => _createNewPart(),
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: Colors.blueAccent,
        child: const Icon(Icons.add_box, color: Colors.white),
        onPressed: () => _createNewPart(),
      ),
    );
  }

  // Method to create a new part
  void _createNewPart({bool replace = false}) {
    PartService().post(body: {'box_id': widget.box.id}).then((data) async {
      dynamic route = MaterialPageRoute(
        builder: (_) => ScannerHome(
          part: Part.fromJson(data['part']),
          onNextPart: () => _createNewPart(replace: true),
          autoCamera: replace
        ),
      );
      if(context.mounted) {
        await Navigator.push(context, route);
      }
      _getParts();  // Fetch updated parts list after returning
    });
  }
}
