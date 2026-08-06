import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:shimmer/shimmer.dart';
import '../../core/services/api_client.dart';
import '../../core/config/theme_config.dart';
import '../../core/models/booking_model.dart';
import 'job_detail_screen.dart';

class MyJobsScreen extends StatefulWidget {
  const MyJobsScreen({super.key});

  @override
  State<MyJobsScreen> createState() => _MyJobsScreenState();
}

class _MyJobsScreenState extends State<MyJobsScreen>
    with SingleTickerProviderStateMixin {
  final _api = ApiClient();

  bool _isLoading = true;
  String? _error;
  late TabController _tabController;
  final Map<String, List<BookingModel>> _jobs = {};

  static const _tabs = ['Active', 'Completed', 'Cancelled'];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _tabs.length, vsync: this);
    _tabController.addListener(() {
      if (!_tabController.indexIsChanging) setState(() {});
    });
    _load();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    if (!mounted) return;
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final res = await _api.get('/api/workers/me/bookings');
      final data = res.data;
      final list = (data is List)
          ? data
          : (data['bookings'] ?? data['data'] ?? []);
      final all = (list as List).map((j) => BookingModel.fromJson(j)).toList();

      if (!mounted) return;
      setState(() {
        _jobs['Active'] = all
            .where(
              (b) => ['ACCEPTED', 'IN_PROGRESS', 'EN_ROUTE'].contains(b.status),
            )
            .toList();
        _jobs['Completed'] = all.where((b) => b.status == 'COMPLETED').toList();
        _jobs['Cancelled'] = all.where((b) => b.status == 'CANCELLED').toList();
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _error = 'Failed to load jobs. Pull to retry.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'My Jobs',
          style: TextStyle(fontWeight: FontWeight.w700),
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(48),
          child: Align(
            alignment: Alignment.centerLeft,
            child: TabBar(
              controller: _tabController,
              isScrollable: true,
              tabAlignment: TabAlignment.start,
              overlayColor: WidgetStateProperty.resolveWith(
                (s) => const Color(0xFFE8F5E9),
              ),
              indicatorColor: AppTheme.primaryColor,
              labelColor: AppTheme.primaryColor,
              unselectedLabelColor: AppTheme.textSecondary,
              labelStyle: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
              ),
              dividerHeight: 0,
              tabs: _tabs.map((t) => Tab(text: t)).toList(),
            ),
          ),
        ),
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
      child: TabBarView(
        controller: _tabController,
        children: _tabs.map((tab) => _buildTab(tab)).toList(),
      ),
    );
  }

  Widget _buildTab(String tab) {
    final list = _jobs[tab] ?? [];

    if (list.isEmpty) {
      return ListView(
        children: [
          SizedBox(height: MediaQuery.of(context).size.height * 0.3),
          _buildEmptyTab(tab),
        ],
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: list.length,
      separatorBuilder: (_, _a) => const SizedBox(height: 12),
      itemBuilder: (_, i) => _buildCard(list[i]),
    );
  }

  Widget _buildCard(BookingModel job) {
    final customer = job.customer ?? {};
    final service = job.service ?? {};

    return GestureDetector(
      onTap: () async {
        await Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => JobDetailScreen(booking: job)),
        );
        _load();
      },
      child: Container(
        padding: const EdgeInsets.all(14),
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
        child: Row(
          children: [
            Container(
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: const Color(0xFFE8F5E9), width: 2),
              ),
              child: CircleAvatar(
                radius: 24,
                backgroundColor: const Color(0xFFE8F5E9),
                backgroundImage: customer['profilePhoto'] != null
                    ? NetworkImage(customer['profilePhoto'])
                    : null,
                child: customer['profilePhoto'] == null
                    ? Text(
                        (customer['fullName'] ?? 'C')[0].toUpperCase(),
                        style: TextStyle(
                          color: AppTheme.primaryColor,
                          fontWeight: FontWeight.w700,
                          fontSize: 16,
                        ),
                      )
                    : null,
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    customer['fullName'] ?? 'Customer',
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    service['name'] ?? 'Service',
                    style: const TextStyle(
                      fontSize: 13,
                      color: AppTheme.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    DateFormat('MMM dd, yyyy').format(job.createdAt),
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppTheme.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
            _statusBadge(job.status),
          ],
        ),
      ),
    );
  }

  Widget _statusBadge(String status) {
    Color bg;
    Color fg;
    String label;
    switch (status) {
      case 'ACCEPTED':
        bg = const Color(0xFFE3F2FD);
        fg = const Color(0xFF1565C0);
        label = 'Accepted';
        break;
      case 'IN_PROGRESS':
        bg = const Color(0xFFFFF3E0);
        fg = const Color(0xFFE65100);
        label = 'In Progress';
        break;
      case 'EN_ROUTE':
        bg = const Color(0xFFF3E5F5);
        fg = const Color(0xFF7B1FA2);
        label = 'En Route';
        break;
      case 'COMPLETED':
        bg = const Color(0xFFE8F5E9);
        fg = const Color(0xFF2E7D32);
        label = 'Completed';
        break;
      case 'CANCELLED':
        bg = const Color(0xFFFFEBEE);
        fg = const Color(0xFFC62828);
        label = 'Cancelled';
        break;
      default:
        bg = const Color(0xFFF5F5F5);
        fg = const Color(0xFF757575);
        label = status;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        label,
        style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: fg),
      ),
    );
  }

  Widget _buildEmptyTab(String tab) {
    final icons = {
      'Active': Icons.engineering_outlined,
      'Completed': Icons.check_circle_outline,
      'Cancelled': Icons.cancel_outlined,
    };
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: const BoxDecoration(
              color: Color(0xFFE8F5E9),
              shape: BoxShape.circle,
            ),
            child: Icon(
              icons[tab] ?? Icons.work_outline,
              size: 48,
              color: const Color(0xFF81C784),
            ),
          ),
          const SizedBox(height: 14),
          Text(
            'No $tab jobs',
            style: const TextStyle(
              fontSize: 17,
              fontWeight: FontWeight.w600,
              color: AppTheme.textPrimary,
            ),
          ),
          const SizedBox(height: 4),
          const Text(
            'Pull down to refresh',
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
      padding: const EdgeInsets.all(16),
      child: Shimmer.fromColors(
        baseColor: Colors.grey.shade200,
        highlightColor: Colors.grey.shade50,
        child: Column(
          children: List.generate(
            6,
            (_) => Container(
              margin: const EdgeInsets.only(bottom: 12),
              height: 84,
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
