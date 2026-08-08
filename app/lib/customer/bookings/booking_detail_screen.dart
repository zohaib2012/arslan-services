import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import 'package:latlong2/latlong.dart';
import '../../core/config/theme_config.dart';
import '../../core/services/api_client.dart';
import '../../core/widgets/app_map_widget.dart';
import '../reviews/write_review_screen.dart';
import '../disputes/create_dispute_screen.dart';

class BookingDetailScreen extends StatefulWidget {
  final String bookingId;
  const BookingDetailScreen({super.key, required this.bookingId});

  @override
  State<BookingDetailScreen> createState() => _BookingDetailScreenState();
}

class _BookingDetailScreenState extends State<BookingDetailScreen> {
  final _api = ApiClient();
  Map<String, dynamic>? _booking;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadBooking();
  }

  Future<void> _loadBooking() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final res = await _api.get('/api/bookings/${widget.bookingId}');
      if (mounted) {
        setState(() {
          _booking = res.data as Map<String, dynamic>?;
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _error = 'Failed to load booking details';
        });
      }
    }
  }

  Future<void> _rescheduleBooking() async {
    final date = await showDatePicker(
      context: context,
      initialDate: DateTime.now().add(const Duration(days: 1)),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (date == null) return;
    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.now(),
    );
    if (time == null) return;
    final scheduledAt = DateTime(
      date.year,
      date.month,
      date.day,
      time.hour,
      time.minute,
    ).toIso8601String();
    try {
      await _api.put(
        '/api/bookings/${widget.bookingId}/reschedule',
        data: {'scheduledAt': scheduledAt},
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Booking rescheduled'),
            backgroundColor: AppTheme.successColor,
            behavior: SnackBarBehavior.floating,
          ),
        );
        _loadBooking();
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to reschedule'),
            backgroundColor: AppTheme.errorColor,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  Future<void> _cancelBooking() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        title: const Text('Cancel Booking'),
        content: const Text('Are you sure you want to cancel this booking?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text(
              'No',
              style: TextStyle(color: AppTheme.textSecondary),
            ),
          ),
          Container(
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppTheme.errorColor, Color(0xFFB71C1C)],
              ),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: () => Navigator.pop(ctx, true),
                borderRadius: BorderRadius.circular(12),
                child: const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                  child: Text(
                    'Yes, Cancel',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
    if (confirm != true) return;
    try {
      await _api.put('/api/bookings/${widget.bookingId}/cancel');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Booking cancelled'),
            backgroundColor: AppTheme.successColor,
            behavior: SnackBarBehavior.floating,
          ),
        );
        _loadBooking();
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to cancel booking'),
            backgroundColor: AppTheme.errorColor,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'PENDING':
        return AppTheme.warningColor;
      case 'ACCEPTED':
        return const Color(0xFF1565C0);
      case 'IN_PROGRESS':
        return AppTheme.primaryColor;
      case 'COMPLETED':
        return AppTheme.successColor;
      case 'CANCELLED':
      case 'DECLINED':
        return AppTheme.errorColor;
      default:
        return AppTheme.textSecondary;
    }
  }

  IconData _statusIcon(String status) {
    switch (status) {
      case 'PENDING':
        return Icons.hourglass_bottom;
      case 'ACCEPTED':
        return Icons.check_circle;
      case 'IN_PROGRESS':
        return Icons.pending_actions;
      case 'COMPLETED':
        return Icons.task_alt;
      case 'CANCELLED':
      case 'DECLINED':
        return Icons.cancel;
      default:
        return Icons.info;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      appBar: AppBar(
        title: const Text(
          'Booking Detail',
          style: TextStyle(fontWeight: FontWeight.w700),
        ),
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return _buildShimmer();
    }
    if (_error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: AppTheme.errorColor.withValues(alpha: 0.08),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.error_outline,
                  size: 48,
                  color: AppTheme.errorColor,
                ),
              ),
              const SizedBox(height: 16),
              Text(
                _error!,
                style: const TextStyle(
                  color: AppTheme.textSecondary,
                  fontSize: 15,
                ),
              ),
              const SizedBox(height: 16),
              GestureDetector(
                onTap: _loadBooking,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 24,
                    vertical: 12,
                  ),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [AppTheme.primaryColor, Color(0xFF008A42)],
                    ),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: const Text(
                    'Retry',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    }
    if (_booking == null) {
      return const Center(
        child: Text(
          'Booking not found',
          style: TextStyle(color: AppTheme.textSecondary),
        ),
      );
    }

    final b = _booking!;
    final worker = b['worker'] ?? {};
    final workerUser = worker['user'] ?? {};
    final service = b['service'] ?? {};
    final status = (b['status'] ?? 'PENDING').toString();
    final statusColor = _statusColor(status);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          _buildStatusBanner(status, statusColor),
          const SizedBox(height: 20),
          _buildWorkerCard(worker, workerUser),
          const SizedBox(height: 14),
          _buildInfoCard(service, b),
          const SizedBox(height: 14),
          _buildLocationTimeCard(b),
          const SizedBox(height: 20),
          _buildStatusTimeline(status),
          const SizedBox(height: 24),
          _buildActionButtons(status, workerUser, service),
          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildShimmer() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: List.generate(
          4,
          (i) => Padding(
            padding: const EdgeInsets.only(bottom: 14),
            child: Shimmer.fromColors(
              baseColor: Colors.grey.shade200,
              highlightColor: Colors.grey.shade100,
              child: Container(
                height: i == 0 ? 120 : 100,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatusBanner(String status, Color color) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            color.withValues(alpha: 0.08),
            color.withValues(alpha: 0.03),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withValues(alpha: 0.2), width: 1.5),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.12),
              shape: BoxShape.circle,
            ),
            child: Icon(_statusIcon(status), size: 36, color: color),
          ),
          const SizedBox(height: 12),
          Text(
            status.replaceAll('_', ' '),
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w800,
              color: color,
              letterSpacing: -0.3,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            _statusDescription(status),
            style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary),
          ),
        ],
      ),
    );
  }

  String _statusDescription(String status) {
    switch (status) {
      case 'PENDING':
        return 'Waiting for worker to accept';
      case 'ACCEPTED':
        return 'Worker has accepted your booking';
      case 'IN_PROGRESS':
        return 'Service is being provided';
      case 'COMPLETED':
        return 'Service has been completed';
      case 'CANCELLED':
        return 'Booking was cancelled';
      default:
        return '';
    }
  }

  Widget _buildWorkerCard(
    Map<String, dynamic> worker,
    Map<String, dynamic> user,
  ) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: _cardDecoration(),
      child: Row(
        children: [
          CircleAvatar(
            radius: 30,
            backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.06),
            backgroundImage: user['profilePhoto'] != null
                ? NetworkImage(user['profilePhoto'])
                : null,
            child: user['profilePhoto'] == null
                ? const Icon(
                    Icons.person,
                    size: 30,
                    color: AppTheme.primaryColor,
                  )
                : null,
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  user['fullName'] ?? 'Worker',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.textPrimary,
                  ),
                ),
                const SizedBox(height: 2),
                Row(
                  children: [
                    const Icon(
                      Icons.star_rounded,
                      size: 14,
                      color: AppTheme.accentColor,
                    ),
                    const SizedBox(width: 2),
                    Text(
                      '${worker['avgRating'] ?? 0} (${worker['totalReviews'] ?? 0} reviews)',
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppTheme.textSecondary,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          Column(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppTheme.primaryColor.withValues(alpha: 0.06),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(
                  Icons.chat_outlined,
                  color: AppTheme.primaryColor,
                  size: 20,
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                'Chat',
                style: TextStyle(fontSize: 10, color: AppTheme.textSecondary),
              ),
            ],
          ),
          const SizedBox(width: 8),
          Column(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppTheme.primaryColor.withValues(alpha: 0.06),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(
                  Icons.call_outlined,
                  color: AppTheme.primaryColor,
                  size: 20,
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                'Call',
                style: TextStyle(fontSize: 10, color: AppTheme.textSecondary),
              ),
            ],
          ),
        ],
      ),
    );
  }

  BoxDecoration _cardDecoration() {
    return BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(16),
      boxShadow: [
        BoxShadow(
          color: Colors.black.withValues(alpha: 0.04),
          blurRadius: 10,
          offset: const Offset(0, 3),
        ),
      ],
    );
  }

  Widget _buildInfoCard(Map<String, dynamic> service, Map<String, dynamic> b) {
    final bookingType = b['bookingType'] as String?;
    final typeIcons = {
      'INSTANT': Icons.bolt,
      'SCHEDULED': Icons.schedule,
      'EMERGENCY': Icons.warning_amber,
    };
    final typeColors = {
      'INSTANT': AppTheme.successColor,
      'SCHEDULED': const Color(0xFF1565C0),
      'EMERGENCY': AppTheme.errorColor,
    };

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: _cardDecoration(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _cardSectionTitle('Service & Booking Type'),
          const SizedBox(height: 12),
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppTheme.primaryColor.withValues(alpha: 0.06),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.handyman_outlined,
                  size: 20,
                  color: AppTheme.primaryColor,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  service['name'] ?? 'N/A',
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppTheme.textPrimary,
                  ),
                ),
              ),
            ],
          ),
          if (bookingType != null) ...[
            const SizedBox(height: 10),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: (typeColors[bookingType] ?? AppTheme.primaryColor)
                        .withValues(alpha: 0.06),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(
                    typeIcons[bookingType],
                    size: 20,
                    color: typeColors[bookingType] ?? AppTheme.primaryColor,
                  ),
                ),
                const SizedBox(width: 12),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 5,
                  ),
                  decoration: BoxDecoration(
                    color: (typeColors[bookingType] ?? AppTheme.primaryColor)
                        .withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    bookingType[0].toUpperCase() +
                        bookingType.substring(1).toLowerCase(),
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: typeColors[bookingType] ?? AppTheme.primaryColor,
                    ),
                  ),
                ),
              ],
            ),
          ],
          if (b['description'] != null &&
              b['description'].toString().isNotEmpty) ...[
            const SizedBox(height: 14),
            const Divider(),
            const SizedBox(height: 10),
            _cardSectionTitle('Description'),
            const SizedBox(height: 6),
            Text(
              b['description'],
              style: const TextStyle(
                fontSize: 13,
                color: AppTheme.textSecondary,
                height: 1.5,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildLocationTimeCard(Map<String, dynamic> b) {
    final lat = double.tryParse(b['latitude']?.toString() ?? '');
    final lng = double.tryParse(b['longitude']?.toString() ?? '');
    final hasLocation = lat != null && lng != null;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: _cardDecoration(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _cardSectionTitle('Location & Time'),
          const SizedBox(height: 12),
          if (hasLocation) ...[
            AppMapWidget(
              height: 180,
              center: LatLng(lat, lng),
              zoom: 14,
              markers: [AppMapMarker(point: LatLng(lat, lng))],
              showLocationButton: true,
            ),
            const SizedBox(height: 12),
          ],
          _infoRow(
            Icons.location_on_outlined,
            'Address',
            b['address'] ?? '',
            AppTheme.primaryColor,
          ),
          const SizedBox(height: 10),
          _infoRow(
            Icons.calendar_today_outlined,
            'Created',
            _formatDateTime(b['createdAt']),
            AppTheme.primaryColor,
          ),
          if (b['scheduledAt'] != null) ...[
            const SizedBox(height: 10),
            _infoRow(
              Icons.schedule_outlined,
              'Scheduled',
              _formatDateTime(b['scheduledAt']),
              const Color(0xFF1565C0),
            ),
          ],
        ],
      ),
    );
  }

  Widget _infoRow(IconData icon, String label, String value, Color color) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(6),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.06),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, size: 16, color: color),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: const TextStyle(
                  fontSize: 11,
                  color: AppTheme.textSecondary,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                value,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.textPrimary,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _cardSectionTitle(String title) {
    return Row(
      children: [
        Container(
          width: 3,
          height: 16,
          decoration: BoxDecoration(
            color: AppTheme.primaryColor,
            borderRadius: BorderRadius.circular(2),
          ),
        ),
        const SizedBox(width: 8),
        Text(
          title,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w700,
            color: AppTheme.textPrimary,
          ),
        ),
      ],
    );
  }

  Widget _buildStatusTimeline(String currentStatus) {
    final steps = [
      {'status': 'PENDING', 'label': 'Pending', 'icon': Icons.hourglass_bottom},
      {'status': 'ACCEPTED', 'label': 'Accepted', 'icon': Icons.check_circle},
      {
        'status': 'IN_PROGRESS',
        'label': 'In Progress',
        'icon': Icons.pending_actions,
      },
      {'status': 'COMPLETED', 'label': 'Completed', 'icon': Icons.task_alt},
    ];

    final currentIdx = steps.indexWhere((s) => s['status'] == currentStatus);

    if (currentStatus == 'CANCELLED' || currentStatus == 'DECLINED') {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: _cardDecoration(),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppTheme.errorColor.withValues(alpha: 0.08),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.cancel,
                color: AppTheme.errorColor,
                size: 28,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Booking Cancelled',
              style: TextStyle(
                fontWeight: FontWeight.w700,
                color: AppTheme.errorColor,
                fontSize: 15,
              ),
            ),
          ],
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: _cardDecoration(),
      child: Column(
        children: List.generate(steps.length, (i) {
          final isDone = currentIdx >= i;
          final isLast = i == steps.length - 1;
          final isActive = currentIdx == i;

          return Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(
                width: 28,
                child: Column(
                  children: [
                    AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      width: 28,
                      height: 28,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: isDone
                            ? AppTheme.primaryColor
                            : AppTheme.dividerColor,
                        boxShadow: isActive
                            ? [
                                BoxShadow(
                                  color: const Color(
                                    0xFF006837,
                                  ).withValues(alpha: 0.3),
                                  blurRadius: 6,
                                  offset: const Offset(0, 2),
                                ),
                              ]
                            : null,
                      ),
                      child: Icon(
                        isDone ? steps[i]['icon'] as IconData : Icons.circle,
                        size: 14,
                        color: Colors.white,
                      ),
                    ),
                    if (!isLast)
                      Container(
                        width: 2.5,
                        height: 36,
                        color: i < currentIdx
                            ? AppTheme.primaryColor
                            : AppTheme.dividerColor,
                      ),
                  ],
                ),
              ),
              const SizedBox(width: 14),
              Padding(
                padding: const EdgeInsets.only(top: 3),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      steps[i]['label'] as String,
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: isActive
                            ? FontWeight.w700
                            : FontWeight.w500,
                        color: isActive
                            ? AppTheme.primaryColor
                            : AppTheme.textSecondary,
                      ),
                    ),
                    if (isActive)
                      Container(
                        margin: const EdgeInsets.only(top: 2),
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: const Color(
                            0xFF006837,
                          ).withValues(alpha: 0.06),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Text(
                          'Current',
                          style: TextStyle(
                            fontSize: 10,
                            color: AppTheme.primaryColor,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ],
          );
        }),
      ),
    );
  }

  Widget _buildActionButtons(
    String status,
    Map<String, dynamic> workerUser,
    Map<String, dynamic> service,
  ) {
    final buttons = <Widget>[];

    if (status == 'PENDING' || status == 'ACCEPTED') {
      buttons.add(
        SizedBox(
          width: double.infinity,
          child: GestureDetector(
            onTap: _cancelBooking,
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 16),
              decoration: BoxDecoration(
                border: Border.all(
                  color: AppTheme.errorColor.withValues(alpha: 0.4),
                ),
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.cancel_outlined,
                    color: AppTheme.errorColor,
                    size: 20,
                  ),
                  SizedBox(width: 8),
                  Text(
                    'Cancel Booking',
                    style: TextStyle(
                      color: AppTheme.errorColor,
                      fontWeight: FontWeight.w700,
                      fontSize: 15,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      );
      buttons.add(const SizedBox(height: 10));
      buttons.add(
        SizedBox(
          width: double.infinity,
          child: GestureDetector(
            onTap: () => _rescheduleBooking(),
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 16),
              decoration: BoxDecoration(
                border: Border.all(color: AppTheme.dividerColor),
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.edit_calendar_outlined,
                    color: AppTheme.textPrimary,
                    size: 20,
                  ),
                  SizedBox(width: 8),
                  Text(
                    'Reschedule',
                    style: TextStyle(
                      color: AppTheme.textPrimary,
                      fontWeight: FontWeight.w700,
                      fontSize: 15,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      );
    }

    if (status == 'COMPLETED') {
      buttons.add(
        SizedBox(
          width: double.infinity,
          child: GestureDetector(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => WriteReviewScreen(
                    bookingId: widget.bookingId,
                    workerName: workerUser['fullName'] ?? 'Worker',
                    serviceName: service['name'],
                  ),
                ),
              );
            },
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [AppTheme.primaryColor, Color(0xFF008A42)],
                ),
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.primaryColor.withValues(alpha: 0.3),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.star_rounded, color: Colors.white, size: 20),
                  SizedBox(width: 8),
                  Text(
                    'Rate & Review',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w700,
                      fontSize: 15,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      );
      buttons.add(const SizedBox(height: 10));
    }

    buttons.add(
      SizedBox(
        width: double.infinity,
        child: GestureDetector(
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const CreateDisputeScreen()),
            );
          },
          child: Container(
            padding: const EdgeInsets.symmetric(vertical: 16),
            decoration: BoxDecoration(
              border: Border.all(color: AppTheme.dividerColor),
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.report_outlined,
                  color: AppTheme.errorColor,
                  size: 20,
                ),
                SizedBox(width: 8),
                Text(
                  'Raise Dispute',
                  style: TextStyle(
                    color: AppTheme.textPrimary,
                    fontWeight: FontWeight.w700,
                    fontSize: 15,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );

    return Column(children: buttons);
  }

  String _formatDateTime(String? dateStr) {
    if (dateStr == null) return 'N/A';
    final d = DateTime.tryParse(dateStr);
    if (d == null) return dateStr;
    final months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return '${d.day} ${months[d.month - 1]} ${d.year} at ${d.hour}:${d.minute.toString().padLeft(2, '0')}';
  }
}
