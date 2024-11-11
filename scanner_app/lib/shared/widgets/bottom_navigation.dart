import 'package:flutter/material.dart';

class BottomNavigation extends StatelessWidget {
  final int currentIndex;
  final Function(int) onTap;

  const BottomNavigation({super.key, required this.currentIndex, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return BottomNavigationBar(
      currentIndex: currentIndex,
      onTap: onTap,
      items: const [
        BottomNavigationBarItem(
          icon: Icon(Icons.camera_alt),
          label: 'License',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.credit_card_sharp),
          label: 'Passport',
        ),
      ],
    );
  }
}
