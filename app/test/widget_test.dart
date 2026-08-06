import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:arslan_services/providers/auth_provider.dart';
import 'package:arslan_services/app.dart';

void main() {
  testWidgets('App launches smoke test', (WidgetTester tester) async {
    final auth = AuthProvider();
    await tester.runAsync(() async {
      await tester.pumpWidget(
        ChangeNotifierProvider.value(
          value: auth,
          child: const ArslanServicesApp(),
        ),
      );
    });
    await tester.pump();
    expect(find.byType(ArslanServicesApp), findsOneWidget);
  });
}
