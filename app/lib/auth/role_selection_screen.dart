import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../core/services/api_client.dart';
import '../core/config/theme_config.dart';

class RoleSelectionScreen extends StatefulWidget {
  const RoleSelectionScreen({super.key});

  @override
  State<RoleSelectionScreen> createState() => _RoleSelectionScreenState();
}

class _RoleSelectionScreenState extends State<RoleSelectionScreen> {
  final _api = ApiClient();
  bool _isLoading = false;

  Future<void> _selectRole(String role) async {
    setState(() => _isLoading = true);
    try {
      await _api.put('/api/users/role', data: {'role': role});
      if (mounted) {
        final auth = context.read<AuthProvider>();
        await auth.init();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Failed to set role')));
      }
    }
    if (mounted) setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  children: [
                    const SizedBox(height: 40),
                    const Text(
                      'How would you like to use\nArslan Services?',
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.primaryColor,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 40),
                    Expanded(
                      child: Row(
                        children: [
                          Expanded(child: _buildRoleCard('CUSTOMER')),
                          const SizedBox(width: 16),
                          Expanded(child: _buildRoleCard('WORKER')),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
      ),
    );
  }

  Widget _buildRoleCard(String role) {
    final isCustomer = role == 'CUSTOMER';
    return GestureDetector(
      onTap: () => _selectRole(role),
      child: Card(
        elevation: 4,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(
            color: AppTheme.primaryColor.withOpacity(0.3),
            width: 1,
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                isCustomer ? Icons.home_outlined : Icons.engineering_outlined,
                size: 56,
                color: AppTheme.accentColor,
              ),
              const SizedBox(height: 16),
              Text(
                isCustomer ? 'I need a\nservice' : 'I provide\nservices',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                isCustomer
                    ? 'Find trusted workers for your home tasks'
                    : 'Offer your skills and earn on your schedule',
                style: const TextStyle(
                  fontSize: 12,
                  color: AppTheme.textSecondary,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
