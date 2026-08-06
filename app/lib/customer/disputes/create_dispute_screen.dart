import 'package:flutter/material.dart';
import '../../core/config/theme_config.dart';
import '../../core/services/api_client.dart';

class CreateDisputeScreen extends StatefulWidget {
  const CreateDisputeScreen({super.key});

  @override
  State<CreateDisputeScreen> createState() => _CreateDisputeScreenState();
}

class _CreateDisputeScreenState extends State<CreateDisputeScreen> {
  final _api = ApiClient();
  final _descriptionController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  List<Map<String, dynamic>> _bookings = [];
  String? _selectedBookingId;
  String _reason = 'WORKER_DID_NOT_ARRIVE';
  bool _isLoading = false;
  bool _loadingBookings = true;

  final _reasons = {
    'WORKER_DID_NOT_ARRIVE': "Worker didn't arrive",
    'CUSTOMER_DID_NOT_PAY': "Customer didn't pay",
    'SERVICE_NOT_AS_DESCRIBED': 'Service not as described',
    'DAMAGE_TO_PROPERTY': 'Damage to property',
    'OTHER': 'Other',
  };

  @override
  void initState() {
    super.initState();
    _loadBookings();
  }

  @override
  void dispose() {
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _loadBookings() async {
    try {
      final res = await _api.get('/api/bookings/my-bookings');
      if (mounted) {
        setState(() {
          _bookings = (res.data is List)
              ? List<Map<String, dynamic>>.from(res.data)
              : [];
          _loadingBookings = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loadingBookings = false);
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedBookingId == null) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Please select a booking')));
      return;
    }
    setState(() => _isLoading = true);
    try {
      await _api.post(
        '/api/disputes',
        data: {
          'bookingId': _selectedBookingId,
          'reason': _reason,
          'description': _descriptionController.text.trim(),
        },
      );
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Dispute submitted')));
        Navigator.pop(context);
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to submit dispute')),
        );
      }
    }
    if (mounted) setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Raise Dispute')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _loadingBookings
                  ? const Center(child: CircularProgressIndicator())
                  : DropdownButtonFormField<String>(
                      value: _selectedBookingId,
                      decoration: const InputDecoration(
                        labelText: 'Select Booking',
                      ),
                      items: _bookings.map((b) {
                        final service = b['service'] ?? {};
                        return DropdownMenuItem<String>(
                          value: b['id'],
                          child: Text(service['name'] ?? 'Booking ${b['id']}'),
                        );
                      }).toList(),
                      onChanged: (v) => setState(() => _selectedBookingId = v),
                    ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: _reason,
                decoration: const InputDecoration(labelText: 'Reason'),
                items: _reasons.entries
                    .map(
                      (e) =>
                          DropdownMenuItem(value: e.key, child: Text(e.value)),
                    )
                    .toList(),
                onChanged: (v) => setState(() => _reason = v!),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _descriptionController,
                decoration: const InputDecoration(
                  labelText: 'Description',
                  alignLabelWithHint: true,
                ),
                maxLines: 4,
                validator: (v) =>
                    v == null || v.trim().isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: 16),
              const Text(
                'Evidence (optional)',
                style: TextStyle(fontWeight: FontWeight.w500),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  _uploadButton(Icons.camera_alt, 'Camera'),
                  const SizedBox(width: 12),
                  _uploadButton(Icons.photo_library, 'Gallery'),
                ],
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _submit,
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Text('Submit Dispute'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _uploadButton(IconData icon, String label) {
    return GestureDetector(
      onTap: () {},
      child: Container(
        width: 100,
        height: 80,
        decoration: BoxDecoration(
          border: Border.all(
            color: AppTheme.textSecondary.withOpacity(0.3),
            style: BorderStyle.solid,
          ),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: AppTheme.primaryColor),
            const SizedBox(height: 4),
            Text(label, style: const TextStyle(fontSize: 12)),
          ],
        ),
      ),
    );
  }
}
