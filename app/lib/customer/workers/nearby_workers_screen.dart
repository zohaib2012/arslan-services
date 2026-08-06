import 'package:flutter/material.dart';
import '../../core/config/theme_config.dart';
import '../../core/services/api_client.dart';
import 'package:shimmer/shimmer.dart';

class NearbyWorkersScreen extends StatefulWidget {
  const NearbyWorkersScreen({super.key});

  @override
  State<NearbyWorkersScreen> createState() => _NearbyWorkersScreenState();
}

class _NearbyWorkersScreenState extends State<NearbyWorkersScreen> {
  final _api = ApiClient();
  List<Map<String, dynamic>> _workers = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadWorkers();
  }

  Future<void> _loadWorkers() async {
    setState(() => _isLoading = true);
    try {
      final res = await _api.get(
        '/api/workers/nearby',
        params: {'limit': '50'},
      );
      if (mounted) {
        setState(() {
          _workers = (res.data is List)
              ? List<Map<String, dynamic>>.from(res.data)
              : [];
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Nearby Workers')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadWorkers,
              child: _workers.isEmpty
                  ? const Center(child: Text('No nearby workers found'))
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _workers.length,
                      itemBuilder: (_, i) {
                        final w = _workers[i];
                        final user = w['user'] ?? {};
                        final distance =
                            ((w['distance'] as num?)?.toDouble() ??
                                    (i + 1) * 0.8)
                                .toStringAsFixed(1);
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
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        user['fullName'] ?? '',
                                        style: const TextStyle(
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                      Row(
                                        children: [
                                          const Icon(
                                            Icons.star,
                                            size: 14,
                                            color: AppTheme.warningColor,
                                          ),
                                          Text(
                                            ' ${w['avgRating'] ?? 0}',
                                            style: const TextStyle(
                                              fontSize: 13,
                                            ),
                                          ),
                                          const SizedBox(width: 12),
                                          const Icon(
                                            Icons.location_on,
                                            size: 14,
                                            color: AppTheme.textSecondary,
                                          ),
                                          Text(
                                            ' $distance km',
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
                                ElevatedButton(
                                  onPressed: () {},
                                  style: ElevatedButton.styleFrom(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 16,
                                      vertical: 8,
                                    ),
                                    textStyle: const TextStyle(fontSize: 13),
                                  ),
                                  child: const Text('Book'),
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
}
