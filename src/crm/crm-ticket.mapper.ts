import { normalizeOpenEnumValue } from '../common/types/open-enum';
import type { TicketEntity } from '../ticket/ticket.entity';
import type { CrmTicketRow } from './crm.types';

const emptyToNull = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string' && value.trim() === '') return null;
  return String(value);
};

/** Maps one CRM row to a TicketEntity-compatible upsert payload. */
export function mapCrmRowToTicket(
  row: CrmTicketRow,
): Partial<TicketEntity> & { ticketid: string } {
  return {
    ticketid: String(row.ticketid),
    ticket_no: emptyToNull(row.ticket_no),
    nationalcode: emptyToNull(row.nationalcode),
    accountname: emptyToNull(row.accountname),
    fname: emptyToNull(row.fname),
    lname: emptyToNull(row.lname),
    mobile: emptyToNull(row.mobile),
    productname: emptyToNull(row.productname),
    branchname: emptyToNull(row.branchname),
    mainticket: normalizeOpenEnumValue(row.mainticket),
    subticket: normalizeOpenEnumValue(row.subticket),
    reqtypeticket: normalizeOpenEnumValue(row.reqtypeticket),
    createdtime: emptyToNull(row.createdtime) as unknown as Date | null,
    modifiedtime: emptyToNull(row.modifiedtime) as unknown as Date | null,
    tickettype: normalizeOpenEnumValue(row.tickettype),
    inputchannel: emptyToNull(row.inputchannel),
    complainttext: emptyToNull(row.complainttext),
    maincomplaint: normalizeOpenEnumValue(row.maincomplaint),
    complaintstatus: normalizeOpenEnumValue(row.complaintstatus),
    finalanswer: emptyToNull(row.finalanswer),
    closeddate: emptyToNull(row.closeddate),
    description: emptyToNull(row.description),
    mainrequest: emptyToNull(row.mainrequest),
    mainoffer: emptyToNull(row.mainoffer),
    ownername: emptyToNull(row.ownername),
  };
}
