import 'package:flutter/material.dart';
import 'package:id_scanner/data/services/inventory/auth_service.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../core/data/base_api.dart';
import '../../projects/pages/project_list.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  LoginPageState createState() => LoginPageState();
}

class LoginPageState extends State<LoginPage> {
  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();

  bool _isObscure = true; // To toggle password visibility
  bool _isLoading = false; // To show loading indicator

  // Simulate a login attempt
  void _login() {
    if (_formKey.currentState!.validate()) {
      setState(() {
        _isLoading = true;
      });

      AuthService()
          .post(endpoint: '/login', body: {
        'username': _usernameController.text,
        'password': _passwordController.text
      })
          .then((data) async {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('jwt_token', data['token']);

        setState(() {
          _isLoading = false;
        });

        await Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const ProjectListScreen()),
        );
      }).catchError((error) {
        setState(() {
          _isLoading = false;
        });
        _showErrorDialog('Login failed');
      });
    }
  }

  // Error dialog
  void _showErrorDialog(String message) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Error'),
          content: Text(message),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
              },
              child: const Text('OK'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 30.0),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const SizedBox(height: 50),
                // Add the logo here
                Image.network(
                  '$apiBaseUrl/images/logo/logo-main.png',
                  width: MediaQuery.of(context).size.width * 0.6, // Set the desired width
                  // height: 100, // Set the desired height
                ),
                const SizedBox(height: 50),
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(10),
                    boxShadow: const [
                      BoxShadow(
                        color: Colors.black12,
                        blurRadius: 10,
                        offset: Offset(0, 1),
                      ),
                    ],
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(20.0),
                    child: Form(
                      key: _formKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          const Text(
                            'User Login',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                              color: Colors.blueAccent,
                            ),
                          ),
                          const SizedBox(height: 20),
                          TextFormField(
                            controller: _usernameController,
                            decoration: InputDecoration(
                              labelText: 'Username',
                              prefixIcon: const Icon(Icons.person),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(10),
                              ),
                              filled: true,
                              fillColor: Colors.white,
                            ),
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'Please enter a username';
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 20),
                          TextFormField(
                            controller: _passwordController,
                            obscureText: _isObscure,
                            decoration: InputDecoration(
                              labelText: 'Password',
                              prefixIcon: const Icon(Icons.lock),
                              suffixIcon: IconButton(
                                icon: Icon(
                                  _isObscure
                                      ? Icons.visibility_off
                                      : Icons.visibility,
                                ),
                                onPressed: () {
                                  setState(() {
                                    _isObscure = !_isObscure;
                                  });
                                },
                              ),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(10),
                              ),
                              filled: true,
                              fillColor: Colors.white,
                            ),
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'Please enter a password';
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 30),
                          ElevatedButton(
                            onPressed: _isLoading ? null : _login,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.blueAccent,
                              padding: const EdgeInsets.symmetric(vertical: 15),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10),
                              ),
                            ),
                            child: _isLoading
                                ? const CircularProgressIndicator(
                              valueColor:
                              AlwaysStoppedAnimation<Color>(
                                  Colors.white),
                            )
                                : const Text(
                              'Login',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                          ),
                          // const SizedBox(height: 15),
                          // TextButton(
                          //   onPressed: () {
                          //     // Navigate to a "forgot password" page or other options
                          //   },
                          //   child: const Text(
                          //     'Forgot Password?',
                          //     style: TextStyle(color: Colors.blueAccent),
                          //   ),
                          // ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
