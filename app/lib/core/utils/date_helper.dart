import 'package:intl/intl.dart';

class DateFormatHelper {
  static final _timeFormat = DateFormat('hh:mm a');
  static final _dateFormat = DateFormat('dd MMM yyyy');
  static final _dateTimeFormat = DateFormat('dd MMM yyyy, hh:mm a');
  static final _shortDateFormat = DateFormat('dd/MM/yyyy');
  static final _apiDateFormat = DateFormat('yyyy-MM-dd');

  static String formatTime(String? dateStr) {
    if (dateStr == null || dateStr.isEmpty) return 'N/A';
    try {
      final dt = DateTime.parse(dateStr);
      return _timeFormat.format(dt);
    } catch (_) {
      return dateStr;
    }
  }

  static String formatDate(String? dateStr) {
    if (dateStr == null || dateStr.isEmpty) return 'N/A';
    try {
      final dt = DateTime.parse(dateStr);
      return _dateFormat.format(dt);
    } catch (_) {
      return dateStr;
    }
  }

  static String formatDateTime(String? dateStr) {
    if (dateStr == null || dateStr.isEmpty) return 'N/A';
    try {
      final dt = DateTime.parse(dateStr);
      return _dateTimeFormat.format(dt);
    } catch (_) {
      return dateStr;
    }
  }

  static String formatShortDate(String? dateStr) {
    if (dateStr == null || dateStr.isEmpty) return 'N/A';
    try {
      final dt = DateTime.parse(dateStr);
      return _shortDateFormat.format(dt);
    } catch (_) {
      return dateStr;
    }
  }

  static String today() => _apiDateFormat.format(DateTime.now());

  static String formatForApi(DateTime dt) => _apiDateFormat.format(dt);

  static String relativeTime(String? dateStr) {
    if (dateStr == null || dateStr.isEmpty) return 'N/A';
    try {
      final dt = DateTime.parse(dateStr);
      final now = DateTime.now();
      final diff = now.difference(dt);
      if (diff.inSeconds < 60) return 'Just now';
      if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
      if (diff.inHours < 24) return '${diff.inHours}h ago';
      if (diff.inDays < 7) return '${diff.inDays}d ago';
      return _dateFormat.format(dt);
    } catch (_) {
      return dateStr;
    }
  }
}
