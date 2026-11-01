import { Injectable } from '@nestjs/common';
import {
  ApplicationStatus,
  FindingResolutionStatus,
  PreparationStatus,
} from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  type CitizenDashboardView,
  type DashboardRecentItemView,
  type IDashboardService,
} from './interfaces/dashboard.service.interface';

@Injectable()
export class DashboardService implements IDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getCitizenDashboard(userId: string): Promise<CitizenDashboardView> {
    const [
      prepGroup,
      appGroup,
      openFindingsCount,
      unreadNotificationsCount,
      recentPreps,
      recentApps,
    ] = await Promise.all([
      this.prisma.preparation.groupBy({
        by: ['status'],
        where: {
          userId,
          archivedAt: null,
          deletedAt: null,
        },
        _count: { status: true },
      }),
      this.prisma.applicationRecord.groupBy({
        by: ['statusSummary'],
        where: {
          userId,
          archivedAt: null,
        },
        _count: { statusSummary: true },
      }),
      this.prisma.finding.count({
        where: {
          inspectionRun: { userId },
          resolutionStatus: {
            in: [
              FindingResolutionStatus.OPEN,
              FindingResolutionStatus.NEEDS_OFFICIAL_CONFIRMATION,
            ],
          },
        },
      }),
      this.prisma.notification.count({
        where: {
          userId,
          readAt: null,
        },
      }),
      this.prisma.preparation.findMany({
        where: {
          userId,
          archivedAt: null,
          deletedAt: null,
        },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        include: {
          service: {
            select: { name: true },
          },
        },
      }),
      this.prisma.applicationRecord.findMany({
        where: {
          userId,
          archivedAt: null,
        },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        include: {
          service: {
            select: { name: true },
          },
        },
      }),
    ]);

    // Map preparations count
    const prepMap = new Map<PreparationStatus, number>();
    for (const item of prepGroup) {
      prepMap.set(item.status, item._count.status);
    }

    const preparationsCount = {
      draft: prepMap.get(PreparationStatus.DRAFT) ?? 0,
      needs_completion: prepMap.get(PreparationStatus.NEEDS_COMPLETION) ?? 0,
      needs_review: prepMap.get(PreparationStatus.NEEDS_CONFIRMATION) ?? 0,
      ready_initial_check:
        prepMap.get(PreparationStatus.READY_INITIAL_CHECK) ?? 0,
    };

    // Map applications count
    const appMap = new Map<ApplicationStatus, number>();
    for (const item of appGroup) {
      appMap.set(item.statusSummary, item._count.statusSummary);
    }

    const activeAppCount =
      (appMap.get(ApplicationStatus.CITIZEN_RECORDED_UNCONFIRMED) ?? 0) +
      (appMap.get(ApplicationStatus.ACCEPTED) ?? 0) +
      (appMap.get(ApplicationStatus.VERIFICATION) ?? 0) +
      (appMap.get(ApplicationStatus.PROCESSING) ?? 0);

    const applicationsCount = {
      active: activeAppCount,
      needs_correction: appMap.get(ApplicationStatus.NEEDS_CORRECTION) ?? 0,
    };

    // Combine recent items
    const prepItems: DashboardRecentItemView[] = recentPreps.map((prep) => ({
      type: 'preparation' as const,
      id: prep.id,
      title: prep.service.name,
      status: this.mapPrepStatusToString(prep.status),
      updated_at: prep.updatedAt.toISOString(),
      primary_action: this.getPrepPrimaryAction(prep.id, prep.status),
    }));

    const appItems: DashboardRecentItemView[] = recentApps.map((app) => ({
      type: 'application' as const,
      id: app.id,
      title: app.service.name,
      status: app.statusSummary.toLowerCase(),
      updated_at: app.updatedAt.toISOString(),
      primary_action: this.getAppPrimaryAction(app.id, app.statusSummary),
    }));

    const combinedRecent = [...prepItems, ...appItems]
      .sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      )
      .slice(0, 5);

    return {
      preparations: preparationsCount,
      applications: applicationsCount,
      open_findings_count: openFindingsCount,
      unread_notifications_count: unreadNotificationsCount,
      recent_items: combinedRecent,
    };
  }

  private mapPrepStatusToString(status: PreparationStatus): string {
    switch (status) {
      case PreparationStatus.NEEDS_CONFIRMATION:
        return 'needs_review';
      case PreparationStatus.RECHECK_REQUIRED:
        return 'needs_new_inspection';
      default:
        return status.toLowerCase();
    }
  }

  private getPrepPrimaryAction(
    id: string,
    status: PreparationStatus,
  ): { label: string; href: string } {
    switch (status) {
      case PreparationStatus.DRAFT:
        return { label: 'Lanjutkan persiapan', href: `/preparations/${id}` };
      case PreparationStatus.READY_INITIAL_CHECK:
        return { label: 'Lihat ringkasan berkas', href: `/preparations/${id}` };
      case PreparationStatus.NEEDS_COMPLETION:
        return { label: 'Lengkapi berkas', href: `/preparations/${id}` };
      case PreparationStatus.NEEDS_CONFIRMATION:
        return { label: 'Periksa catatan berkas', href: `/preparations/${id}` };
      default:
        return { label: 'Buka persiapan', href: `/preparations/${id}` };
    }
  }

  private getAppPrimaryAction(
    id: string,
    status: ApplicationStatus,
  ): { label: string; href: string } {
    switch (status) {
      case ApplicationStatus.NEEDS_CORRECTION:
        return { label: 'Perbaiki pengajuan', href: `/applications/${id}` };
      case ApplicationStatus.RESULT_RECEIVED_BY_CITIZEN:
        return { label: 'Lihat arsip pengajuan', href: `/applications/${id}` };
      default:
        return { label: 'Lihat status pengajuan', href: `/applications/${id}` };
    }
  }
}
