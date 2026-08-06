import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';

class UserAvatar extends StatelessWidget {
  final String? photoUrl;
  final String? name;
  final double radius;
  final Color? backgroundColor;
  final VoidCallback? onTap;
  const UserAvatar({
    super.key,
    this.photoUrl,
    this.name,
    this.radius = 24,
    this.backgroundColor,
    this.onTap,
  });

  String get _initials {
    if (name == null || name!.isEmpty) return '?';
    final parts = name!.trim().split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return name![0].toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    final bg = backgroundColor ?? Theme.of(context).primaryColor;
    final child = CircleAvatar(
      radius: radius,
      backgroundColor: bg,
      backgroundImage: (photoUrl != null && photoUrl!.isNotEmpty)
          ? CachedNetworkImageProvider(photoUrl!)
          : null,
      child: (photoUrl == null || photoUrl!.isEmpty)
          ? Text(
              _initials,
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w600,
                fontSize: radius * 0.6,
              ),
            )
          : null,
    );

    if (onTap != null) {
      return InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(radius),
        child: child,
      );
    }
    return child;
  }
}
