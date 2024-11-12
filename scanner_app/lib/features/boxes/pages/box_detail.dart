import 'dart:developer';

import 'package:flutter/material.dart';

import '../box.dart';

class BoxDetailScreen extends StatelessWidget {
  final Box box;

  BoxDetailScreen(this.box);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(box.label)),
      body: Center(
        child: Text('Box Details Screen for ${box.label}'),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _onCaptureButtonPressed,
        label: Text('Capture'),
        icon: Icon(Icons.camera),
      ),
    );
  }

  void _onCaptureButtonPressed() {
    // Empty function callback - add capture functionality here
    print('Capture button pressed for ${box.label}');
  }
}
