import 'package:flutter/material.dart';
import 'dashboard/worker_dashboard.dart';
import 'bookings/booking_requests_screen.dart';
import 'chat/worker_chat_list_screen.dart';
import 'profile/worker_profile_screen.dart';

class WorkerHome extends StatefulWidget {
  const WorkerHome({super.key});

  @override
  State<WorkerHome> createState() => _WorkerHomeState();
}

class _WorkerHomeState extends State<WorkerHome> {
  int _currentIndex = 0;

  static const _screens = <Widget>[
    WorkerDashboard(),
    BookingRequestsScreen(),
    WorkerChatListScreen(),
    WorkerProfileScreen(),
  ];

  static const _destinations = <NavigationDestination>[
    NavigationDestination(
      icon: Icon(Icons.dashboard_outlined),
      selectedIcon: Icon(Icons.dashboard_rounded),
      label: 'Dashboard',
    ),
    NavigationDestination(
      icon: Icon(Icons.work_outline),
      selectedIcon: Icon(Icons.work_rounded),
      label: 'Jobs',
    ),
    NavigationDestination(
      icon: Icon(Icons.chat_outlined),
      selectedIcon: Icon(Icons.chat_rounded),
      label: 'Chat',
    ),
    NavigationDestination(
      icon: Icon(Icons.person_outline),
      selectedIcon: Icon(Icons.person_rounded),
      label: 'Profile',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(index: _currentIndex, children: _screens),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (i) => setState(() => _currentIndex = i),
        indicatorColor: const Color(0xFFE8F5E9),
        animationDuration: const Duration(milliseconds: 350),
        destinations: _destinations,
      ),
    );
  }
}
