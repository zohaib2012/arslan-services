import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import '../../core/config/theme_config.dart';
import '../../core/services/api_client.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final _api = ApiClient();
  final _searchController = TextEditingController();
  final _focusNode = FocusNode();
  final _scrollController = ScrollController();

  List<Map<String, dynamic>> _results = [];
  List<String> _recent = [];
  List<String> _suggestions = [];
  bool _isLoading = false;
  bool _hasSearched = false;
  String? _error;
  String _activeFilter = 'All';
  bool _showSuggestions = false;

  final List<String> _filters = ['All', 'Distance', 'Rating', 'Price'];
  @override
  void initState() {
    super.initState();
    _loadRecent();
  }

  @override
  void dispose() {
    _searchController.dispose();
    _focusNode.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _loadRecent() {
    _recent = [
      'Plumber',
      'Electrician',
      'Cleaner',
      'Painter',
      'Carpenter',
      'AC Repair',
    ];
    _suggestions = [..._recent];
  }

  Future<void> _search(String query) async {
    if (query.trim().isEmpty) return;
    setState(() {
      _isLoading = true;
      _hasSearched = true;
      _showSuggestions = false;
      _error = null;
      _focusNode.unfocus();
    });
    try {
      final res = await _api.get(
        '/api/workers/search',
        params: {'q': query.trim()},
      );
      if (mounted) {
        setState(() {
          _results = (res.data is List)
              ? List<Map<String, dynamic>>.from(res.data)
              : [];
          _isLoading = false;
          if (!_recent.contains(query.trim())) {
            _recent.insert(0, query.trim());
            if (_recent.length > 10) _recent = _recent.sublist(0, 10);
          }
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _error = 'Search failed. Please try again.';
        });
      }
    }
  }

  IconData _filterIcon(String filter) {
    switch (filter) {
      case 'Distance':
        return Icons.near_me_outlined;
      case 'Rating':
        return Icons.star_outline;
      case 'Price':
        return Icons.attach_money;
      default:
        return Icons.apps_outlined;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(70),
        child: SafeArea(
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            decoration: const BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Color(0x0A000000),
                  blurRadius: 10,
                  offset: Offset(0, 2),
                ),
              ],
            ),
            child: Row(
              children: [
                GestureDetector(
                  onTap: () => Navigator.pop(context),
                  child: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppTheme.backgroundColor,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(
                      Icons.arrow_back_rounded,
                      color: AppTheme.textPrimary,
                      size: 22,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Container(
                    height: 46,
                    decoration: BoxDecoration(
                      color: AppTheme.backgroundColor,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: _focusNode.hasFocus
                            ? AppTheme.primaryColor.withValues(alpha: 0.3)
                            : AppTheme.dividerColor.withValues(alpha: 0.5),
                      ),
                    ),
                    child: TextField(
                      controller: _searchController,
                      focusNode: _focusNode,
                      onChanged: (v) {
                        setState(() {
                          _showSuggestions = v.isNotEmpty;
                          _suggestions = _recent
                              .where(
                                (r) =>
                                    r.toLowerCase().contains(v.toLowerCase()),
                              )
                              .toList();
                        });
                      },
                      onSubmitted: _search,
                      textInputAction: TextInputAction.search,
                      style: const TextStyle(
                        fontSize: 15,
                        color: AppTheme.textPrimary,
                      ),
                      decoration: InputDecoration(
                        hintText: 'Search for services...',
                        hintStyle: const TextStyle(
                          color: AppTheme.textSecondary,
                          fontSize: 15,
                        ),
                        prefixIcon: Container(
                          margin: const EdgeInsets.all(8),
                          padding: const EdgeInsets.all(4),
                          decoration: BoxDecoration(
                            color: const Color(
                              0xFF006837,
                            ).withValues(alpha: 0.08),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(
                            Icons.search_rounded,
                            color: AppTheme.primaryColor,
                            size: 20,
                          ),
                        ),
                        suffixIcon: _searchController.text.isNotEmpty
                            ? GestureDetector(
                                onTap: () {
                                  _searchController.clear();
                                  setState(() {
                                    _hasSearched = false;
                                    _showSuggestions = false;
                                    _error = null;
                                  });
                                },
                                child: const Icon(
                                  Icons.close_rounded,
                                  color: AppTheme.textSecondary,
                                  size: 20,
                                ),
                              )
                            : null,
                        border: InputBorder.none,
                        contentPadding: const EdgeInsets.symmetric(
                          vertical: 12,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
      body: Column(
        children: [
          if (_hasSearched && !_isLoading)
            Container(
              padding: const EdgeInsets.symmetric(vertical: 10),
              color: Colors.white,
              child: SizedBox(
                height: 38,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: _filters.length,
                  itemBuilder: (_, i) {
                    final filter = _filters[i];
                    final isActive = _activeFilter == filter;
                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: Material(
                        color: isActive
                            ? AppTheme.primaryColor
                            : AppTheme.backgroundColor,
                        borderRadius: BorderRadius.circular(10),
                        child: InkWell(
                          onTap: () => setState(() => _activeFilter = filter),
                          borderRadius: BorderRadius.circular(10),
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 14,
                              vertical: 8,
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  _filterIcon(filter),
                                  size: 16,
                                  color: isActive
                                      ? Colors.white
                                      : AppTheme.textSecondary,
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  filter,
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                    color: isActive
                                        ? Colors.white
                                        : AppTheme.textSecondary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),
          Expanded(child: _hasSearched ? _buildResults() : _buildSuggestions()),
        ],
      ),
    );
  }

  Widget _buildSuggestions() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (_showSuggestions && _suggestions.isNotEmpty)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.04),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Suggestions',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 12),
                  ..._suggestions
                      .take(6)
                      .map(
                        (s) => GestureDetector(
                          onTap: () {
                            _searchController.text = s;
                            _search(s);
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              vertical: 10,
                              horizontal: 12,
                            ),
                            margin: const EdgeInsets.only(bottom: 4),
                            decoration: BoxDecoration(
                              color: AppTheme.backgroundColor,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Row(
                              children: [
                                const Icon(
                                  Icons.search_rounded,
                                  size: 18,
                                  color: AppTheme.textSecondary,
                                ),
                                const SizedBox(width: 10),
                                Text(
                                  s,
                                  style: const TextStyle(
                                    fontSize: 14,
                                    color: AppTheme.textPrimary,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                ],
              ),
            ),
          if (!_showSuggestions) ...[
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Recent Searches',
                  style: TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.textPrimary,
                  ),
                ),
                GestureDetector(
                  onTap: () {
                    setState(() => _recent.clear());
                  },
                  child: const Text(
                    'Clear All',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.errorColor,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            if (_recent.isEmpty)
              Container(
                padding: const EdgeInsets.symmetric(vertical: 40),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Center(
                  child: Column(
                    children: [
                      Icon(
                        Icons.history_rounded,
                        size: 40,
                        color: AppTheme.textSecondary,
                      ),
                      SizedBox(height: 10),
                      Text(
                        'No recent searches',
                        style: TextStyle(
                          color: AppTheme.textSecondary,
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                ),
              )
            else
              ..._recent.map(
                (q) => GestureDetector(
                  onTap: () {
                    _searchController.text = q;
                    _search(q);
                  },
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 14,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(14),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.03),
                          blurRadius: 6,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(
                            color: AppTheme.accentColor.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(
                            Icons.history_rounded,
                            size: 18,
                            color: AppTheme.accentColor,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            q,
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w500,
                              color: AppTheme.textPrimary,
                            ),
                          ),
                        ),
                        const Icon(
                          Icons.north_west_rounded,
                          size: 18,
                          color: AppTheme.textSecondary,
                        ),
                      ],
                    ),
                  ),
                ),
              ),
          ],
        ],
      ),
    );
  }

  Widget _buildResults() {
    if (_isLoading) return _buildResultsShimmer();
    if (_error != null) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppTheme.errorColor.withValues(alpha: 0.08),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.error_outline,
                size: 48,
                color: AppTheme.errorColor,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              _error!,
              style: const TextStyle(
                color: AppTheme.textSecondary,
                fontSize: 15,
              ),
            ),
            const SizedBox(height: 16),
            Material(
              color: AppTheme.primaryColor,
              borderRadius: BorderRadius.circular(14),
              child: InkWell(
                onTap: () => _search(_searchController.text),
                borderRadius: BorderRadius.circular(14),
                child: const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.refresh_rounded,
                        color: Colors.white,
                        size: 18,
                      ),
                      SizedBox(width: 6),
                      Text(
                        'Retry',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      );
    }
    if (_results.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(40),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppTheme.backgroundColor,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.search_off_rounded,
                  size: 56,
                  color: AppTheme.textSecondary,
                ),
              ),
              const SizedBox(height: 20),
              const Text(
                'No workers found',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: AppTheme.textPrimary,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                'Try searching for "plumber", "electrician", etc.',
                style: TextStyle(
                  fontSize: 14,
                  color: AppTheme.textSecondary.withValues(alpha: 0.8),
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      );
    }
    return RefreshIndicator(
      onRefresh: () async => _search(_searchController.text),
      color: AppTheme.primaryColor,
      child: ListView.builder(
        controller: _scrollController,
        padding: const EdgeInsets.all(16),
        itemCount: _results.length,
        itemBuilder: (_, i) => _buildWorkerCard(_results[i]),
      ),
    );
  }

  Widget _buildResultsShimmer() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: 5,
      itemBuilder: (_, __) => Padding(
        padding: const EdgeInsets.only(bottom: 12),
        child: Shimmer.fromColors(
          baseColor: Colors.grey.shade200,
          highlightColor: Colors.grey.shade100,
          child: Container(
            height: 110,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildWorkerCard(Map<String, dynamic> w) {
    final user = w['user'] ?? {};
    final fullName = user['fullName'] ?? 'Worker';
    final photo = user['profilePhoto'];
    final rating = double.tryParse(w['avgRating']?.toString() ?? '0') ?? 0.0;
    final isVerified = w['verificationStatus'] == 'VERIFIED';
    final completedJobs = w['completedJobs'] ?? 0;
    final services =
        (w['workerServices'] as List<dynamic>?)
            ?.map((s) => s['service']?['name'] ?? '')
            .where((n) => n.isNotEmpty)
            .take(3)
            .toList() ??
        [];
    final serviceName = w['service']?['name'] ?? '';

    return GestureDetector(
      onTap: () {
        Navigator.pushNamed(context, '/worker-detail', arguments: w);
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
          border: Border.all(
            color: AppTheme.dividerColor.withValues(alpha: 0.4),
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            children: [
              Stack(
                children: [
                  Container(
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: AppTheme.primaryColor.withValues(alpha: 0.12),
                          blurRadius: 6,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: CircleAvatar(
                      radius: 32,
                      backgroundColor: AppTheme.primaryColor.withValues(
                        alpha: 0.08,
                      ),
                      backgroundImage: photo != null
                          ? NetworkImage(photo)
                          : null,
                      child: photo == null
                          ? const Icon(
                              Icons.person,
                              size: 32,
                              color: AppTheme.primaryColor,
                            )
                          : null,
                    ),
                  ),
                  if (isVerified)
                    const Positioned(
                      bottom: 0,
                      right: 0,
                      child: Icon(
                        Icons.verified,
                        size: 18,
                        color: AppTheme.primaryColor,
                      ),
                    ),
                ],
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      fullName,
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                    if (serviceName.isNotEmpty) ...[
                      const SizedBox(height: 2),
                      Text(
                        serviceName,
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppTheme.textSecondary,
                        ),
                      ),
                    ],
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: AppTheme.accentColor.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(
                                Icons.star_rounded,
                                size: 13,
                                color: AppTheme.accentColor,
                              ),
                              const SizedBox(width: 3),
                              Text(
                                rating.toStringAsFixed(1),
                                style: const TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w700,
                                  color: AppTheme.accentColor,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: const Color(
                              0xFF006837,
                            ).withValues(alpha: 0.08),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(
                                Icons.work_outline_rounded,
                                size: 12,
                                color: AppTheme.primaryColor,
                              ),
                              const SizedBox(width: 3),
                              Text(
                                '$completedJobs jobs',
                                style: const TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                  color: AppTheme.primaryColor,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    if (services.isNotEmpty) ...[
                      const SizedBox(height: 6),
                      Wrap(
                        spacing: 4,
                        runSpacing: 4,
                        children: services.map((s) {
                          return Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 3,
                            ),
                            decoration: BoxDecoration(
                              color: AppTheme.backgroundColor,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              s,
                              style: const TextStyle(
                                fontSize: 10,
                                color: AppTheme.textSecondary,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                    ],
                  ],
                ),
              ),
              Container(
                height: 38,
                width: 38,
                decoration: BoxDecoration(
                  color: AppTheme.primaryColor.withValues(alpha: 0.08),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.arrow_forward_rounded,
                  size: 18,
                  color: AppTheme.primaryColor,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
