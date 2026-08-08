import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:latlong2/latlong.dart';
import '../../core/config/theme_config.dart';
import '../../core/services/api_client.dart';
import '../../core/widgets/app_map_widget.dart';

class NearbyWorkersScreen extends StatefulWidget {
  const NearbyWorkersScreen({super.key});

  @override
  State<NearbyWorkersScreen> createState() => _NearbyWorkersScreenState();
}

class _NearbyWorkersScreenState extends State<NearbyWorkersScreen> {
  final _api = ApiClient();
  static const _refPoint = LatLng(31.5204, 74.3587); // Lahore
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
        params: {
          'lat': _refPoint.latitude.toString(),
          'lng': _refPoint.longitude.toString(),
          'radius': '10',
        },
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

  List<Map<String, dynamic>> _serviceAreas(Map<String, dynamic> w) {
    final areas = w['serviceAreas'];
    if (areas is! List) return [];
    return areas.whereType<Map<String, dynamic>>().toList();
  }

  LatLng? _nearestPoint(Map<String, dynamic> w) {
    LatLng? nearest;
    for (final a in _serviceAreas(w)) {
      final lat = double.tryParse(a['latitude']?.toString() ?? '');
      final lng = double.tryParse(a['longitude']?.toString() ?? '');
      if (lat == null || lng == null) continue;
      final p = LatLng(lat, lng);
      final d = _distanceKm(_refPoint, p);
      if (nearest == null || d < _distanceKm(_refPoint, nearest)) {
        nearest = p;
      }
    }
    return nearest;
  }

  double _distanceKm(LatLng a, LatLng b) {
    const r = 6371.0;
    final dLat = _deg2rad(b.latitude - a.latitude);
    final dLng = _deg2rad(b.longitude - a.longitude);
    final h =
        math.sin(dLat / 2) * math.sin(dLat / 2) +
        math.cos(_deg2rad(a.latitude)) *
            math.cos(_deg2rad(b.latitude)) *
            math.sin(dLng / 2) *
            math.sin(dLng / 2);
    return 2 * r * math.asin(math.sqrt(h));
  }

  double _deg2rad(double deg) => deg * math.pi / 180.0;

  String _formatDistance(double? d) {
    if (d == null) return 'Nearby';
    if (d < 1) return '${(d * 1000).round()} m';
    return '${d.toStringAsFixed(1)} km';
  }

  List<AppMapMarker> _markers() {
    return _workers.map((w) {
      final user = w['user'] ?? {};
      final point = _nearestPoint(w) ?? _refPoint;
      return AppMapMarker(
        point: point,
        icon: Icons.handyman,
        label: (user['fullName'] ?? '').split(' ').first,
      );
    }).toList();
  }

  List<AppMapCircle> _circles() {
    final circles = <AppMapCircle>[];
    for (final w in _workers) {
      for (final a in _serviceAreas(w)) {
        final lat = double.tryParse(a['latitude']?.toString() ?? '');
        final lng = double.tryParse(a['longitude']?.toString() ?? '');
        final radiusKm = double.tryParse(a['radiusKm']?.toString() ?? '');
        if (lat == null || lng == null) continue;
        circles.add(
          AppMapCircle(
            point: LatLng(lat, lng),
            radiusMeters: (radiusKm ?? 5) * 1000,
          ),
        );
      }
    }
    return circles;
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
                  ? ListView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      children: const [
                        Padding(
                          padding: EdgeInsets.only(top: 120),
                          child: Center(
                            child: Column(
                              children: [
                                Icon(
                                  Icons.search_off,
                                  size: 40,
                                  color: AppTheme.textSecondary,
                                ),
                                SizedBox(height: 8),
                                Text(
                                  'No nearby workers found',
                                  style: TextStyle(
                                    color: AppTheme.textSecondary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    )
                  : ListView(
                      padding: const EdgeInsets.all(16),
                      children: [
                        AppMapWidget(
                          height: 220,
                          center: _refPoint,
                          zoom: 11,
                          markers: _markers(),
                          circles: _circles(),
                        ),
                        const SizedBox(height: 16),
                        ..._workers.map((w) => _buildWorkerCard(w)),
                      ],
                    ),
            ),
    );
  }

  Widget _buildWorkerCard(Map<String, dynamic> w) {
    final user = w['user'] ?? {};
    final distance = _nearestPoint(w) != null
        ? _distanceKm(_refPoint, _nearestPoint(w)!)
        : null;
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
                    style: const TextStyle(fontWeight: FontWeight.w600),
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
                        style: const TextStyle(fontSize: 13),
                      ),
                      const SizedBox(width: 12),
                      const Icon(
                        Icons.location_on,
                        size: 14,
                        color: AppTheme.textSecondary,
                      ),
                      Text(
                        ' ${_formatDistance(distance)}',
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
  }
}
