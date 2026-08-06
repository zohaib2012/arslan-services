import 'package:flutter/material.dart';
import '../../core/config/theme_config.dart';
import '../../core/services/api_client.dart';
import 'package:shimmer/shimmer.dart';

class BlockedWorkersScreen extends StatefulWidget {
  const BlockedWorkersScreen({super.key});

  @override
  State<BlockedWorkersScreen> createState() => _BlockedWorkersScreenState();
}

class _BlockedWorkersScreenState extends State<BlockedWorkersScreen> {
  final _api = ApiClient();
  List<Map<String, dynamic>> _blocked = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadBlocked();
  }

  Future<void> _loadBlocked() async {
    try {
      final res = await _api.get('/api/blocked-workers');
      if (mounted) {
        setState(() {
          _blocked = (res.data is List)
              ? List<Map<String, dynamic>>.from(res.data)
              : [];
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _unblock(String id) async {
    try {
      await _api.delete('/api/blocked-workers/$id');
      setState(
        () => _blocked.removeWhere((b) => b['workerId'] == id || b['id'] == id),
      );
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Worker unblocked')));
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Failed to unblock')));
      }
    }
  }

  Future<void> _confirmUnblock(Map<String, dynamic> item) async {
    final worker = item['worker'] ?? {};
    final user = worker['user'] ?? {};
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Unblock Worker'),
        content: Text('Unblock ${user['fullName'] ?? 'this worker'}?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Unblock'),
          ),
        ],
      ),
    );
    if (confirm == true) _unblock(item['workerId'] ?? item['id']);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Blocked Workers')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _blocked.isEmpty
          ? const Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.block_outlined,
                    size: 64,
                    color: AppTheme.textSecondary,
                  ),
                  SizedBox(height: 16),
                  Text(
                    'No blocked workers',
                    style: TextStyle(color: AppTheme.textSecondary),
                  ),
                ],
              ),
            )
          : RefreshIndicator(
              onRefresh: _loadBlocked,
              child: ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: _blocked.length,
                itemBuilder: (_, i) {
                  final b = _blocked[i];
                  final worker = b['worker'] ?? {};
                  final user = worker['user'] ?? {};
                  return Card(
                    margin: const EdgeInsets.only(bottom: 12),
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Row(
                        children: [
                          CircleAvatar(
                            radius: 26,
                            backgroundImage: user['profilePhoto'] != null
                                ? NetworkImage(user['profilePhoto'])
                                : null,
                            child: user['profilePhoto'] == null
                                ? const Icon(Icons.person)
                                : null,
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  user['fullName'] ?? '',
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                Text(
                                  'Blocked on ${_formatDate(b['createdAt'])}',
                                  style: const TextStyle(
                                    fontSize: 13,
                                    color: AppTheme.textSecondary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          TextButton(
                            onPressed: () => _confirmUnblock(b),
                            child: const Text('Unblock'),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
    );
  }

  String _formatDate(String? dateStr) {
    if (dateStr == null) return 'N/A';
    final d = DateTime.tryParse(dateStr);
    if (d == null) return dateStr;
    return '${d.day}/${d.month}/${d.year}';
  }
}
