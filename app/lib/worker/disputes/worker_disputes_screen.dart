import 'package:flutter/material.dart';
import '../../core/services/api_client.dart';
import '../../core/config/theme_config.dart';
import 'worker_dispute_detail_screen.dart';

class WorkerDisputesScreen extends StatefulWidget {
  const WorkerDisputesScreen({super.key});

  @override
  State<WorkerDisputesScreen> createState() => _WorkerDisputesScreenState();
}

class _WorkerDisputesScreenState extends State<WorkerDisputesScreen> {
  final _api = ApiClient();
  bool _isLoading = true;
  List<Map<String, dynamic>> _disputes = [];

  @override
  void initState() {
    super.initState();
    _fetchDisputes();
  }

  Future<void> _fetchDisputes() async {
    try {
      final res = await _api.get('/api/disputes/my');
      final data = res.data;
      final list = (data is List)
          ? data
          : (data['disputes'] ?? data['data'] ?? []);
      setState(() {
        _disputes = List<Map<String, dynamic>>.from(list);
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to load disputes')),
        );
      }
    }
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'OPEN':
        return Colors.orange;
      case 'RESOLVED':
        return AppTheme.successColor;
      case 'CLOSED':
        return Colors.grey;
      default:
        return Colors.blue;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Disputes')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _fetchDisputes,
              child: _disputes.isEmpty
                  ? _buildEmptyState()
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _disputes.length,
                      itemBuilder: (context, index) =>
                          _buildDisputeCard(_disputes[index]),
                    ),
            ),
    );
  }

  Widget _buildDisputeCard(Map<String, dynamic> dispute) {
    final booking = dispute['booking'] ?? {};
    final customer = booking['customer'] ?? {};
    final service = booking['service'] ?? {};
    final reason = dispute['reason'] ?? '';
    final status = dispute['status'] ?? 'OPEN';
    final color = _statusColor(status);
    final dateStr = dispute['createdAt'] ?? '';

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () async {
          await Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => WorkerDisputeDetailScreen(dispute: dispute),
            ),
          );
          _fetchDisputes();
        },
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              CircleAvatar(
                radius: 22,
                backgroundImage: customer['profilePhoto'] != null
                    ? NetworkImage(customer['profilePhoto'])
                    : null,
                child: customer['profilePhoto'] == null
                    ? CircleAvatar(
                        radius: 22,
                        backgroundColor: AppTheme.secondaryColor.withOpacity(
                          0.15,
                        ),
                        child: Text(
                          (customer['fullName'] ?? 'C')[0].toUpperCase(),
                          style: const TextStyle(
                            color: AppTheme.primaryColor,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      )
                    : null,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          customer['fullName'] ?? 'Customer',
                          style: const TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 14,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 3,
                          ),
                          decoration: BoxDecoration(
                            color: color.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            status,
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w600,
                              color: color,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      service['name'] ?? 'Service',
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppTheme.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      reason,
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppTheme.textPrimary,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _formatDate(dateStr),
                      style: TextStyle(
                        fontSize: 11,
                        color: Colors.grey.shade500,
                      ),
                    ),
                  ],
                ),
              ),
              const Icon(
                Icons.chevron_right,
                color: AppTheme.textSecondary,
                size: 20,
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _formatDate(String dateStr) {
    final date = DateTime.tryParse(dateStr);
    if (date == null) return '';
    return '${date.day}/${date.month}/${date.year} ${date.hour}:${date.minute.toString().padLeft(2, '0')}';
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.report_problem_outlined,
            size: 64,
            color: Colors.grey.shade400,
          ),
          const SizedBox(height: 12),
          const Text(
            'No disputes',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w500,
              color: AppTheme.textSecondary,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'You have no disputes raised',
            style: TextStyle(fontSize: 13, color: Colors.grey.shade500),
          ),
        ],
      ),
    );
  }
}
