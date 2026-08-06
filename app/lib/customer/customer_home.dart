import 'dart:async';
import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import '../core/config/theme_config.dart';
import '../core/services/api_client.dart';
import 'search/search_screen.dart';
import 'bookings/my_bookings_screen.dart';
import 'chat/chat_list_screen.dart';
import 'profile/customer_profile_screen.dart';
import 'workers/nearby_workers_screen.dart';
import 'profile/notifications_screen.dart';

class CustomerHome extends StatefulWidget {
  const CustomerHome({super.key});

  @override
  State<CustomerHome> createState() => _CustomerHomeState();
}

class _CustomerHomeState extends State<CustomerHome> {
  int _currentIndex = 0;
  final _api = ApiClient();
  final _homeScrollController = ScrollController();
  final _carouselController = PageController(viewportFraction: 0.88);
  Timer? _carouselTimer;
  int _carouselPage = 0;

  List<Map<String, dynamic>> _categories = [];
  List<Map<String, dynamic>> _popularWorkers = [];
  bool _isLoading = true;
  String? _error;
  bool _isRefreshing = false;

  final List<Map<String, dynamic>> _banners = [
    {
      'color': AppTheme.primaryColor,
      'icon': Icons.plumbing,
      'title': 'Emergency Plumber',
      'subtitle': 'Get help in 30 mins',
      'tag': 'FAST RESPONSE',
    },
    {
      'color': const Color(0xFF1B5E20),
      'icon': Icons.electrical_services,
      'title': 'Electrical Repair',
      'subtitle': 'Licensed electricians',
      'tag': 'CERTIFIED',
    },
    {
      'color': const Color(0xFF2E7D32),
      'icon': Icons.cleaning_services,
      'title': 'Home Cleaning',
      'subtitle': 'Professional cleaners',
      'tag': 'TOP RATED',
    },
  ];

  static const Map<String, IconData> _categoryIcons = {
    'plumbing': Icons.plumbing,
    'electrician': Icons.electrical_services,
    'cleaning': Icons.cleaning_services,
    'painting': Icons.format_paint,
    'carpentry': Icons.carpenter,
    'ac repair': Icons.ac_unit,
    'mechanic': Icons.build,
    'gardening': Icons.yard,
    'pest control': Icons.bug_report,
    'mason': Icons.construction,
    'salon': Icons.content_cut,
    'beauty': Icons.face,
    'tutor': Icons.school,
    'medical': Icons.medical_services,
    'delivery': Icons.delivery_dining,
    'laundry': Icons.local_laundry_service,
    'moving': Icons.local_shipping,
    'photography': Icons.camera_alt,
    'catering': Icons.restaurant,
    'security': Icons.security,
  };

  static const List<Color> _categoryColors = [
    AppTheme.primaryColor,
    Color(0xFFE65100),
    Color(0xFF0D47A1),
    Color(0xFFC62828),
    Color(0xFF6A1B9A),
    Color(0xFF00838F),
    Color(0xFF4E342E),
    Color(0xFF33691E),
    Color(0xFFD84315),
    Color(0xFF1565C0),
  ];

  @override
  void initState() {
    super.initState();
    _loadData();
    _startCarousel();
  }

  @override
  void dispose() {
    _carouselTimer?.cancel();
    _carouselController.dispose();
    _homeScrollController.dispose();
    super.dispose();
  }

  void _startCarousel() {
    _carouselTimer = Timer.periodic(const Duration(seconds: 4), (timer) {
      if (_carouselController.hasClients) {
        _carouselPage = (_carouselPage + 1) % _banners.length;
        _carouselController.animateToPage(
          _carouselPage,
          duration: const Duration(milliseconds: 500),
          curve: Curves.easeInOut,
        );
      }
    });
  }

  Future<void> _loadData() async {
    if (!_isRefreshing) setState(() => _isLoading = true);
    _error = null;
    try {
      final results = await Future.wait([
        _api.get('/api/categories'),
        _api.get('/api/workers/nearby', params: {'limit': '10'}),
      ]);
      if (mounted) {
        setState(() {
          _categories = (results[0].data is List)
              ? List<Map<String, dynamic>>.from(results[0].data)
              : [];
          _popularWorkers = (results[1].data is List)
              ? List<Map<String, dynamic>>.from(results[1].data)
              : [];
          _isLoading = false;
          _isRefreshing = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _isRefreshing = false;
          _error = 'Unable to load data. Pull to retry.';
        });
      }
    }
  }

  IconData _iconForCategory(String name) {
    final lower = name.toLowerCase();
    for (final entry in _categoryIcons.entries) {
      if (lower.contains(entry.key)) return entry.value;
    }
    return Icons.home_repair_service;
  }

  String _greeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: [
          _buildHomeTab(),
          const ExploreTab(),
          const MyBookingsScreen(),
          const ChatListScreen(),
          const CustomerProfileScreen(),
        ],
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.08),
              blurRadius: 16,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
          child: BottomNavigationBar(
            currentIndex: _currentIndex,
            onTap: (i) => setState(() => _currentIndex = i),
            type: BottomNavigationBarType.fixed,
            backgroundColor: Colors.white,
            selectedItemColor: AppTheme.primaryColor,
            unselectedItemColor: AppTheme.textSecondary,
            selectedLabelStyle: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
            ),
            unselectedLabelStyle: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w500,
            ),
            items: const [
              BottomNavigationBarItem(
                icon: Icon(Icons.home_outlined, size: 24),
                activeIcon: Icon(Icons.home_rounded, size: 24),
                label: 'Home',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.explore_outlined, size: 24),
                activeIcon: Icon(Icons.explore_rounded, size: 24),
                label: 'Explore',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.calendar_month_outlined, size: 24),
                activeIcon: Icon(Icons.calendar_month, size: 24),
                label: 'Bookings',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.chat_outlined, size: 24),
                activeIcon: Icon(Icons.chat_rounded, size: 24),
                label: 'Inbox',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.person_outline, size: 24),
                activeIcon: Icon(Icons.person, size: 24),
                label: 'Profile',
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHomeTab() {
    return RefreshIndicator(
      color: AppTheme.primaryColor,
      onRefresh: () async {
        setState(() => _isRefreshing = true);
        await _loadData();
      },
      child: _error != null && !_isLoading
          ? _buildErrorState()
          : _isLoading
          ? _buildHomeShimmer()
          : SingleChildScrollView(
              controller: _homeScrollController,
              physics: const BouncingScrollPhysics(
                parent: AlwaysScrollableScrollPhysics(),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildHeader(),
                  _buildSearchBar(),
                  const SizedBox(height: 20),
                  _buildBannerCarousel(),
                  const SizedBox(height: 28),
                  _buildSectionTitle('Quick Services'),
                  const SizedBox(height: 14),
                  _buildQuickServiceIcons(),
                  const SizedBox(height: 28),
                  _buildSectionTitle('Popular Services', onSeeAll: () {}),
                  const SizedBox(height: 14),
                  _buildPopularServices(),
                  const SizedBox(height: 28),
                  _buildSectionTitle(
                    'Top Workers Near You',
                    onSeeAll: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const NearbyWorkersScreen(),
                        ),
                      );
                    },
                  ),
                  const SizedBox(height: 14),
                  _buildTopWorkers(),
                  const SizedBox(height: 32),
                ],
              ),
            ),
    );
  }

  Widget _buildErrorState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
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
                Icons.cloud_off_rounded,
                size: 56,
                color: AppTheme.errorColor,
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              'Connection Error',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w700,
                color: AppTheme.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              _error ?? 'Something went wrong.',
              style: const TextStyle(
                color: AppTheme.textSecondary,
                fontSize: 15,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            Container(
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: AppTheme.primaryGradient,
                ),
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.primaryColor.withValues(alpha: 0.35),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Material(
                color: Colors.transparent,
                child: InkWell(
                  onTap: _loadData,
                  borderRadius: BorderRadius.circular(16),
                  child: const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 32, vertical: 14),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.refresh_rounded,
                          color: Colors.white,
                          size: 20,
                        ),
                        SizedBox(width: 8),
                        Text(
                          'Retry',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w700,
                            fontSize: 16,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHomeShimmer() {
    return SingleChildScrollView(
      physics: const NeverScrollableScrollPhysics(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildShimmerHeader(),
          const SizedBox(height: 8),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Shimmer.fromColors(
              baseColor: Colors.grey.shade200,
              highlightColor: Colors.grey.shade100,
              child: Container(
                height: 52,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
            ),
          ),
          const SizedBox(height: 20),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Shimmer.fromColors(
              baseColor: Colors.grey.shade200,
              highlightColor: Colors.grey.shade100,
              child: Container(
                height: 150,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
            ),
          ),
          const SizedBox(height: 28),
          _buildShimmerSectionTitle(),
          const SizedBox(height: 14),
          _buildQuickServiceShimmer(),
          const SizedBox(height: 28),
          _buildShimmerSectionTitle(),
          const SizedBox(height: 14),
          _buildShimmerCards(),
          const SizedBox(height: 28),
          _buildShimmerSectionTitle(),
          const SizedBox(height: 14),
          _buildShimmerWorkerCards(),
          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildShimmerHeader() {
    return Shimmer.fromColors(
      baseColor: Colors.grey.shade200,
      highlightColor: Colors.grey.shade100,
      child: Container(
        height: 130,
        padding: const EdgeInsets.fromLTRB(20, 24, 20, 28),
        decoration: const BoxDecoration(color: Colors.white),
      ),
    );
  }

  Widget _buildShimmerSectionTitle() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Shimmer.fromColors(
        baseColor: Colors.grey.shade200,
        highlightColor: Colors.grey.shade100,
        child: Container(
          height: 20,
          width: 160,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(6),
          ),
        ),
      ),
    );
  }

  Widget _buildQuickServiceShimmer() {
    return SizedBox(
      height: 88,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        itemCount: 6,
        itemBuilder: (_, __) => Padding(
          padding: const EdgeInsets.only(right: 16),
          child: Shimmer.fromColors(
            baseColor: Colors.grey.shade200,
            highlightColor: Colors.grey.shade100,
            child: Container(
              width: 64,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildShimmerCards() {
    return SizedBox(
      height: 140,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        itemCount: 4,
        itemBuilder: (_, __) => Padding(
          padding: const EdgeInsets.only(right: 14),
          child: Shimmer.fromColors(
            baseColor: Colors.grey.shade200,
            highlightColor: Colors.grey.shade100,
            child: Container(
              width: 200,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildShimmerWorkerCards() {
    return SizedBox(
      height: 210,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        itemCount: 4,
        itemBuilder: (_, __) => Padding(
          padding: const EdgeInsets.only(right: 14),
          child: Shimmer.fromColors(
            baseColor: Colors.grey.shade200,
            highlightColor: Colors.grey.shade100,
            child: Container(
              width: 170,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 44, 20, 32),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [AppTheme.primaryColor, Color(0xFF008A42)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Good ${_greeting()},',
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.85),
                      fontSize: 15,
                      fontWeight: FontWeight.w400,
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Arslan Services',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 24,
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.5,
                    ),
                  ),
                ],
              ),
              Row(
                children: [
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.15),
                      shape: BoxShape.circle,
                    ),
                    child: Stack(
                      children: [
                        IconButton(
                          icon: const Icon(
                            Icons.notifications_outlined,
                            color: Colors.white,
                          ),
                          onPressed: () => Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => const NotificationsScreen(),
                            ),
                          ),
                        ),
                        Positioned(
                          right: 8,
                          top: 8,
                          child: Container(
                            width: 10,
                            height: 10,
                            decoration: BoxDecoration(
                              color: AppTheme.accentColor,
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.white, width: 2),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: Colors.white.withValues(alpha: 0.5),
                        width: 2,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.15),
                          blurRadius: 8,
                          offset: const Offset(0, 3),
                        ),
                      ],
                    ),
                    child: const CircleAvatar(
                      radius: 22,
                      backgroundColor: Colors.white24,
                      child: Icon(Icons.person, color: Colors.white, size: 24),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: GestureDetector(
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const SearchScreen()),
        ),
        child: Transform.translate(
          offset: const Offset(0, -26),
          child: Container(
            height: 54,
            padding: const EdgeInsets.symmetric(horizontal: 18),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: AppTheme.primaryColor.withValues(alpha: 0.18),
                  blurRadius: 20,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AppTheme.primaryColor.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(
                    Icons.search_rounded,
                    color: AppTheme.primaryColor,
                    size: 22,
                  ),
                ),
                const SizedBox(width: 14),
                const Expanded(
                  child: Text(
                    'Search for services...',
                    style: TextStyle(
                      color: AppTheme.textSecondary,
                      fontSize: 15,
                      fontWeight: FontWeight.w400,
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: AppTheme.accentColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.tune_rounded,
                        size: 18,
                        color: AppTheme.accentColor,
                      ),
                      SizedBox(width: 4),
                      Text(
                        'Filter',
                        style: TextStyle(
                          fontSize: 12,
                          color: AppTheme.accentColor,
                          fontWeight: FontWeight.w600,
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
    );
  }

  Widget _buildSectionTitle(String title, {VoidCallback? onSeeAll}) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 19,
              fontWeight: FontWeight.w800,
              color: AppTheme.textPrimary,
              letterSpacing: -0.3,
            ),
          ),
          if (onSeeAll != null)
            GestureDetector(
              onTap: onSeeAll,
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: AppTheme.accentColor.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Text(
                  'See All',
                  style: TextStyle(
                    fontWeight: FontWeight.w700,
                    fontSize: 13,
                    color: AppTheme.accentColor,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildBannerCarousel() {
    return SizedBox(
      height: 175,
      child: PageView.builder(
        controller: _carouselController,
        itemCount: _banners.length,
        padEnds: false,
        onPageChanged: (i) => _carouselPage = i,
        itemBuilder: (_, i) {
          final b = _banners[i];
          final color = b['color'] as Color;
          return Padding(
            padding: EdgeInsets.only(left: i == 0 ? 20 : 6, right: 14),
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [color, color.withValues(alpha: 0.72)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: color.withValues(alpha: 0.4),
                    blurRadius: 16,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              padding: const EdgeInsets.all(24),
              child: Stack(
                children: [
                  Positioned(
                    right: -20,
                    bottom: -20,
                    child: Icon(
                      b['icon'] as IconData,
                      size: 110,
                      color: Colors.white.withValues(alpha: 0.1),
                    ),
                  ),
                  Positioned(
                    right: -8,
                    top: -8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 14,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: AppTheme.accentColor,
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: [
                          BoxShadow(
                            color: AppTheme.accentColor.withValues(alpha: 0.4),
                            blurRadius: 8,
                            offset: const Offset(0, 3),
                          ),
                        ],
                      ),
                      child: Text(
                        b['tag'] as String,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.8,
                        ),
                      ),
                    ),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Spacer(),
                      Text(
                        b['title'] as String,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 22,
                          fontWeight: FontWeight.w800,
                          letterSpacing: -0.3,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        b['subtitle'] as String,
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.85),
                          fontSize: 14,
                          fontWeight: FontWeight.w400,
                        ),
                      ),
                      const SizedBox(height: 16),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 18,
                          vertical: 8,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(
                              Icons.arrow_forward_rounded,
                              size: 16,
                              color: AppTheme.primaryColor,
                            ),
                            const SizedBox(width: 6),
                            const Text(
                              'Book Now',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                                color: AppTheme.primaryColor,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const Spacer(),
                    ],
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildQuickServiceIcons() {
    if (_categories.isEmpty) {
      return const SizedBox(
        height: 80,
        child: Center(
          child: Text(
            'No services available',
            style: TextStyle(color: AppTheme.textSecondary),
          ),
        ),
      );
    }
    final items = _categories.take(10).toList();
    return SizedBox(
      height: 88,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        itemCount: items.length,
        itemBuilder: (_, i) {
          final cat = items[i];
          final name = cat['name'] ?? 'Service';
          final color = _categoryColors[i % _categoryColors.length];
          return GestureDetector(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const SearchScreen()),
              );
            },
            child: Container(
              width: 68,
              margin: const EdgeInsets.only(right: 16),
              child: Column(
                children: [
                  Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      color: color.withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(
                        color: color.withValues(alpha: 0.2),
                        width: 1,
                      ),
                    ),
                    child: Icon(_iconForCategory(name), color: color, size: 26),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    name.length > 10 ? '${name.substring(0, 10)}...' : name,
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.textPrimary,
                    ),
                    textAlign: TextAlign.center,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildPopularServices() {
    if (_categories.isEmpty) {
      return const SizedBox(
        height: 80,
        child: Center(
          child: Text(
            'No services available',
            style: TextStyle(color: AppTheme.textSecondary),
          ),
        ),
      );
    }
    final items = _categories.take(6).toList();
    return SizedBox(
      height: 145,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        itemCount: items.length,
        itemBuilder: (_, i) {
          final cat = items[i];
          final name = cat['name'] ?? 'Service';
          final color = _categoryColors[i % _categoryColors.length];
          return GestureDetector(
            onTap: () {},
            child: Container(
              width: 210,
              margin: const EdgeInsets.only(right: 14),
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
                  color: AppTheme.dividerColor.withValues(alpha: 0.5),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    height: 80,
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [color, color.withValues(alpha: 0.7)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: const BorderRadius.vertical(
                        top: Radius.circular(16),
                      ),
                    ),
                    child: Center(
                      child: Icon(
                        _iconForCategory(name),
                        color: Colors.white,
                        size: 34,
                      ),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          name,
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: AppTheme.textPrimary,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            const Icon(
                              Icons.star_rounded,
                              size: 14,
                              color: AppTheme.accentColor,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              '4.8 (120+)',
                              style: TextStyle(
                                fontSize: 12,
                                color: AppTheme.textSecondary.withValues(
                                  alpha: 0.9,
                                ),
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildTopWorkers() {
    if (_popularWorkers.isEmpty) {
      return const SizedBox(
        height: 80,
        child: Center(
          child: Text(
            'No workers available nearby',
            style: TextStyle(color: AppTheme.textSecondary),
          ),
        ),
      );
    }
    return SizedBox(
      height: 220,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        itemCount: _popularWorkers.length,
        itemBuilder: (_, i) {
          final w = _popularWorkers[i];
          final user = w['user'] ?? {};
          final fullName = user['fullName'] ?? 'Worker';
          final photo = user['profilePhoto'];
          final rating =
              double.tryParse(w['avgRating']?.toString() ?? '0') ?? 0.0;
          final serviceName = w['service']?['name'] ?? '';
          final isVerified = w['verificationStatus'] == 'VERIFIED';
          final completedJobs = w['completedJobs'] ?? 0;
          final services =
              (w['workerServices'] as List<dynamic>?)
                  ?.take(2)
                  .map((s) => s['service']?['name'] ?? '')
                  .where((n) => n.isNotEmpty)
                  .toList() ??
              [];

          return GestureDetector(
            onTap: () {
              Navigator.pushNamed(context, '/worker-detail', arguments: w);
            },
            child: Container(
              width: 185,
              margin: const EdgeInsets.only(right: 14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.06),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
                border: Border.all(
                  color: AppTheme.dividerColor.withValues(alpha: 0.4),
                ),
              ),
              child: Column(
                children: [
                  const SizedBox(height: 16),
                  Stack(
                    alignment: Alignment.bottomRight,
                    children: [
                      Container(
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: AppTheme.primaryColor.withValues(
                                alpha: 0.15,
                              ),
                              blurRadius: 8,
                              offset: const Offset(0, 3),
                            ),
                          ],
                        ),
                        child: Hero(
                          tag: 'worker-avatar-${w['id']}',
                          child: CircleAvatar(
                            radius: 34,
                            backgroundColor: AppTheme.primaryColor.withValues(
                              alpha: 0.08,
                            ),
                            backgroundImage: photo != null
                                ? NetworkImage(photo)
                                : null,
                            child: photo == null
                                ? const Icon(
                                    Icons.person,
                                    size: 34,
                                    color: AppTheme.primaryColor,
                                  )
                                : null,
                          ),
                        ),
                      ),
                      if (isVerified)
                        Container(
                          padding: const EdgeInsets.all(3),
                          decoration: const BoxDecoration(
                            color: AppTheme.primaryColor,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.verified,
                            color: Colors.white,
                            size: 16,
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    fullName,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: AppTheme.textPrimary,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    textAlign: TextAlign.center,
                  ),
                  if (serviceName.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(top: 2),
                      child: Text(
                        serviceName,
                        style: const TextStyle(
                          fontSize: 11,
                          color: AppTheme.textSecondary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
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
                              size: 14,
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
                      const SizedBox(width: 6),
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
                              size: 13,
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
                    const SizedBox(height: 8),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      child: Wrap(
                        spacing: 4,
                        runSpacing: 4,
                        alignment: WrapAlignment.center,
                        children: services
                            .map(
                              (s) => Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 6,
                                  vertical: 2,
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
                              ),
                            )
                            .toList(),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

class ExploreTab extends StatelessWidget {
  const ExploreTab({super.key});

  @override
  Widget build(BuildContext context) {
    return const NearbyWorkersScreen();
  }
}
