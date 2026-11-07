import { SelectQueryBuilder } from 'typeorm';
import { TicketEntity } from './ticket.entity';
import type { ListTicketsDto } from './dto/list-tickets.dto';

/** CRM closed-status variants seen in production exports (with/without spaces). */
export const CLOSED_STATUSES = [
  'closed',
  'بسته‌شده',
  'بسته شده',
  'رد شده',
  'رد شده - عدم آگاهی',
  'رد شده - خارج از ضوابط',
  'رد شده-عدم آگاهی',
  'رد شده-خارج از ضوابط',
  'وارده - رسیدگی شده',
  'وارده-رسیدگی شده',
  'وارده - خارج از اختیارات اجرایی',
  'وارده-خارج از اختیارات اجرایی',
  'حل شده',
  'قابل قبول',
  'غیر قابل قبول',
  'تبدیل به شکایت',
] as const;

export const REVIEW_STATUSES = [
  'inProgress',
  'underReview',
  'در جریان',
  'در حال اجرا',
] as const;

const SORT_COLUMN: Record<string, string> = {
  id: 'ticket.ticketid',
  createdAt: 'ticket.createdtime',
  type: 'ticket.tickettype',
  mobile: 'ticket.mobile',
  nationalId: 'ticket.nationalcode',
  subject1: 'ticket.maincomplaint',
  subject2: 'ticket.subticket',
  subject3: 'ticket.reqtypeticket',
  followUpOwner: 'ticket.ownername',
  branch: 'ticket.branchname',
  complaintOwner: 'ticket.ownername',
  channel: 'ticket.inputchannel',
  sentiment: 'ticket.sentiment',
  priority: 'ticket.priority',
};

/** Normalize «شکایت» filter to include CRM plural «شکایات». */
export const ticketTypeVariants = (type: string): string[] => {
  if (type === 'شکایت' || type === 'شکایات') return ['شکایت', 'شکایات'];
  return [type];
};

export function applyTicketFilters(
  qb: SelectQueryBuilder<TicketEntity>,
  query: ListTicketsDto,
): SelectQueryBuilder<TicketEntity> {
  const search = query.search?.trim();
  if (search) {
    const tokens = search.split(/\s+/).filter(Boolean);
    tokens.forEach((token, index) => {
      const key = `search${index}`;
      const pattern = `%${token}%`;
      qb.andWhere(
        `(
          ticket.ticketid::text ILIKE :${key}
          OR ticket.ticket_no ILIKE :${key}
          OR ticket.nationalcode ILIKE :${key}
          OR ticket.mobile ILIKE :${key}
          OR ticket.fname ILIKE :${key}
          OR ticket.lname ILIKE :${key}
          OR ticket.accountname ILIKE :${key}
          OR CONCAT(COALESCE(ticket.fname, ''), ' ', COALESCE(ticket.lname, '')) ILIKE :${key}
        )`,
        { [key]: pattern },
      );
    });
  }

  if (query.type) {
    qb.andWhere('ticket.tickettype IN (:...types)', {
      types: ticketTypeVariants(query.type),
    });
  }

  if (query.subject1) {
    qb.andWhere(
      `(COALESCE(NULLIF(ticket.maincomplaint, ''), ticket.mainticket) = :subject1)`,
      { subject1: query.subject1 },
    );
  }
  if (query.subject2) {
    qb.andWhere('ticket.subticket = :subject2', { subject2: query.subject2 });
  }
  if (query.subject3) {
    qb.andWhere('ticket.reqtypeticket = :subject3', {
      subject3: query.subject3,
    });
  }

  if (query.sentiment) {
    qb.andWhere('ticket.sentiment = :sentiment', {
      sentiment: query.sentiment,
    });
  }
  if (query.priority) {
    qb.andWhere('ticket.priority = :priority', { priority: query.priority });
  }

  if (query.from) {
    qb.andWhere('ticket.createdtime >= :from', { from: new Date(query.from) });
  }
  if (query.to) {
    qb.andWhere('ticket.createdtime <= :to', { to: new Date(query.to) });
  }

  if (query.status) {
    applyStatusFilter(qb, query.status);
  }

  return qb;
}

function applyStatusFilter(
  qb: SelectQueryBuilder<TicketEntity>,
  status: string,
) {
  if (status === 'open') {
    qb.andWhere(
      `(ticket.complaintstatus IS NULL OR ticket.complaintstatus = '' OR ticket.complaintstatus NOT IN (:...closedStatuses))`,
      { closedStatuses: [...CLOSED_STATUSES] },
    );
    return;
  }

  if (status === 'closed') {
    qb.andWhere('ticket.complaintstatus IN (:...closedStatuses)', {
      closedStatuses: [...CLOSED_STATUSES],
    });
    return;
  }

  if (status === 'inReview') {
    qb.andWhere('ticket.complaintstatus IN (:...reviewStatuses)', {
      reviewStatuses: [...REVIEW_STATUSES],
    });
    return;
  }

  // SMART status codes or raw CRM complaintstatus string.
  if (status === 'pending') {
    qb.andWhere(
      `(ticket.complaintstatus IS NULL OR ticket.complaintstatus = '' OR ticket.complaintstatus = :pending)`,
      { pending: 'pending' },
    );
    return;
  }

  if (status === 'inProgress' || status === 'underReview') {
    qb.andWhere('ticket.complaintstatus IN (:...reviewStatuses)', {
      reviewStatuses: [...REVIEW_STATUSES],
    });
    return;
  }

  if (status === 'registered') {
    qb.andWhere(
      `ticket.complaintstatus IS NOT NULL
       AND ticket.complaintstatus <> ''
       AND ticket.complaintstatus NOT IN (:...closedStatuses)
       AND ticket.complaintstatus NOT IN (:...reviewStatuses)`,
      {
        closedStatuses: [...CLOSED_STATUSES],
        reviewStatuses: [...REVIEW_STATUSES],
      },
    );
    return;
  }

  qb.andWhere('ticket.complaintstatus = :status', { status });
}

export function applyTicketSort(
  qb: SelectQueryBuilder<TicketEntity>,
  sort: string = 'createdAt',
  dir: 'asc' | 'desc' = 'desc',
): SelectQueryBuilder<TicketEntity> {
  const column = SORT_COLUMN[sort] ?? SORT_COLUMN.createdAt;
  const direction = dir.toUpperCase() as 'ASC' | 'DESC';
  qb.orderBy(column, direction);
  // subject1 falls back to mainticket when maincomplaint is empty.
  if (sort === 'subject1') {
    qb.addOrderBy('ticket.mainticket', direction);
  }
  qb.addOrderBy('ticket.ticketid', direction);
  return qb;
}
