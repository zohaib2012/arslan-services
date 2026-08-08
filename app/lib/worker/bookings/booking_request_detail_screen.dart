import 'dart:async';
import 'package:flutter/material.dart';
import 'package:latlong2/latlong.dart';
import '../../core/services/api_client.dart';
import '../../core/config/theme_config.dart';
import '../../core/models/booking_model.dart';
import '../../core/widgets/app_map_widget.dart';

class BookingRequestDetailScreen extends StatefulWidget {
  final BookingModel booking;
  const BookingRequestDetailScreen({super.key, required this.booking});

  @override
  State<BookingRequestDetailScreen> createState() =>
      _BookingRequestDetailScreenState();
}

class _BookingRequestDetailScreenState
    extends State<BookingRequestDetailScreen> {
  final _api = ApiClient();
  late BookingModel _booking;
  Timer? _timer;
  Duration? _remaining;
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    _booking = widget.booking;
    if (_booking.expiryAt != null) _startTimer();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (_booking.expiryAt == null) return;
      final rem = _booking.expiryAt!.difference(DateTime.now());
      if (rem.isNegative) {
        _timer?.cancel();
        if (mounted) Navigator.pop(context);
      } else if (mounted) {
        setState(() => _remaining = rem);
      }
    });
  }

  Future<void> _accept() async {
    setState(() => _loading = true);
    try {
      await _api.post('/api/bookings/${_booking.id}/accept');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Request accepted'),
            backgroundColor: AppTheme.successColor,
            behavior: SnackBarBehavior.floating,
          ),
        );
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to accept'),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _reject() async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Reject Request'),
        content: const Text('Are you sure you want to reject this request?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(foregroundColor: AppTheme.errorColor),
            child: const Text('Reject'),
          ),
        ],
      ),
    );
    if (ok != true) return;

    setState(() => _loading = true);
    try {
      await _api.post('/api/bookings/${_booking.id}/reject');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Request rejected'),
            backgroundColor: AppTheme.errorColor,
            behavior: SnackBarBehavior.floating,
          ),
        );
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to reject'),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final customer = _booking.customer ?? {};
    final service = _booking.service ?? {};

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Request Detail',
          style: TextStyle(fontWeight: FontWeight.w700),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (_remaining != null) _buildCountdownTimer(),
            if (_remaining != null) const SizedBox(height: 20),
            _buildCustomerSection(customer),
            const SizedBox(height: 16),
            _buildServiceSection(service),
            const SizedBox(height: 16),
            _buildTypeCard(),
            const SizedBox(height: 16),
            _buildAddressCard(),
            if (_booking.customerNotes != null &&
                _booking.customerNotes!.isNotEmpty) ...[
              const SizedBox(height: 16),
              _buildNotesCard(),
            ],
            const SizedBox(height: 16),
            if (_booking.description.isNotEmpty) _buildDescriptionCard(),
            const SizedBox(height: 32),
            _buildActionButtons(),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildCountdownTimer() {
    if (_remaining == null) return const SizedBox.shrink();
    final isUrgent = _remaining!.inMinutes < 5;
    final color = isUrgent ? const Color(0xFFD32F2F) : const Color(0xFFF57C00);
    final mins = _remaining!.inMinutes;
    final secs = (_remaining!.inSeconds % 60).toString().padLeft(2, '0');

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 24),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withValues(alpha: 0.4), width: 2),
        boxShadow: [
          BoxShadow(
            color: color.withValues(alpha: 0.2),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.15),
              shape: BoxShape.circle,
            ),
            child: Icon(Icons.timer_rounded, size: 42, color: color),
          ),
          const SizedBox(height: 16),
          Text(
            '$mins:$secs',
            style: TextStyle(
              fontSize: 48,
              fontWeight: FontWeight.w800,
              color: color,
              letterSpacing: 2,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            isUrgent ? 'Hurry! Expiring soon' : 'Time remaining to respond',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: color,
              letterSpacing: 0.2,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCustomerSection(Map<String, dynamic> customer) {
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
            'Customer',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: AppTheme.textSecondary,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 12),
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
                    Text(
                      customer['fullName'] ?? 'Customer',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                    if (customer['phone'] != null) ...[
                      const SizedBox(height: 4),
                      Text(
                        customer['phone'],
                        style: const TextStyle(
                          fontSize: 14,
                          color: AppTheme.textSecondary,
                        ),
                      ),
                    ],
                    if (customer['email'] != null) ...[
                      const SizedBox(height: 2),
                      Text(
                        customer['email'],
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppTheme.textSecondary,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildServiceSection(Map<String, dynamic> service) {
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
            'Service',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: AppTheme.textSecondary,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            service['name'] ?? 'Service',
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: AppTheme.textPrimary,
            ),
          ),
          if (service['description'] != null) ...[
            const SizedBox(height: 6),
            Text(
              service['description'],
              style: const TextStyle(
                fontSize: 13,
                color: AppTheme.textSecondary,
              ),
            ),
          ],
          if (service['price'] != null) ...[
            const SizedBox(height: 8),
            Row(
              children: [
                Icon(
                  Icons.payments_outlined,
                  size: 16,
                  color: AppTheme.primaryColor,
                ),
                const SizedBox(width: 6),
                Text(
                  'Rs. ${service['price']}',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.primaryColor,
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildTypeCard() {
    final type = _booking.bookingType.toUpperCase();
    final isEmergency = type == 'EMERGENCY';
    final isScheduled = type == 'SCHEDULED';

    final Color color;
    final IconData icon;
    final String label;

    if (isEmergency) {
      color = const Color(0xFFD32F2F);
      icon = Icons.emergency_rounded;
      label = 'Emergency Booking';
    } else if (isScheduled) {
      color = const Color(0xFF7B1FA2);
      icon = Icons.schedule_rounded;
      label = 'Scheduled Booking';
    } else {
      color = const Color(0xFF0D47A1);
      icon = Icons.bolt_rounded;
      label = 'Instant Booking';
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withValues(alpha: 0.2)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.12),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, size: 22, color: color),
          ),
          const SizedBox(width: 14),
          Text(
            label,
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w700,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAddressCard() {
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
          const Row(
            children: [
              Icon(
                Icons.location_on_outlined,
                size: 18,
                color: AppTheme.primaryColor,
              ),
              SizedBox(width: 6),
              Text(
                'Location',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.textSecondary,
                  letterSpacing: 0.5,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            _booking.address,
            style: const TextStyle(fontSize: 14, color: AppTheme.textPrimary),
          ),
          const SizedBox(height: 12),
          if (_booking.latitude != 0 && _booking.longitude != 0)
            AppMapWidget(
              height: 180,
              center: LatLng(_booking.latitude, _booking.longitude),
              zoom: 14,
              markers: [
                AppMapMarker(
                  point: LatLng(_booking.latitude, _booking.longitude),
                ),
              ],
              showLocationButton: true,
            )
          else
            Container(
              height: 140,
              width: double.infinity,
              decoration: BoxDecoration(
                color: const Color(0xFFF5F5F5),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.map_outlined,
                      size: 40,
                      color: Color(0xFFBDBDBD),
                    ),
                    SizedBox(height: 6),
                    Text(
                      'No location available',
                      style: TextStyle(fontSize: 13, color: Color(0xFF9E9E9E)),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildNotesCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF8E1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: const Color(0xFFF5A623).withValues(alpha: 0.3),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.note_outlined, size: 18, color: Color(0xFFF5A623)),
              SizedBox(width: 6),
              Text(
                'Customer Notes',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFFF5A623),
                  letterSpacing: 0.5,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            _booking.customerNotes!,
            style: const TextStyle(fontSize: 14, color: AppTheme.textPrimary),
          ),
        ],
      ),
    );
  }

  Widget _buildDescriptionCard() {
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
            'Description',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: AppTheme.textSecondary,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            _booking.description.isNotEmpty
                ? _booking.description
                : 'No description provided',
            style: TextStyle(
              fontSize: 14,
              color: _booking.description.isNotEmpty
                  ? AppTheme.textPrimary
                  : AppTheme.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButtons() {
    return Column(
      children: [
        SizedBox(
          width: double.infinity,
          height: 56,
          child: ElevatedButton.icon(
            onPressed: _loading ? null : _accept,
            icon: const Icon(Icons.check_circle_outline, size: 22),
            label: _loading
                ? const SizedBox(
                    width: 24,
                    height: 24,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.white,
                    ),
                  )
                : const Text(
                    'Accept Request',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.2,
                    ),
                  ),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primaryColor,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              elevation: 4,
              shadowColor: AppTheme.primaryColor.withValues(alpha: 0.35),
            ),
          ),
        ),
        const SizedBox(height: 14),
        SizedBox(
          width: double.infinity,
          height: 56,
          child: OutlinedButton.icon(
            onPressed: _loading ? null : _reject,
            icon: const Icon(Icons.close_rounded, size: 20),
            label: const Text(
              'Reject Request',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                letterSpacing: 0.2,
              ),
            ),
            style: OutlinedButton.styleFrom(
              foregroundColor: AppTheme.errorColor,
              side: const BorderSide(color: AppTheme.errorColor, width: 1.5),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
