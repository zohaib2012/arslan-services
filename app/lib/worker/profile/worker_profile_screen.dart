import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../core/services/api_client.dart';
import '../../core/config/theme_config.dart';
import '../../core/models/worker_model.dart';
import 'edit_worker_profile_screen.dart';
import 'cnic_verification_screen.dart';
import 'portfolio_screen.dart';
import 'services_selection_screen.dart';
import 'service_areas_screen.dart';
import 'working_hours_screen.dart';
import 'payment_methods_screen.dart';
import '../disputes/worker_disputes_screen.dart';

class WorkerProfileScreen extends StatefulWidget {
  const WorkerProfileScreen({super.key});

  @override
  State<WorkerProfileScreen> createState() => _WorkerProfileScreenState();
}

class _WorkerProfileScreenState extends State<WorkerProfileScreen> {
  final _api = ApiClient();
  bool _isLoading = true;
  bool _isTogglingOnline = false;
  String? _error;
  WorkerModel? _worker;

  @override
  void initState() {
    super.initState();
    _fetchProfile();
  }

  Future<void> _fetchProfile() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final res = await _api.get('/api/workers/me');
      if (!mounted) return;
      setState(() {
        _worker = WorkerModel.fromJson(res.data as Map<String, dynamic>);
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _error = 'Failed to load profile. Pull to retry.';
      });
    }
  }

  Future<void> _toggleOnline() async {
    if (_worker == null) return;
    setState(() => _isTogglingOnline = true);
    try {
      final newStatus = !_worker!.isOnline;
      await _api.put('/api/workers/me', data: {'isOnline': newStatus});
      await _fetchProfile();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to update online status')),
        );
      }
    } finally {
      if (mounted) setState(() => _isTogglingOnline = false);
    }
  }

  Future<void> _logout() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Logout'),
        content: const Text('Are you sure you want to logout?'),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(foregroundColor: AppTheme.errorColor),
            child: const Text('Logout'),
          ),
        ],
      ),
    );

    if (confirmed == true && mounted) {
      await context.read<AuthProvider>().logout();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) return _buildLoadingShimmer();

    if (_error != null || _worker == null) {
      return RefreshIndicator(
        onRefresh: _fetchProfile,
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
                      _error ?? 'Failed to load profile',
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
      onRefresh: _fetchProfile,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(0, 0, 0, 32),
        child: Column(
          children: [
            const SizedBox(height: 24),
            _buildProfileHeader(),
            const SizedBox(height: 16),
            _buildOnlineToggle(),
            const SizedBox(height: 16),
            _buildStatsRow(),
            const SizedBox(height: 24),
            _buildMenuItems(),
            const SizedBox(height: 16),
            _buildLogoutButton(),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildLoadingShimmer() {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(0, 24, 0, 32),
      child: Column(
        children: [
          const Center(
            child: _PulseWidget(
              child: CircleAvatar(
                radius: 50,
                backgroundColor: Color(0xFFE0E0E0),
              ),
            ),
          ),
          const SizedBox(height: 16),
          Center(
            child: _PulseWidget(
              child: Container(
                width: 160,
                height: 18,
                decoration: BoxDecoration(
                  color: Colors.grey.shade200,
                  borderRadius: BorderRadius.circular(9),
                ),
              ),
            ),
          ),
          const SizedBox(height: 20),
          Center(
            child: _PulseWidget(
              child: Container(
                width: 200,
                height: 40,
                decoration: BoxDecoration(
                  color: Colors.grey.shade200,
                  borderRadius: BorderRadius.circular(20),
                ),
              ),
            ),
          ),
          const SizedBox(height: 24),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: List.generate(
                3,
                (_) => _PulseWidget(
                  child: Container(
                    width: 60,
                    height: 44,
                    decoration: BoxDecoration(
                      color: Colors.grey.shade200,
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 28),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Column(
              children: List.generate(
                7,
                (_) => Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: _PulseWidget(
                    child: Card(
                      child: SizedBox(
                        height: 56,
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          child: Row(
                            children: [
                              Container(
                                width: 36,
                                height: 36,
                                decoration: BoxDecoration(
                                  color: Colors.grey.shade200,
                                  borderRadius: BorderRadius.circular(10),
                                ),
                              ),
                              const SizedBox(width: 16),
                              Container(
                                width: 140,
                                height: 14,
                                decoration: BoxDecoration(
                                  color: Colors.grey.shade200,
                                  borderRadius: BorderRadius.circular(7),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProfileHeader() {
    final verificationColor = _getVerificationColor(
      _worker!.verificationStatus,
    );

    return Column(
      children: [
        Stack(
          children: [
            Container(
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.primaryColor.withOpacity(0.15),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: CircleAvatar(
                radius: 50,
                backgroundImage:
                    _worker!.profilePhoto != null &&
                        _worker!.profilePhoto!.isNotEmpty
                    ? NetworkImage(_worker!.profilePhoto!)
                    : null,
                backgroundColor: AppTheme.secondaryColor.withOpacity(0.15),
                child:
                    _worker!.profilePhoto == null ||
                        _worker!.profilePhoto!.isEmpty
                    ? Text(
                        _worker!.fullName.isNotEmpty
                            ? _worker!.fullName[0].toUpperCase()
                            : 'W',
                        style: const TextStyle(
                          fontSize: 32,
                          fontWeight: FontWeight.w600,
                          color: AppTheme.primaryColor,
                        ),
                      )
                    : null,
              ),
            ),
            Positioned(
              right: 0,
              bottom: 0,
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: verificationColor,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.white, width: 2.5),
                ),
                child: Text(
                  _worker!.verificationStatus,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Text(
          _worker!.fullName,
          style: const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: AppTheme.textPrimary,
          ),
        ),
        if (_worker!.phone != null && _worker!.phone!.isNotEmpty) ...[
          const SizedBox(height: 4),
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(
                Icons.phone_android,
                size: 14,
                color: AppTheme.textSecondary,
              ),
              const SizedBox(width: 4),
              Text(
                _worker!.phone!,
                style: const TextStyle(
                  fontSize: 14,
                  color: AppTheme.textSecondary,
                ),
              ),
            ],
          ),
        ],
        if (_worker!.description != null &&
            _worker!.description!.isNotEmpty) ...[
          const SizedBox(height: 8),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32),
            child: Text(
              _worker!.description!,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 13,
                color: AppTheme.textSecondary,
              ),
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ],
    );
  }

  Color _getVerificationColor(String status) {
    switch (status.toUpperCase()) {
      case 'VERIFIED':
        return AppTheme.successColor;
      case 'REJECTED':
        return AppTheme.errorColor;
      default:
        return AppTheme.warningColor;
    }
  }

  Widget _buildOnlineToggle() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Card(
        child: InkWell(
          onTap: _isTogglingOnline ? null : _toggleOnline,
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: _worker!.isOnline
                            ? AppTheme.successColor.withOpacity(0.1)
                            : Colors.grey.shade100,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(
                        Icons.circle,
                        size: 12,
                        color: _worker!.isOnline
                            ? AppTheme.successColor
                            : Colors.grey,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Text(
                      _worker!.isOnline ? 'You\'re online' : 'You\'re offline',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w500,
                        color: _worker!.isOnline
                            ? AppTheme.successColor
                            : AppTheme.textSecondary,
                      ),
                    ),
                  ],
                ),
                _isTogglingOnline
                    ? const SizedBox(
                        height: 22,
                        width: 22,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : Switch(
                        value: _worker!.isOnline,
                        onChanged: (_) => _toggleOnline(),
                        activeColor: AppTheme.primaryColor,
                      ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatsRow() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          _buildStat(_worker!.completedJobs.toString(), 'Jobs Done'),
          _buildStat(
            _worker!.avgRating.toStringAsFixed(1),
            'Rating',
            icon: Icons.star,
            iconColor: Colors.amber,
          ),
          _buildStat(
            _worker!.responseTimeMinutes != null
                ? '${_worker!.responseTimeMinutes}m'
                : 'N/A',
            'Response',
          ),
        ],
      ),
    );
  }

  Widget _buildStat(
    String value,
    String label, {
    IconData? icon,
    Color? iconColor,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Column(
        children: [
          if (icon != null)
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(icon, size: 16, color: iconColor ?? AppTheme.primaryColor),
                const SizedBox(width: 4),
                Text(
                  value,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.textPrimary,
                  ),
                ),
              ],
            )
          else
            Text(
              value,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppTheme.textPrimary,
              ),
            ),
          const SizedBox(height: 2),
          Text(
            label,
            style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary),
          ),
        ],
      ),
    );
  }

  Widget _buildMenuItems() {
    final menuItems = [
      {
        'icon': Icons.edit_outlined,
        'title': 'Edit Profile',
        'screen': const EditWorkerProfileScreen(),
      },
      {
        'icon': Icons.verified_user_outlined,
        'title': 'CNIC Verification',
        'screen': const CnicVerificationScreen(),
      },
      {
        'icon': Icons.photo_library_outlined,
        'title': 'Portfolio',
        'screen': const PortfolioScreen(),
      },
      {
        'icon': Icons.build_outlined,
        'title': 'Services',
        'screen': const ServicesSelectionScreen(),
      },
      {
        'icon': Icons.location_on_outlined,
        'title': 'Service Areas',
        'screen': const ServiceAreasScreen(),
      },
      {
        'icon': Icons.access_time,
        'title': 'Working Hours',
        'screen': const WorkingHoursScreen(),
      },
      {
        'icon': Icons.payment_outlined,
        'title': 'Payment Methods',
        'screen': const PaymentMethodsScreen(),
      },
      {
        'icon': Icons.report_problem_outlined,
        'title': 'Disputes',
        'screen': const WorkerDisputesScreen(),
      },
    ];

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        children: menuItems.map((item) {
          return Card(
            margin: const EdgeInsets.only(bottom: 6),
            child: ListTile(
              onTap: () async {
                await Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => item['screen'] as Widget),
                );
                _fetchProfile();
              },
              leading: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppTheme.secondaryColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(
                  item['icon'] as IconData,
                  color: AppTheme.primaryColor,
                  size: 22,
                ),
              ),
              title: Text(
                item['title'] as String,
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w500,
                ),
              ),
              trailing: const Icon(
                Icons.chevron_right,
                color: AppTheme.textSecondary,
              ),
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 12,
                vertical: 2,
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildLogoutButton() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: SizedBox(
        width: double.infinity,
        height: 50,
        child: OutlinedButton(
          onPressed: _logout,
          style: OutlinedButton.styleFrom(
            foregroundColor: AppTheme.errorColor,
            side: const BorderSide(color: AppTheme.errorColor),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
          child: const Text('Logout', style: TextStyle(fontSize: 16)),
        ),
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
