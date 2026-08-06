import 'package:flutter/material.dart';
import '../../core/services/api_client.dart';
import '../../core/config/theme_config.dart';

class PaymentMethodsScreen extends StatefulWidget {
  const PaymentMethodsScreen({super.key});

  @override
  State<PaymentMethodsScreen> createState() => _PaymentMethodsScreenState();
}

class _PaymentMethodsScreenState extends State<PaymentMethodsScreen> {
  final _api = ApiClient();
  bool _isLoading = true;
  bool _isSaving = false;
  String? _error;
  List<Map<String, dynamic>> _methods = [];
  String? _defaultMethodId;

  static const _methodTypes = [
    {'type': 'EASYPAISA', 'label': 'EasyPaisa', 'icon': Icons.phone_android},
    {'type': 'JAZZCASH', 'label': 'JazzCash', 'icon': Icons.phone_android},
    {'type': 'SADAPAY', 'label': 'SadaPay', 'icon': Icons.credit_card},
    {'type': 'NAYAPAY', 'label': 'NayaPay', 'icon': Icons.credit_card},
    {'type': 'BANK', 'label': 'Bank Account', 'icon': Icons.account_balance},
  ];

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
      final list = data['paymentMethods'] as List? ?? [];
      if (!mounted) return;
      setState(() {
        _methods = List<Map<String, dynamic>>.from(list);
        _defaultMethodId = null;
        for (final m in _methods) {
          if (m['isDefault'] == true) {
            _defaultMethodId = m['id']?.toString();
            break;
          }
        }
        if (_defaultMethodId == null && _methods.isNotEmpty) {
          _defaultMethodId = _methods[0]['id']?.toString();
        }
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _error = 'Failed to load payment methods. Pull to retry.';
      });
    }
  }

  Future<void> _showAddDialog() async {
    String selectedType = 'EASYPAISA';
    final accountController = TextEditingController();
    final accountHolderController = TextEditingController();

    final result = await showDialog<Map<String, String>>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          title: const Text('Add Payment Method'),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                DropdownButtonFormField<String>(
                  value: selectedType,
                  decoration: const InputDecoration(labelText: 'Type'),
                  items: _methodTypes
                      .map(
                        (m) => DropdownMenuItem(
                          value: m['type'] as String,
                          child: Text(m['label'] as String),
                        ),
                      )
                      .toList(),
                  onChanged: (v) => setDialogState(() => selectedType = v!),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: accountController,
                  keyboardType: selectedType == 'BANK'
                      ? TextInputType.text
                      : TextInputType.phone,
                  decoration: InputDecoration(
                    labelText: selectedType == 'BANK'
                        ? 'Account Number / IBAN'
                        : 'Phone / Account Number',
                    hintText: selectedType == 'BANK'
                        ? 'Enter IBAN or account number'
                        : '03XX-XXXXXXX',
                  ),
                ),
                if (selectedType == 'BANK') ...[
                  const SizedBox(height: 12),
                  TextField(
                    controller: accountHolderController,
                    decoration: const InputDecoration(
                      labelText: 'Account Holder Name',
                      hintText: 'Enter account holder name',
                    ),
                  ),
                ],
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
                if (accountController.text.trim().isEmpty) return;
                Navigator.pop(ctx, {
                  'type': selectedType,
                  'accountNumber': accountController.text.trim(),
                  if (selectedType == 'BANK')
                    'accountHolder': accountHolderController.text.trim(),
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

    final newMethod = <String, dynamic>{
      'id': DateTime.now().millisecondsSinceEpoch.toString(),
      'type': result['type'],
      'accountNumber': result['accountNumber'],
      'isDefault': _methods.isEmpty,
    };
    if (result.containsKey('accountHolder')) {
      newMethod['accountHolder'] = result['accountHolder'];
    }

    setState(() {
      _methods.add(newMethod);
      if (_methods.length == 1) {
        _defaultMethodId = newMethod['id'];
      }
    });
  }

  Future<void> _deleteMethod(int index) async {
    final method = _methods[index];
    final id = method['id']?.toString();

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Delete Payment Method'),
        content: const Text(
          'Are you sure you want to remove this payment method?',
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

    setState(() {
      _methods.removeAt(index);
      if (_defaultMethodId == id && _methods.isNotEmpty) {
        _defaultMethodId = _methods[0]['id'];
      } else if (_methods.isEmpty) {
        _defaultMethodId = null;
      }
    });
  }

  void _setDefault(String id) {
    setState(() {
      _defaultMethodId = id;
      for (var i = 0; i < _methods.length; i++) {
        _methods[i]['isDefault'] = _methods[i]['id'] == id;
      }
    });
  }

  Future<void> _save() async {
    setState(() => _isSaving = true);
    try {
      await _api.put(
        '/api/workers/me/payment-methods',
        data: {'paymentMethods': _methods},
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Payment methods updated'),
          backgroundColor: AppTheme.successColor,
        ),
      );
      Navigator.pop(context, true);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to save payment methods')),
      );
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  IconData _getMethodIcon(String type) {
    final found = _methodTypes.where((m) => m['type'] == type).firstOrNull;
    return (found?['icon'] as IconData?) ?? Icons.payment;
  }

  String _getMethodLabel(String type) {
    final found = _methodTypes.where((m) => m['type'] == type).firstOrNull;
    return (found?['label'] as String?) ?? type;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Payment Methods'),
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

    if (_methods.isEmpty) {
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
                      Icons.payment_outlined,
                      size: 56,
                      color: Colors.grey.shade400,
                    ),
                    const SizedBox(height: 12),
                    const Text(
                      'No payment methods',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w500,
                        color: AppTheme.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Tap + to add a payment method',
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
        itemCount: _methods.length,
        itemBuilder: (context, index) => _buildMethodCard(index),
      ),
    );
  }

  Widget _buildLoadingShimmer() {
    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(0, 16, 0, 80),
      itemCount: 3,
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
                              width: 120,
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

  Widget _buildMethodCard(int index) {
    final method = _methods[index];
    final type = method['type'] as String? ?? '';
    final accountNumber = method['accountNumber'] as String? ?? '';
    final accountHolder = method['accountHolder'] as String? ?? '';
    final id = method['id']?.toString() ?? '';
    final isDefault = _defaultMethodId == id;

    return Dismissible(
      key: Key(id),
      direction: DismissDirection.endToStart,
      onDismissed: (_) => _deleteMethod(index),
      confirmDismiss: (_) async {
        final confirmed = await showDialog<bool>(
          context: context,
          builder: (_) => AlertDialog(
            title: const Text('Delete Payment Method'),
            content: const Text(
              'Are you sure you want to remove this payment method?',
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
          child: InkWell(
            onTap: () => _setDefault(id),
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
                    child: Icon(
                      _getMethodIcon(type),
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
                          _getMethodLabel(type),
                          style: const TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 15,
                          ),
                        ),
                        if (accountNumber.isNotEmpty) ...[
                          const SizedBox(height: 3),
                          Text(
                            accountNumber,
                            style: const TextStyle(
                              fontSize: 13,
                              color: AppTheme.textSecondary,
                            ),
                          ),
                        ],
                        if (accountHolder.isNotEmpty) ...[
                          const SizedBox(height: 2),
                          Text(
                            accountHolder,
                            style: const TextStyle(
                              fontSize: 12,
                              color: AppTheme.textSecondary,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                  if (isDefault)
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 5,
                      ),
                      decoration: BoxDecoration(
                        color: AppTheme.successColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Text(
                        'Default',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: AppTheme.successColor,
                        ),
                      ),
                    )
                  else
                    Radio(
                      value: id,
                      groupValue: _defaultMethodId,
                      onChanged: (_) => _setDefault(id),
                      activeColor: AppTheme.primaryColor,
                      visualDensity: VisualDensity.compact,
                    ),
                ],
              ),
            ),
          ),
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
