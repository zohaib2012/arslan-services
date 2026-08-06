import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:dio/dio.dart';
import '../../core/services/api_client.dart';
import '../../core/config/theme_config.dart';

class CnicVerificationScreen extends StatefulWidget {
  const CnicVerificationScreen({super.key});

  @override
  State<CnicVerificationScreen> createState() => _CnicVerificationScreenState();
}

class _CnicVerificationScreenState extends State<CnicVerificationScreen> {
  final _api = ApiClient();
  final _cnicController = TextEditingController();
  bool _isLoading = true;
  bool _isSubmitting = false;
  String? _error;

  XFile? _frontImage;
  XFile? _backImage;
  String? _frontUrl;
  String? _backUrl;
  String _verificationStatus = 'PENDING';
  String? _adminNotes;

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  @override
  void dispose() {
    _cnicController.dispose();
    super.dispose();
  }

  Future<void> _fetchData() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final res = await _api.get('/api/workers/me');
      final data = res.data as Map<String, dynamic>;
      if (!mounted) return;
      setState(() {
        _verificationStatus =
            data['verificationStatus'] as String? ?? 'PENDING';
        _adminNotes = data['adminNotes'] as String?;
        _cnicController.text = data['cnicNumber'] as String? ?? '';
        _frontUrl = data['cnicFrontUrl'] as String?;
        _backUrl = data['cnicBackUrl'] as String?;
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _error = 'Failed to load verification status. Pull to retry.';
      });
    }
  }

  Future<void> _pickImage(bool isFront) async {
    final picker = ImagePicker();
    final image = await picker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 80,
    );
    if (image != null) {
      setState(() {
        if (isFront) {
          _frontImage = image;
        } else {
          _backImage = image;
        }
      });
    }
  }

  String _formatCnic(String value) {
    final digits = value.replaceAll(RegExp(r'[^0-9]'), '');
    if (digits.length <= 5) return digits;
    if (digits.length <= 12)
      return '${digits.substring(0, 5)}-${digits.substring(5)}';
    return '${digits.substring(0, 5)}-${digits.substring(5, 12)}-${digits.substring(12)}';
  }

  Future<void> _submit() async {
    final rawCnic = _cnicController.text.trim().replaceAll(
      RegExp(r'[^0-9]'),
      '',
    );
    if (rawCnic.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter your CNIC number')),
      );
      return;
    }
    if (rawCnic.length != 13) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('CNIC number must be 13 digits')),
      );
      return;
    }

    setState(() => _isSubmitting = true);
    try {
      final map = <String, dynamic>{'cnicNumber': rawCnic};

      if (_frontImage != null) {
        map['cnicFront'] = await MultipartFile.fromFile(_frontImage!.path);
      }
      if (_backImage != null) {
        map['cnicBack'] = await MultipartFile.fromFile(_backImage!.path);
      }

      final formData = FormData.fromMap(map);
      await _api.put('/api/workers/me/verification', data: formData);

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Verification submitted'),
          backgroundColor: AppTheme.successColor,
        ),
      );
      Navigator.pop(context, true);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to submit verification')),
      );
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('CNIC Verification')),
      body: _buildBody(),
      bottomNavigationBar: _isLoading || _error != null
          ? null
          : SafeArea(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                child: SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: _isSubmitting ? null : _submit,
                    child: _isSubmitting
                        ? const SizedBox(
                            height: 22,
                            width: 22,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.white,
                            ),
                          )
                        : const Text(
                            'Submit Verification',
                            style: TextStyle(fontSize: 16),
                          ),
                  ),
                ),
              ),
            ),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            _PulseWidget(
              child: Container(
                height: 80,
                width: double.infinity,
                decoration: BoxDecoration(
                  color: Colors.grey.shade200,
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: _PulseWidget(
                    child: Container(
                      height: 160,
                      decoration: BoxDecoration(
                        color: Colors.grey.shade200,
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _PulseWidget(
                    child: Container(
                      height: 160,
                      decoration: BoxDecoration(
                        color: Colors.grey.shade200,
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            _PulseWidget(
              child: Container(
                height: 60,
                width: double.infinity,
                decoration: BoxDecoration(
                  color: Colors.grey.shade200,
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ],
        ),
      );
    }

    if (_error != null) {
      return RefreshIndicator(
        onRefresh: _fetchData,
        child: ListView(
          children: [
            SizedBox(height: MediaQuery.of(context).size.height * 0.25),
            Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.error_outline,
                      size: 56,
                      color: Colors.grey.shade400,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      _error!,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontSize: 15,
                        color: AppTheme.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _fetchData,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildStatusBanner(),
            const SizedBox(height: 24),
            _buildUploadCards(),
            const SizedBox(height: 20),
            _buildCnicInput(),
            if (_verificationStatus == 'REJECTED' &&
                _adminNotes != null &&
                _adminNotes!.isNotEmpty) ...[
              const SizedBox(height: 16),
              _buildAdminNotes(),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildStatusBanner() {
    Color color;
    IconData icon;

    switch (_verificationStatus.toUpperCase()) {
      case 'VERIFIED':
        color = AppTheme.successColor;
        icon = Icons.verified;
        break;
      case 'REJECTED':
        color = AppTheme.errorColor;
        icon = Icons.cancel;
        break;
      default:
        color = AppTheme.warningColor;
        icon = Icons.pending;
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withOpacity(0.15),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: color, size: 22),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Status: $_verificationStatus',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: color,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  _verificationStatus == 'VERIFIED'
                      ? 'Your identity has been verified'
                      : _verificationStatus == 'REJECTED'
                      ? 'Your verification was rejected. Please resubmit.'
                      : 'Your verification is under review',
                  style: TextStyle(fontSize: 12, color: color.withOpacity(0.8)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildUploadCards() {
    return Row(
      children: [
        Expanded(
          child: _buildUploadCard('Front Side', _frontImage, _frontUrl, true),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _buildUploadCard('Back Side', _backImage, _backUrl, false),
        ),
      ],
    );
  }

  Widget _buildUploadCard(
    String label,
    XFile? image,
    String? url,
    bool isFront,
  ) {
    final hasImage = image != null || (url != null && url.isNotEmpty);

    return GestureDetector(
      onTap: () => _pickImage(isFront),
      child: Container(
        height: 160,
        decoration: BoxDecoration(
          color: Colors.grey.shade50,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: hasImage ? AppTheme.successColor : Colors.grey.shade300,
            width: hasImage ? 2 : 1,
          ),
        ),
        child: hasImage
            ? ClipRRect(
                borderRadius: BorderRadius.circular(11),
                child: image != null
                    ? Image.file(File(image.path), fit: BoxFit.cover)
                    : Image.network(
                        url!,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) =>
                            _buildUploadPlaceholder(label),
                      ),
              )
            : _buildUploadPlaceholder(label),
      ),
    );
  }

  Widget _buildUploadPlaceholder(String label) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(Icons.camera_alt_outlined, size: 32, color: Colors.grey.shade400),
        const SizedBox(height: 8),
        Text(
          label,
          style: TextStyle(
            fontSize: 13,
            color: Colors.grey.shade500,
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          'Tap to upload',
          style: TextStyle(fontSize: 11, color: Colors.grey.shade400),
        ),
      ],
    );
  }

  Widget _buildCnicInput() {
    return TextFormField(
      controller: _cnicController,
      decoration: const InputDecoration(
        labelText: 'CNIC Number',
        hintText: 'XXXXX-XXXXXXX-X',
        prefixIcon: Icon(Icons.badge_outlined),
      ),
      keyboardType: TextInputType.number,
      maxLength: 15,
      onChanged: (value) {
        final cursorPos = _cnicController.selection.baseOffset;
        final formatted = _formatCnic(value);
        _cnicController.value = TextEditingValue(
          text: formatted,
          selection: TextSelection.collapsed(offset: formatted.length),
        );
      },
    );
  }

  Widget _buildAdminNotes() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.red.shade50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.red.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.info_outline, size: 18, color: AppTheme.errorColor),
              SizedBox(width: 6),
              Text(
                'Admin Notes',
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  color: AppTheme.errorColor,
                  fontSize: 14,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            _adminNotes!,
            style: const TextStyle(fontSize: 13, color: AppTheme.textPrimary),
          ),
        ],
      ),
    );
  }
}

class _PulseWidget extends StatefulWidget {
  final Widget child;
  const _PulseWidget({required this.child});

  @override
  State<_PulseWidget> createState() => _PulseWidgetState();
}

class _PulseWidgetState extends State<_PulseWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _controller.drive(Tween(begin: 0.4, end: 1.0)),
      child: widget.child,
    );
  }
}
