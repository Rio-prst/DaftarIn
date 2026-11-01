import {
  ApplicationStatus,
  PreparationStatus,
} from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let mockPrisma: any;

  const userId = 'user-uuid-1';

  beforeEach(() => {
    mockPrisma = {
      preparation: {
        groupBy: jest.fn(),
        findMany: jest.fn(),
      },
      applicationRecord: {
        groupBy: jest.fn(),
        findMany: jest.fn(),
      },
      finding: {
        count: jest.fn(),
      },
      notification: {
        count: jest.fn(),
      },
    };

    service = new DashboardService(mockPrisma as PrismaService);
  });

  describe('getCitizenDashboard', () => {
    it('aggregates counts and returns combined recent items correctly', async () => {
      mockPrisma.preparation.groupBy.mockResolvedValue([
        { status: PreparationStatus.DRAFT, _count: { status: 2 } },
        { status: PreparationStatus.NEEDS_COMPLETION, _count: { status: 1 } },
        { status: PreparationStatus.NEEDS_CONFIRMATION, _count: { status: 1 } },
        {
          status: PreparationStatus.READY_INITIAL_CHECK,
          _count: { status: 1 },
        },
      ]);

      mockPrisma.applicationRecord.groupBy.mockResolvedValue([
        {
          statusSummary: ApplicationStatus.CITIZEN_RECORDED_UNCONFIRMED,
          _count: { statusSummary: 1 },
        },
        {
          statusSummary: ApplicationStatus.PROCESSING,
          _count: { statusSummary: 1 },
        },
        {
          statusSummary: ApplicationStatus.NEEDS_CORRECTION,
          _count: { statusSummary: 1 },
        },
      ]);

      mockPrisma.finding.count.mockResolvedValue(3);
      mockPrisma.notification.count.mockResolvedValue(2);

      const now = new Date('2026-10-29T10:00:00Z');
      const earlier = new Date('2026-10-29T08:00:00Z');

      mockPrisma.preparation.findMany.mockResolvedValue([
        {
          id: 'prep-1',
          status: PreparationStatus.DRAFT,
          updatedAt: earlier,
          service: { name: 'Pembuatan KTP' },
        },
      ]);

      mockPrisma.applicationRecord.findMany.mockResolvedValue([
        {
          id: 'app-1',
          statusSummary: ApplicationStatus.PROCESSING,
          updatedAt: now,
          service: { name: 'Pembuatan Akta Kelahiran' },
        },
      ]);

      const result = await service.getCitizenDashboard(userId);

      expect(result.preparations).toEqual({
        draft: 2,
        needs_completion: 1,
        needs_review: 1,
        ready_initial_check: 1,
      });

      expect(result.applications).toEqual({
        active: 2, // 1 CITIZEN_RECORDED_UNCONFIRMED + 1 PROCESSING
        needs_correction: 1,
      });

      expect(result.open_findings_count).toBe(3);
      expect(result.unread_notifications_count).toBe(2);

      expect(result.recent_items).toHaveLength(2);
      // app-1 has a later updatedAt, so it should be first
      expect(result.recent_items[0].id).toBe('app-1');
      expect(result.recent_items[0].type).toBe('application');
      expect(result.recent_items[0].primary_action.href).toBe(
        '/applications/app-1',
      );

      expect(result.recent_items[1].id).toBe('prep-1');
      expect(result.recent_items[1].type).toBe('preparation');
      expect(result.recent_items[1].primary_action.label).toBe(
        'Lanjutkan persiapan',
      );
    });
  });
});
