import type { CallEntity } from '../call/call.entity';
import type { CustomerEntity } from '../customer/customer.entity';
import type { CrmTicketRow } from './crm.types';

const emptyToNull = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string' && value.trim() === '') return null;
  return String(value).trim();
};

const normalizeMobile = (value: string | null): string | null => {
  if (!value) return null;
  const digits = value.replace(/[^\d]/g, '');
  if (/^09\d{9}$/.test(digits)) return digits;
  if (/^9\d{9}$/.test(digits)) return `0${digits}`;
  return digits || null;
};

const normalizeNationalCode = (value: string | null): string | null => {
  if (!value) return null;
  const digits = value.replace(/[^\d]/g, '');
  if (!digits || /^0+$/.test(digits) || /^1+$/.test(digits)) return null;
  return digits.padStart(10, '0').slice(-10);
};

const normalizeCallType = (value: string | null): string | null => {
  if (!value) return null;
  if (value === 'ارتباط دهی' || value === 'ارتباط‌دهی') return 'ارتباط‌دهی';
  if (value === 'گفت و گو' || value === 'گفت‌وگو') return 'گفت‌وگو';
  return value;
};

/** Maps one CRM `voc_fetch_all_calls` row into a CallEntity upsert payload. */
export function mapCrmRowToCall(
  row: CrmTicketRow,
): Partial<CallEntity> & { callid: string } {
  const ticketNo = emptyToNull(row.ticket_no);
  const ticketId = String(row.ticketid);
  return {
    callid: ticketNo || `IC-${ticketId}`,
    calltype: normalizeCallType(emptyToNull(row.tickettype)),
    createdtime: emptyToNull(row.createdtime) as unknown as Date | null,
    nationalcode: normalizeNationalCode(emptyToNull(row.nationalcode)),
    fname: emptyToNull(row.fname),
    lname: emptyToNull(row.lname),
    mobile: normalizeMobile(emptyToNull(row.mobile)),
    accountname: emptyToNull(row.accountname),
    branchname: emptyToNull(row.branchname),
    productname: emptyToNull(row.productname),
    inputchannel: emptyToNull(row.inputchannel),
    ownername: emptyToNull(row.ownername),
    direction: 'inbound',
    status: 'answered',
    durationsec: 0,
    waitsec: 0,
  };
}

/** Builds a customer upsert from a call/ticket CRM row when an identity key exists. */
export function mapCrmRowToCustomer(
  row: CrmTicketRow,
): (Partial<CustomerEntity> & { nationalcode: string }) | null {
  const nationalcode = normalizeNationalCode(emptyToNull(row.nationalcode));
  const mobile = normalizeMobile(emptyToNull(row.mobile));
  const key = nationalcode || (mobile ? `M-${mobile}` : null);
  if (!key) return null;

  return {
    nationalcode: key,
    fname: emptyToNull(row.fname),
    lname: emptyToNull(row.lname),
    mobile,
    accountname: emptyToNull(row.accountname),
    branchname: emptyToNull(row.branchname),
    productname: emptyToNull(row.productname),
    kind: emptyToNull(row.accountname) ? 'corporate' : 'individual',
    status: 'active',
  };
}
