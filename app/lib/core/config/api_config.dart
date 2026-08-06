class ApiConfig {
  static const String baseUrl = 'http://187.127.218.111';
  static const String apiPrefix = '/api';
  static String get apiUrl => '$baseUrl$apiPrefix';

  static const String auth = '/auth';
  static const String users = '/users';
  static const String workers = '/workers';
  static const String categories = '/categories';
  static const String services = '/services';
  static const String bookings = '/bookings';
  static const String reviews = '/reviews';
  static const String disputes = '/disputes';
  static const String favorites = '/favorites';
  static const String blocked = '/blocked-workers';
  static const String notifications = '/notifications';
  static const String upload = '/upload';
  static const String location = '/location';
  static const String ai = '/ai';
  static const String admin = '/admin';
  static const String chat = '/chat';
}
