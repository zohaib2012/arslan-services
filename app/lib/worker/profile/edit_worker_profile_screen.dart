import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:dio/dio.dart';
import '../../core/services/api_client.dart';
import '../../core/config/theme_config.dart';

class EditWorkerProfileScreen extends StatefulWidget {
  const EditWorkerProfileScreen({super.key});

  @override
  State<EditWorkerProfileScreen> createState() =>
      _EditWorkerProfileScreenState();
}

class _EditWorkerProfileScreenState extends State<EditWorkerProfileScreen> {
  final _api = ApiClient();
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = true;
  bool _isSaving = false;

  String? _photoUrl;
  XFile? _selectedImage;
  final _nameController = TextEditingController();
  final _experienceController = TextEditingController();
  final _bioController = TextEditingController();
  List<String> _selectedLanguages = [];
  List<String> _availableLanguages = [
    'English',
    'Urdu',
    'Punjabi',
    'Sindhi',
    'Pashto',
    'Balochi',
    'Arabic',
  ];

  @override
  void initState() {
    super.initState();
    _fetchProfile();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _experienceController.dispose();
    _bioController.dispose();
    super.dispose();
  }

  Future<void> _fetchProfile() async {
    try {
      final res = await _api.get('/api/workers/me');
      final data = res.data;
      final user = data['user'] ?? {};
      setState(() {
        _photoUrl = user['profilePhoto'];
        _nameController.text = user['fullName'] ?? '';
        _experienceController.text = (data['experienceYears'] ?? '').toString();
        _bioController.text = data['description'] ?? '';
        _selectedLanguages = List<String>.from(data['languages'] ?? []);
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Failed to load profile')));
      }
    }
  }

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final image = await picker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 80,
    );
    if (image != null) {
      setState(() => _selectedImage = image);
    }
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSaving = true);
    try {
      final data = {
        'fullName': _nameController.text.trim(),
        'experienceYears': int.tryParse(_experienceController.text.trim()),
        'description': _bioController.text.trim(),
        'languages': _selectedLanguages,
      };

      await _api.put('/api/workers/me', data: data);

      if (_selectedImage != null) {
        final formData = FormData.fromMap({
          'photo': await MultipartFile.fromFile(_selectedImage!.path),
        });
        await _api.put('/api/workers/me/photo', data: formData);
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Profile updated'),
            backgroundColor: AppTheme.successColor,
          ),
        );
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Failed to save profile')));
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(title: const Text('Edit Profile')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Edit Profile'),
        actions: [
          TextButton(
            onPressed: _isSaving ? null : _save,
            child: _isSaving
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.white,
                    ),
                  )
                : const Text(
                    'Save',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              _buildPhotoSection(),
              const SizedBox(height: 24),
              _buildNameField(),
              const SizedBox(height: 16),
              _buildExperienceField(),
              const SizedBox(height: 16),
              _buildDescriptionField(),
              const SizedBox(height: 16),
              _buildLanguagesSection(),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: _isSaving ? null : _save,
                  child: _isSaving
                      ? const SizedBox(
                          height: 22,
                          width: 22,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Text(
                          'Save Changes',
                          style: TextStyle(fontSize: 16),
                        ),
                ),
              ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPhotoSection() {
    return Center(
      child: GestureDetector(
        onTap: _pickImage,
        child: Stack(
          children: [
            CircleAvatar(
              radius: 50,
              backgroundImage: _selectedImage != null
                  ? FileImage(File(_selectedImage!.path))
                  : (_photoUrl != null ? NetworkImage(_photoUrl!) : null),
              child: (_selectedImage == null && _photoUrl == null)
                  ? Icon(Icons.person, size: 50, color: Colors.grey.shade400)
                  : null,
            ),
            Positioned(
              right: 0,
              bottom: 0,
              child: Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: AppTheme.primaryColor,
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 2),
                ),
                child: const Icon(
                  Icons.camera_alt,
                  size: 18,
                  color: Colors.white,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNameField() {
    return TextFormField(
      controller: _nameController,
      decoration: const InputDecoration(
        labelText: 'Full Name',
        prefixIcon: Icon(Icons.person_outline),
      ),
      validator: (v) =>
          (v == null || v.trim().isEmpty) ? 'Name is required' : null,
    );
  }

  Widget _buildExperienceField() {
    return TextFormField(
      controller: _experienceController,
      decoration: const InputDecoration(
        labelText: 'Experience (years)',
        prefixIcon: Icon(Icons.work_outline),
      ),
      keyboardType: TextInputType.number,
    );
  }

  Widget _buildDescriptionField() {
    return TextFormField(
      controller: _bioController,
      decoration: const InputDecoration(
        labelText: 'Description / Bio',
        prefixIcon: Icon(Icons.description_outlined),
        alignLabelWithHint: true,
      ),
      maxLines: 4,
    );
  }

  Widget _buildLanguagesSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Languages',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: AppTheme.textPrimary,
          ),
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: _availableLanguages.map((lang) {
            final selected = _selectedLanguages.contains(lang);
            return FilterChip(
              label: Text(lang),
              selected: selected,
              onSelected: (val) {
                setState(() {
                  if (val) {
                    _selectedLanguages.add(lang);
                  } else {
                    _selectedLanguages.remove(lang);
                  }
                });
              },
              selectedColor: AppTheme.secondaryColor.withOpacity(0.2),
              checkmarkColor: AppTheme.primaryColor,
            );
          }).toList(),
        ),
      ],
    );
  }
}
