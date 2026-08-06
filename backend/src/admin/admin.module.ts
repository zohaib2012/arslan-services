import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminService } from './admin.service';
import { AdminDashboardController } from './dashboard.controller';
import { AdminCustomersController } from './customers.controller';
import { AdminWorkersController } from './workers.controller';
import { AdminBookingsController } from './bookings.controller';
import { AdminCategoriesController } from './categories.controller';
import { AdminServicesController } from './services.controller';
import { AdminDisputesController } from './disputes.controller';
import { AdminBannersController } from './banners.controller';
import { AdminNotificationsController } from './notifications.controller';
import { AdminReportsController } from './reports.controller';
import { AdminLogsController } from './logs.controller';
import { AdminSupportController, PublicSupportController } from './support.controller';
import { AdminRolesController } from './roles.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [AuthModule, NotificationsModule],
  controllers: [AdminDashboardController, AdminCustomersController, AdminWorkersController, AdminBookingsController, AdminCategoriesController, AdminServicesController, AdminDisputesController, AdminBannersController, AdminNotificationsController, AdminReportsController, AdminLogsController, AdminSupportController, AdminRolesController, PublicSupportController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
