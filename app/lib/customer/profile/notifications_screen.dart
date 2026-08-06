import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import '../../core/config/theme_config.dart';
import '../../core/services/api_client.dart';
import '../../core/widgets/state_widgets.dart';
import '../../core/utils/date_helper.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  final _api = ApiClient();
  List<Map<String, dynamic>> _notifications = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadNotifications();
  }

  Future<void> _loadNotifications() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final res = await _api.get('/api/notifications');
      if (mounted) {
        setState(() {
          _notifications = (res.data is List)
              ? List<Map<String, dynamic>>.from(res.data)
              : [];
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _error = 'Failed to load notifications';
        });
      }
    }
  }

  Future<void> _markAsRead(String id, int index) async {
    final n = _notifications[index];
    setState(() => n['read'] = true);
    try {
      await _api.put('/api/notifications/$id/read');
    } catch (_) {
      if (mounted) setState(() => n['read'] = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      appBar: AppBar(
        backgroundColor: AppTheme.primaryColor,
        title: const Text(
          'Notifications',
          style: TextStyle(color: Colors.white),
        ),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) return _buildShimmer();
    if (_error != null) {
      return ErrorStateWidget(message: _error!, onRetry: _loadNotifications);
    }
    if (_notifications.isEmpty) {
      return const EmptyStateWidget(
        message: 'No notifications yet',
        icon: Icons.notifications_none_rounded,
      );
    }
    return RefreshIndicator(
      color: AppTheme.primaryColor,
      onRefresh: _loadNotifications,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _notifications.length,
        itemBuilder: (_, i) => _buildNotificationCard(_notifications[i], i),
      ),
    );
  }

  Widget _buildNotificationCard(Map<String, dynamic> n, int index) {
    final unread = n['read'] != true;
    final body = n['body'] ?? n['message'] ?? '';
    final title = n['title'] ?? '';
    final createdAt = n['createdAt'];
    final id = n['id'] ?? '${n['_id']}' ?? '';

    return GestureDetector(
      onTap: () {
        if (unread && id.isNotEmpty) {
          _markAsRead(id, index);
        }
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 8,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: AppTheme.primaryColor.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  Icons.notifications_outlined,
                  color: AppTheme.primaryColor,
                  size: 22,
                ),
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
                            title,
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: unread
                                  ? FontWeight.w700
                                  : FontWeight.w600,
                              color: AppTheme.textPrimary,
                            ),
                          ),
                        ),
                        if (unread)
                          Container(
                            width: 10,
                            height: 10,
                            decoration: const BoxDecoration(
                              color: AppTheme.primaryColor,
                              shape: BoxShape.circle,
                            ),
                          ),
                      ],
                    ),
                    if (body.isNotEmpty) ...[
                      const SizedBox(height: 6),
                      Text(
                        body,
                        style: const TextStyle(
                          fontSize: 13,
                          color: AppTheme.textSecondary,
                          height: 1.4,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                    const SizedBox(height: 8),
                    Text(
                      DateFormatHelper.relativeTime(createdAt),
                      style: TextStyle(
                        fontSize: 12,
                        color: AppTheme.textSecondary.withValues(alpha: 0.7),
                      ),
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

  Widget _buildShimmer() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: 6,
      itemBuilder: (_, _) => Shimmer.fromColors(
        baseColor: Colors.grey.shade200,
        highlightColor: Colors.grey.shade100,
        child: Container(
          height: 100,
          margin: const EdgeInsets.only(bottom: 12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
          ),
        ),
      ),
    );
  }
}
