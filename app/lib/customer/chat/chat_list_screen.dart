import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import '../../core/config/theme_config.dart';
import '../../core/services/api_client.dart';
import 'chat_screen.dart';

class ChatListScreen extends StatefulWidget {
  const ChatListScreen({super.key});

  @override
  State<ChatListScreen> createState() => _ChatListScreenState();
}

class _ChatListScreenState extends State<ChatListScreen> {
  final _api = ApiClient();
  final _searchController = TextEditingController();

  List<Map<String, dynamic>> _conversations = [];
  List<Map<String, dynamic>> _filteredConversations = [];
  bool _isLoading = true;
  String? _error;
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _loadConversations();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadConversations() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final res = await _api.get('/api/chat/conversations');
      if (mounted) {
        setState(() {
          _conversations = (res.data is List)
              ? List<Map<String, dynamic>>.from(res.data)
              : [];
          _filterConversations();
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _error = 'Failed to load conversations';
        });
      }
    }
  }

  void _filterConversations() {
    if (_searchQuery.isEmpty) {
      _filteredConversations = List.from(_conversations);
    } else {
      _filteredConversations = _conversations.where((c) {
        final participant = c['participant'] ?? c['worker'] ?? {};
        final name = (participant['fullName'] ?? '').toString().toLowerCase();
        return name.contains(_searchQuery.toLowerCase());
      }).toList();
    }
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      appBar: AppBar(
        title: const Text(
          'Messages',
          style: TextStyle(fontWeight: FontWeight.w700, fontSize: 18),
        ),
      ),
      body: Column(
        children: [
          _buildSearchBar(),
          Expanded(child: _buildContent()),
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      color: Colors.white,
      child: Container(
        height: 46,
        decoration: BoxDecoration(
          color: AppTheme.backgroundColor,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: AppTheme.dividerColor.withValues(alpha: 0.5),
          ),
        ),
        child: TextField(
          controller: _searchController,
          onChanged: (v) {
            _searchQuery = v;
            _filterConversations();
          },
          style: const TextStyle(fontSize: 14, color: AppTheme.textPrimary),
          decoration: InputDecoration(
            hintText: 'Search conversations...',
            hintStyle: const TextStyle(
              color: AppTheme.textSecondary,
              fontSize: 14,
            ),
            prefixIcon: Container(
              margin: const EdgeInsets.all(8),
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: AppTheme.primaryColor.withValues(alpha: 0.06),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(
                Icons.search_rounded,
                color: AppTheme.primaryColor,
                size: 18,
              ),
            ),
            suffixIcon: _searchQuery.isNotEmpty
                ? GestureDetector(
                    onTap: () {
                      _searchController.clear();
                      _searchQuery = '';
                      _filterConversations();
                    },
                    child: const Icon(
                      Icons.close_rounded,
                      color: AppTheme.textSecondary,
                      size: 18,
                    ),
                  )
                : null,
            border: InputBorder.none,
            contentPadding: const EdgeInsets.symmetric(vertical: 12),
          ),
        ),
      ),
    );
  }

  Widget _buildContent() {
    if (_isLoading) return _buildShimmer();
    if (_error != null) return _buildError();
    if (_filteredConversations.isEmpty) return _buildEmpty();
    return RefreshIndicator(
      color: AppTheme.primaryColor,
      onRefresh: _loadConversations,
      child: ListView.builder(
        padding: const EdgeInsets.all(12),
        itemCount: _filteredConversations.length,
        itemBuilder: (_, i) =>
            _buildConversationCard(_filteredConversations[i]),
      ),
    );
  }

  Widget _buildShimmer() {
    return ListView.builder(
      padding: const EdgeInsets.all(12),
      itemCount: 6,
      itemBuilder: (_, __) => Padding(
        padding: const EdgeInsets.only(bottom: 10),
        child: Shimmer.fromColors(
          baseColor: Colors.grey.shade200,
          highlightColor: Colors.grey.shade100,
          child: Container(
            height: 76,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
            ),
          ),
        ),
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
            Text(
              _error!,
              style: const TextStyle(
                color: AppTheme.textSecondary,
                fontSize: 15,
              ),
            ),
            const SizedBox(height: 16),
            GestureDetector(
              onTap: _loadConversations,
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

  Widget _buildEmpty() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(28),
              decoration: BoxDecoration(
                color: AppTheme.backgroundColor,
                shape: BoxShape.circle,
              ),
              child: Icon(
                _searchQuery.isEmpty
                    ? Icons.chat_bubble_outline_rounded
                    : Icons.search_off_rounded,
                size: 52,
                color: AppTheme.textSecondary.withValues(alpha: 0.5),
              ),
            ),
            const SizedBox(height: 20),
            Text(
              _searchQuery.isEmpty
                  ? 'No messages yet'
                  : 'No conversations found',
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: AppTheme.textSecondary,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              _searchQuery.isEmpty
                  ? 'Start booking a service to chat with workers'
                  : 'Try a different search',
              style: TextStyle(
                fontSize: 13,
                color: AppTheme.textSecondary.withValues(alpha: 0.7),
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildConversationCard(Map<String, dynamic> conv) {
    final participant = conv['participant'] ?? conv['worker'] ?? {};
    final lastMsg = conv['lastMessage'] ?? {};
    final unread = conv['unreadCount'] ?? 0;
    final isOnline = participant['isOnline'] ?? false;
    final photo = participant['profilePhoto'];

    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => ChatScreen(
              conversationId: conv['id'],
              participantName: participant['fullName'] ?? '',
              participantPhoto: photo,
            ),
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.03),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              Stack(
                children: [
                  CircleAvatar(
                    radius: 26,
                    backgroundColor: AppTheme.primaryColor.withValues(
                      alpha: 0.06,
                    ),
                    backgroundImage: photo != null ? NetworkImage(photo) : null,
                    child: photo == null
                        ? const Icon(
                            Icons.person,
                            size: 26,
                            color: AppTheme.primaryColor,
                          )
                        : null,
                  ),
                  if (isOnline)
                    Positioned(
                      bottom: 1,
                      right: 1,
                      child: Container(
                        width: 12,
                        height: 12,
                        decoration: BoxDecoration(
                          color: AppTheme.successColor,
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 2),
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            participant['fullName'] ?? 'User',
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                              color: AppTheme.textPrimary,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        Text(
                          _formatTime(lastMsg['createdAt']),
                          style: TextStyle(
                            fontSize: 11,
                            color: unread > 0
                                ? AppTheme.primaryColor
                                : AppTheme.textSecondary,
                            fontWeight: unread > 0
                                ? FontWeight.w700
                                : FontWeight.w400,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            lastMsg['content'] ?? lastMsg['text'] ?? '',
                            style: TextStyle(
                              fontSize: 13,
                              color: unread > 0
                                  ? AppTheme.textPrimary
                                  : AppTheme.textSecondary,
                              fontWeight: unread > 0
                                  ? FontWeight.w600
                                  : FontWeight.w400,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        if (unread > 0) ...[
                          const SizedBox(width: 8),
                          Container(
                            width: 22,
                            height: 22,
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(
                                colors: [
                                  AppTheme.primaryColor,
                                  Color(0xFF008A42),
                                ],
                              ),
                              shape: BoxShape.circle,
                            ),
                            child: Center(
                              child: Text(
                                unread > 99 ? '99+' : '$unread',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 10,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                          ),
                        ],
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

  String _formatTime(String? dateStr) {
    if (dateStr == null) return '';
    final d = DateTime.tryParse(dateStr);
    if (d == null) return '';
    final now = DateTime.now();
    if (d.day == now.day && d.month == now.month && d.year == now.year) {
      return '${d.hour}:${d.minute.toString().padLeft(2, '0')}';
    }
    if (d.year == now.year && d.month == now.month && now.day - d.day == 1) {
      return 'Yesterday';
    }
    return '${d.day}/${d.month}';
  }
}
