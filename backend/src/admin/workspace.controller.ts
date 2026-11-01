import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { Response } from '../common/response/response';

@Roles('admin')
@Controller('admin')
export class AdminWorkspaceController {
  constructor(private readonly prisma: PrismaService) {}
  @Get('reviews')
  async reviews(@Query('page') page = '1', @Query('page_size') size = '50') {
    const current = Math.max(1, Number.parseInt(page, 10) || 1);
    const take = Math.min(100, Math.max(1, Number.parseInt(size, 10) || 50));
    const where = {
      preparationId: { not: null },
      reviewStatus: {
        in: [
          'SUBMITTED',
          'IN_REVIEW',
          'REVISION_REQUESTED',
        ] as import('../generated/prisma/client').CompanionReviewStatus[],
      },
    };
    const [items, count] = await Promise.all([
      this.prisma.applicationRecord.findMany({
        where,
        skip: (current - 1) * take,
        take,
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          internalReference: true,
          reviewStatus: true,
          version: true,
          service: { select: { id: true, name: true } },
          user: { select: { displayName: true } },
          officerEscalations: {
            where: { status: 'OPEN' },
            select: { id: true, reason: true },
          },
          officerAssignments: {
            where: { endedAt: null, assignmentStatus: 'ACTIVE' },
            select: { officerUserId: true },
          },
        },
      }),
      this.prisma.applicationRecord.count({ where }),
    ]);
    return new Response({
      data: items.map((item) => ({
        id: item.id,
        internal_reference: item.internalReference,
        review_status: item.reviewStatus.toLowerCase(),
        version: item.version,
        service: item.service,
        citizen: { name: item.user.displayName },
        officer_user_id: item.officerAssignments[0]?.officerUserId || null,
        escalations: item.officerEscalations,
      })),
      meta: {
        page: current,
        page_size: take,
        total_items: count,
        total_pages: Math.ceil(count / take),
      },
    });
  }
  @Get('services/:id/versions')
  async versions(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.prisma.guideVersion.findMany({
      where: { serviceId: id },
      orderBy: { versionNumber: 'desc' },
      select: {
        id: true,
        versionNumber: true,
        status: true,
        procedureJson: true,
        sourceReviewedAt: true,
        publishedAt: true,
        createdAt: true,
      },
    });
    return new Response({
      data: data.map((item) => ({
        id: item.id,
        version_number: item.versionNumber,
        status: item.status.toLowerCase(),
        procedure_steps: item.procedureJson,
        reviewed_at: item.sourceReviewedAt,
        published_at: item.publishedAt,
        created_at: item.createdAt,
      })),
    });
  }
}
