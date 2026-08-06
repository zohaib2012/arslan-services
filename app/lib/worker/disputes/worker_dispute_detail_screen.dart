import 'package:flutter/material.dart';
import '../../core/config/theme_config.dart';

class WorkerDisputeDetailScreen extends StatelessWidget {
  final Map<String, dynamic> dispute;

  const WorkerDisputeDetailScreen({super.key, required this.dispute});

  @override
  Widget build(BuildContext context) {
    final booking = dispute['booking'] ?? {};
    final customer = booking['customer'] ?? {};
    final service = booking['service'] ?? {};
    final reason = dispute['reason'] ?? '';
    final description = dispute['description'] ?? '';
    final status = dispute['status'] ?? 'OPEN';
    final resolution = dispute['resolution'] ?? '';
    final evidence = List<Map<String, dynamic>>.from(dispute['evidence'] ?? []);
    final createdAt = dispute['createdAt'] ?? '';

    final statusColor = _statusColor(status);

    return Scaffold(
      appBar: AppBar(title: const Text('Dispute Detail')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildStatusBanner(status, statusColor),
            const SizedBox(height: 16),
            _buildBookingInfo(booking, customer, service),
            const SizedBox(height: 16),
            _buildReasonSection(reason, description),
            if (evidence.isNotEmpty) ...[
              const SizedBox(height: 16),
              _buildEvidenceSection(evidence, context),
            ],
            if (resolution.isNotEmpty) ...[
              const SizedBox(height: 16),
              _buildResolutionSection(resolution, statusColor),
            ],
            const SizedBox(height: 16),
            _buildTimeline(createdAt, status),
          ],
        ),
      ),
    );
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

  Widget _buildStatusBanner(String status, Color color) {
    IconData icon;
    switch (status) {
      case 'OPEN':
        icon = Icons.warning_amber;
        break;
      case 'RESOLVED':
        icon = Icons.check_circle;
        break;
      case 'CLOSED':
        icon = Icons.cancel;
        break;
      default:
        icon = Icons.info;
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(width: 12),
          Text(
            'Dispute $status',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBookingInfo(
    Map<String, dynamic> booking,
    Map<String, dynamic> customer,
    Map<String, dynamic> service,
  ) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Booking Information',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: AppTheme.textPrimary,
              ),
            ),
            const SizedBox(height: 14),
            Row(
              children: [
                CircleAvatar(
                  radius: 24,
                  backgroundImage: customer['profilePhoto'] != null
                      ? NetworkImage(customer['profilePhoto'])
                      : null,
                  child: customer['profilePhoto'] == null
                      ? Text((customer['fullName'] ?? 'C')[0].toUpperCase())
                      : null,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        customer['fullName'] ?? 'Customer',
                        style: const TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 15,
                        ),
                      ),
                      Text(
                        service['name'] ?? 'Service',
                        style: const TextStyle(
                          fontSize: 13,
                          color: AppTheme.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            _infoRow('Service', service['name'] ?? 'N/A'),
            _infoRow('Booking ID', booking['id'] ?? 'N/A'),
            _infoRow('Type', booking['bookingType'] ?? 'N/A'),
            _infoRow('Address', booking['address'] ?? 'N/A'),
          ],
        ),
      ),
    );
  }

  Widget _buildReasonSection(String reason, String description) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Reason',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: AppTheme.textPrimary,
              ),
            ),
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.orange.shade50,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                reason.isNotEmpty ? reason : 'No reason provided',
                style: TextStyle(
                  fontSize: 14,
                  color: reason.isNotEmpty
                      ? AppTheme.textPrimary
                      : AppTheme.textSecondary,
                ),
              ),
            ),
            if (description.isNotEmpty) ...[
              const SizedBox(height: 12),
              const Text(
                'Description',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: AppTheme.textSecondary,
                ),
              ),
              const SizedBox(height: 4),
              Text(description, style: const TextStyle(fontSize: 14)),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildEvidenceSection(
    List<Map<String, dynamic>> evidence,
    BuildContext context,
  ) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Evidence',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: AppTheme.textPrimary,
              ),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 10,
              runSpacing: 10,
              children: evidence.map((item) {
                final url = item['url'] ?? '';
                return GestureDetector(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => Scaffold(
                          backgroundColor: Colors.black,
                          appBar: AppBar(backgroundColor: Colors.black),
                          body: Center(
                            child: InteractiveViewer(
                              child: Image.network(url, fit: BoxFit.contain),
                            ),
                          ),
                        ),
                      ),
                    );
                  },
                  child: Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.grey.shade300),
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(7),
                      child: Image.network(
                        url,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => const Icon(
                          Icons.broken_image,
                          size: 30,
                          color: Colors.grey,
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildResolutionSection(String resolution, Color statusColor) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(
                  Icons.admin_panel_settings_outlined,
                  size: 18,
                  color: AppTheme.primaryColor,
                ),
                SizedBox(width: 6),
                Text(
                  'Admin Resolution',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.textPrimary,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: statusColor.withOpacity(0.08),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: statusColor.withOpacity(0.2)),
              ),
              child: Text(resolution, style: const TextStyle(fontSize: 14)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTimeline(String createdAt, String status) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Timeline',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: AppTheme.textPrimary,
              ),
            ),
            const SizedBox(height: 14),
            _timelineItem('Dispute raised', createdAt, true),
            if (status == 'RESOLVED' || status == 'CLOSED')
              _timelineItem('Dispute $status', '', false),
          ],
        ),
      ),
    );
  }

  Widget _timelineItem(String title, String date, bool isFirst) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            Container(
              width: 12,
              height: 12,
              decoration: BoxDecoration(
                color: AppTheme.primaryColor,
                shape: BoxShape.circle,
                border: Border.all(color: AppTheme.secondaryColor, width: 2),
              ),
            ),
            if (!isFirst)
              Container(
                width: 2,
                height: 30,
                color: AppTheme.secondaryColor.withOpacity(0.3),
              ),
          ],
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontWeight: FontWeight.w500,
                  fontSize: 14,
                ),
              ),
              if (date.isNotEmpty)
                Text(
                  _formatDate(date),
                  style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
                ),
            ],
          ),
        ),
      ],
    );
  }

  String _formatDate(String dateStr) {
    final date = DateTime.tryParse(dateStr);
    if (date == null) return '';
    return '${date.day}/${date.month}/${date.year} ${date.hour}:${date.minute.toString().padLeft(2, '0')}';
  }

  Widget _infoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 90,
            child: Text(
              label,
              style: const TextStyle(
                fontSize: 12,
                color: AppTheme.textSecondary,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontSize: 12, color: AppTheme.textPrimary),
            ),
          ),
        ],
      ),
    );
  }
}
