import 'dart:developer';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:id_scanner/features/auth/login/login.dart';
import 'package:id_scanner/features/projects/pages/project_detail.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../data/services/inventory/project_service.dart';
import '../project.dart';

class ProjectListScreen extends StatefulWidget {
  const ProjectListScreen({super.key});

  @override
  ProjectListScreenState createState() => ProjectListScreenState();
}

class ProjectListScreenState extends State<ProjectListScreen> {
  late List<Project> projects = []; // Replace with actual data source
  late int projectCount;
  bool isLoading = true; // Track loading state

  Future<void> _getProjects() async {
    setState(() {
      isLoading = true; // Set loading to true at the start of the fetch
    });

    try {
      final response = await ProjectService().get();
      if (kDebugMode) {
        print(response);
      }
      setState(() {
        projectCount = response['count'];
        projects = (response['projects'] as List)
            .map((projectData) => Project.fromJson(projectData))
            .toList();
      });
    } catch (error) {
      log('Error fetching projects: $error');
    } finally {
      setState(() {
        isLoading = false; // Set loading to false after fetch completes
      });
    }
  }

  @override
  void initState() {
    _getProjects();
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.blueAccent, // Matching login color scheme
        title: const Text('Inventory Capture (Beta)', style: TextStyle(color: Colors.white)),
        actions: [
          IconButton(
            icon: const Icon(Icons.exit_to_app, color: Colors.white), // Logout icon
            onPressed: () {
              _logout(context); // Add logout functionality here
            },
          ),
        ],
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator()) // Show loading indicator while loading
          : RefreshIndicator(
        onRefresh: _getProjects, // Swipe-down to refresh
        child: projects.isNotEmpty
            ? ListView.builder(
          itemCount: projects.length,
          itemBuilder: (context, index) {
            final project = projects[index];
            return Card(
              margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
              elevation: 5,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              child: ListTile(
                contentPadding: const EdgeInsets.symmetric(horizontal: 20),
                title: Text(
                  '${project.label} (${project.boxes.length} ${project.boxes.length > 1 ? 'boxes' : 'box'})',
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                onTap: () async {
                  await Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => ProjectDetailScreen(project)),
                  );
                  _getProjects(); // Refresh project list on return
                },
              ),
            );
          },
        )
            : Center(
          child: GestureDetector(
            child: const Text('Add a new project to begin', style: TextStyle(color: Colors.blueAccent)),
            onTap: () => _createNewProject(context),
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: Colors.blueAccent, // Matching login color scheme
        child: const Icon(Icons.add, color: Colors.white),
        onPressed: () => _createNewProject(context),
      ),
    );
  }

  void _createNewProject(BuildContext context) {
    ProjectService()
        .post(body: {'label': 'Project ${projectCount + 1}'})
        .then((data) async {
      if (context.mounted) {
        await Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => ProjectDetailScreen(Project.fromJson(data['project']))),
        );
        _getProjects();
      }
    });
  }

  // Function to handle the logout
  Future<void> _logout(BuildContext context) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('jwt_token');
    await Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => const LoginPage()),
    );
  }
}
