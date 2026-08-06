import 'package:flutter/material.dart';
import '../../core/services/api_client.dart';
import '../../core/config/theme_config.dart';

class ServicesSelectionScreen extends StatefulWidget {
  const ServicesSelectionScreen({super.key});

  @override
  State<ServicesSelectionScreen> createState() =>
      _ServicesSelectionScreenState();
}

class _ServicesSelectionScreenState extends State<ServicesSelectionScreen> {
  final _api = ApiClient();
  final _searchController = TextEditingController();
  bool _isLoading = true;
  bool _isSaving = false;
  String? _error;

  List<Map<String, dynamic>> _categories = [];
  Set<String> _selectedServiceIds = {};
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _fetchData() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final results = await Future.wait([
        _api.get('/api/workers/me'),
        _api.get('/api/categories'),
      ]);

      final workerData = results[0].data as Map<String, dynamic>;
      final workerServices = workerData['workerServices'] as List? ?? [];
      final preSelectedIds = workerServices
          .map((s) => (s['serviceId'] ?? s['service']?['id'] ?? '').toString())
          .where((id) => id.isNotEmpty)
          .toSet();

      final categoriesData = results[1].data;
      final cats = (categoriesData is List)
          ? categoriesData
          : (categoriesData['categories'] ?? categoriesData['data'] ?? []);

      if (!mounted) return;
      setState(() {
        _selectedServiceIds = preSelectedIds.cast<String>();
        _categories = List<Map<String, dynamic>>.from(cats);
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _error = 'Failed to load services. Pull to retry.';
      });
    }
  }

  Future<void> _save() async {
    setState(() => _isSaving = true);
    try {
      await _api.put(
        '/api/workers/me/services',
        data: {'serviceIds': _selectedServiceIds.toList()},
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Services updated'),
          backgroundColor: AppTheme.successColor,
        ),
      );
      Navigator.pop(context, true);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Failed to save services')));
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  bool _matchesSearch(Map<String, dynamic> service) {
    if (_searchQuery.isEmpty) return true;
    final name = (service['name'] ?? '').toString().toLowerCase();
    return name.contains(_searchQuery.toLowerCase());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Services'),
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
      body: Column(
        children: [
          _buildSearchBar(),
          Expanded(child: _buildBody()),
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: TextField(
        controller: _searchController,
        decoration: InputDecoration(
          hintText: 'Search services...',
          prefixIcon: const Icon(Icons.search),
          suffixIcon: _searchQuery.isNotEmpty
              ? IconButton(
                  icon: const Icon(Icons.clear),
                  onPressed: () {
                    _searchController.clear();
                    setState(() => _searchQuery = '');
                  },
                )
              : null,
        ),
        onChanged: (v) => setState(() => _searchQuery = v),
      ),
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

    final filteredCategories = <Map<String, dynamic>>[];
    for (final cat in _categories) {
      final services = List<Map<String, dynamic>>.from(cat['services'] ?? []);
      final filteredServices = services.where(_matchesSearch).toList();
      if (filteredServices.isNotEmpty) {
        filteredCategories.add({...cat, 'services': filteredServices});
      }
    }

    if (filteredCategories.isEmpty) {
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
                      Icons.search_off,
                      size: 56,
                      color: Colors.grey.shade400,
                    ),
                    const SizedBox(height: 12),
                    const Text(
                      'No services found',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w500,
                        color: AppTheme.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _searchQuery.isNotEmpty
                          ? 'Try a different search term'
                          : 'No categories available',
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
        padding: const EdgeInsets.fromLTRB(0, 12, 0, 24),
        itemCount: filteredCategories.length,
        itemBuilder: (context, index) {
          return _buildCategoryTile(filteredCategories[index]);
        },
      ),
    );
  }

  Widget _buildLoadingShimmer() {
    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
      itemCount: 5,
      itemBuilder: (context, index) {
        return _ShimmerCard(
          child: Card(
            margin: const EdgeInsets.only(bottom: 10),
            child: SizedBox(
              height: 56,
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  children: [
                    Container(
                      width: 140,
                      height: 14,
                      decoration: BoxDecoration(
                        color: Colors.grey.shade200,
                        borderRadius: BorderRadius.circular(7),
                      ),
                    ),
                    const Spacer(),
                    Container(
                      width: 24,
                      height: 24,
                      decoration: BoxDecoration(
                        color: Colors.grey.shade200,
                        borderRadius: BorderRadius.circular(6),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildCategoryTile(Map<String, dynamic> category) {
    final services = List<Map<String, dynamic>>.from(
      category['services'] ?? [],
    );
    final allSelected =
        services.isNotEmpty &&
        services.every(
          (s) => _selectedServiceIds.contains(s['id']?.toString()),
        );

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      shadowColor: Colors.black.withOpacity(0.06),
      elevation: 1.5,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ExpansionTile(
        tilePadding: const EdgeInsets.symmetric(horizontal: 16),
        childrenPadding: const EdgeInsets.only(bottom: 8),
        shape: const Border(),
        collapsedShape: const Border(),
        title: Text(
          category['name'] ?? 'Category',
          style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
        ),
        subtitle: Text(
          '${services.where((s) => _selectedServiceIds.contains(s['id']?.toString())).length} / ${services.length} selected',
          style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary),
        ),
        trailing: Checkbox(
          value: allSelected && services.isNotEmpty,
          tristate: true,
          onChanged: (val) {
            setState(() {
              for (final s in services) {
                final id = s['id']?.toString() ?? '';
                if (val == true) {
                  _selectedServiceIds.add(id);
                } else {
                  _selectedServiceIds.remove(id);
                }
              }
            });
          },
          activeColor: AppTheme.primaryColor,
        ),
        children: services.map((service) {
          final id = service['id']?.toString() ?? '';
          final isSelected = _selectedServiceIds.contains(id);
          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8),
            child: CheckboxListTile(
              title: Text(
                service['name'] ?? 'Service',
                style: const TextStyle(fontSize: 14),
              ),
              subtitle: service['description'] != null
                  ? Text(
                      service['description'],
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppTheme.textSecondary,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    )
                  : null,
              value: isSelected,
              onChanged: (val) {
                setState(() {
                  if (val == true) {
                    _selectedServiceIds.add(id);
                  } else {
                    _selectedServiceIds.remove(id);
                  }
                });
              },
              activeColor: AppTheme.primaryColor,
              controlAffinity: ListTileControlAffinity.leading,
              dense: true,
            ),
          );
        }).toList(),
      ),
    );
  }
}

class _ShimmerCard extends StatefulWidget {
  final Widget child;
  const _ShimmerCard({required this.child});

  @override
  State<_ShimmerCard> createState() => _ShimmerCardState();
}

class _ShimmerCardState extends State<_ShimmerCard>
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
