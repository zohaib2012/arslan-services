import 'dart:convert';
import 'package:flutter/material.dart';
import '../../core/services/api_client.dart';
import '../../core/config/theme_config.dart';

class WorkingHoursScreen extends StatefulWidget {
  const WorkingHoursScreen({super.key});

  @override
  State<WorkingHoursScreen> createState() => _WorkingHoursScreenState();
}

class _WorkingHoursScreenState extends State<WorkingHoursScreen> {
  final _api = ApiClient();
  bool _isLoading = true;
  bool _isSaving = false;
  String? _error;

  final _days = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  final Map<String, bool> _enabled = {};
  final Map<String, TimeOfDay> _startTimes = {};
  final Map<String, TimeOfDay> _endTimes = {};

  @override
  void initState() {
    super.initState();
    _initDefaults();
    _fetchData();
  }

  void _initDefaults() {
    for (final day in _days) {
      _enabled[day] = false;
      _startTimes[day] = const TimeOfDay(hour: 9, minute: 0);
      _endTimes[day] = const TimeOfDay(hour: 17, minute: 0);
    }
  }

  Future<void> _fetchData() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final res = await _api.get('/api/workers/me');
      final data = res.data as Map<String, dynamic>;
      final raw = data['workingHoursJson'];

      List<dynamic> hoursList = [];
      if (raw is String && raw.isNotEmpty) {
        hoursList = jsonDecode(raw) as List<dynamic>;
      } else if (raw is List) {
        hoursList = raw;
      }

      _initDefaults();

      for (final h in hoursList) {
        if (h is! Map<String, dynamic>) continue;
        final day = h['day'] ?? '';
        if (!_days.contains(day)) continue;

        _enabled[day] = h['enabled'] ?? false;
        final start = (h['startTime'] ?? '09:00').toString();
        final end = (h['endTime'] ?? '17:00').toString();

        final startParts = start.split(':');
        if (startParts.length >= 2) {
          _startTimes[day] = TimeOfDay(
            hour: int.tryParse(startParts[0]) ?? 9,
            minute: int.tryParse(startParts[1]) ?? 0,
          );
        }
        final endParts = end.split(':');
        if (endParts.length >= 2) {
          _endTimes[day] = TimeOfDay(
            hour: int.tryParse(endParts[0]) ?? 17,
            minute: int.tryParse(endParts[1]) ?? 0,
          );
        }
      }

      if (!mounted) return;
      setState(() => _isLoading = false);
    } catch (e) {
      if (!mounted) return;
      _initDefaults();
      setState(() {
        _isLoading = false;
        _error = 'Failed to load working hours. Pull to retry.';
      });
    }
  }

  Future<void> _pickTime(String day, bool isStart) async {
    final initial = isStart ? _startTimes[day]! : _endTimes[day]!;
    final picked = await showTimePicker(context: context, initialTime: initial);

    if (picked != null) {
      setState(() {
        if (isStart) {
          _startTimes[day] = picked;
        } else {
          _endTimes[day] = picked;
        }
      });
    }
  }

  String _formatTime(TimeOfDay t) {
    final h = t.hourOfPeriod == 0 ? 12 : t.hourOfPeriod;
    final m = t.minute.toString().padLeft(2, '0');
    final period = t.period == DayPeriod.am ? 'AM' : 'PM';
    return '$h:$m $period';
  }

  Future<void> _save() async {
    setState(() => _isSaving = true);
    try {
      final hours = _days
          .map(
            (day) => {
              'day': day,
              'enabled': _enabled[day],
              'startTime':
                  '${_startTimes[day]!.hour.toString().padLeft(2, '0')}:${_startTimes[day]!.minute.toString().padLeft(2, '0')}',
              'endTime':
                  '${_endTimes[day]!.hour.toString().padLeft(2, '0')}:${_endTimes[day]!.minute.toString().padLeft(2, '0')}',
            },
          )
          .toList();

      await _api.put('/api/workers/me/hours', data: {'workingHours': hours});

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Working hours updated'),
          backgroundColor: AppTheme.successColor,
        ),
      );
      Navigator.pop(context, true);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to save working hours')),
      );
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Working Hours'),
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

    return RefreshIndicator(
      onRefresh: _fetchData,
      child: ListView.builder(
        padding: const EdgeInsets.fromLTRB(0, 16, 0, 32),
        itemCount: _days.length,
        itemBuilder: (context, index) => _buildDayCard(_days[index]),
      ),
    );
  }

  Widget _buildLoadingShimmer() {
    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(0, 16, 0, 32),
      itemCount: _days.length,
      itemBuilder: (context, index) {
        return Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 5),
          child: _PulseWidget(
            child: Card(
              child: SizedBox(
                height: 56,
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Row(
                    children: [
                      Container(
                        width: 100,
                        height: 14,
                        decoration: BoxDecoration(
                          color: Colors.grey.shade200,
                          borderRadius: BorderRadius.circular(7),
                        ),
                      ),
                      const Spacer(),
                      Container(
                        width: 40,
                        height: 24,
                        decoration: BoxDecoration(
                          color: Colors.grey.shade200,
                          borderRadius: BorderRadius.circular(12),
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

  Widget _buildDayCard(String day) {
    final enabled = _enabled[day] ?? false;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 5),
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    day,
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 15,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                  Switch(
                    value: enabled,
                    onChanged: (val) => setState(() => _enabled[day] = val),
                    activeColor: AppTheme.primaryColor,
                  ),
                ],
              ),
              if (enabled) ...[
                const Divider(height: 20),
                Row(
                  children: [
                    Expanded(
                      child: _buildTimePickerCell(
                        'Start',
                        _formatTime(_startTimes[day]!),
                        () => _pickTime(day, true),
                      ),
                    ),
                    const SizedBox(width: 12),
                    const Text(
                      'to',
                      style: TextStyle(
                        color: AppTheme.textSecondary,
                        fontSize: 13,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _buildTimePickerCell(
                        'End',
                        _formatTime(_endTimes[day]!),
                        () => _pickTime(day, false),
                      ),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTimePickerCell(String label, String time, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: AppTheme.secondaryColor.withOpacity(0.08),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppTheme.secondaryColor.withOpacity(0.2)),
        ),
        child: Column(
          children: [
            Text(
              label,
              style: const TextStyle(
                fontSize: 11,
                color: AppTheme.textSecondary,
              ),
            ),
            const SizedBox(height: 2),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(
                  Icons.access_time,
                  size: 16,
                  color: AppTheme.primaryColor,
                ),
                const SizedBox(width: 6),
                Text(
                  time,
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                    color: AppTheme.primaryColor,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
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
