import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import '../../core/services/api_client.dart';
import '../../core/config/theme_config.dart';
import 'worker_chat_screen.dart';

class WorkerChatListScreen extends StatefulWidget {
  const WorkerChatListScreen({super.key});

  @override
  State<WorkerChatListScreen> createState() => _WorkerChatListScreenState();
}

class _WorkerChatListScreenState extends State<WorkerChatListScreen> {
  final _api = ApiClient();

  bool _isLoading = true;
  String? _error;
  List<Map<String, dynamic>> _conversations = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    if (!mounted) return;
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final res = await _api.get('/api/chat/conversations');
      final data = res.data;
      final list = (data is List)
          ? data
          : (data['conversations'] ?? data['data'] ?? []);
      if (!mounted) return;
      setState(() {
        _conversations = List<Map<String, dynamic>>.from(list);
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _error = 'Failed to load conversations. Pull to retry.';
      });
    }
  }

  String _formatTime(String dateStr) {
    final date = DateTime.tryParse(dateStr);
    if (date == null) return '';
    final now = DateTime.now();
    if (date.day == now.day &&
        date.month == now.month &&
        date.year == now.year) {
      return '${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';
    }
    return '${date.day}/${date.month}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Messages',
          style: TextStyle(fontWeight: FontWeight.w700),
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
      child: _conversations.isEmpty
          ? _buildEmptyState()
          : ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              itemCount: _conversations.length,
              separatorBuilder: (_, _a) => const SizedBox(height: 6),
              itemBuilder: (_, i) => _buildTile(_conversations[i]),
            ),
    );
  }

  Widget _buildTile(Map<String, dynamic> convo) {
    final participant = convo['participant'] as Map<String, dynamic>? ?? {};
    final lastMsg = convo['lastMessage'] as Map<String, dynamic>? ?? {};
    final unread = convo['unreadCount'] ?? 0;
    final name = participant['fullName'] ?? 'Customer';
    final photo = participant['profilePhoto'];
    final isOnline = participant['isOnline'] == true;

    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => WorkerChatScreen(
              userId: participant['id'] ?? '',
              userName: name,
              userPhoto: photo,
            ),
          ),
        );
      },
      child: Container(
        padding: const EdgeInsets.all(12),
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
        child: Row(
          children: [
            Stack(
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
                    radius: 26,
                    backgroundColor: const Color(0xFFE8F5E9),
                    backgroundImage: photo != null ? NetworkImage(photo) : null,
                    child: photo == null
                        ? Text(
                            name[0].toUpperCase(),
                            style: TextStyle(
                              color: AppTheme.primaryColor,
                              fontWeight: FontWeight.w700,
                              fontSize: 18,
                            ),
                          )
                        : null,
                  ),
                ),
                if (isOnline)
                  Positioned(
                    right: 2,
                    bottom: 2,
                    child: Container(
                      width: 13,
                      height: 13,
                      decoration: BoxDecoration(
                        color: const Color(0xFF4CAF50),
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 2.5),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(
                              0xFF4CAF50,
                            ).withValues(alpha: 0.5),
                            blurRadius: 4,
                            spreadRadius: 1,
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    lastMsg['text'] ?? 'No messages yet',
                    style: TextStyle(
                      fontSize: 13,
                      color: unread > 0
                          ? AppTheme.textPrimary
                          : const Color(0xFF9E9E9E),
                      fontWeight: unread > 0
                          ? FontWeight.w500
                          : FontWeight.normal,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                if (lastMsg['createdAt'] != null)
                  Text(
                    _formatTime(lastMsg['createdAt']),
                    style: const TextStyle(
                      fontSize: 11,
                      color: Color(0xFF9E9E9E),
                    ),
                  ),
                if (unread > 0) ...[
                  const SizedBox(height: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 7,
                      vertical: 3,
                    ),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [AppTheme.primaryColor, Color(0xFF4CAF50)],
                      ),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      unread.toString(),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ],
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
            decoration: const BoxDecoration(
              color: Color(0xFFE8F5E9),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.chat_bubble_outline,
              size: 48,
              color: Color(0xFF81C784),
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'No conversations yet',
            style: TextStyle(
              fontSize: 17,
              fontWeight: FontWeight.w600,
              color: AppTheme.textPrimary,
            ),
          ),
          const SizedBox(height: 4),
          const Text(
            'Chats with customers will appear here',
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
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      child: Shimmer.fromColors(
        baseColor: Colors.grey.shade200,
        highlightColor: Colors.grey.shade50,
        child: Column(
          children: List.generate(
            6,
            (_) => Container(
              margin: const EdgeInsets.only(bottom: 6),
              height: 80,
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
