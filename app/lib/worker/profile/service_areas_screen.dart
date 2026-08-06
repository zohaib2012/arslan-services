import 'package:flutter/material.dart';
import '../../core/services/api_client.dart';
import '../../core/config/theme_config.dart';

class ServiceAreasScreen extends StatefulWidget {
  const ServiceAreasScreen({super.key});

  @override
  State<ServiceAreasScreen> createState() => _ServiceAreasScreenState();
}

class _ServiceAreasScreenState extends State<ServiceAreasScreen> {
  final _api = ApiClient();
  bool _isLoading = true;
  bool _isSaving = false;
  String? _error;
  List<Map<String, dynamic>> _areas = [];

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final res = await _api.get('/api/workers/me');
      final data = res.data as Map<String, dynamic>;
      final areasList = data['serviceAreas'] as List? ?? [];
      if (!mounted) return;
      setState(() {
        _areas = List<Map<String, dynamic>>.from(areasList);
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _error = 'Failed to load service areas. Pull to retry.';
      });
    }
  }

  Future<void> _showAddDialog() async {
    final cityController = TextEditingController();
    final areaController = TextEditingController();
    double radius = 10.0;

    final result = await showDialog<Map<String, dynamic>>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          title: const Text('Add Service Area'),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: cityController,
                  decoration: const InputDecoration(
                    labelText: 'City',
                    hintText: 'e.g. Rawalpindi',
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: areaController,
                  decoration: const InputDecoration(
                    labelText: 'Area',
                    hintText: 'e.g. Saddar',
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    const Text(
                      'Radius:',
                      style: TextStyle(fontWeight: FontWeight.w500),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Slider(
                        value: radius,
                        min: 1,
                        max: 50,
                        divisions: 49,
                        label: '${radius.round()} km',
                        onChanged: (v) => setDialogState(() => radius = v),
                        activeColor: AppTheme.primaryColor,
                      ),
                    ),
                    SizedBox(
                      width: 42,
                      child: Text(
                        '${radius.round()} km',
                        style: const TextStyle(
                          fontWeight: FontWeight.w500,
                          fontSize: 13,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: () {
                if (cityController.text.trim().isEmpty ||
                    areaController.text.trim().isEmpty)
                  return;
                Navigator.pop(ctx, {
                  'city': cityController.text.trim(),
                  'area': areaController.text.trim(),
                  'radius': radius.round(),
                });
              },
              style: FilledButton.styleFrom(
                backgroundColor: AppTheme.primaryColor,
              ),
              child: const Text('Add'),
            ),
          ],
        ),
      ),
    );

    if (result == null) return;
    setState(() => _areas.add(result));
  }

  Future<void> _deleteArea(int index) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Delete Area'),
        content: const Text(
          'Are you sure you want to remove this service area?',
        ),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(foregroundColor: AppTheme.errorColor),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    final area = _areas[index];
    final id = area['id']?.toString();
    setState(() => _areas.removeAt(index));

    if (id != null) {
      try {
        await _api.delete('/api/workers/me/areas/$id');
      } catch (_) {}
    }
  }

  Future<void> _save() async {
    setState(() => _isSaving = true);
    try {
      await _api.put('/api/workers/me/areas', data: {'areas': _areas});
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Service areas updated'),
          backgroundColor: AppTheme.successColor,
        ),
      );
      Navigator.pop(context, true);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Failed to save areas')));
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Service Areas'),
        actions: [
          if (!_isLoading)
            TextButton(
              onPressed: _isSaving ? null : _save,
              child: _isSaving
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Text(
                      'Save',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
            ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _showAddDialog,
        backgroundColor: AppTheme.primaryColor,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: const Icon(Icons.add),
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) return _buildLoadingShimmer();

    if (_error != null) {
      return RefreshIndicator(
        onRefresh: _fetchData,
        child: ListView(
          children: [
            SizedBox(height: MediaQuery.of(context).size.height * 0.25),
            Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.error_outline,
                      size: 56,
                      color: Colors.grey.shade400,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      _error!,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontSize: 15,
                        color: AppTheme.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      );
    }

    if (_areas.isEmpty) {
      return RefreshIndicator(
        onRefresh: _fetchData,
        child: ListView(
          children: [
            SizedBox(height: MediaQuery.of(context).size.height * 0.2),
            Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.location_off_outlined,
                      size: 56,
                      color: Colors.grey.shade400,
                    ),
                    const SizedBox(height: 12),
                    const Text(
                      'No service areas added',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w500,
                        color: AppTheme.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Tap + to add areas where you provide services',
                      style: TextStyle(
                        fontSize: 13,
                        color: Colors.grey.shade500,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _fetchData,
      child: ListView.builder(
        padding: const EdgeInsets.fromLTRB(0, 16, 0, 80),
        itemCount: _areas.length,
        itemBuilder: (context, index) => _buildAreaCard(index),
      ),
    );
  }

  Widget _buildLoadingShimmer() {
    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(0, 16, 0, 80),
      itemCount: 4,
      itemBuilder: (context, index) {
        return Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 5),
          child: _PulseWidget(
            child: Card(
              child: SizedBox(
                height: 64,
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Row(
                    children: [
                      Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          color: Colors.grey.shade200,
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              width: 160,
                              height: 12,
                              decoration: BoxDecoration(
                                color: Colors.grey.shade200,
                                borderRadius: BorderRadius.circular(6),
                              ),
                            ),
                            const SizedBox(height: 8),
                            Container(
                              width: 80,
                              height: 10,
                              decoration: BoxDecoration(
                                color: Colors.grey.shade200,
                                borderRadius: BorderRadius.circular(5),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildAreaCard(int index) {
    final area = _areas[index];
    final city = area['city'] ?? '';
    final areaName = area['area'] ?? '';
    final radius = area['radius'] ?? 10;
    final id = area['id']?.toString() ?? '$city-$areaName-$index';

    return Dismissible(
      key: Key(id),
      direction: DismissDirection.endToStart,
      onDismissed: (_) => _deleteArea(index),
      confirmDismiss: (_) async {
        final confirmed = await showDialog<bool>(
          context: context,
          builder: (_) => AlertDialog(
            title: const Text('Delete Area'),
            content: const Text(
              'Are you sure you want to remove this service area?',
            ),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context, false),
                child: const Text('Cancel'),
              ),
              TextButton(
                onPressed: () => Navigator.pop(context, true),
                style: TextButton.styleFrom(
                  foregroundColor: AppTheme.errorColor,
                ),
                child: const Text('Delete'),
              ),
            ],
          ),
        );
        return confirmed == true;
      },
      background: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 5),
        decoration: BoxDecoration(
          color: AppTheme.errorColor,
          borderRadius: BorderRadius.circular(12),
        ),
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 24),
        child: const Icon(Icons.delete_outline, color: Colors.white),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 5),
        child: Card(
          margin: EdgeInsets.zero,
          child: InkWell(
            onTap: () => _showEditDialog(index),
            borderRadius: BorderRadius.circular(12),
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppTheme.secondaryColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(
                      Icons.location_on_outlined,
                      color: AppTheme.primaryColor,
                      size: 22,
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '$areaName, $city',
                          style: const TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 15,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Icon(
                              Icons.radio_button_checked,
                              size: 12,
                              color: AppTheme.secondaryColor,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              '$radius km radius',
                              style: const TextStyle(
                                fontSize: 12,
                                color: AppTheme.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const Icon(
                    Icons.chevron_right,
                    color: AppTheme.textSecondary,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _showEditDialog(int index) async {
    final area = _areas[index];
    final cityController = TextEditingController(text: area['city'] ?? '');
    final areaController = TextEditingController(text: area['area'] ?? '');
    double radius = (area['radius'] ?? 10).toDouble();

    final result = await showDialog<Map<String, dynamic>>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          title: const Text('Edit Service Area'),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: cityController,
                  decoration: const InputDecoration(
                    labelText: 'City',
                    hintText: 'e.g. Rawalpindi',
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: areaController,
                  decoration: const InputDecoration(
                    labelText: 'Area',
                    hintText: 'e.g. Saddar',
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    const Text(
                      'Radius:',
                      style: TextStyle(fontWeight: FontWeight.w500),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Slider(
                        value: radius,
                        min: 1,
                        max: 50,
                        divisions: 49,
                        label: '${radius.round()} km',
                        onChanged: (v) => setDialogState(() => radius = v),
                        activeColor: AppTheme.primaryColor,
                      ),
                    ),
                    SizedBox(
                      width: 42,
                      child: Text(
                        '${radius.round()} km',
                        style: const TextStyle(
                          fontWeight: FontWeight.w500,
                          fontSize: 13,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: () {
                if (cityController.text.trim().isEmpty ||
                    areaController.text.trim().isEmpty)
                  return;
                Navigator.pop(ctx, {
                  'city': cityController.text.trim(),
                  'area': areaController.text.trim(),
                  'radius': radius.round(),
                });
              },
              style: FilledButton.styleFrom(
                backgroundColor: AppTheme.primaryColor,
              ),
              child: const Text('Save'),
            ),
          ],
        ),
      ),
    );

    if (result != null && mounted) {
      setState(() => _areas[index] = {..._areas[index], ...result});
    }
  }
}

class _PulseWidget extends StatefulWidget {
  final Widget child;
  const _PulseWidget({required this.child});

  @override
  State<_PulseWidget> createState() => _PulseWidgetState();
}

class _PulseWidgetState extends State<_PulseWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _controller.drive(Tween(begin: 0.4, end: 1.0)),
      child: widget.child,
    );
  }
}
