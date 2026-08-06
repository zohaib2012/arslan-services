import 'package:flutter/material.dart';
import '../../core/config/theme_config.dart';
import '../../core/services/api_client.dart';
import 'package:shimmer/shimmer.dart';
import 'dispute_detail_screen.dart';

class MyDisputesScreen extends StatefulWidget {
  const MyDisputesScreen({super.key});

  @override
  State<MyDisputesScreen> createState() => _MyDisputesScreenState();
}

class _MyDisputesScreenState extends State<MyDisputesScreen> {
  final _api = ApiClient();
  List<Map<String, dynamic>> _disputes = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadDisputes();
  }

  Future<void> _loadDisputes() async {
    try {
      final res = await _api.get('/api/disputes');
      if (mounted) {
        setState(() {
          _disputes = (res.data is List)
              ? List<Map<String, dynamic>>.from(res.data)
              : [];
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'PENDING':
        return AppTheme.warningColor;
      case 'UNDER_REVIEW':
        return AppTheme.primaryColor;
      case 'RESOLVED':
        return AppTheme.successColor;
      default:
        return AppTheme.textSecondary;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Disputes')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _disputes.isEmpty
          ? const Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.gavel_outlined,
                    size: 64,
                    color: AppTheme.textSecondary,
                  ),
                  SizedBox(height: 16),
                  Text(
                    'No disputes raised',
                    style: TextStyle(color: AppTheme.textSecondary),
                  ),
                ],
              ),
            )
          : RefreshIndicator(
              onRefresh: _loadDisputes,
              child: ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: _disputes.length,
                itemBuilder: (_, i) {
                  final d = _disputes[i];
                  return Card(
                    margin: const EdgeInsets.only(bottom: 12),
                    child: InkWell(
                      onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => CustomerDisputeDetailScreen(
                            disputeId: d['id'] ?? '',
                          ),
                        ),
                      ),
                      borderRadius: BorderRadius.circular(12),
                      child: Padding(
                        padding: const EdgeInsets.all(12),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: Text(
                                    d['reason'] ?? '',
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 10,
                                    vertical: 4,
                                  ),
                                  decoration: BoxDecoration(
                                    color: _statusColor(
                                      d['status'] ?? '',
                                    ).withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(
                                    (d['status'] ?? '').toString().replaceAll(
                                      '_',
                                      ' ',
                                    ),
                                    style: TextStyle(
                                      color: _statusColor(d['status'] ?? ''),
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                const Icon(
                                  Icons.calendar_today,
                                  size: 14,
                                  color: AppTheme.textSecondary,
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  _formatDate(d['createdAt']),
                                  style: const TextStyle(
                                    fontSize: 13,
                                    color: AppTheme.textSecondary,
                                  ),
                                ),
                                const SizedBox(width: 16),
                                const Icon(
                                  Icons.attach_file,
                                  size: 14,
                                  color: AppTheme.textSecondary,
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  '${d['evidence'] != null ? (d['evidence'] as List).length : 0} evidence',
                                  style: const TextStyle(
                                    fontSize: 13,
                                    color: AppTheme.textSecondary,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
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
