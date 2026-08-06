import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../core/services/api_client.dart';
import '../core/models/user_model.dart';

class AuthProvider extends ChangeNotifier {
  final _api = ApiClient();
  final _storage = const FlutterSecureStorage();

  UserModel? _user;
  bool _isLoading = true;

  UserModel? get user => _user;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _user != null;
  bool get isWorker => _user?.role == 'WORKER';
  bool get isCustomer => _user?.role == 'CUSTOMER';

  Future<void> init() async {
    final token = await _storage.read(key: 'accessToken');
    if (token != null) {
      try {
        final res = await _api.get('/api/users/me');
        _user = UserModel.fromJson(res.data);
      } catch (e) {
        debugPrint('Init error: $e');
        await _storage.delete(key: 'accessToken');
      }
    }
    _isLoading = false;
    notifyListeners();
  }

  Future<bool> login(String identifier, String password) async {
    try {
      final res = await _api.post(
        '/api/auth/login',
        data: {'identifier': identifier, 'password': password},
      );
      await _storage.write(key: 'accessToken', value: res.data['accessToken']);
      if (res.data['refreshToken'] != null) {
        await _storage.write(
          key: 'refreshToken',
          value: res.data['refreshToken'],
        );
      }
      _user = UserModel.fromJson(res.data['user']);
      notifyListeners();
      return true;
    } catch (e) {
      debugPrint('Login error: $e');
      return false;
    }
  }

  Future<bool> register(Map<String, dynamic> data) async {
    try {
      final res = await _api.post('/api/auth/register', data: data);
      await _storage.write(key: 'accessToken', value: res.data['accessToken']);
      if (res.data['refreshToken'] != null) {
        await _storage.write(
          key: 'refreshToken',
          value: res.data['refreshToken'],
        );
      }
      _user = UserModel.fromJson(res.data['user']);
      notifyListeners();
      return true;
    } catch (e) {
      debugPrint('Register error: $e');
      return false;
    }
  }

  Future<bool> guestLogin(String name) async {
    try {
      final res = await _api.post(
        '/api/auth/login/guest',
        data: {'fullName': name},
      );
      await _storage.write(key: 'accessToken', value: res.data['accessToken']);
      _user = UserModel.fromJson(res.data['user']);
      notifyListeners();
      return true;
    } catch (e) {
      debugPrint('Guest login error: $e');
      return false;
    }
  }

  Future<void> logout() async {
    try {
      await _api.post('/api/auth/logout');
    } catch (_) {}
    await _storage.delete(key: 'accessToken');
    await _storage.delete(key: 'refreshToken');
    _user = null;
    notifyListeners();
  }
}
