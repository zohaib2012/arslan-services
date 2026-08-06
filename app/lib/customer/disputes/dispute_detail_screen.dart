import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import '../../core/config/theme_config.dart';
import '../../core/services/api_client.dart';
import '../../core/widgets/state_widgets.dart';
import '../../core/widgets/pulse_widget.dart';
import '../../core/utils/date_helper.dart';

class CustomerDisputeDetailScreen extends StatefulWidget {
  final String disputeId;
  const CustomerDisputeDetailScreen({super.key, required this.disputeId});

  @override
  State<CustomerDisputeDetailScreen> createState() =>
      _CustomerDisputeDetailScreenState();
}

class _CustomerDisputeDetailScreenState
    extends State<CustomerDisputeDetailScreen> {
  final _api = ApiClient();
  Map<String, dynamic>? _dispute;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadDispute();
  }

  Future<void> _loadDispute() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final res = await _api.get('/api/disputes/${widget.disputeId}');
      if (mounted) {
        setState(() {
          _dispute = res.data as Map<String, dynamic>?;
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _error = 'Failed to load dispute details';
        });
      }
    }
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'OPEN':
        return AppTheme.warningColor;
      case 'RESOLVED_CUSTOMER':
        return AppTheme.successColor;
      case 'RESOLVED_WORKER':
        return const Color(0xFF1565C0);
      case 'DISMISSED':
        return AppTheme.textSecondary;
      default:
        return AppTheme.textSecondary;
    }
  }

  IconData _statusIcon(String status) {
    switch (status) {
      case 'OPEN':
        return Icons.pending_actions;
      case 'RESOLVED_CUSTOMER':
        return Icons.check_circle;
      case 'RESOLVED_WORKER':
        return Icons.verified;
      case 'DISMISSED':
        return Icons.cancel;
      default:
        return Icons.info;
    }
  }

  String _statusDescription(String status) {
    switch (status) {
      case 'OPEN':
        return 'Dispute is under review';
      case 'RESOLVED_CUSTOMER':
        return 'Resolved in your favour';
      case 'RESOLVED_WORKER':
        return 'Resolved in worker\'s favour';
      case 'DISMISSED':
        return 'Dispute was dismissed';
      default:
        return '';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      appBar: AppBar(
        backgroundColor: AppTheme.primaryColor,
        foregroundColor: Colors.white,
        title: const Text(
          'Dispute Detail',
          style: TextStyle(fontWeight: FontWeight.w700, color: Colors.white),
        ),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) return _buildShimmer();
    if (_error != null) {
      return ErrorStateWidget(message: _error!, onRetry: _loadDispute);
    }
    if (_dispute == null) {
      return const EmptyStateWidget(message: 'Dispute not found');
    }

    final d = _dispute!;
    final status = (d['status'] ?? 'OPEN').toString();
    final statusColor = _statusColor(status);
    final raiser = d['raiser'] as Map<String, dynamic>? ?? {};
    final booking = d['booking'] as Map<String, dynamic>?;
    final evidence = d['evidence'] as List? ?? [];

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          _buildStatusBanner(status, statusColor),
          const SizedBox(height: 16),
          _buildInfoCard(d, raiser, booking),
          const SizedBox(height: 14),
          if (evidence.isNotEmpty) ...[
            _buildEvidenceGrid(evidence),
            const SizedBox(height: 14),
          ],
          if (status != 'OPEN') ...[
            _buildResolutionCard(d),
            const SizedBox(height: 14),
          ],
          _buildTimelineCard(d),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildShimmer() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          PulseWidget(
            child: Shimmer.fromColors(
              baseColor: Colors.grey.shade200,
              highlightColor: Colors.grey.shade100,
              child: Container(
                height: 140,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                ),
              ),
            ),
          ),
          const SizedBox(height: 16),
          ...List.generate(3, (i) {
            return Padding(
              padding: const EdgeInsets.only(bottom: 14),
              child: PulseWidget(
                child: Shimmer.fromColors(
                  baseColor: Colors.grey.shade200,
                  highlightColor: Colors.grey.shade100,
                  child: Container(
                    height: i == 2 ? 120 : 100,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                ),
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildStatusBanner(String status, Color color) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            color.withValues(alpha: 0.08),
            color.withValues(alpha: 0.03),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withValues(alpha: 0.2), width: 1.5),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.12),
              shape: BoxShape.circle,
            ),
            child: Icon(_statusIcon(status), size: 36, color: color),
          ),
          const SizedBox(height: 12),
          Text(
            status.replaceAll('_', ' '),
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w800,
              color: color,
              letterSpacing: -0.3,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            _statusDescription(status),
            style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoCard(
    Map<String, dynamic> d,
    Map<String, dynamic> raiser,
    Map<String, dynamic>? booking,
  ) {
    final reason = d['reason']?.toString().replaceAll('_', ' ') ?? 'N/A';
    final description = d['description'] as String?;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: _cardDecoration(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _cardSectionTitle('Dispute Details'),
          const SizedBox(height: 12),
          _infoRow(
            Icons.report_outlined,
            'Reason',
            reason,
            AppTheme.errorColor,
          ),
          if (description != null && description.isNotEmpty) ...[
            const SizedBox(height: 10),
            _infoRow(
              Icons.description_outlined,
              'Description',
              description,
              AppTheme.primaryColor,
            ),
          ],
          const SizedBox(height: 10),
          _infoRow(
            Icons.person_outlined,
            'Raised by',
            raiser['fullName'] ?? 'N/A',
            AppTheme.accentColor,
          ),
          if (booking != null) ...[
            const SizedBox(height: 10),
            _infoRow(
              Icons.bookmark_outlined,
              'Booking Reference',
              '#${booking['id'] ?? 'N/A'}',
              const Color(0xFF1565C0),
            ),
          ],
          const SizedBox(height: 10),
          _infoRow(
            Icons.calendar_today_outlined,
            'Created',
            DateFormatHelper.formatDateTime(d['createdAt']?.toString()),
            AppTheme.primaryColor,
          ),
          if (d['updatedAt'] != null) ...[
            const SizedBox(height: 10),
            _infoRow(
              Icons.schedule_outlined,
              'Last Updated',
              DateFormatHelper.relativeTime(d['updatedAt']?.toString()),
              AppTheme.textSecondary,
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildEvidenceGrid(List evidence) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: _cardDecoration(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _cardSectionTitle('Evidence (${evidence.length})'),
          const SizedBox(height: 12),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              crossAxisSpacing: 8,
              mainAxisSpacing: 8,
              childAspectRatio: 1,
            ),
            itemCount: evidence.length,
            itemBuilder: (_, i) {
              final item = evidence[i] as Map<String, dynamic>;
              final url = item['fileUrl']?.toString() ?? '';
              return GestureDetector(
                onTap: () => _showFullScreenImage(context, url),
                child: Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppTheme.dividerColor),
                  ),
                  clipBehavior: Clip.antiAlias,
                  child: Image.network(
                    url,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) => Container(
                      color: AppTheme.dividerColor,
                      child: const Icon(
                        Icons.broken_image_outlined,
                        color: AppTheme.textSecondary,
                        size: 32,
                      ),
                    ),
                    loadingBuilder: (context, child, loadingProgress) {
                      if (loadingProgress == null) return child;
                      return Container(
                        color: AppTheme.dividerColor,
                        child: const Center(
                          child: CircularProgressIndicator(strokeWidth: 2),
                        ),
                      );
                    },
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildResolutionCard(Map<String, dynamic> d) {
    final result = d['resolutionResult'] as String?;
    final notes = d['resolutionNotes'] as String?;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: _cardDecoration(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _cardSectionTitle('Resolution'),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppTheme.successColor.withValues(alpha: 0.06),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: AppTheme.successColor.withValues(alpha: 0.15),
              ),
            ),
            child: Row(
              children: [
                const Icon(
                  Icons.check_circle_outline,
                  color: AppTheme.successColor,
                  size: 20,
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    result ?? 'Dispute has been resolved',
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                ),
              ],
            ),
          ),
          if (notes != null && notes.isNotEmpty) ...[
            const SizedBox(height: 10),
            Text(
              notes,
              style: const TextStyle(
                fontSize: 13,
                color: AppTheme.textSecondary,
                height: 1.5,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildTimelineCard(Map<String, dynamic> d) {
    final createdAt = d['createdAt'] as String?;
    final updatedAt = d['updatedAt'] as String?;
    final resolvedAt = d['resolvedAt'] as String?;
    final status = (d['status'] ?? '').toString();

    final items = <Map<String, String>>[
      {
        'label': 'Dispute raised',
        'date': DateFormatHelper.relativeTime(createdAt),
        'icon': 'raised',
      },
    ];

    if (resolvedAt != null && status != 'OPEN') {
      items.add({
        'label': status.replaceAll('_', ' '),
        'date': DateFormatHelper.formatDateTime(resolvedAt),
        'icon': 'resolved',
      });
    } else if (updatedAt != null && createdAt != updatedAt) {
      items.add({
        'label': 'Updated',
        'date': DateFormatHelper.relativeTime(updatedAt),
        'icon': 'updated',
      });
    }

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: _cardDecoration(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _cardSectionTitle('Timeline'),
          const SizedBox(height: 14),
          ...items.asMap().entries.map((entry) {
            final i = entry.key;
            final item = entry.value;
            final isLast = i == items.length - 1;
            final isResolved = item['icon'] == 'resolved';

            final iconColor = isResolved
                ? AppTheme.successColor
                : AppTheme.primaryColor;
            final icon = isResolved
                ? Icons.check_circle
                : Icons.radio_button_checked;

            return Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SizedBox(
                  width: 28,
                  child: Column(
                    children: [
                      Container(
                        width: 28,
                        height: 28,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: iconColor,
                        ),
                        child: Icon(icon, size: 16, color: Colors.white),
                      ),
                      if (!isLast)
                        Container(
                          width: 2.5,
                          height: 36,
                          color: iconColor.withValues(alpha: 0.3),
                        ),
                    ],
                  ),
                ),
                const SizedBox(width: 14),
                Padding(
                  padding: const EdgeInsets.only(top: 3),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        item['label']!,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: AppTheme.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        item['date']!,
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppTheme.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            );
          }),
        ],
      ),
    );
  }

  void _showFullScreenImage(BuildContext context, String url) {
    showDialog(
      context: context,
      builder: (_) => Dialog(
        backgroundColor: Colors.transparent,
        insetPadding: EdgeInsets.zero,
        child: Stack(
          children: [
            InteractiveViewer(
              child: Center(
                child: Image.network(
                  url,
                  fit: BoxFit.contain,
                  errorBuilder: (context, error, stackTrace) => const Center(
                    child: Icon(
                      Icons.broken_image_outlined,
                      color: AppTheme.textSecondary,
                      size: 64,
                    ),
                  ),
                ),
              ),
            ),
            Positioned(
              top: 48,
              right: 16,
              child: GestureDetector(
                onTap: () => Navigator.pop(context),
                child: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha: 0.5),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.close, color: Colors.white, size: 24),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  BoxDecoration _cardDecoration() {
    return BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(16),
      boxShadow: [
        BoxShadow(
          color: Colors.black.withValues(alpha: 0.04),
          blurRadius: 10,
          offset: const Offset(0, 3),
        ),
      ],
    );
  }

  Widget _cardSectionTitle(String title) {
    return Row(
      children: [
        Container(
          width: 3,
          height: 16,
          decoration: BoxDecoration(
            color: AppTheme.primaryColor,
            borderRadius: BorderRadius.circular(2),
          ),
        ),
        const SizedBox(width: 8),
        Text(
          title,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w700,
            color: AppTheme.textPrimary,
          ),
        ),
      ],
    );
  }

  Widget _infoRow(IconData icon, String label, String value, Color color) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(6),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.06),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, size: 16, color: color),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: const TextStyle(
                  fontSize: 11,
                  color: AppTheme.textSecondary,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                value,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.textPrimary,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
