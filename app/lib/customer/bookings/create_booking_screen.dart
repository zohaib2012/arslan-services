import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import '../../core/config/theme_config.dart';
import '../../core/services/api_client.dart';

class CreateBookingScreen extends StatefulWidget {
  final Map<String, dynamic>? worker;
  const CreateBookingScreen({super.key, this.worker});

  @override
  State<CreateBookingScreen> createState() => _CreateBookingScreenState();
}

class _CreateBookingScreenState extends State<CreateBookingScreen>
    with SingleTickerProviderStateMixin {
  final _api = ApiClient();
  final _formKey = GlobalKey<FormState>();
  final _descriptionController = TextEditingController();
  final _addressController = TextEditingController();
  final _notesController = TextEditingController();
  final _priceController = TextEditingController();

  late AnimationController _stepAnimController;
  late Animation<double> _stepAnim;

  int _currentStep = 0;
  List<Map<String, dynamic>> _services = [];
  String? _selectedServiceId;
  String _bookingType = 'INSTANT';
  DateTime? _scheduledDate;
  TimeOfDay? _scheduledTime;
  bool _isSubmitting = false;
  bool _loadingServices = true;
  String? _serviceError;

  final List<String> _stepLabels = ['Service', 'Details', 'Confirm'];

  @override
  void initState() {
    super.initState();
    _stepAnimController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
    );
    _stepAnim = CurvedAnimation(
      parent: _stepAnimController,
      curve: Curves.easeInOut,
    );
    _stepAnimController.forward();
    _loadServices();
  }

  @override
  void dispose() {
    _descriptionController.dispose();
    _addressController.dispose();
    _notesController.dispose();
    _priceController.dispose();
    _stepAnimController.dispose();
    super.dispose();
  }

  Future<void> _loadServices() async {
    setState(() {
      _loadingServices = true;
      _serviceError = null;
    });
    try {
      final res = await _api.get('/api/services');
      if (mounted) {
        setState(() {
          _services = (res.data is List)
              ? List<Map<String, dynamic>>.from(res.data)
              : [];
          _loadingServices = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _loadingServices = false;
          _serviceError = 'Failed to load services';
        });
      }
    }
  }

  void _nextStep() {
    if (_currentStep == 0 && _selectedServiceId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Row(
            children: [
              Icon(Icons.info_outline, color: Colors.white, size: 18),
              SizedBox(width: 8),
              Text('Please select a service'),
            ],
          ),
          backgroundColor: AppTheme.primaryColor,
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }
    setState(() => _currentStep++);
    _stepAnimController.reset();
    _stepAnimController.forward();
  }

  void _prevStep() {
    setState(() => _currentStep--);
    _stepAnimController.reset();
    _stepAnimController.forward();
  }

  Future<void> _createBooking() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);
    try {
      final data = <String, dynamic>{
        'workerId': widget.worker?['id'],
        'serviceId': _selectedServiceId,
        'bookingType': _bookingType,
        'description': _descriptionController.text.trim(),
        'address': _addressController.text.trim(),
        'customerNotes': _notesController.text.trim(),
        if (_priceController.text.isNotEmpty)
          'estimatedPrice': double.tryParse(_priceController.text),
      };

      if (_bookingType == 'SCHEDULED' &&
          _scheduledDate != null &&
          _scheduledTime != null) {
        data['scheduledAt'] = DateTime(
          _scheduledDate!.year,
          _scheduledDate!.month,
          _scheduledDate!.day,
          _scheduledTime!.hour,
          _scheduledTime!.minute,
        ).toIso8601String();
      }

      await _api.post('/api/bookings', data: data);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Row(
              children: [
                Icon(Icons.check_circle, color: Colors.white, size: 18),
                SizedBox(width: 8),
                Text('Booking created successfully!'),
              ],
            ),
            backgroundColor: AppTheme.successColor,
            behavior: SnackBarBehavior.floating,
          ),
        );
        Navigator.pop(context);
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Row(
              children: [
                Icon(Icons.error_outline, color: Colors.white, size: 18),
                SizedBox(width: 8),
                Text('Failed to create booking'),
              ],
            ),
            backgroundColor: AppTheme.errorColor,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
    if (mounted) setState(() => _isSubmitting = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      appBar: AppBar(
        title: const Text(
          'Create Booking',
          style: TextStyle(fontWeight: FontWeight.w700, fontSize: 18),
        ),
        leading: Container(
          margin: const EdgeInsets.all(6),
          decoration: BoxDecoration(
            color: AppTheme.backgroundColor,
            borderRadius: BorderRadius.circular(12),
          ),
          child: IconButton(
            icon: const Icon(Icons.arrow_back_rounded, size: 22),
            onPressed: () => Navigator.pop(context),
          ),
        ),
      ),
      body: Column(
        children: [
          _buildStepIndicator(),
          Expanded(
            child: FadeTransition(
              opacity: _stepAnim,
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Form(key: _formKey, child: _buildCurrentStep()),
              ),
            ),
          ),
          _buildBottomBar(),
        ],
      ),
    );
  }

  Widget _buildStepIndicator() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
      decoration: const BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Color(0x08000000),
            blurRadius: 6,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: List.generate(_stepLabels.length, (i) {
          final isActive = i <= _currentStep;
          final isDone = i < _currentStep;
          return Expanded(
            child: Row(
              children: [
                if (i > 0)
                  Expanded(
                    child: Container(
                      height: 3,
                      color: isActive
                          ? AppTheme.primaryColor
                          : AppTheme.dividerColor,
                    ),
                  ),
                Column(
                  children: [
                    AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: isActive
                            ? AppTheme.primaryColor
                            : AppTheme.dividerColor,
                        boxShadow: isActive
                            ? [
                                BoxShadow(
                                  color: const Color(
                                    0xFF006837,
                                  ).withValues(alpha: 0.3),
                                  blurRadius: 8,
                                  offset: const Offset(0, 2),
                                ),
                              ]
                            : null,
                      ),
                      child: Center(
                        child: isDone
                            ? const Icon(
                                Icons.check,
                                color: Colors.white,
                                size: 16,
                              )
                            : Text(
                                '${i + 1}',
                                style: TextStyle(
                                  color: isActive
                                      ? Colors.white
                                      : AppTheme.textSecondary,
                                  fontWeight: FontWeight.w700,
                                  fontSize: 13,
                                ),
                              ),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _stepLabels[i],
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: isActive
                            ? FontWeight.w700
                            : FontWeight.w500,
                        color: isActive
                            ? AppTheme.primaryColor
                            : AppTheme.textSecondary,
                      ),
                    ),
                  ],
                ),
                if (i < _stepLabels.length - 1)
                  Expanded(
                    child: Container(
                      height: 3,
                      color: i < _currentStep
                          ? AppTheme.primaryColor
                          : AppTheme.dividerColor,
                    ),
                  ),
              ],
            ),
          );
        }),
      ),
    );
  }

  Widget _buildCurrentStep() {
    switch (_currentStep) {
      case 0:
        return _buildStepService();
      case 1:
        return _buildStepDetails();
      case 2:
        return _buildStepConfirm();
      default:
        return const SizedBox.shrink();
    }
  }

  Widget _buildStepService() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (widget.worker != null) ...[
          _buildWorkerInfoCard(),
          const SizedBox(height: 20),
        ],
        const Text(
          'Select Service',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: AppTheme.textPrimary,
          ),
        ),
        const SizedBox(height: 4),
        const Text(
          'Choose the service you need',
          style: TextStyle(fontSize: 13, color: AppTheme.textSecondary),
        ),
        const SizedBox(height: 16),
        if (_loadingServices) _buildServiceShimmer(),
        if (_serviceError != null)
          _buildErrorCard(_serviceError!, _loadServices),
        if (!_loadingServices && _serviceError == null) _buildServiceGrid(),
      ],
    );
  }

  Widget _buildServiceShimmer() {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 2.2,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
      ),
      itemCount: 6,
      itemBuilder: (_, __) => Shimmer.fromColors(
        baseColor: Colors.grey.shade200,
        highlightColor: Colors.grey.shade100,
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
          ),
        ),
      ),
    );
  }

  Widget _buildErrorCard(String message, VoidCallback onRetry) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.errorColor.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppTheme.errorColor.withValues(alpha: 0.15)),
      ),
      child: Row(
        children: [
          const Icon(Icons.error_outline, color: AppTheme.errorColor, size: 20),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              message,
              style: const TextStyle(color: AppTheme.errorColor, fontSize: 13),
            ),
          ),
          GestureDetector(
            onTap: onRetry,
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

  Widget _buildServiceGrid() {
    if (_services.isEmpty) {
      return Container(
        padding: const EdgeInsets.symmetric(vertical: 32),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
        ),
        child: const Center(
          child: Text(
            'No services available',
            style: TextStyle(color: AppTheme.textSecondary),
          ),
        ),
      );
    }
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 2.2,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
      ),
      itemCount: _services.length,
      itemBuilder: (_, i) {
        final s = _services[i];
        final name = s['name'] ?? 'Service';
        final isSelected = _selectedServiceId == s['id'];
        return GestureDetector(
          onTap: () => setState(() => _selectedServiceId = s['id']),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            decoration: BoxDecoration(
              color: isSelected ? AppTheme.primaryColor : Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: isSelected
                    ? AppTheme.primaryColor
                    : AppTheme.dividerColor.withValues(alpha: 0.5),
                width: isSelected ? 2 : 1,
              ),
              boxShadow: isSelected
                  ? [
                      BoxShadow(
                        color: AppTheme.primaryColor.withValues(alpha: 0.2),
                        blurRadius: 8,
                        offset: const Offset(0, 3),
                      ),
                    ]
                  : [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.03),
                        blurRadius: 6,
                        offset: const Offset(0, 2),
                      ),
                    ],
            ),
            child: Row(
              children: [
                Icon(
                  isSelected ? Icons.check_circle : Icons.circle_outlined,
                  size: 20,
                  color: isSelected ? Colors.white : AppTheme.textSecondary,
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    name,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: isSelected ? Colors.white : AppTheme.textPrimary,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildStepDetails() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Booking Details',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: AppTheme.textPrimary,
          ),
        ),
        const SizedBox(height: 4),
        const Text(
          'Provide details for your booking',
          style: TextStyle(fontSize: 13, color: AppTheme.textSecondary),
        ),
        const SizedBox(height: 20),
        _buildSectionTitle('Booking Type'),
        const SizedBox(height: 12),
        _buildBookingTypeCards(),
        const SizedBox(height: 20),
        if (_bookingType == 'SCHEDULED') ...[
          _buildSectionTitle('Schedule'),
          const SizedBox(height: 12),
          _buildDateTimePicker(),
          const SizedBox(height: 20),
        ],
        _buildSectionTitle('Description'),
        const SizedBox(height: 12),
        TextFormField(
          controller: _descriptionController,
          decoration: const InputDecoration(
            labelText: 'Describe the problem',
            prefixIcon: Icon(Icons.description_outlined),
          ),
          maxLines: 4,
          validator: (v) => v == null || v.trim().isEmpty
              ? 'Please describe what you need'
              : null,
        ),
        const SizedBox(height: 20),
        _buildSectionTitle('Address'),
        const SizedBox(height: 12),
        TextFormField(
          controller: _addressController,
          decoration: const InputDecoration(
            labelText: 'Your address',
            prefixIcon: Icon(Icons.location_on_outlined),
          ),
          validator: (v) =>
              v == null || v.trim().isEmpty ? 'Address is required' : null,
        ),
        const SizedBox(height: 20),
        _buildSectionTitle('Additional Notes (Optional)'),
        const SizedBox(height: 12),
        TextFormField(
          controller: _notesController,
          decoration: const InputDecoration(
            labelText: 'Any special instructions',
            prefixIcon: Icon(Icons.note_outlined),
          ),
          maxLines: 3,
        ),
        const SizedBox(height: 20),
        _buildSectionTitle('Estimated Price'),
        const SizedBox(height: 12),
        TextFormField(
          controller: _priceController,
          keyboardType: TextInputType.number,
          decoration: const InputDecoration(
            labelText: 'Enter estimated budget',
            prefixIcon: Icon(Icons.attach_money),
            suffixText: 'PKR',
          ),
        ),
      ],
    );
  }

  Widget _buildStepConfirm() {
    final worker = widget.worker ?? {};
    final user = worker['user'] ?? {};
    final selectedService = _services.firstWhere(
      (s) => s['id'] == _selectedServiceId,
      orElse: () => {},
    );
    final serviceName = selectedService['name'] ?? 'Selected service';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Confirm Booking',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: AppTheme.textPrimary,
          ),
        ),
        const SizedBox(height: 4),
        const Text(
          'Review your booking details',
          style: TextStyle(fontSize: 13, color: AppTheme.textSecondary),
        ),
        const SizedBox(height: 20),
        Container(
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
          ),
          child: Column(
            children: [
              if (user['fullName'] != null) ...[
                Row(
                  children: [
                    CircleAvatar(
                      radius: 22,
                      backgroundColor: AppTheme.primaryColor.withValues(
                        alpha: 0.08,
                      ),
                      backgroundImage: user['profilePhoto'] != null
                          ? NetworkImage(user['profilePhoto'])
                          : null,
                      child: user['profilePhoto'] == null
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
                          Text(
                            user['fullName'],
                            style: const TextStyle(
                              fontWeight: FontWeight.w700,
                              fontSize: 15,
                            ),
                          ),
                          Row(
                            children: [
                              const Icon(
                                Icons.star_rounded,
                                size: 13,
                                color: AppTheme.accentColor,
                              ),
                              Text(
                                ' ${worker['avgRating'] ?? 0}',
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
                  ],
                ),
                const Divider(height: 24),
              ],
              _confirmRow(
                Icons.handyman_outlined,
                'Service',
                serviceName,
                AppTheme.primaryColor,
              ),
              const SizedBox(height: 14),
              _confirmRow(
                _bookingType == 'INSTANT'
                    ? Icons.bolt
                    : _bookingType == 'SCHEDULED'
                    ? Icons.schedule
                    : Icons.warning_amber,
                'Booking Type',
                _bookingType == 'INSTANT'
                    ? 'Instant'
                    : _bookingType == 'SCHEDULED'
                    ? 'Scheduled'
                    : 'Emergency',
                _bookingType == 'INSTANT'
                    ? AppTheme.successColor
                    : _bookingType == 'SCHEDULED'
                    ? const Color(0xFF1565C0)
                    : AppTheme.errorColor,
              ),
              if (_scheduledDate != null && _scheduledTime != null) ...[
                const SizedBox(height: 14),
                _confirmRow(
                  Icons.calendar_today,
                  'Scheduled',
                  '${_scheduledDate!.day}/${_scheduledDate!.month}/${_scheduledDate!.year} at ${_scheduledTime!.format(context)}',
                  AppTheme.primaryColor,
                ),
              ],
              const SizedBox(height: 14),
              _confirmRow(
                Icons.location_on_outlined,
                'Address',
                _addressController.text.trim(),
                AppTheme.primaryColor,
              ),
              if (_descriptionController.text.isNotEmpty) ...[
                const SizedBox(height: 14),
                _confirmRow(
                  Icons.description_outlined,
                  'Description',
                  _descriptionController.text.trim(),
                  AppTheme.primaryColor,
                ),
              ],
              if (_priceController.text.isNotEmpty) ...[
                const SizedBox(height: 14),
                _confirmRow(
                  Icons.attach_money,
                  'Budget',
                  'Rs. ${_priceController.text.trim()}',
                  AppTheme.accentColor,
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }

  Widget _confirmRow(IconData icon, String label, String value, Color color) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(6),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.08),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, size: 16, color: color),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: const TextStyle(
                  fontSize: 11,
                  color: AppTheme.textSecondary,
                  fontWeight: FontWeight.w500,
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

  Widget _buildWorkerInfoCard() {
    final w = widget.worker!;
    final user = w['user'] ?? {};
    return Container(
      padding: const EdgeInsets.all(14),
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
        border: Border.all(color: AppTheme.dividerColor.withValues(alpha: 0.4)),
      ),
      child: Row(
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
              radius: 26,
              backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.08),
              backgroundImage: user['profilePhoto'] != null
                  ? NetworkImage(user['profilePhoto'])
                  : null,
              child: user['profilePhoto'] == null
                  ? const Icon(
                      Icons.person,
                      size: 26,
                      color: AppTheme.primaryColor,
                    )
                  : null,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  user['fullName'] ?? 'Worker',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.textPrimary,
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Icon(
                      Icons.star_rounded,
                      size: 14,
                      color: AppTheme.accentColor,
                    ),
                    const SizedBox(width: 3),
                    Text(
                      '${w['avgRating'] ?? 0}',
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.accentColor,
                      ),
                    ),
                    const SizedBox(width: 12),
                    const Icon(
                      Icons.work_outline_rounded,
                      size: 14,
                      color: AppTheme.textSecondary,
                    ),
                    const SizedBox(width: 3),
                    Text(
                      '${w['completedJobs'] ?? 0} jobs',
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
          if (w['verificationStatus'] == 'VERIFIED')
            Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: AppTheme.primaryColor.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(
                Icons.verified,
                size: 20,
                color: AppTheme.primaryColor,
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Row(
      children: [
        Container(
          width: 4,
          height: 18,
          decoration: BoxDecoration(
            color: AppTheme.primaryColor,
            borderRadius: BorderRadius.circular(2),
          ),
        ),
        const SizedBox(width: 10),
        Text(
          title,
          style: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w700,
            color: AppTheme.textPrimary,
          ),
        ),
      ],
    );
  }

  Widget _buildBookingTypeCards() {
    final types = [
      {
        'value': 'INSTANT',
        'label': 'Instant',
        'desc': 'Immediate booking',
        'icon': Icons.bolt,
        'color': AppTheme.successColor,
      },
      {
        'value': 'SCHEDULED',
        'label': 'Scheduled',
        'desc': 'Pick date & time',
        'icon': Icons.schedule,
        'color': const Color(0xFF1565C0),
      },
      {
        'value': 'EMERGENCY',
        'label': 'Emergency',
        'desc': 'Urgent service',
        'icon': Icons.warning_amber,
        'color': AppTheme.errorColor,
      },
    ];

    return Row(
      children: types.map((t) {
        final isSelected = _bookingType == t['value'];
        final color = t['color'] as Color;
        return Expanded(
          child: GestureDetector(
            onTap: () => setState(() => _bookingType = t['value'] as String),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 250),
              margin: const EdgeInsets.symmetric(horizontal: 4),
              padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 10),
              decoration: BoxDecoration(
                color: isSelected ? color : Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isSelected
                      ? color
                      : AppTheme.dividerColor.withValues(alpha: 0.5),
                  width: isSelected ? 2 : 1,
                ),
                boxShadow: isSelected
                    ? [
                        BoxShadow(
                          color: color.withValues(alpha: 0.3),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ]
                    : [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.03),
                          blurRadius: 6,
                          offset: const Offset(0, 2),
                        ),
                      ],
              ),
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? Colors.white.withValues(alpha: 0.2)
                          : color.withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      t['icon'] as IconData,
                      size: 24,
                      color: isSelected ? Colors.white : color,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    t['label'] as String,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: isSelected ? Colors.white : AppTheme.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    t['desc'] as String,
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w500,
                      color: isSelected
                          ? Colors.white.withValues(alpha: 0.8)
                          : AppTheme.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildDateTimePicker() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.dividerColor.withValues(alpha: 0.5)),
      ),
      child: Column(
        children: [
          GestureDetector(
            onTap: () async {
              final d = await showDatePicker(
                context: context,
                initialDate: DateTime.now().add(const Duration(days: 1)),
                firstDate: DateTime.now(),
                lastDate: DateTime.now().add(const Duration(days: 365)),
              );
              if (d != null) setState(() => _scheduledDate = d);
            },
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1565C0).withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(
                    Icons.calendar_today,
                    color: Color(0xFF1565C0),
                    size: 20,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Date',
                        style: TextStyle(
                          fontSize: 11,
                          color: AppTheme.textSecondary,
                        ),
                      ),
                      Text(
                        _scheduledDate != null
                            ? '${_scheduledDate!.day}/${_scheduledDate!.month}/${_scheduledDate!.year}'
                            : 'Select date',
                        style: const TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                ),
                const Icon(Icons.chevron_right, color: AppTheme.textSecondary),
              ],
            ),
          ),
          const Divider(height: 20),
          GestureDetector(
            onTap: () async {
              final t = await showTimePicker(
                context: context,
                initialTime: TimeOfDay.now(),
              );
              if (t != null) setState(() => _scheduledTime = t);
            },
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1565C0).withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(
                    Icons.access_time,
                    color: Color(0xFF1565C0),
                    size: 20,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Time',
                        style: TextStyle(
                          fontSize: 11,
                          color: AppTheme.textSecondary,
                        ),
                      ),
                      Text(
                        _scheduledTime != null
                            ? _scheduledTime!.format(context)
                            : 'Select time',
                        style: const TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                ),
                const Icon(Icons.chevron_right, color: AppTheme.textSecondary),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomBar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.06),
            blurRadius: 12,
            offset: const Offset(0, -3),
          ),
        ],
      ),
      child: SafeArea(
        child: Row(
          children: [
            if (_currentStep > 0)
              Expanded(
                child: GestureDetector(
                  onTap: _isSubmitting ? null : _prevStep,
                  child: Container(
                    height: 52,
                    decoration: BoxDecoration(
                      color: AppTheme.backgroundColor,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: AppTheme.dividerColor.withValues(alpha: 0.5),
                      ),
                    ),
                    child: const Center(
                      child: Text(
                        'Back',
                        style: TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 15,
                          color: AppTheme.textPrimary,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            if (_currentStep > 0) const SizedBox(width: 12),
            Expanded(
              child: GestureDetector(
                onTap: _isSubmitting
                    ? null
                    : _currentStep < 2
                    ? _nextStep
                    : _createBooking,
                child: Container(
                  height: 52,
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
                  child: Center(
                    child: _isSubmitting
                        ? const SizedBox(
                            width: 22,
                            height: 22,
                            child: CircularProgressIndicator(
                              strokeWidth: 2.5,
                              color: Colors.white,
                            ),
                          )
                        : Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                _currentStep < 2
                                    ? 'Continue'
                                    : 'Confirm Booking',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w700,
                                  fontSize: 15,
                                ),
                              ),
                              if (_currentStep < 2) ...[
                                const SizedBox(width: 6),
                                const Icon(
                                  Icons.arrow_forward_rounded,
                                  color: Colors.white,
                                  size: 20,
                                ),
                              ],
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
}
