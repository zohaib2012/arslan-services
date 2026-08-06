import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import '../../core/config/theme_config.dart';
import '../../core/services/api_client.dart';
import 'booking_detail_screen.dart';

class MyBookingsScreen extends StatefulWidget {
  final String? initialFilter;
  const MyBookingsScreen({super.key, this.initialFilter});

  @override
  State<MyBookingsScreen> createState() => _MyBookingsScreenState();
}

class _MyBookingsScreenState extends State<MyBookingsScreen>
    with SingleTickerProviderStateMixin {
  final _api = ApiClient();
  late TabController _tabController;

  static const List<String> _tabs = ['All', 'Active', 'Completed', 'Cancelled'];
  static const Map<String, String> _statusMap = {
    'All': '',
    'Active': 'active',
    'Completed': 'completed',
    'Cancelled': 'cancelled',
  };

  final Map<String, List<Map<String, dynamic>>> _bookings = {};
  final Map<String, bool> _isLoading = {};
  final Map<String, bool> _hasError = {};
  int _initialTabIndex = 0;

  @override
  void initState() {
    super.initState();
    if (widget.initialFilter != null) {
      _initialTabIndex = _tabs.indexOf(widget.initialFilter!);
      if (_initialTabIndex < 0) _initialTabIndex = 0;
    }
    _tabController = TabController(
      length: _tabs.length,
      vsync: this,
      initialIndex: _initialTabIndex,
    );
    for (final tab in _tabs) {
      _bookings[tab] = [];
      _isLoading[tab] = true;
      _hasError[tab] = false;
    }
    _loadBookings(_tabs[_initialTabIndex]);
    _tabController.addListener(() {
      if (!_tabController.indexIsChanging) {
        final tab = _tabs[_tabController.index];
        if (_bookings[tab]!.isEmpty &&
            _isLoading[tab] == false &&
            !_hasError[tab]!) {
          _loadBookings(tab);
        }
      }
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadBookings(String tab) async {
    setState(() {
      _isLoading[tab] = true;
      _hasError[tab] = false;
    });
    try {
      final params = <String, String>{};
      final status = _statusMap[tab];
      if (status != null && status.isNotEmpty) {
        params['status'] = status;
      }
      final res = await _api.get('/api/bookings', params: params);
      if (mounted) {
        setState(() {
          _bookings[tab] = (res.data is List)
              ? List<Map<String, dynamic>>.from(res.data)
              : [];
          _isLoading[tab] = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _isLoading[tab] = false;
          _hasError[tab] = true;
        });
      }
    }
  }

  Color _statusColor(String status) {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return AppTheme.warningColor;
      case 'ACCEPTED':
      case 'IN_PROGRESS':
        return const Color(0xFF1565C0);
      case 'COMPLETED':
        return AppTheme.successColor;
      case 'CANCELLED':
      case 'DECLINED':
        return AppTheme.errorColor;
      case 'EXPIRED':
        return AppTheme.textSecondary;
      default:
        return AppTheme.warningColor;
    }
  }

  IconData _statusIcon(String status) {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return Icons.hourglass_empty;
      case 'ACCEPTED':
        return Icons.check_circle_outline;
      case 'IN_PROGRESS':
        return Icons.pending_actions;
      case 'COMPLETED':
        return Icons.task_alt_rounded;
      case 'CANCELLED':
        return Icons.cancel_outlined;
      case 'DECLINED':
        return Icons.do_not_disturb_alt_outlined;
      case 'EXPIRED':
        return Icons.timer_off_outlined;
      default:
        return Icons.info_outline;
    }
  }

  IconData _bookingTypeIcon(String? type) {
    switch (type?.toUpperCase()) {
      case 'INSTANT':
        return Icons.bolt;
      case 'SCHEDULED':
        return Icons.schedule;
      case 'EMERGENCY':
        return Icons.warning_amber;
      default:
        return Icons.bolt;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      appBar: AppBar(
        title: const Text(
          'My Bookings',
          style: TextStyle(fontWeight: FontWeight.w700, fontSize: 18),
        ),
      ),
      body: Column(
        children: [
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.04),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(14),
              child: TabBar(
                controller: _tabController,
                labelColor: Colors.white,
                unselectedLabelColor: AppTheme.textSecondary,
                indicator: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AppTheme.primaryColor, Color(0xFF008A42)],
                  ),
                  borderRadius: BorderRadius.circular(12),
                ),
                indicatorSize: TabBarIndicatorSize.tab,
                dividerColor: Colors.transparent,
                labelStyle: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                ),
                unselectedLabelStyle: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                ),
                padding: const EdgeInsets.all(4),
                tabs: _tabs.map((t) => Tab(text: t)).toList(),
                onTap: (i) {
                  final tab = _tabs[i];
                  if (_bookings[tab]!.isEmpty &&
                      _isLoading[tab] == false &&
                      !_hasError[tab]!) {
                    _loadBookings(tab);
                  }
                },
              ),
            ),
          ),
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: _tabs.map((tab) {
                if (_isLoading[tab] == true) return _buildShimmer();
                if (_hasError[tab] == true) return _buildErrorTab(tab);
                if (_bookings[tab]!.isEmpty) return _buildEmptyTab(tab);
                return RefreshIndicator(
                  color: AppTheme.primaryColor,
                  onRefresh: () => _loadBookings(tab),
                  child: ListView.builder(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 8,
                    ),
                    itemCount: _bookings[tab]!.length,
                    itemBuilder: (_, i) =>
                        _buildBookingCard(_bookings[tab]![i]),
                  ),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildShimmer() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: 4,
      itemBuilder: (_, __) => Padding(
        padding: const EdgeInsets.only(bottom: 12),
        child: Shimmer.fromColors(
          baseColor: Colors.grey.shade200,
          highlightColor: Colors.grey.shade100,
          child: Container(
            height: 120,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildErrorTab(String tab) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.errorColor.withValues(alpha: 0.08),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.cloud_off_rounded,
                size: 40,
                color: AppTheme.errorColor,
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Failed to load bookings',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: AppTheme.textPrimary,
              ),
            ),
            const SizedBox(height: 16),
            GestureDetector(
              onTap: () => _loadBookings(tab),
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

  Widget _buildEmptyTab(String tab) {
    final icons = {
      'All': Icons.inbox_outlined,
      'Active': Icons.pending_actions_outlined,
      'Completed': Icons.task_alt_outlined,
      'Cancelled': Icons.cancel_outlined,
    };
    final messages = {
      'All': 'No bookings yet',
      'Active': 'No active bookings',
      'Completed': 'No completed bookings',
      'Cancelled': 'No cancelled bookings',
    };
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: AppTheme.backgroundColor,
                shape: BoxShape.circle,
              ),
              child: Icon(
                icons[tab] ?? Icons.inbox_outlined,
                size: 48,
                color: AppTheme.textSecondary.withValues(alpha: 0.6),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              messages[tab] ?? 'No bookings',
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: AppTheme.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBookingCard(Map<String, dynamic> booking) {
    final worker = booking['worker'] ?? {};
    final workerUser = worker['user'] ?? {};
    final service = booking['service'] ?? {};
    final status = (booking['status'] ?? 'PENDING').toString();
    final statusColor = _statusColor(status);
    final bookingType = booking['bookingType'] as String?;

    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => BookingDetailScreen(bookingId: booking['id']),
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 8,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            children: [
              Stack(
                children: [
                  Container(
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: AppTheme.primaryColor.withValues(alpha: 0.1),
                          blurRadius: 6,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: CircleAvatar(
                      radius: 28,
                      backgroundColor: AppTheme.primaryColor.withValues(
                        alpha: 0.06,
                      ),
                      backgroundImage: workerUser['profilePhoto'] != null
                          ? NetworkImage(workerUser['profilePhoto'])
                          : null,
                      child: workerUser['profilePhoto'] == null
                          ? const Icon(
                              Icons.person,
                              size: 28,
                              color: AppTheme.primaryColor,
                            )
                          : null,
                    ),
                  ),
                  if (worker['verificationStatus'] == 'VERIFIED')
                    const Positioned(
                      bottom: 0,
                      right: 0,
                      child: Icon(
                        Icons.verified,
                        size: 16,
                        color: AppTheme.primaryColor,
                      ),
                    ),
                ],
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            workerUser['fullName'] ?? 'Worker',
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                              color: AppTheme.textPrimary,
                            ),
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 5,
                          ),
                          decoration: BoxDecoration(
                            color: statusColor.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                _statusIcon(status),
                                size: 14,
                                color: statusColor,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                status[0].toUpperCase() +
                                    status.substring(1).toLowerCase(),
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                  color: statusColor,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Icon(
                          _bookingTypeIcon(bookingType),
                          size: 13,
                          color: AppTheme.textSecondary,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          service['name'] ?? 'Service',
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppTheme.textSecondary,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(
                          Icons.location_on_outlined,
                          size: 13,
                          color: AppTheme.textSecondary,
                        ),
                        const SizedBox(width: 3),
                        Expanded(
                          child: Text(
                            booking['address'] ?? '',
                            style: const TextStyle(
                              fontSize: 11,
                              color: AppTheme.textSecondary,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 3),
                    Row(
                      children: [
                        const Icon(
                          Icons.calendar_today_outlined,
                          size: 12,
                          color: AppTheme.textSecondary,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          _formatDate(booking['createdAt']),
                          style: const TextStyle(
                            fontSize: 11,
                            color: AppTheme.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _formatDate(String? dateStr) {
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
    return '${d.day} ${months[d.month - 1]} ${d.year}';
  }
}
