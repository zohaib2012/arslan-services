import 'package:flutter/material.dart';
import '../../core/config/theme_config.dart';
import '../../core/services/api_client.dart';

class WriteReviewScreen extends StatefulWidget {
  final String bookingId;
  final String workerName;
  final String? serviceName;

  const WriteReviewScreen({
    super.key,
    required this.bookingId,
    required this.workerName,
    this.serviceName,
  });

  @override
  State<WriteReviewScreen> createState() => _WriteReviewScreenState();
}

class _WriteReviewScreenState extends State<WriteReviewScreen> {
  final _api = ApiClient();
  final _commentController = TextEditingController();
  int _rating = 0;
  bool _isLoading = false;

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_rating == 0) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Please select a rating')));
      return;
    }
    setState(() => _isLoading = true);
    try {
      await _api.post(
        '/api/reviews',
        data: {
          'bookingId': widget.bookingId,
          'rating': _rating,
          'comment': _commentController.text.trim(),
        },
      );
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Review submitted')));
        Navigator.pop(context);
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to submit review')),
        );
      }
    }
    if (mounted) setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Write Review')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    const Icon(
                      Icons.person,
                      size: 48,
                      color: AppTheme.primaryColor,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      widget.workerName,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    if (widget.serviceName != null)
                      Text(
                        widget.serviceName!,
                        style: const TextStyle(color: AppTheme.textSecondary),
                      ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'Rate your experience',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(5, (i) {
                return GestureDetector(
                  onTap: () => setState(() => _rating = i + 1),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    child: Icon(
                      i < _rating ? Icons.star : Icons.star_border,
                      size: 40,
                      color: i < _rating
                          ? AppTheme.warningColor
                          : Colors.grey.shade300,
                    ),
                  ),
                );
              }),
            ),
            const SizedBox(height: 24),
            TextFormField(
              controller: _commentController,
              decoration: const InputDecoration(
                labelText: 'Write a comment (optional)',
                hintText: 'Share your experience with this worker...',
                alignLabelWithHint: true,
              ),
              maxLines: 4,
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _submit,
                child: _isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : const Text('Submit Review'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
