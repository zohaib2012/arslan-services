import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import '../../core/config/theme_config.dart';
import '../../core/services/api_client.dart';
import '../../core/models/worker_model.dart';
import '../../worker/chat/worker_chat_screen.dart';

class WorkerDetailScreen extends StatefulWidget {
  final Map<String, dynamic> worker;
  const WorkerDetailScreen({super.key, required this.worker});

  @override
  State<WorkerDetailScreen> createState() => _WorkerDetailScreenState();
}

class _WorkerDetailScreenState extends State<WorkerDetailScreen> {
  final _api = ApiClient();
  final _scrollController = ScrollController();

  bool _isFavorite = false;
  List<Map<String, dynamic>> _reviews = [];
  bool _loadingReviews = true;
  String? _reviewError;

  WorkerModel get _worker => WorkerModel.fromJson(widget.worker);

  @override
  void initState() {
    super.initState();
    _loadReviews();
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _loadReviews() async {
    setState(() {
      _loadingReviews = true;
      _reviewError = null;
    });
    try {
      final res = await _api.get('/api/workers/${_worker.id}/reviews');
      if (mounted) {
        setState(() {
          _reviews = (res.data is List)
              ? List<Map<String, dynamic>>.from(res.data)
              : [];
          _loadingReviews = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _loadingReviews = false;
          _reviewError = 'Failed to load reviews';
        });
      }
    }
  }

  Future<void> _toggleFavorite() async {
    setState(() => _isFavorite = !_isFavorite);
    try {
      if (_isFavorite) {
        await _api.post('/api/favorites', data: {'workerId': _worker.id});
      } else {
        await _api.delete('/api/favorites/${_worker.id}');
      }
    } catch (_) {
      if (mounted) setState(() => _isFavorite = !_isFavorite);
    }
  }

  Color _ratingColor(double rating) {
    if (rating >= 4.5) return AppTheme.primaryColor;
    if (rating >= 4.0) return AppTheme.successColor;
    if (rating >= 3.0) return AppTheme.accentColor;
    return AppTheme.warningColor;
  }

  @override
  Widget build(BuildContext context) {
    final w = _worker;
    return Scaffold(
      body: CustomScrollView(
        controller: _scrollController,
        slivers: [
          _buildSliverAppBar(w),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildHeroSection(w),
                  const SizedBox(height: 24),
                  _buildQuickStats(w),
                  const SizedBox(height: 24),
                  _buildAboutSection(w),
                  if (w.services.isNotEmpty) ...[
                    const SizedBox(height: 24),
                    _buildCardSection(
                      icon: Icons.handyman_outlined,
                      title: 'Services Offered',
                      child: _buildServicesChips(w),
                    ),
                  ],
                  if (w.serviceAreas.isNotEmpty) ...[
                    const SizedBox(height: 16),
                    _buildCardSection(
                      icon: Icons.location_on_outlined,
                      title: 'Service Areas',
                      child: _buildAreasList(w),
                    ),
                  ],
                  if (w.portfolio.isNotEmpty) ...[
                    const SizedBox(height: 16),
                    _buildSectionTitle('Portfolio'),
                    const SizedBox(height: 12),
                    _buildPortfolioGrid(w),
                  ],
                  if (w.paymentMethods.isNotEmpty) ...[
                    const SizedBox(height: 16),
                    _buildCardSection(
                      icon: Icons.payment_outlined,
                      title: 'Payment Methods',
                      child: _buildPaymentList(w),
                    ),
                  ],
                  const SizedBox(height: 24),
                  _buildSectionTitle('Reviews (${w.totalReviews})'),
                  const SizedBox(height: 12),
                  _buildReviews(),
                  const SizedBox(height: 100),
                ],
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: _buildStickyBottomBar(w),
    );
  }

  Widget _buildSliverAppBar(WorkerModel w) {
    return SliverAppBar(
      expandedHeight: 240,
      pinned: true,
      backgroundColor: AppTheme.primaryColor,
      leading: Container(
        margin: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.2),
          shape: BoxShape.circle,
        ),
        child: IconButton(
          icon: const Icon(
            Icons.arrow_back_rounded,
            color: Colors.white,
            size: 22,
          ),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      actions: [
        Container(
          margin: const EdgeInsets.only(right: 8),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.2),
            shape: BoxShape.circle,
          ),
          child: IconButton(
            icon: Icon(
              _isFavorite ? Icons.favorite : Icons.favorite_border,
              color: _isFavorite ? AppTheme.errorColor : Colors.white,
              size: 22,
            ),
            onPressed: _toggleFavorite,
          ),
        ),
        Container(
          margin: const EdgeInsets.only(right: 8),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.2),
            shape: BoxShape.circle,
          ),
          child: PopupMenuButton<String>(
            color: Colors.white,
            icon: const Icon(Icons.more_vert, color: Colors.white, size: 22),
            onSelected: (_) {},
            itemBuilder: (_) => const [
              PopupMenuItem(value: 'report', child: Text('Report')),
              PopupMenuItem(value: 'block', child: Text('Block Worker')),
            ],
          ),
        ),
      ],
      flexibleSpace: FlexibleSpaceBar(
        background: Stack(
          fit: StackFit.expand,
          children: [
            w.profilePhoto != null
                ? Image.network(w.profilePhoto!, fit: BoxFit.cover)
                : Container(
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        colors: [AppTheme.primaryColor, Color(0xFF008A42)],
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                      ),
                    ),
                  ),
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    Colors.black.withValues(alpha: 0.4),
                    Colors.transparent,
                    Colors.black.withValues(alpha: 0.3),
                  ],
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeroSection(WorkerModel w) {
    final rating = w.avgRating;
    return Transform.translate(
      offset: const Offset(0, -45),
      child: Column(
        children: [
          Stack(
            alignment: Alignment.bottomRight,
            children: [
              Container(
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 4),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.15),
                      blurRadius: 16,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Hero(
                  tag: 'worker-avatar-${widget.worker['id']}',
                  child: CircleAvatar(
                    radius: 56,
                    backgroundColor: AppTheme.primaryColor.withValues(
                      alpha: 0.08,
                    ),
                    backgroundImage: w.profilePhoto != null
                        ? NetworkImage(w.profilePhoto!)
                        : null,
                    child: w.profilePhoto == null
                        ? const Icon(
                            Icons.person,
                            size: 56,
                            color: AppTheme.primaryColor,
                          )
                        : null,
                  ),
                ),
              ),
              if (w.verificationStatus == 'VERIFIED')
                Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: AppTheme.primaryColor,
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white, width: 3),
                    boxShadow: [
                      BoxShadow(
                        color: AppTheme.primaryColor.withValues(alpha: 0.3),
                        blurRadius: 6,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: const Icon(
                    Icons.verified,
                    color: Colors.white,
                    size: 20,
                  ),
                ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            w.fullName,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w800,
              color: AppTheme.textPrimary,
              letterSpacing: -0.5,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 5,
                ),
                decoration: BoxDecoration(
                  color: _ratingColor(rating).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.star_rounded,
                      size: 18,
                      color: _ratingColor(rating),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      rating.toStringAsFixed(1),
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: _ratingColor(rating),
                      ),
                    ),
                    const SizedBox(width: 2),
                    Text(
                      '(${w.totalReviews} reviews)',
                      style: const TextStyle(
                        fontSize: 13,
                        color: AppTheme.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 10),
              if (w.isOnline)
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 5,
                  ),
                  decoration: BoxDecoration(
                    color: AppTheme.successColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.circle, size: 8, color: AppTheme.successColor),
                      SizedBox(width: 4),
                      Text(
                        'Online',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: AppTheme.successColor,
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildQuickStats(WorkerModel w) {
    return Row(
      children: [
        _statCard(
          icon: Icons.work_history_rounded,
          value: '${w.experienceYears ?? 0} yr',
          label: 'Experience',
          color: AppTheme.primaryColor,
        ),
        const SizedBox(width: 10),
        _statCard(
          icon: Icons.task_alt_rounded,
          value: '${w.completedJobs}',
          label: 'Jobs Done',
          color: AppTheme.primaryColor,
        ),
        const SizedBox(width: 10),
        _statCard(
          icon: Icons.timer_outlined,
          value: w.responseTimeMinutes != null
              ? '${w.responseTimeMinutes}m'
              : 'N/A',
          label: 'Response',
          color: AppTheme.accentColor,
        ),
      ],
    );
  }

  Widget _statCard({
    required IconData icon,
    required String value,
    required String label,
    required Color color,
  }) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 10),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: color.withValues(alpha: 0.1),
              blurRadius: 10,
              offset: const Offset(0, 3),
            ),
          ],
          border: Border.all(color: color.withValues(alpha: 0.15), width: 1),
        ),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: color, size: 22),
            ),
            const SizedBox(height: 8),
            Text(
              value,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w800,
                color: color,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: const TextStyle(
                fontSize: 11,
                color: AppTheme.textSecondary,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAboutSection(WorkerModel w) {
    return _buildCardSection(
      icon: Icons.info_outline_rounded,
      title: 'About',
      child: Text(
        w.description ?? 'No description provided.',
        style: const TextStyle(
          fontSize: 14,
          color: AppTheme.textSecondary,
          height: 1.6,
        ),
      ),
    );
  }

  Widget _buildCardSection({
    required IconData icon,
    required String title,
    required Widget child,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
        border: Border.all(color: AppTheme.dividerColor.withValues(alpha: 0.5)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: AppTheme.primaryColor.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, size: 18, color: AppTheme.primaryColor),
              ),
              const SizedBox(width: 10),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: AppTheme.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          child,
        ],
      ),
    );
  }

  Widget _buildServicesChips(WorkerModel w) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: w.services.map<Widget>((s) {
        final name = s['service']?['name'] ?? s['name'] ?? '';
        if (name.isEmpty) return const SizedBox.shrink();
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [AppTheme.primaryColor, Color(0xFF008A42)],
            ),
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: AppTheme.primaryColor.withValues(alpha: 0.25),
                blurRadius: 6,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Text(
            name,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 13,
              fontWeight: FontWeight.w600,
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildAreasList(WorkerModel w) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: w.serviceAreas.map<Widget>((a) {
        final name = a['name'] ?? a['city'] ?? '';
        if (name.isEmpty) return const SizedBox.shrink();
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          decoration: BoxDecoration(
            color: AppTheme.backgroundColor,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: AppTheme.dividerColor.withValues(alpha: 0.6),
            ),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(
                Icons.location_on_outlined,
                size: 14,
                color: AppTheme.primaryColor,
              ),
              const SizedBox(width: 4),
              Text(
                name,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: AppTheme.textPrimary,
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  Widget _buildPaymentList(WorkerModel w) {
    final iconMap = {
      'cash': Icons.money_outlined,
      'jazzcash': Icons.account_balance_wallet_outlined,
      'easypesa': Icons.account_balance_wallet_outlined,
      'bank': Icons.account_balance_outlined,
      'card': Icons.credit_card_outlined,
    };
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: w.paymentMethods.map<Widget>((p) {
        final method = (p['method'] ?? p['name'] ?? '')
            .toString()
            .toLowerCase();
        final icon = iconMap.entries
            .firstWhere(
              (e) => method.contains(e.key),
              orElse: () => const MapEntry('cash', Icons.money_outlined),
            )
            .value;
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          decoration: BoxDecoration(
            color: AppTheme.backgroundColor,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: AppTheme.dividerColor.withValues(alpha: 0.6),
            ),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 16, color: AppTheme.primaryColor),
              const SizedBox(width: 6),
              Text(
                method[0].toUpperCase() + method.substring(1),
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: AppTheme.textPrimary,
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Row(
      children: [
        Container(
          width: 4,
          height: 20,
          decoration: BoxDecoration(
            color: AppTheme.primaryColor,
            borderRadius: BorderRadius.circular(2),
          ),
        ),
        const SizedBox(width: 10),
        Text(
          title,
          style: const TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.w700,
            color: AppTheme.textPrimary,
          ),
        ),
      ],
    );
  }

  Widget _buildPortfolioGrid(WorkerModel w) {
    return SizedBox(
      height: 110,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: w.portfolio.length,
        itemBuilder: (_, i) {
          final img = w.portfolio[i]['imageUrl'] ?? w.portfolio[i];
          final url = img is String && img.startsWith('http') ? img : null;
          return GestureDetector(
            onTap: () {},
            child: Container(
              width: 110,
              margin: const EdgeInsets.only(right: 10),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(14),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.08),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(14),
                child: url != null
                    ? Image.network(url, fit: BoxFit.cover)
                    : Container(
                        color: Colors.grey.shade100,
                        child: const Icon(
                          Icons.image,
                          color: AppTheme.textSecondary,
                        ),
                      ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildReviews() {
    if (_loadingReviews) {
      return ListView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: 3,
        itemBuilder: (_, __) => Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Shimmer.fromColors(
            baseColor: Colors.grey.shade200,
            highlightColor: Colors.grey.shade100,
            child: Container(
              height: 80,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
              ),
            ),
          ),
        ),
      );
    }
    if (_reviewError != null) {
      return Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: AppTheme.errorColor.withValues(alpha: 0.05),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: AppTheme.errorColor.withValues(alpha: 0.15),
          ),
        ),
        child: Row(
          children: [
            const Icon(Icons.error_outline, color: AppTheme.errorColor),
            const SizedBox(width: 10),
            const Expanded(
              child: Text(
                'Failed to load reviews',
                style: TextStyle(color: AppTheme.errorColor, fontSize: 13),
              ),
            ),
            GestureDetector(
              onTap: _loadReviews,
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'Retry',
                    style: TextStyle(
                      color: AppTheme.primaryColor,
                      fontWeight: FontWeight.w700,
                      fontSize: 13,
                    ),
                  ),
                  SizedBox(width: 4),
                  Icon(Icons.refresh, size: 16, color: AppTheme.primaryColor),
                ],
              ),
            ),
          ],
        ),
      );
    }
    if (_reviews.isEmpty) {
      return Container(
        padding: const EdgeInsets.symmetric(vertical: 32),
        decoration: BoxDecoration(
          color: AppTheme.backgroundColor,
          borderRadius: BorderRadius.circular(14),
        ),
        child: const Center(
          child: Column(
            children: [
              Icon(
                Icons.rate_review_outlined,
                size: 40,
                color: AppTheme.textSecondary,
              ),
              SizedBox(height: 8),
              Text(
                'No reviews yet',
                style: TextStyle(color: AppTheme.textSecondary, fontSize: 14),
              ),
            ],
          ),
        ),
      );
    }
    return Column(
      children: _reviews.map((r) {
        final customer = r['customer'] ?? {};
        final rating = r['rating'] ?? 0;
        return Container(
          margin: const EdgeInsets.only(bottom: 10),
          padding: const EdgeInsets.all(14),
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
            border: Border.all(
              color: AppTheme.dividerColor.withValues(alpha: 0.4),
            ),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              CircleAvatar(
                radius: 22,
                backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.08),
                backgroundImage: customer['profilePhoto'] != null
                    ? NetworkImage(customer['profilePhoto'])
                    : null,
                child: customer['profilePhoto'] == null
                    ? const Icon(
                        Icons.person,
                        size: 22,
                        color: AppTheme.primaryColor,
                      )
                    : null,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          customer['fullName'] ?? 'Customer',
                          style: const TextStyle(
                            fontWeight: FontWeight.w700,
                            fontSize: 14,
                            color: AppTheme.textPrimary,
                          ),
                        ),
                        Row(
                          children: List.generate(5, (i) {
                            return Icon(
                              i < rating
                                  ? Icons.star_rounded
                                  : Icons.star_outline_rounded,
                              size: 14,
                              color: i < rating
                                  ? AppTheme.accentColor
                                  : Colors.grey.shade300,
                            );
                          }),
                        ),
                      ],
                    ),
                    if (r['comment'] != null &&
                        r['comment'].toString().isNotEmpty) ...[
                      const SizedBox(height: 6),
                      Text(
                        r['comment'],
                        style: const TextStyle(
                          fontSize: 13,
                          color: AppTheme.textSecondary,
                          height: 1.4,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  Widget _buildStickyBottomBar(WorkerModel w) {
    return SafeArea(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.08),
              blurRadius: 16,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: Row(
          children: [
            _bottomActionButton(
              Icons.chat_outlined,
              'Chat',
              AppTheme.primaryColor,
              () {
                final w = widget.worker;
                final user = (w['user'] as Map<String, dynamic>?) ?? {};
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => WorkerChatScreen(
                      userId: user['id'] ?? w['id'] ?? '',
                      userName: user['fullName'] ?? w['fullName'] ?? 'Worker',
                      userPhoto: user['profilePhoto'],
                    ),
                  ),
                );
              },
            ),
            _bottomActionButton(
              Icons.call_outlined,
              'Call',
              AppTheme.primaryColor,
              () {
                final phone =
                    widget.worker['user']?['phone'] ?? widget.worker['phone'];
                if (phone != null && phone.isNotEmpty) {
                  ScaffoldMessenger.of(
                    context,
                  ).showSnackBar(SnackBar(content: Text('Calling $phone...')));
                }
              },
            ),
            _bottomActionButton(
              Icons.message_outlined,
              'WhatsApp',
              AppTheme.successColor,
              () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('WhatsApp coming soon')),
                );
              },
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Container(
                height: 50,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AppTheme.primaryColor, Color(0xFF008A42)],
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
                    onTap: () {
                      Navigator.pushNamed(
                        context,
                        '/create-booking',
                        arguments: widget.worker,
                      );
                    },
                    borderRadius: BorderRadius.circular(16),
                    child: const Center(
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.calendar_month_rounded,
                            color: Colors.white,
                            size: 18,
                          ),
                          SizedBox(width: 8),
                          Text(
                            'Book Now',
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w800,
                              fontSize: 15,
                            ),
                          ),
                        ],
                      ),
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

  Widget _bottomActionButton(
    IconData icon,
    String label,
    Color color,
    VoidCallback onTap,
  ) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 4),
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          width: 52,
          padding: const EdgeInsets.symmetric(vertical: 6),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.06),
            borderRadius: BorderRadius.circular(14),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, color: color, size: 20),
              const SizedBox(height: 2),
              Text(
                label,
                style: TextStyle(
                  fontSize: 10,
                  color: color,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
