import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:geolocator/geolocator.dart';
import '../config/theme_config.dart';

class AppMapMarker {
  final LatLng point;
  final IconData icon;
  final Color color;
  final String? label;
  const AppMapMarker({
    required this.point,
    this.icon = Icons.location_pin,
    this.color = AppTheme.primaryColor,
    this.label,
  });
}

class AppMapCircle {
  final LatLng point;
  final double radiusMeters;
  final Color color;
  const AppMapCircle({
    required this.point,
    required this.radiusMeters,
    this.color = AppTheme.primaryColor,
  });
}

class AppMapWidget extends StatefulWidget {
  final List<AppMapMarker> markers;
  final List<AppMapCircle> circles;
  final LatLng? center;
  final double zoom;
  final double height;
  final bool interactive;
  final bool showLocationButton;
  final ValueChanged<LatLng>? onPointSelected;
  final ValueChanged<AppMapMarker>? onMarkerTap;
  final EdgeInsetsGeometry padding;

  const AppMapWidget({
    super.key,
    this.markers = const [],
    this.circles = const [],
    this.center,
    this.zoom = 13,
    this.height = 280,
    this.interactive = false,
    this.showLocationButton = false,
    this.onPointSelected,
    this.onMarkerTap,
    this.padding = EdgeInsets.zero,
  });

  @override
  State<AppMapWidget> createState() => _AppMapWidgetState();
}

class _AppMapWidgetState extends State<AppMapWidget> {
  final _mapController = MapController();
  LatLng? _pickedPoint;
  bool _locating = false;

  static const _defaultCenter = LatLng(31.5204, 74.3587); // Lahore

  @override
  Widget build(BuildContext context) {
    final center = widget.center ?? _pickedPoint ?? _defaultCenter;
    final showPicked = widget.interactive && _pickedPoint != null;

    return SizedBox(
      height: widget.height,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: Stack(
          children: [
            FlutterMap(
              mapController: _mapController,
              options: MapOptions(
                initialCenter: center,
                initialZoom: widget.zoom,
                minZoom: 3,
                maxZoom: 19,
                onTap: widget.interactive
                    ? (tapPosition, point) {
                        setState(() => _pickedPoint = point);
                        widget.onPointSelected?.call(point);
                      }
                    : null,
                interactionOptions: const InteractionOptions(
                  flags: InteractiveFlag.all & ~InteractiveFlag.rotate,
                ),
              ),
              children: [
                TileLayer(
                  urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                  userAgentPackageName: 'com.arslan.services',
                  maxNativeZoom: 19,
                ),
                if (widget.circles.isNotEmpty)
                  CircleLayer(
                    circles: widget.circles
                        .map(
                          (c) => CircleMarker(
                            point: c.point,
                            radius: c.radiusMeters,
                            useRadiusInMeter: true,
                            color: c.color.withValues(alpha: 0.15),
                            borderColor: c.color.withValues(alpha: 0.6),
                            borderStrokeWidth: 2,
                          ),
                        )
                        .toList(),
                  ),
                if (widget.markers.isNotEmpty)
                  MarkerLayer(
                    markers: widget.markers.asMap().entries.map((e) {
                      final m = e.value;
                      return Marker(
                        point: m.point,
                        width: 44,
                        height: 44,
                        child: GestureDetector(
                          onTap: () => widget.onMarkerTap?.call(m),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                m.icon,
                                size: 34,
                                color: m.color,
                                shadows: const [
                                  Shadow(
                                    color: Colors.black38,
                                    blurRadius: 6,
                                    offset: Offset(0, 2),
                                  ),
                                ],
                              ),
                              if (m.label != null) ...[
                                const SizedBox(height: 2),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 6,
                                    vertical: 2,
                                  ),
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(8),
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.black.withValues(
                                          alpha: 0.15,
                                        ),
                                        blurRadius: 4,
                                      ),
                                    ],
                                  ),
                                  child: Text(
                                    m.label!,
                                    style: const TextStyle(
                                      fontSize: 10,
                                      fontWeight: FontWeight.w700,
                                      color: AppTheme.textPrimary,
                                    ),
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                if (showPicked)
                  MarkerLayer(
                    markers: [
                      Marker(
                        point: _pickedPoint!,
                        width: 44,
                        height: 44,
                        child: const Icon(
                          Icons.location_on,
                          size: 40,
                          color: AppTheme.errorColor,
                          shadows: [
                            Shadow(color: Colors.black38, blurRadius: 6),
                          ],
                        ),
                      ),
                    ],
                  ),
                RichAttributionWidget(
                  attributions: [
                    TextSourceAttribution('OpenStreetMap', onTap: () {}),
                  ],
                ),
              ],
            ),
            if (widget.interactive)
              IgnorePointer(
                child: Center(
                  child: Icon(
                    Icons.add_location_alt,
                    size: 40,
                    color: AppTheme.primaryColor.withValues(alpha: 0.9),
                  ),
                ),
              ),
            if (widget.showLocationButton)
              Positioned(
                right: 10,
                bottom: 10,
                child: FloatingActionButton(
                  heroTag: 'map-locate-${widget.hashCode}',
                  mini: true,
                  backgroundColor: Colors.white,
                  foregroundColor: AppTheme.primaryColor,
                  elevation: 3,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                  onPressed: _locating ? null : _locateMe,
                  child: _locating
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: AppTheme.primaryColor,
                          ),
                        )
                      : const Icon(Icons.my_location),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Future<void> _locateMe() async {
    setState(() => _locating = true);
    try {
      final position = await Geolocator.getCurrentPosition();
      if (!mounted) return;
      _mapController.move(LatLng(position.latitude, position.longitude), 14);
      widget.onPointSelected?.call(
        LatLng(position.latitude, position.longitude),
      );
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Could not get your location'),
          backgroundColor: AppTheme.errorColor,
        ),
      );
    } finally {
      if (mounted) setState(() => _locating = false);
    }
  }

  void moveTo(LatLng point, {double zoom = 14}) {
    if (mounted) _mapController.move(point, zoom);
  }
}
