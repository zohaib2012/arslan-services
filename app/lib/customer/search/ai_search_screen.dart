import 'package:flutter/material.dart';
import '../../core/config/theme_config.dart';
import '../../core/services/api_client.dart';

class AiSearchScreen extends StatefulWidget {
  const AiSearchScreen({super.key});

  @override
  State<AiSearchScreen> createState() => _AiSearchScreenState();
}

class _AiSearchScreenState extends State<AiSearchScreen> {
  final _api = ApiClient();
  final _controller = TextEditingController();
  final _scrollController = ScrollController();
  final List<_ChatMessage> _messages = [];
  bool _isLoading = false;
  String? _sessionId;

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
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

  Future<void> _send() async {
    final text = _controller.text.trim();
    if (text.isEmpty) return;
    _controller.clear();

    setState(() => _messages.add(_ChatMessage(text: text, isUser: true)));
    _scrollToBottom();

    setState(() => _isLoading = true);

    try {
      final endpoint = _sessionId != null ? '/api/ai/chat' : '/api/ai/search';
      final res = await _api.post(
        endpoint,
        data: {'query': text, if (_sessionId != null) 'sessionId': _sessionId},
      );
      final data = res.data;
      if (_sessionId == null && data['sessionId'] != null) {
        _sessionId = data['sessionId'];
      }
      final reply = data['reply'] ?? data['message'] ?? 'No results found.';
      final workers = data['workers'] as List<dynamic>?;

      if (mounted) {
        setState(() {
          _messages.add(
            _ChatMessage(
              text: reply,
              isUser: false,
              workers: workers
                  ?.map((w) => Map<String, dynamic>.from(w))
                  .toList(),
            ),
          );
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _messages.add(
            _ChatMessage(
              text: 'Something went wrong. Please try again.',
              isUser: false,
            ),
          );
          _isLoading = false;
        });
      }
    }
    _scrollToBottom();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('AI Assistant'),
        actions: [IconButton(icon: const Icon(Icons.mic), onPressed: () {})],
      ),
      body: Column(
        children: [
          Expanded(
            child: _messages.isEmpty ? _buildEmptyState() : _buildMessageList(),
          ),
          _buildInputBar(),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.chat,
            size: 64,
            color: AppTheme.accentColor.withOpacity(0.5),
          ),
          const SizedBox(height: 16),
          const Text(
            'Ask me to find a service...',
            style: TextStyle(color: AppTheme.textSecondary, fontSize: 16),
          ),
          const SizedBox(height: 24),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children:
                [
                  'Find a plumber near me',
                  'I need an electrician',
                  'Best cleaner in my area',
                ].map((q) {
                  return ActionChip(
                    label: Text(q),
                    onPressed: () {
                      _controller.text = q;
                      _send();
                    },
                  );
                }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildMessageList() {
    return ListView.builder(
      controller: _scrollController,
      padding: const EdgeInsets.all(16),
      itemCount: _messages.length + (_isLoading ? 1 : 0),
      itemBuilder: (_, i) {
        if (_isLoading && i == _messages.length) {
          return _buildTypingIndicator();
        }
        return _messages[i].build(context);
      },
    );
  }

  Widget _buildTypingIndicator() {
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: Colors.grey.shade200,
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(16),
            topRight: Radius.circular(16),
            bottomRight: Radius.circular(16),
          ),
        ),
        child: const SizedBox(
          width: 40,
          height: 20,
          child: Center(
            child: SizedBox(
              width: 20,
              height: 20,
              child: CircularProgressIndicator(strokeWidth: 2),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildInputBar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 4,
            offset: const Offset(0, -1),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _controller,
              decoration: InputDecoration(
                hintText: 'Describe what you need...',
                filled: true,
                fillColor: AppTheme.backgroundColor,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(24),
                  borderSide: BorderSide.none,
                ),
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 10,
                ),
              ),
              textInputAction: TextInputAction.send,
              onSubmitted: (_) => _send(),
            ),
          ),
          const SizedBox(width: 8),
          CircleAvatar(
            backgroundColor: AppTheme.primaryColor,
            child: IconButton(
              icon: const Icon(Icons.send, color: Colors.white, size: 20),
              onPressed: _isLoading ? null : _send,
            ),
          ),
        ],
      ),
    );
  }
}

class _ChatMessage {
  final String text;
  final bool isUser;
  final List<Map<String, dynamic>>? workers;

  _ChatMessage({required this.text, required this.isUser, this.workers});

  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: isUser
            ? CrossAxisAlignment.end
            : CrossAxisAlignment.start,
        children: [
          Align(
            alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
            child: Container(
              constraints: BoxConstraints(
                maxWidth: MediaQuery.of(context).size.width * 0.75,
              ),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: isUser ? AppTheme.primaryColor : Colors.grey.shade200,
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(16),
                  topRight: const Radius.circular(16),
                  bottomLeft: Radius.circular(isUser ? 16 : 0),
                  bottomRight: Radius.circular(isUser ? 0 : 16),
                ),
              ),
              child: Text(
                text,
                style: TextStyle(
                  color: isUser ? Colors.white : AppTheme.textPrimary,
                ),
              ),
            ),
          ),
          if (workers != null && workers!.isNotEmpty) ...[
            const SizedBox(height: 8),
            SizedBox(
              height: 120,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: workers!.length,
                separatorBuilder: (_, __) => const SizedBox(width: 8),
                itemBuilder: (_, i) {
                  final w = workers![i];
                  final user = w['user'] ?? {};
                  return GestureDetector(
                    onTap: () => Navigator.pushNamed(
                      context,
                      '/worker-detail',
                      arguments: w,
                    ),
                    child: Container(
                      width: 160,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: AppTheme.accentColor.withOpacity(0.3),
                        ),
                      ),
                      padding: const EdgeInsets.all(10),
                      child: Column(
                        children: [
                          CircleAvatar(
                            radius: 20,
                            backgroundImage: user['profilePhoto'] != null
                                ? NetworkImage(user['profilePhoto'])
                                : null,
                            child: user['profilePhoto'] == null
                                ? const Icon(Icons.person, size: 20)
                                : null,
                          ),
                          const SizedBox(height: 6),
                          Text(
                            user['fullName'] ?? '',
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          Text(
                            '${w['avgRating'] ?? 0} ★',
                            style: const TextStyle(fontSize: 11),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ],
      ),
    );
  }
}
