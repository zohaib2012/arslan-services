import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import '../../core/services/api_client.dart';
import '../../core/config/theme_config.dart';
import '../bookings/booking_requests_screen.dart';

class WorkerDashboard extends StatefulWidget {
  const WorkerDashboard({super.key});

  @override
  State<WorkerDashboard> createState() => _WorkerDashboardState();
}

class _WorkerDashboardState extends State<WorkerDashboard> {
  final _api = ApiClient();

  bool _isLoading = true;
  String? _error;
  String _workerName = 'Worker';

  bool _isOnline = false;
  int _todayBookings = 0;
  int _pendingCount = 0;
  int _completedCount = 0;
  double _totalEarnings = 0;
  List<Map<String, dynamic>> _newRequests = [];
  List<Map<String, dynamic>> _recentActivity = [];

  static const _accentGold = Color(0xFFF5A623);

  @override
  void initState() {
    super.initState();
    _fetchDashboard();
  }

  Future<void> _fetchDashboard() async {
    if (!mounted) return;
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final res = await _api.get('/api/workers/me/stats');
      final data = res.data as Map<String, dynamic>;
      if (!mounted) return;
      setState(() {
        _workerName = data['fullName'] ?? data['name'] ?? 'Worker';
        _isOnline = data['isOnline'] ?? false;
        _todayBookings = data['todayBookings'] ?? 0;
        _pendingCount = data['pendingCount'] ?? 0;
        _completedCount = data['completedCount'] ?? 0;
        _totalEarnings =
            double.tryParse((data['totalEarnings'] ?? 0).toString()) ?? 0;
        _newRequests = List<Map<String, dynamic>>.from(
          data['newRequests'] ?? [],
        );
        _recentActivity = List<Map<String, dynamic>>.from(
          data['recentActivity'] ?? [],
        );
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _error = 'Failed to load dashboard. Pull to retry.';
      });
    }
  }

  Future<void> _toggleOnline(bool value) async {
    try {
      await _api.put(
        '/api/workers/me/online-status',
        data: {'isOnline': value},
      );
      if (mounted) setState(() => _isOnline = value);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to update online status'),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  String _greeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(body: SafeArea(child: _buildBody()));
  }

  Widget _buildBody() {
    if (_isLoading) return _buildShimmer();
    if (_error != null) return _buildError();

    return RefreshIndicator(
      onRefresh: _fetchDashboard,
      color: AppTheme.primaryColor,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildHeader(),
            const SizedBox(height: 20),
            _buildOnlineCard(),
            const SizedBox(height: 22),
            _buildStatsRow(),
            const SizedBox(height: 26),
            _buildNewRequestsSection(),
            const SizedBox(height: 26),
            _buildRecentActivity(),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Row(
      children: [
        Container(
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(color: const Color(0xFFE8F5E9), width: 3),
            boxShadow: [
              BoxShadow(
                color: AppTheme.primaryColor.withValues(alpha: 0.15),
                blurRadius: 12,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: CircleAvatar(
            radius: 26,
            backgroundColor: const Color(0xFFE8F5E9),
            child: Text(
              _workerName.isNotEmpty ? _workerName[0].toUpperCase() : 'W',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w700,
                color: AppTheme.primaryColor,
              ),
            ),
          ),
        ),
        const SizedBox(width: 14),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '${_greeting()},',
              style: TextStyle(
                fontSize: 15,
                color: AppTheme.textSecondary.withValues(alpha: 0.85),
                fontWeight: FontWeight.w400,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              _workerName,
              style: const TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w800,
                color: AppTheme.textPrimary,
                letterSpacing: -0.3,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildOnlineCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: _isOnline
              ? [AppTheme.primaryColor, Color(0xFF4CAF50)]
              : const [Color(0xFF607D8B), Color(0xFF78909C)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: (_isOnline ? AppTheme.primaryColor : const Color(0xFF607D8B))
                .withValues(alpha: 0.35),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 15,
            height: 15,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: _isOnline
                  ? const Color(0xFF81C784)
                  : const Color(0xFFB0BEC5),
              boxShadow: [
                BoxShadow(
                  color:
                      (_isOnline
                              ? const Color(0xFF81C784)
                              : const Color(0xFFB0BEC5))
                          .withValues(alpha: 0.7),
                  blurRadius: 10,
                  spreadRadius: 2,
                ),
              ],
            ),
          ),
          const SizedBox(width: 14),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                _isOnline ? "You're Online" : "You're Offline",
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 17,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                _isOnline
                    ? 'Receiving booking requests'
                    : 'Go online to receive requests',
                style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.8),
                  fontSize: 13,
                ),
              ),
            ],
          ),
          const Spacer(),
          Switch.adaptive(
            value: _isOnline,
            onChanged: _toggleOnline,
            activeThumbColor: Colors.white,
            activeTrackColor: Colors.white.withValues(alpha: 0.3),
            inactiveThumbColor: Colors.white,
            inactiveTrackColor: Colors.white.withValues(alpha: 0.15),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsRow() {
    return Row(
      children: [
        _buildStatCard(
          'Today',
          '$_todayBookings',
          Icons.calendar_today_rounded,
          AppTheme.primaryColor,
          const Color(0xFFE8F5E9),
        ),
        const SizedBox(width: 10),
        _buildStatCard(
          'Pending',
          '$_pendingCount',
          Icons.hourglass_bottom_rounded,
          _accentGold,
          const Color(0xFFFFF8E1),
        ),
        const SizedBox(width: 10),
        _buildStatCard(
          'Done',
          '$_completedCount',
          Icons.verified_rounded,
          AppTheme.successColor,
          const Color(0xFFE8F5E9),
        ),
        const SizedBox(width: 10),
        _buildStatCard(
          'Earnings',
          _totalEarnings.toStringAsFixed(0),
          Icons.payments_rounded,
          const Color(0xFF005B8F),
          const Color(0xFFE3F2FD),
        ),
      ],
    );
  }

  Widget _buildStatCard(
    String label,
    String value,
    IconData icon,
    Color color,
    Color bg,
  ) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 6),
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
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(color: bg, shape: BoxShape.circle),
              child: Icon(icon, size: 20, color: color),
            ),
            const SizedBox(height: 10),
            FittedBox(
              fit: BoxFit.scaleDown,
              child: Text(
                value,
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                  color: color,
                ),
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w500,
                color: Color(0xFF9E9E9E),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNewRequestsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'New Requests',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: AppTheme.textPrimary,
              ),
            ),
            if (_newRequests.isNotEmpty)
              GestureDetector(
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => const BookingRequestsScreen(),
                  ),
                ),
                child: Text(
                  'View All',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppTheme.primaryColor,
                  ),
                ),
              ),
          ],
        ),
        const SizedBox(height: 12),
        _newRequests.isEmpty
            ? _buildEmptySection(Icons.inbox_outlined, 'No new requests yet')
            : SizedBox(
                height: 190,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: _newRequests.length,
                  separatorBuilder: (_, _a) => const SizedBox(width: 12),
                  itemBuilder: (context, index) {
                    final req = _newRequests[index];
                    final customer =
                        (req['customer'] as Map<String, dynamic>?) ?? {};
                    final service =
                        (req['service'] as Map<String, dynamic>?) ?? {};
                    final expiryAt = req['expiryAt'] != null
                        ? DateTime.tryParse(req['expiryAt'])
                        : null;
                    return _buildRequestCard(
                      customerName: customer['fullName'] ?? 'Customer',
                      customerPhoto: customer['profilePhoto'],
                      serviceName: service['name'] ?? 'Service',
                      bookingType: req['bookingType'] ?? 'INSTANT',
                      expiryAt: expiryAt,
                      description: req['description'] ?? '',
                    );
                  },
                ),
              ),
      ],
    );
  }

  Widget _buildRequestCard({
    required String customerName,
    String? customerPhoto,
    required String serviceName,
    required String bookingType,
    DateTime? expiryAt,
    required String description,
  }) {
    final isEmergency = bookingType.toUpperCase() == 'EMERGENCY';
    final borderColor = isEmergency
        ? const Color(0xFFEF5350).withValues(alpha: 0.3)
        : const Color(0xFFE8F5E9);

    return Container(
      width: 250,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: borderColor, width: 1),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 12,
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
                  border: Border.all(color: const Color(0xFFE8F5E9), width: 2),
                ),
                child: CircleAvatar(
                  radius: 20,
                  backgroundColor: const Color(0xFFE8F5E9),
                  backgroundImage: customerPhoto != null
                      ? NetworkImage(customerPhoto)
                      : null,
                  child: customerPhoto == null
                      ? Text(
                          customerName.isNotEmpty
                              ? customerName[0].toUpperCase()
                              : 'C',
                          style: TextStyle(
                            color: AppTheme.primaryColor,
                            fontWeight: FontWeight.w700,
                          ),
                        )
                      : null,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      customerName,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.textPrimary,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      serviceName,
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppTheme.textSecondary,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ],
          ),
          if (description.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(
              description,
              style: const TextStyle(
                fontSize: 12,
                color: AppTheme.textSecondary,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],
          const Spacer(),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildTypeBadge(bookingType),
              if (expiryAt != null) _buildExpiryBadge(expiryAt),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTypeBadge(String type) {
    final upper = type.toUpperCase();
    final isEmergency = upper == 'EMERGENCY';
    final isScheduled = upper == 'SCHEDULED';
    final Color color;
    final IconData icon;
    if (isEmergency) {
      color = const Color(0xFFD32F2F);
      icon = Icons.priority_high_rounded;
    } else if (isScheduled) {
      color = const Color(0xFF7B1FA2);
      icon = Icons.schedule_rounded;
    } else {
      color = const Color(0xFF0D47A1);
      icon = Icons.bolt_rounded;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: color),
          const SizedBox(width: 3),
          Text(
            type,
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w700,
              color: color,
              letterSpacing: 0.3,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildExpiryBadge(DateTime expiry) {
    final diff = expiry.difference(DateTime.now());
    final isExpired = diff.inSeconds <= 0;
    final isUrgent = !isExpired && diff.inMinutes < 5;
    final text = isExpired
        ? 'Expired'
        : '${diff.inMinutes}:${(diff.inSeconds % 60).toString().padLeft(2, '0')}';
    final color = isUrgent || isExpired
        ? const Color(0xFFD32F2F)
        : const Color(0xFFF57C00);

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(Icons.timer_rounded, size: 14, color: color),
        const SizedBox(width: 4),
        Text(
          text,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w700,
            color: color,
          ),
        ),
      ],
    );
  }

  Widget _buildRecentActivity() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Recent Activity',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: AppTheme.textPrimary,
          ),
        ),
        const SizedBox(height: 12),
        _recentActivity.isEmpty
            ? _buildEmptySection(Icons.history, 'No recent activity')
            : Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.04),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: _recentActivity.length,
                  separatorBuilder: (_, _a) => const Divider(height: 1),
                  itemBuilder: (context, index) {
                    final a = _recentActivity[index];
                    final isBooking = a['type'] == 'booking';
                    final dotColor = isBooking
                        ? AppTheme.primaryColor
                        : _accentGold;
                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      child: Row(
                        children: [
                          Container(
                            width: 10,
                            height: 10,
                            decoration: BoxDecoration(
                              color: dotColor,
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                  color: dotColor.withValues(alpha: 0.5),
                                  blurRadius: 4,
                                  spreadRadius: 1,
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  a['title'] ?? '',
                                  style: const TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                    color: AppTheme.textPrimary,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  a['description'] ?? '',
                                  style: const TextStyle(
                                    fontSize: 12,
                                    color: AppTheme.textSecondary,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ),
                          ),
                          Text(
                            a['time'] ?? '',
                            style: const TextStyle(
                              fontSize: 11,
                              color: AppTheme.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),
      ],
    );
  }

  Widget _buildEmptySection(IconData icon, String msg) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 40),
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
      child: Column(
        children: [
          Icon(icon, size: 44, color: const Color(0xFFBDBDBD)),
          const SizedBox(height: 10),
          Text(
            msg,
            style: const TextStyle(
              fontSize: 14,
              color: Color(0xFF9E9E9E),
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildError() {
    return ListView(
      children: [
        SizedBox(height: MediaQuery.of(context).size.height * 0.3),
        Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFF3E0),
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
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: _fetchDashboard,
                icon: const Icon(Icons.refresh_rounded, size: 18),
                label: const Text('Retry'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryColor,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 28,
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
      ],
    );
  }

  Widget _buildShimmer() {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      child: Shimmer.fromColors(
        baseColor: Colors.grey.shade200,
        highlightColor: Colors.grey.shade50,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 8),
            Row(
              children: [
                const CircleAvatar(radius: 26, backgroundColor: Colors.white),
                const SizedBox(width: 14),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(width: 100, height: 14, color: Colors.white),
                    const SizedBox(height: 6),
                    Container(width: 140, height: 20, color: Colors.white),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 22),
            Container(
              width: double.infinity,
              height: 82,
              decoration: _shimmerDecor,
            ),
            const SizedBox(height: 22),
            Row(
              children: List.generate(
                4,
                (_) => Expanded(
                  child: Container(
                    margin: const EdgeInsets.symmetric(horizontal: 5),
                    height: 100,
                    decoration: _shimmerDecor,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 28),
            Container(width: 140, height: 18, color: Colors.white),
            const SizedBox(height: 14),
            SizedBox(
              height: 190,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: 3,
                itemBuilder: (_, _a) => Container(
                  width: 250,
                  margin: const EdgeInsets.only(right: 12),
                  decoration: _shimmerDecor,
                ),
              ),
            ),
            const SizedBox(height: 28),
            Container(width: 140, height: 18, color: Colors.white),
            const SizedBox(height: 14),
            Container(
              width: double.infinity,
              height: 220,
              decoration: _shimmerDecor,
            ),
          ],
        ),
      ),
    );
  }

  BoxDecoration get _shimmerDecor => BoxDecoration(
    color: Colors.white,
    borderRadius: BorderRadius.circular(16),
  );
}
