import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:arslan_services/core/config/theme_config.dart';

class ConnectivityWrapper extends StatefulWidget {
  final Widget child;
  const ConnectivityWrapper({super.key, required this.child});

  @override
  State<ConnectivityWrapper> createState() => _ConnectivityWrapperState();
}

class _ConnectivityWrapperState extends State<ConnectivityWrapper> {
  bool _isOffline = false;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _checkConnection();
    _timer = Timer.periodic(
      const Duration(seconds: 10),
      (_) => _checkConnection(),
    );
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _checkConnection() async {
    try {
      final result = await InternetAddress.lookup(
        'google.com',
      ).timeout(const Duration(seconds: 3));
      if (mounted)
        setState(
          () => _isOffline = result.isEmpty || result[0].rawAddress.isEmpty,
        );
    } catch (_) {
      if (mounted) setState(() => _isOffline = true);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        if (_isOffline)
          MaterialBanner(
            content: const Text(
              'No internet connection',
              style: TextStyle(color: Colors.white),
            ),
            backgroundColor: AppTheme.errorColor,
            actions: [
              TextButton(
                onPressed: _checkConnection,
                child: const Text(
                  'Retry',
                  style: TextStyle(color: Colors.white),
                ),
              ),
            ],
          ),
        Expanded(child: widget.child),
      ],
    );
  }
}
