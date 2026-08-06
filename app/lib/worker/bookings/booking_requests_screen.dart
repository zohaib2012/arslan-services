import 'dart:async';
import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import '../../core/services/api_client.dart';
import '../../core/config/theme_config.dart';
import '../../core/models/booking_model.dart';
import 'booking_request_detail_screen.dart';
import 'my_jobs_screen.dart';

class BookingRequestsScreen extends StatefulWidget {
  const BookingRequestsScreen({super.key});

  @override
  State<BookingRequestsScreen> createState() => _BookingRequestsScreenState();
}

class _BookingRequestsScreenState extends State<BookingRequestsScreen> {
  final _api = ApiClient();

  bool _isLoading = true;
  String? _error;
  List<BookingModel> _requests = [];
  final Map<String, Timer> _timers = {};
  final Map<String, Duration> _remaining = {};

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    for (final t in _timers.values) t.cancel();
    super.dispose();
  }

  Future<void> _load() async {
    if (!mounted) return;
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final res = await _api.get(
        '/api/workers/me/bookings',
        params: {'status': 'PENDING'},
      );
      final data = res.data;
      final list = (data is List)
          ? data
          : (data['bookings'] ?? data['data'] ?? []);
      final bookings = (list as List)
          .map((j) => BookingModel.fromJson(j))
          .toList();

      for (final t in _timers.values) t.cancel();
      _timers.clear();
      _remaining.clear();

      for (final b in bookings) {
        if (b.expiryAt != null) _startTimer(b.id, b.expiryAt!);
      }

      if (!mounted) return;
      setState(() {
        _requests = bookings;
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _error = 'Failed to load requests. Pull to retry.';
      });
    }
  }

  void _startTimer(String id, DateTime expiry) {
    _timers[id]?.cancel();
    _timers[id] = Timer.periodic(const Duration(seconds: 1), (_) {
      final rem = expiry.difference(DateTime.now());
      if (rem.isNegative) {
        _timers[id]?.cancel();
        _load();
      } else if (mounted) {
        setState(() => _remaining[id] = rem);
      }
    });
  }

  Future<void> _accept(String bookingId) async {
    try {
      await _api.post('/api/bookings/$bookingId/accept');
      _load();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Request accepted'),
            backgroundColor: AppTheme.successColor,
            behavior: SnackBarBehavior.floating,
          ),
        );
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
    }
  }

  Future<void> _reject(String bookingId) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Reject Request'),
        content: const Text('Are you sure you want to reject?'),
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
    if (confirmed != true) return;

    try {
      await _api.post('/api/bookings/$bookingId/reject');
      _load();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Request rejected'),
            backgroundColor: AppTheme.errorColor,
            behavior: SnackBarBehavior.floating,
          ),
        );
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
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Booking Requests',
          style: TextStyle(fontWeight: FontWeight.w700),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.work_history_rounded),
            tooltip: 'My Jobs',
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const MyJobsScreen()),
            ),
          ),
        ],
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) return _buildShimmer();
    if (_error != null) return _buildError();

    return RefreshIndicator(
      onRefresh: _load,
      color: AppTheme.primaryColor,
      child: _requests.isEmpty
          ? _buildEmptyState()
          : ListView.separated(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
              itemCount: _requests.length,
              separatorBuilder: (_, _a) => const SizedBox(height: 12),
              itemBuilder: (_, i) => _buildCard(_requests[i]),
            ),
    );
  }

  Widget _buildCard(BookingModel booking) {
    final customer = booking.customer ?? {};
    final service = booking.service ?? {};
    final rem = _remaining[booking.id];
    final customerName = customer['fullName'] ?? 'Customer';
    final customerPhoto = customer['profilePhoto'];
    final serviceName = service['name'] ?? 'Service';

    return GestureDetector(
      onTap: () async {
        await Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => BookingRequestDetailScreen(booking: booking),
          ),
        );
        _load();
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.06),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: const Color(0xFFE8F5E9),
                      width: 2,
                    ),
                  ),
                  child: CircleAvatar(
                    radius: 22,
                    backgroundColor: const Color(0xFFE8F5E9),
                    backgroundImage: customerPhoto != null
                        ? NetworkImage(customerPhoto)
                        : null,
                    child: customerPhoto == null
                        ? Text(
                            customerName[0].toUpperCase(),
                            style: TextStyle(
                              color: AppTheme.primaryColor,
                              fontWeight: FontWeight.w700,
                            ),
                          )
                        : null,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        customerName,
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: AppTheme.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        serviceName,
                        style: const TextStyle(
                          fontSize: 13,
                          color: AppTheme.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
                _buildTypeBadge(booking.bookingType),
              ],
            ),
            if (booking.description.isNotEmpty) ...[
              const SizedBox(height: 10),
              Text(
                booking.description,
                style: const TextStyle(
                  fontSize: 13,
                  color: AppTheme.textSecondary,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
            if (rem != null) ...[
              const SizedBox(height: 10),
              _buildTimerBadge(rem),
            ],
            const SizedBox(height: 14),
            Row(
              children: [
                Expanded(
                  child: SizedBox(
                    height: 44,
                    child: ElevatedButton(
                      onPressed: () => _accept(booking.id),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primaryColor,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        elevation: 2,
                      ),
                      child: const Text(
                        'Accept',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: SizedBox(
                    height: 44,
                    child: OutlinedButton(
                      onPressed: () => _reject(booking.id),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppTheme.errorColor,
                        side: const BorderSide(color: AppTheme.errorColor),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Text(
                        'Reject',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTimerBadge(Duration rem) {
    final isUrgent = rem.inMinutes < 5;
    final color = isUrgent ? const Color(0xFFD32F2F) : const Color(0xFFF57C00);
    final mins = rem.inMinutes;
    final secs = (rem.inSeconds % 60).toString().padLeft(2, '0');

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.timer_outlined, size: 16, color: color),
          const SizedBox(width: 6),
          Text(
            '$mins:$secs remaining',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: color,
            ),
          ),
          if (isUrgent)
            Text('  ⏳', style: TextStyle(fontSize: 12, color: color)),
        ],
      ),
    );
  }

  Widget _buildTypeBadge(String type) {
    final upper = type.toUpperCase();
    final isEmergency = upper == 'EMERGENCY';
    final isScheduled = upper == 'SCHEDULED';
    final Color color;
    final String label;
    if (isEmergency) {
      color = const Color(0xFFD32F2F);
      label = 'Emergency';
    } else if (isScheduled) {
      color = const Color(0xFF7B1FA2);
      label = 'Scheduled';
    } else {
      color = const Color(0xFF0D47A1);
      label = 'Instant';
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w700,
          color: color,
          letterSpacing: 0.3,
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: const Color(0xFFE8F5E9),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.inbox_outlined,
              size: 48,
              color: Color(0xFF81C784),
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'No pending requests',
            style: TextStyle(
              fontSize: 17,
              fontWeight: FontWeight.w600,
              color: AppTheme.textPrimary,
            ),
          ),
          const SizedBox(height: 4),
          const Text(
            'New booking requests will appear here',
            style: TextStyle(fontSize: 13, color: AppTheme.textSecondary),
          ),
        ],
      ),
    );
  }

  Widget _buildError() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: const BoxDecoration(
                color: Color(0xFFFFF3E0),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.wifi_off_rounded,
                size: 44,
                color: Color(0xFFE65100),
              ),
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
            const SizedBox(height: 20),
            ElevatedButton.icon(
              onPressed: _load,
              icon: const Icon(Icons.refresh_rounded, size: 18),
              label: const Text('Retry'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryColor,
                padding: const EdgeInsets.symmetric(
                  horizontal: 24,
                  vertical: 12,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildShimmer() {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
      child: Shimmer.fromColors(
        baseColor: Colors.grey.shade200,
        highlightColor: Colors.grey.shade50,
        child: Column(
          children: List.generate(
            4,
            (_) => Container(
              margin: const EdgeInsets.only(bottom: 12),
              height: 190,
              width: double.infinity,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
