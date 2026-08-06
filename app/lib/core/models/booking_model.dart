class BookingModel {
  final String id;
  final String customerId;
  final String workerId;
  final String serviceId;
  final String bookingType;
  final String status;
  final String description;
  final DateTime? scheduledAt;
  final String address;
  final double latitude;
  final double longitude;
  final String? customerNotes;
  final DateTime? expiryAt;
  final DateTime createdAt;
  final Map<String, dynamic>? customer;
  final Map<String, dynamic>? worker;
  final Map<String, dynamic>? service;

  BookingModel({
    required this.id,
    required this.customerId,
    required this.workerId,
    required this.serviceId,
    required this.bookingType,
    required this.status,
    required this.description,
    this.scheduledAt,
    required this.address,
    required this.latitude,
    required this.longitude,
    this.customerNotes,
    this.expiryAt,
    required this.createdAt,
    this.customer,
    this.worker,
    this.service,
  });

  factory BookingModel.fromJson(Map<String, dynamic> json) => BookingModel(
    id: json['id'] ?? '',
    customerId: json['customerId'] ?? '',
    workerId: json['workerId'] ?? '',
    serviceId: json['serviceId'] ?? '',
    bookingType: json['bookingType'] ?? 'INSTANT',
    status: json['status'] ?? 'PENDING',
    description: json['description'] ?? '',
    scheduledAt: json['scheduledAt'] != null
        ? DateTime.tryParse(json['scheduledAt'])
        : null,
    address: json['address'] ?? '',
    latitude: double.tryParse(json['latitude']?.toString() ?? '0') ?? 0,
    longitude: double.tryParse(json['longitude']?.toString() ?? '0') ?? 0,
    customerNotes: json['customerNotes'],
    expiryAt: json['expiryAt'] != null
        ? DateTime.tryParse(json['expiryAt'])
        : null,
    createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
    customer: json['customer'],
    worker: json['worker'],
    service: json['service'],
  );
}
