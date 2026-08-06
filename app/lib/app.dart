import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/auth_provider.dart';
import 'providers/theme_provider.dart';
import 'core/config/theme_config.dart';
import 'auth/login_screen.dart';
import 'auth/role_selection_screen.dart';
import 'customer/customer_home.dart';
import 'customer/workers/worker_detail_screen.dart';
import 'core/widgets/connectivity_wrapper.dart';
import 'worker/worker_home.dart';
import 'worker/chat/worker_chat_screen.dart';
import 'customer/bookings/create_booking_screen.dart';

class ArslanServicesApp extends StatelessWidget {
  const ArslanServicesApp({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final themeProvider = context.watch<ThemeProvider>();

    return MaterialApp(
      title: 'Arslan Services',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: themeProvider.isDark ? ThemeMode.dark : ThemeMode.light,
      home: ConnectivityWrapper(child: _getHomeScreen(auth)),
      routes: {
        '/login': (_) => const LoginScreen(),
        '/role-selection': (_) => const RoleSelectionScreen(),
        '/customer-home': (_) => const CustomerHome(),
        '/worker-home': (_) => const WorkerHome(),
      },
      onGenerateRoute: (settings) {
        if (settings.name == '/worker-detail') {
          final args = settings.arguments as Map<String, dynamic>? ?? {};
          return MaterialPageRoute(
            builder: (_) => WorkerDetailScreen(worker: args),
          );
        }
        if (settings.name == '/create-booking') {
          final args = settings.arguments as Map<String, dynamic>? ?? {};
          return MaterialPageRoute(
            builder: (_) => CreateBookingScreen(worker: args),
          );
        }
        if (settings.name == '/worker-chat') {
          final args = settings.arguments as Map<String, dynamic>? ?? {};
          return MaterialPageRoute(
            builder: (_) => WorkerChatScreen(
              userId: args['userId'] ?? '',
              userName: args['userName'] ?? '',
              userPhoto: args['userPhoto'],
            ),
          );
        }
        return null;
      },
    );
  }

  Widget _getHomeScreen(AuthProvider auth) {
    if (auth.isLoading)
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    if (!auth.isAuthenticated) return const LoginScreen();
    if (auth.user == null) return const RoleSelectionScreen();
    if (auth.isWorker) return const WorkerHome();
    return const CustomerHome();
  }
}
