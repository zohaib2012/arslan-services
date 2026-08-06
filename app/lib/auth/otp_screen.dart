import 'dart:async';
import 'package:flutter/material.dart';
import '../core/services/api_client.dart';
import '../core/config/theme_config.dart';

class OtpScreen extends StatefulWidget {
  final String phone;
  const OtpScreen({super.key, required this.phone});

  @override
  State<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends State<OtpScreen> {
  final _api = ApiClient();
  final _controllers = List.generate(4, (_) => TextEditingController());
  final _focusNodes = List.generate(4, (_) => FocusNode());
  bool _isLoading = false;
  bool _canResend = false;
  int _cooldown = 30;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _startCooldown();
  }

  @override
  void dispose() {
    for (final c in _controllers) {
      c.dispose();
    }
    for (final f in _focusNodes) {
      f.dispose();
    }
    _timer?.cancel();
    super.dispose();
  }

  void _startCooldown() {
    _canResend = false;
    _cooldown = 30;
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (_cooldown <= 1) {
        t.cancel();
        if (mounted) setState(() => _canResend = true);
      } else {
        _cooldown--;
        if (mounted) setState(() {});
      }
    });
  }

  String get _otp => _controllers.map((c) => c.text).join();

  Future<void> _verify() async {
    if (_otp.length < 4) return;
    setState(() => _isLoading = true);
    try {
      final res = await _api.post(
        '/api/auth/verify-otp',
        data: {'phone': widget.phone, 'otp': _otp},
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Phone verified successfully')),
        );
        Navigator.of(context).pop(true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Invalid OTP')));
      }
    }
    if (mounted) setState(() => _isLoading = false);
  }

  Future<void> _resend() async {
    setState(() => _isLoading = true);
    try {
      await _api.post('/api/auth/send-otp', data: {'phone': widget.phone});
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('OTP resent')));
        _startCooldown();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Failed to resend OTP')));
      }
    }
    if (mounted) setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Verify OTP')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: TweenAnimationBuilder<double>(
            tween: Tween(begin: 0.0, end: 1.0),
            duration: const Duration(milliseconds: 600),
            curve: Curves.easeOutCubic,
            builder: (context, value, child) {
              return Opacity(
                opacity: value,
                child: Transform.translate(
                  offset: Offset(0, (1 - value) * 30),
                  child: child,
                ),
              );
            },
            child: Column(
              children: [
                const Icon(
                  Icons.message_outlined,
                  size: 64,
                  color: AppTheme.primaryColor,
                ),
                const SizedBox(height: 16),
                const Text(
                  'Enter Verification Code',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Text(
                  'We sent a 4-digit code to ${widget.phone}',
                  style: const TextStyle(color: AppTheme.textSecondary),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(4, (i) {
                    return Container(
                      width: 56,
                      height: 64,
                      margin: const EdgeInsets.symmetric(horizontal: 6),
                      child: TextFormField(
                        controller: _controllers[i],
                        focusNode: _focusNodes[i],
                        textAlign: TextAlign.center,
                        keyboardType: TextInputType.number,
                        maxLength: 1,
                        style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                        ),
                        decoration: const InputDecoration(counterText: ''),
                        onChanged: (v) {
                          if (v.isNotEmpty && i < 3) {
                            _focusNodes[i + 1].requestFocus();
                          }
                          if (v.isEmpty && i > 0) {
                            _focusNodes[i - 1].requestFocus();
                          }
                          if (_otp.length == 4) _verify();
                        },
                      ),
                    );
                  }),
                ),
                const SizedBox(height: 32),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _isLoading || _otp.length < 4 ? null : _verify,
                    child: _isLoading
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.white,
                            ),
                          )
                        : const Text('Verify'),
                  ),
                ),
                const SizedBox(height: 16),
                TextButton(
                  onPressed: _canResend && !_isLoading ? _resend : null,
                  child: Text(
                    _canResend ? 'Resend OTP' : 'Resend OTP in $_cooldown s',
                    style: TextStyle(
                      color: _canResend
                          ? AppTheme.primaryColor
                          : AppTheme.textSecondary,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
