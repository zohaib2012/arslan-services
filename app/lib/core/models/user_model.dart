class UserModel {
  final String id;
  final String? email;
  final String? phone;
  final bool phoneVerified;
  final String fullName;
  final String? profilePhoto;
  final String role;
  final bool isGuest;
  final String? fcmToken;
  final String languagePreference;
  final bool isBlocked;

  UserModel({
    required this.id,
    this.email,
    this.phone,
    required this.phoneVerified,
    required this.fullName,
    this.profilePhoto,
    required this.role,
    required this.isGuest,
    this.fcmToken,
    required this.languagePreference,
    required this.isBlocked,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) => UserModel(
    id: json['id'] ?? '',
    email: json['email'],
    phone: json['phone'],
    phoneVerified: json['phoneVerified'] ?? false,
    fullName: json['fullName'] ?? '',
    profilePhoto: json['profilePhoto'],
    role: json['role'] ?? 'CUSTOMER',
    isGuest: json['isGuest'] ?? false,
    fcmToken: json['fcmToken'],
    languagePreference: json['languagePreference'] ?? 'ENGLISH',
    isBlocked: json['isBlocked'] ?? false,
  );
}
