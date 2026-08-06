import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:shimmer/shimmer.dart';
import '../../core/services/api_client.dart';
import '../../core/config/theme_config.dart';

class WorkerChatScreen extends StatefulWidget {
  final String userId;
  final String userName;
  final String? userPhoto;

  const WorkerChatScreen({
    super.key,
    required this.userId,
    required this.userName,
    this.userPhoto,
  });

  @override
  State<WorkerChatScreen> createState() => _WorkerChatScreenState();
}

class _WorkerChatScreenState extends State<WorkerChatScreen> {
  final _api = ApiClient();
  final _msgCtl = TextEditingController();
  final _scrollCtl = ScrollController();

  bool _isLoading = true;
  String? _error;
  bool _isSending = false;
  List<Map<String, dynamic>> _messages = [];

  @override
  void initState() {
    super.initState();
    _loadMessages();
  }

  @override
  void dispose() {
    _msgCtl.dispose();
    _scrollCtl.dispose();
    super.dispose();
  }

  Future<void> _loadMessages() async {
    if (!mounted) return;
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final res = await _api.get('/api/chat/messages/${widget.userId}');
      final data = res.data;
      final list = (data is List)
          ? data
          : (data['messages'] ?? data['data'] ?? []);
      if (!mounted) return;
      setState(() {
        _messages = List<Map<String, dynamic>>.from(list);
        _isLoading = false;
      });
      _scrollToEnd();
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _error = 'Failed to load messages';
      });
    }
  }

  Future<void> _send() async {
    final text = _msgCtl.text.trim();
    if (text.isEmpty) return;

    setState(() => _isSending = true);

    final temp = {
      'id': DateTime.now().millisecondsSinceEpoch.toString(),
      'text': text,
      'senderId': 'me',
      'createdAt': DateTime.now().toIso8601String(),
    };

    setState(() => _messages.add(temp));
    _msgCtl.clear();
    _scrollToEnd();

    try {
      await _api.post(
        '/api/chat/send',
        data: {'receiverId': widget.userId, 'text': text},
      );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to send'),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isSending = false);
    }
  }

  void _scrollToEnd() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollCtl.hasClients) {
        _scrollCtl.animateTo(
          _scrollCtl.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _launchUrl(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) await launchUrl(uri);
  }

  String _formatTime(String dateStr) {
    final d = DateTime.tryParse(dateStr);
    if (d == null) return '';
    return '${d.hour.toString().padLeft(2, '0')}:${d.minute.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leadingWidth: 56,
        leading: Padding(
          padding: const EdgeInsets.only(left: 8),
          child: Container(
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: const Color(0xFFE8F5E9), width: 2),
            ),
            child: CircleAvatar(
              radius: 18,
              backgroundColor: const Color(0xFFE8F5E9),
              backgroundImage: widget.userPhoto != null
                  ? NetworkImage(widget.userPhoto!)
                  : null,
              child: widget.userPhoto == null
                  ? Text(
                      widget.userName[0].toUpperCase(),
                      style: TextStyle(
                        color: AppTheme.primaryColor,
                        fontWeight: FontWeight.w700,
                      ),
                    )
                  : null,
            ),
          ),
        ),
        title: Text(
          widget.userName,
          style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.call_rounded),
            tooltip: 'Call',
            onPressed: () => _launchUrl('tel:${widget.userId}'),
          ),
          IconButton(
            icon: const Icon(Icons.wechat_rounded),
            tooltip: 'WhatsApp',
            onPressed: () => _launchUrl('https://wa.me/${widget.userId}'),
          ),
        ],
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) return _buildShimmer();
    if (_error != null) return _buildError();

    return Column(
      children: [
        Expanded(
          child: _messages.isEmpty
              ? _buildEmptyChat()
              : ListView.builder(
                  controller: _scrollCtl,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 16,
                  ),
                  itemCount: _messages.length,
                  itemBuilder: (_, i) => _buildBubble(_messages[i]),
                ),
        ),
        _buildInput(),
      ],
    );
  }

  Widget _buildBubble(Map<String, dynamic> msg) {
    final isMine = msg['senderId'] == 'me';
    final isImage = msg['imageUrl'] != null;

    return Align(
      alignment: isMine ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.75,
        ),
        padding: EdgeInsets.all(isImage ? 4 : 12),
        decoration: BoxDecoration(
          gradient: isMine
              ? LinearGradient(
                  colors: [AppTheme.primaryColor, Color(0xFF4CAF50)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                )
              : null,
          color: isMine ? null : Colors.white,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(18),
            topRight: const Radius.circular(18),
            bottomLeft: Radius.circular(isMine ? 18 : 4),
            bottomRight: Radius.circular(isMine ? 4 : 18),
          ),
          boxShadow: isMine
              ? [
                  BoxShadow(
                    color: AppTheme.primaryColor.withValues(alpha: 0.25),
                    blurRadius: 6,
                    offset: const Offset(0, 3),
                  ),
                ]
              : [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ],
        ),
        child: isImage
            ? ClipRRect(
                borderRadius: BorderRadius.circular(14),
                child: Image.network(
                  msg['imageUrl'],
                  fit: BoxFit.cover,
                  loadingBuilder: (_, child, progress) {
                    if (progress == null) return child;
                    return SizedBox(
                      height: 200,
                      width: 200,
                      child: Center(
                        child: CircularProgressIndicator(
                          value: progress.expectedTotalBytes != null
                              ? progress.cumulativeBytesLoaded /
                                    progress.expectedTotalBytes!
                              : null,
                        ),
                      ),
                    );
                  },
                  errorBuilder: (_, _a, _b) => const SizedBox(
                    height: 200,
                    width: 200,
                    child: Center(child: Icon(Icons.broken_image)),
                  ),
                ),
              )
            : Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    msg['text'] ?? '',
                    style: TextStyle(
                      color: isMine ? Colors.white : AppTheme.textPrimary,
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _formatTime(msg['createdAt'] ?? ''),
                    style: TextStyle(
                      fontSize: 10,
                      color: isMine
                          ? Colors.white.withValues(alpha: 0.7)
                          : const Color(0xFF9E9E9E),
                    ),
                  ),
                ],
              ),
      ),
    );
  }

  Widget _buildInput() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 6,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _msgCtl,
              textInputAction: TextInputAction.send,
              onSubmitted: (_) => _send(),
              decoration: InputDecoration(
                hintText: 'Type a message...',
                filled: true,
                fillColor: const Color(0xFFF5F5F5),
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 18,
                  vertical: 12,
                ),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(26),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ),
          const SizedBox(width: 8),
          GestureDetector(
            onTap: _isSending ? null : _send,
            child: Container(
              width: 46,
              height: 46,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [AppTheme.primaryColor, Color(0xFF4CAF50)],
                ),
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.primaryColor.withValues(alpha: 0.3),
                    blurRadius: 8,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: _isSending
                  ? const Padding(
                      padding: EdgeInsets.all(12),
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Icon(
                      Icons.send_rounded,
                      color: Colors.white,
                      size: 20,
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyChat() {
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
              Icons.chat_outlined,
              size: 48,
              color: Color(0xFF81C784),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'Start chatting with ${widget.userName}',
            style: const TextStyle(
              fontSize: 17,
              fontWeight: FontWeight.w600,
              color: AppTheme.textPrimary,
            ),
          ),
          const SizedBox(height: 4),
          const Text(
            'Send your first message',
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
              onPressed: _loadMessages,
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
    return Column(
      children: [
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 16),
            child: Shimmer.fromColors(
              baseColor: Colors.grey.shade200,
              highlightColor: Colors.grey.shade50,
              child: Column(
                children: List.generate(8, (i) {
                  final isRight = i % 2 == 0;
                  return Align(
                    alignment: isRight
                        ? Alignment.centerRight
                        : Alignment.centerLeft,
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      width:
                          MediaQuery.of(context).size.width *
                          (isRight ? 0.6 : 0.55),
                      height: 50,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.only(
                          topLeft: const Radius.circular(18),
                          topRight: const Radius.circular(18),
                          bottomLeft: Radius.circular(isRight ? 18 : 4),
                          bottomRight: Radius.circular(isRight ? 4 : 18),
                        ),
                      ),
                    ),
                  );
                }),
              ),
            ),
          ),
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: Colors.white,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.04),
                blurRadius: 6,
                offset: const Offset(0, -2),
              ),
            ],
          ),
          child: Row(
            children: [
              Expanded(
                child: Container(
                  height: 46,
                  decoration: BoxDecoration(
                    color: const Color(0xFFF5F5F5),
                    borderRadius: BorderRadius.circular(26),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Container(
                width: 46,
                height: 46,
                decoration: const BoxDecoration(
                  color: Color(0xFFF5F5F5),
                  shape: BoxShape.circle,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
