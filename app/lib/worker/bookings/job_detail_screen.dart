import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/services/api_client.dart';
import '../../core/config/theme_config.dart';
import '../../core/models/booking_model.dart';

class JobDetailScreen extends StatefulWidget {
  final BookingModel booking;
  const JobDetailScreen({super.key, required this.booking});

  @override
  State<JobDetailScreen> createState() => _JobDetailScreenState();
}

class _JobDetailScreenState extends State<JobDetailScreen> {
  final _api = ApiClient();
  late BookingModel _booking;
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    _booking = widget.booking;
  }

  Future<void> _completeJob() async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Mark Complete'),
        content: const Text('Confirm this job as completed?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(foregroundColor: AppTheme.primaryColor),
            child: const Text('Complete'),
          ),
        ],
      ),
    );
    if (ok != true) return;

    setState(() => _loading = true);
    try {
      await _api.post('/api/bookings/${_booking.id}/complete');
      setState(() {
        _booking = BookingModel(
          id: _booking.id,
          customerId: _booking.customerId,
          workerId: _booking.workerId,
          serviceId: _booking.serviceId,
          bookingType: _booking.bookingType,
          status: 'COMPLETED',
          description: _booking.description,
          scheduledAt: _booking.scheduledAt,
          address: _booking.address,
          latitude: _booking.latitude,
          longitude: _booking.longitude,
          customerNotes: _booking.customerNotes,
          expiryAt: _booking.expiryAt,
          createdAt: _booking.createdAt,
          customer: _booking.customer,
          worker: _booking.worker,
          service: _booking.service,
        );
        _loading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Job completed'),
            backgroundColor: AppTheme.successColor,
            behavior: SnackBarBehavior.floating,
          ),
        );
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (mounted) {
        setState(() => _loading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to complete job'),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  Future<void> _raiseDispute() async {
    final reasonCtl = TextEditingController();
    final reason = await showDialog<String>(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Raise Dispute'),
        content: TextField(
          controller: reasonCtl,
          maxLines: 4,
          decoration: const InputDecoration(
            hintText: 'Describe the issue...',
            border: OutlineInputBorder(),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, reasonCtl.text.trim()),
            child: const Text('Submit'),
          ),
        ],
      ),
    );
    if (reason == null || reason.isEmpty) return;

    setState(() => _loading = true);
    try {
      await _api.post(
        '/api/disputes',
        data: {'bookingId': _booking.id, 'reason': reason},
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Dispute raised'),
            backgroundColor: AppTheme.warningColor,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to raise dispute'),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _launchUrl(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) await launchUrl(uri);
  }

  @override
  Widget build(BuildContext context) {
    final customer = _booking.customer ?? {};
    final service = _booking.service ?? {};
    final phone = customer['phone'] ?? '';
    final canComplete = [
      'ACCEPTED',
      'IN_PROGRESS',
      'EN_ROUTE',
    ].contains(_booking.status);

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Job Detail',
          style: TextStyle(fontWeight: FontWeight.w700),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildStatusBanner(),
            const SizedBox(height: 16),
            _buildCustomerCard(customer, phone),
            const SizedBox(height: 16),
            _buildDetailsCard(service),
            const SizedBox(height: 20),
            if (canComplete) ...[
              _buildActionButton(
                'Mark as Completed',
                AppTheme.primaryColor,
                _loading ? null : _completeJob,
                Icons.check_circle_outline,
              ),
              const SizedBox(height: 10),
            ],
            _buildOutlinedButton(
              'Raise Dispute',
              AppTheme.errorColor,
              _loading ? null : _raiseDispute,
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusBanner() {
    final (color, icon, label) = _statusData(_booking.status);
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 16),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.15),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, size: 20, color: color),
          ),
          const SizedBox(width: 10),
          Text(
            label,
            style: TextStyle(
              fontSize: 17,
              fontWeight: FontWeight.w700,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  (Color, IconData, String) _statusData(String status) {
    return switch (status) {
      'PENDING' => (const Color(0xFFF57C00), Icons.hourglass_empty, 'Pending'),
      'ACCEPTED' => (const Color(0xFF1565C0), Icons.thumb_up_alt, 'Accepted'),
      'IN_PROGRESS' => (
        const Color(0xFFE65100),
        Icons.engineering,
        'In Progress',
      ),
      'EN_ROUTE' => (const Color(0xFF7B1FA2), Icons.directions_car, 'En Route'),
      'COMPLETED' => (const Color(0xFF2E7D32), Icons.check_circle, 'Completed'),
      'CANCELLED' => (const Color(0xFFC62828), Icons.cancel, 'Cancelled'),
      _ => (const Color(0xFF757575), Icons.info, status),
    };
  }

  Widget _buildCustomerCard(Map<String, dynamic> customer, String phone) {
    final isVerified = customer['phoneVerified'] == true;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: const Color(0xFFE8F5E9), width: 2),
                ),
                child: CircleAvatar(
                  radius: 30,
                  backgroundColor: const Color(0xFFE8F5E9),
                  backgroundImage: customer['profilePhoto'] != null
                      ? NetworkImage(customer['profilePhoto'])
                      : null,
                  child: customer['profilePhoto'] == null
                      ? Text(
                          (customer['fullName'] ?? 'C')[0].toUpperCase(),
                          style: TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w700,
                            color: AppTheme.primaryColor,
                          ),
                        )
                      : null,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Flexible(
                          child: Text(
                            customer['fullName'] ?? 'Customer',
                            style: const TextStyle(
                              fontSize: 17,
                              fontWeight: FontWeight.w700,
                              color: AppTheme.textPrimary,
                            ),
                          ),
                        ),
                        if (isVerified) ...[
                          const SizedBox(width: 6),
                          const Icon(
                            Icons.verified,
                            size: 16,
                            color: Color(0xFF1565C0),
                          ),
                        ],
                      ],
                    ),
                    if (phone.isNotEmpty) ...[
                      const SizedBox(height: 4),
                      Text(
                        phone,
                        style: const TextStyle(
                          fontSize: 14,
                          color: AppTheme.textSecondary,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              _contactBtn(Icons.chat_rounded, 'Chat', () {
                final cid = customer['id'] ?? _booking.customerId;
                Navigator.pushNamed(
                  context,
                  '/worker-chat',
                  arguments: {'userId': cid, 'userName': customer['fullName']},
                );
              }),
              const SizedBox(width: 8),
              _contactBtn(Icons.call_rounded, 'Call', () {
                if (phone.isNotEmpty) _launchUrl('tel:$phone');
              }),
              const SizedBox(width: 8),
              _contactBtn(Icons.wechat_rounded, 'WhatsApp', () {
                if (phone.isNotEmpty) _launchUrl('https://wa.me/$phone');
              }),
            ],
          ),
        ],
      ),
    );
  }

  Widget _contactBtn(IconData icon, String label, VoidCallback onTap) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: const Color(0xFFE8F5E9),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            children: [
              Icon(icon, size: 20, color: AppTheme.primaryColor),
              const SizedBox(height: 4),
              Text(
                label,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.primaryColor,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDetailsCard(Map<String, dynamic> service) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Booking Details',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: AppTheme.textPrimary,
            ),
          ),
          const SizedBox(height: 14),
          _row('Service', service['name'] ?? 'N/A'),
          _row('Type', _booking.bookingType),
          _row('Status', _booking.status),
          _row(
            'Date',
            DateFormat('MMM dd, yyyy  hh:mm a').format(_booking.createdAt),
          ),
          _row('Address', _booking.address),
          if (_booking.description.isNotEmpty)
            _row('Description', _booking.description),
          if (_booking.customerNotes != null &&
              _booking.customerNotes!.isNotEmpty)
            _row('Notes', _booking.customerNotes!),
          const SizedBox(height: 8),
          Row(
            children: [
              const Icon(
                Icons.location_on_outlined,
                size: 16,
                color: AppTheme.primaryColor,
              ),
              const SizedBox(width: 6),
              const Text(
                'Map',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: AppTheme.textSecondary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Container(
            height: 130,
            width: double.infinity,
            decoration: BoxDecoration(
              color: const Color(0xFFF5F5F5),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.map_outlined, size: 36, color: Color(0xFFBDBDBD)),
                  SizedBox(height: 4),
                  Text(
                    'Map View',
                    style: TextStyle(fontSize: 12, color: Color(0xFF9E9E9E)),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _row(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 110,
            child: Text(
              label,
              style: const TextStyle(
                fontSize: 13,
                color: AppTheme.textSecondary,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontSize: 13, color: AppTheme.textPrimary),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton(
    String label,
    Color color,
    VoidCallback? onPressed,
    IconData icon,
  ) {
    return SizedBox(
      width: double.infinity,
      height: 52,
      child: ElevatedButton.icon(
        onPressed: onPressed,
        icon: onPressed != null ? Icon(icon, size: 20) : null,
        label: _loading && onPressed == null
            ? const SizedBox(
                width: 22,
                height: 22,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: Colors.white,
                ),
              )
            : Text(
                label,
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                ),
              ),
        style: ElevatedButton.styleFrom(
          backgroundColor: color,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
          elevation: 2,
        ),
      ),
    );
  }

  Widget _buildOutlinedButton(
    String label,
    Color color,
    VoidCallback? onPressed,
  ) {
    return SizedBox(
      width: double.infinity,
      height: 52,
      child: OutlinedButton(
        onPressed: onPressed,
        style: OutlinedButton.styleFrom(
          foregroundColor: color,
          side: BorderSide(color: color),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
        ),
        child: Text(
          label,
          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
        ),
      ),
    );
  }
}
