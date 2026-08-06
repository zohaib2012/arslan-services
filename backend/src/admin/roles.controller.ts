import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { PrismaService } from '../config/database.config';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('api/admin/roles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AdminRolesController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getRoles() {
    const roles = await this.prisma.adminRole.findMany({ include: { _count: { select: { adminUsers: true } } } });
    return { roles };
  }

  @Get('admins')
  async getAdmins() {
    const admins = await this.prisma.adminUser.findMany({ include: { user: { select: { id: true, fullName: true, email: true } }, role: true } });
    return { admins };
  }

  @Post()
  async createRole(@Body() body: any) {
    return this.prisma.adminRole.create({ data: { name: body.name, permissions: body.permissions || {} } });
  }

  @Post('admins')
  async createAdmin(@Body() body: any) {
    const user = await this.prisma.user.findUnique({ where: { email: body.email } });
    if (!user) throw new Error('User not found');
    return this.prisma.adminUser.create({ data: { userId: user.id, roleId: body.roleId } });
  }

  @Put(':id')
  async updateRole(@Param('id') id: string, @Body() body: any) {
    return this.prisma.adminRole.update({
      where: { id },
      data: { name: body.name, permissions: body.permissions || {} },
    });
  }

  @Delete(':id')
  async deleteRole(@Param('id') id: string) {
    await this.prisma.adminRole.delete({ where: { id } });
    return { message: 'Deleted' };
  }
}
