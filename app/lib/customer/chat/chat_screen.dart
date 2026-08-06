import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import '../../core/config/theme_config.dart';
import '../../core/services/api_client.dart';

class ChatScreen extends StatefulWidget {
  final String conversationId;
  final String participantName;
  final String? participantPhoto;

  const ChatScreen({
    super.key,
    required this.conversationId,
    required this.participantName,
    this.participantPhoto,
  });

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final _api = ApiClient();
  final _controller = TextEditingController();
  final _scrollController = ScrollController();
  List<Map<String, dynamic>> _messages = [];
  bool _isLoading = true;
  String? _error;
  @override
  void initState() {
    super.initState();
    _loadMessages();
  }

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _loadMessages() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final res = await _api.get(
        '/api/chat/conversations/${widget.conversationId}/messages',
      );
      if (mounted) {
        setState(() {
          _messages = (res.data is List)
              ? List<Map<String, dynamic>>.from(res.data)
              : [];
          _isLoading = false;
        });
        _scrollToBottom();
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _error = 'Failed to load messages';
        });
      }
    }
  }

  Future<void> _sendMessage() async {
    final text = _controller.text.trim();
    if (text.isEmpty) return;

    final optimisticMsg = <String, dynamic>{
      'id': DateTime.now().millisecondsSinceEpoch.toString(),
      'content': text,
      'type': 'TEXT',
      'sender': 'me',
      'senderId': 'me',
      'createdAt': DateTime.now().toIso8601String(),
    };

    setState(() {
      _messages.add(optimisticMsg);
    });
    _controller.clear();
    _scrollToBottom();

    try {
      await _api.post(
        '/api/chat/messages',
        data: {
          'conversationId': widget.conversationId,
          'content': text,
          'type': 'TEXT',
        },
      );
    } catch (_) {
      final idx = _messages.indexWhere((m) => m['id'] == optimisticMsg['id']);
      if (idx != -1 && mounted) {
        setState(() {
          _messages[idx]['failed'] = true;
        });
      }
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(70),
        child: SafeArea(
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Row(
              children: [
                GestureDetector(
                  onTap: () => Navigator.pop(context),
                  child: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppTheme.backgroundColor,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(
                      Icons.arrow_back_rounded,
                      size: 22,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Stack(
                  children: [
                    CircleAvatar(
                      radius: 20,
                      backgroundColor: AppTheme.primaryColor.withValues(
                        alpha: 0.06,
                      ),
                      backgroundImage: widget.participantPhoto != null
                          ? NetworkImage(widget.participantPhoto!)
                          : null,
                      child: widget.participantPhoto == null
                          ? const Icon(
                              Icons.person,
                              size: 20,
                              color: AppTheme.primaryColor,
                            )
                          : null,
                    ),
                    Positioned(
                      bottom: 0,
                      right: 0,
                      child: Container(
                        width: 10,
                        height: 10,
                        decoration: BoxDecoration(
                          color: AppTheme.successColor,
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 1.5),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        widget.participantName,
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: AppTheme.textPrimary,
                        ),
                      ),
                      Text(
                        'Online',
                        style: TextStyle(
                          fontSize: 11,
                          color: AppTheme.successColor,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  decoration: BoxDecoration(
                    color: AppTheme.primaryColor.withValues(alpha: 0.06),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: IconButton(
                    icon: const Icon(
                      Icons.call_outlined,
                      size: 20,
                      color: AppTheme.primaryColor,
                    ),
                    onPressed: () {},
                  ),
                ),
                const SizedBox(width: 4),
                Container(
                  decoration: BoxDecoration(
                    color: AppTheme.successColor.withValues(alpha: 0.06),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: IconButton(
                    icon: const Icon(
                      Icons.message_outlined,
                      size: 20,
                      color: AppTheme.successColor,
                    ),
                    onPressed: () {},
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
      body: Column(
        children: [
          Expanded(child: _buildMessageList()),
          _buildInputBar(),
        ],
      ),
    );
  }

  Widget _buildMessageList() {
    if (_isLoading) return _buildMessagesShimmer();
    if (_error != null) return _buildMessagesError();
    if (_messages.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(28),
              decoration: BoxDecoration(
                color: AppTheme.backgroundColor,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.chat_bubble_outline_rounded,
                size: 52,
                color: AppTheme.textSecondary,
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Start the conversation',
              style: TextStyle(color: AppTheme.textSecondary, fontSize: 15),
            ),
          ],
        ),
      );
    }
    return GestureDetector(
      onTap: () => FocusScope.of(context).unfocus(),
      child: ListView.builder(
        controller: _scrollController,
        padding: const EdgeInsets.all(16),
        itemCount: _messages.length,
        itemBuilder: (_, i) {
          final showDate =
              i == 0 ||
              _isDifferentDay(
                _messages[i]['createdAt'],
                _messages[i - 1]['createdAt'],
              );
          return Column(
            children: [
              if (showDate) _buildDateHeader(_messages[i]['createdAt']),
              _buildMessageBubble(_messages[i]),
            ],
          );
        },
      ),
    );
  }

  bool _isDifferentDay(String? a, String? b) {
    if (a == null || b == null) return false;
    final da = DateTime.tryParse(a);
    final db = DateTime.tryParse(b);
    if (da == null || db == null) return false;
    return da.day != db.day || da.month != db.month || da.year != db.year;
  }

  Widget _buildMessagesShimmer() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: 6,
      itemBuilder: (_, i) {
        final isMe = i % 2 == 1;
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Align(
            alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
            child: Shimmer.fromColors(
              baseColor: Colors.grey.shade200,
              highlightColor: Colors.grey.shade100,
              child: Container(
                height: 40,
                width: isMe ? 160 : 200,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.only(
                    topLeft: const Radius.circular(14),
                    topRight: const Radius.circular(14),
                    bottomLeft: Radius.circular(isMe ? 14 : 0),
                    bottomRight: Radius.circular(isMe ? 0 : 14),
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildMessagesError() {
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
              onTap: _loadMessages,
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

  Widget _buildDateHeader(String? dateStr) {
    if (dateStr == null) return const SizedBox.shrink();
    final d = DateTime.tryParse(dateStr);
    if (d == null) return const SizedBox.shrink();
    final now = DateTime.now();
    String text;
    if (d.day == now.day && d.month == now.month && d.year == now.year) {
      text = 'Today';
    } else if (d.year == now.year &&
        d.month == now.month &&
        now.day - d.day == 1) {
      text = 'Yesterday';
    } else {
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
      text = '${d.day} ${months[d.month - 1]} ${d.year}';
    }
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(
          color: AppTheme.dividerColor.withValues(alpha: 0.5),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Text(
          text,
          style: const TextStyle(
            fontSize: 11,
            color: AppTheme.textSecondary,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }

  Widget _buildMessageBubble(Map<String, dynamic> msg) {
    final isMe = msg['sender'] == 'me' || msg['senderId'] == 'me';
    final isImage = msg['type'] == 'IMAGE';
    final isFailed = msg['failed'] == true;

    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        mainAxisAlignment: isMe
            ? MainAxisAlignment.end
            : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (!isMe) ...[
            CircleAvatar(
              radius: 14,
              backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.06),
              backgroundImage: widget.participantPhoto != null
                  ? NetworkImage(widget.participantPhoto!)
                  : null,
              child: widget.participantPhoto == null
                  ? const Icon(
                      Icons.person,
                      size: 14,
                      color: AppTheme.primaryColor,
                    )
                  : null,
            ),
            const SizedBox(width: 8),
          ],
          Flexible(
            child: Container(
              padding: isImage
                  ? const EdgeInsets.all(4)
                  : const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              constraints: BoxConstraints(
                maxWidth: MediaQuery.of(context).size.width * 0.72,
              ),
              decoration: BoxDecoration(
                color: isMe ? AppTheme.primaryColor : Colors.white,
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(16),
                  topRight: const Radius.circular(16),
                  bottomLeft: Radius.circular(isMe ? 16 : 4),
                  bottomRight: Radius.circular(isMe ? 4 : 16),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.04),
                    blurRadius: 3,
                    offset: const Offset(0, 1),
                  ),
                ],
              ),
              child: isImage
                  ? ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Image.network(
                        msg['content'] ?? msg['imageUrl'] ?? '',
                        fit: BoxFit.cover,
                        loadingBuilder: (_, child, progress) {
                          if (progress == null) return child;
                          return SizedBox(
                            height: 180,
                            width: 200,
                            child: Center(
                              child: CircularProgressIndicator(
                                value: progress.expectedTotalBytes != null
                                    ? progress.cumulativeBytesLoaded /
                                          progress.expectedTotalBytes!
                                    : null,
                                color: AppTheme.primaryColor,
                              ),
                            ),
                          );
                        },
                        errorBuilder: (_, __, ___) => Container(
                          height: 100,
                          width: 150,
                          color: Colors.grey.shade100,
                          child: const Icon(
                            Icons.broken_image,
                            color: AppTheme.textSecondary,
                          ),
                        ),
                      ),
                    )
                  : Text(
                      msg['content'] ?? '',
                      style: TextStyle(
                        color: isMe ? Colors.white : AppTheme.textPrimary,
                        fontSize: 14,
                        height: 1.4,
                      ),
                    ),
            ),
          ),
          if (isMe) ...[
            const SizedBox(width: 6),
            if (isFailed)
              const Icon(
                Icons.error_outline,
                size: 16,
                color: AppTheme.errorColor,
              )
            else
              const Icon(Icons.check, size: 14, color: AppTheme.successColor),
          ],
        ],
      ),
    );
  }

  Widget _buildInputBar() {
    return SafeArea(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 8,
              offset: const Offset(0, -2),
            ),
          ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Container(
              decoration: BoxDecoration(
                color: AppTheme.backgroundColor,
                borderRadius: BorderRadius.circular(12),
              ),
              child: IconButton(
                icon: const Icon(
                  Icons.add_rounded,
                  color: AppTheme.textSecondary,
                  size: 22,
                ),
                onPressed: () {},
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Container(
                decoration: BoxDecoration(
                  color: AppTheme.backgroundColor,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: AppTheme.dividerColor.withValues(alpha: 0.5),
                  ),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 4),
                child: TextField(
                  controller: _controller,
                  decoration: const InputDecoration(
                    hintText: 'Type a message...',
                    hintStyle: TextStyle(
                      color: AppTheme.textSecondary,
                      fontSize: 14,
                    ),
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 12,
                    ),
                  ),
                  textInputAction: TextInputAction.send,
                  onSubmitted: (_) => _sendMessage(),
                  maxLines: 5,
                  minLines: 1,
                  style: const TextStyle(
                    fontSize: 14,
                    color: AppTheme.textPrimary,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 6),
            GestureDetector(
              onTap: _controller.text.trim().isEmpty ? null : _sendMessage,
              child: Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  gradient: _controller.text.trim().isNotEmpty
                      ? const LinearGradient(
                          colors: [AppTheme.primaryColor, Color(0xFF008A42)],
                        )
                      : null,
                  color: _controller.text.trim().isNotEmpty
                      ? null
                      : AppTheme.backgroundColor,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(
                  Icons.send_rounded,
                  color: _controller.text.trim().isNotEmpty
                      ? Colors.white
                      : AppTheme.textSecondary,
                  size: 20,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
