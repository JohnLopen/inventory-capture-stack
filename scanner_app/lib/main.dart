import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'features/auth/login/login.dart';
import 'features/projects/pages/project_list.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final bool hasToken = await _checkIfLoggedIn();
  runApp(IdScannerApp(hasToken: hasToken,));
}

Future<bool> _checkIfLoggedIn() async {
  final prefs = await SharedPreferences.getInstance();
  final String? token = prefs.getString('jwt_token');
  return token != null && token.isNotEmpty;
}

class IdScannerApp extends StatelessWidget {
  final bool hasToken;

  const IdScannerApp({super.key, required this.hasToken});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Inventory Locator',
      theme: ThemeData.light(),
      home: hasToken ? const MainPage() : const LoginPage(),
    );
  }
}

class MainPage extends StatefulWidget {
  const MainPage({super.key});

  @override
  MainPageState createState() => MainPageState();
}

class MainPageState extends State<MainPage> {

  @override
  void initState() {
    super.initState();
  }

  Widget circularProgress() {
    return const Scaffold(
      body: Center(child: CircularProgressIndicator()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      home: ProjectListScreen(),
    );

  }

}
