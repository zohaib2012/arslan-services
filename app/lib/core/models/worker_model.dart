class WorkerModel {
  final String id;
  final String userId;
  final String fullName;
  final String? profilePhoto;
  final String? phone;
  final String verificationStatus;
  final int? experienceYears;
  final String? description;
  final bool isOnline;
  final int completedJobs;
  final double avgRating;
  final int totalReviews;
  final int? responseTimeMinutes;
  final List<dynamic> services;
  final List<dynamic> serviceAreas;
  final List<dynamic> paymentMethods;
  final List<dynamic> portfolio;
  final double? latitude;
  final double? longitude;

  WorkerModel({
    required this.id,
    required this.userId,
    required this.fullName,
    this.profilePhoto,
    this.phone,
    required this.verificationStatus,
    this.experienceYears,
    this.description,
    required this.isOnline,
    required this.completedJobs,
    required this.avgRating,
    required this.totalReviews,
    this.responseTimeMinutes,
    required this.services,
    required this.serviceAreas,
    required this.paymentMethods,
    required this.portfolio,
    this.latitude,
    this.longitude,
  });

  factory WorkerModel.fromJson(Map<String, dynamic> json) {
    final user = json['user'] ?? {};
    return WorkerModel(
      id: json['id'] ?? '',
      userId: user['id'] ?? json['userId'] ?? '',
      fullName: user['fullName'] ?? '',
      profilePhoto: user['profilePhoto'],
      phone: user['phone'],
      verificationStatus: json['verificationStatus'] ?? 'PENDING',
      experienceYears: json['experienceYears'],
      description: json['description'],
      isOnline: json['isOnline'] ?? false,
      completedJobs: json['completedJobs'] ?? 0,
      avgRating: double.tryParse(json['avgRating']?.toString() ?? '0') ?? 0,
      totalReviews: json['totalReviews'] ?? 0,
      responseTimeMinutes: json['responseTimeMinutes'],
      services: json['workerServices'] ?? [],
      serviceAreas: json['serviceAreas'] ?? [],
      paymentMethods: json['paymentMethods'] ?? [],
      portfolio: json['portfolio'] ?? [],
      latitude: json['latitude'] != null
          ? double.tryParse(json['latitude'].toString())
          : null,
      longitude: json['longitude'] != null
          ? double.tryParse(json['longitude'].toString())
          : null,
    );
  }
}
