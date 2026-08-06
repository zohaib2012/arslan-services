import 'package:flutter/material.dart';

class LanguageProvider extends ChangeNotifier {
  Locale _locale = const Locale('en');
  Locale get locale => _locale;

  void setEnglish() {
    _locale = const Locale('en');
    notifyListeners();
  }

  void setUrdu() {
    _locale = const Locale('ur');
    notifyListeners();
  }
}
