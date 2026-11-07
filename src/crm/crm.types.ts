/** Single ticket row returned by CRM `voc_fetch_all`. */
export type CrmTicketRow = {
  ticketid: string | number;
  ticket_no?: string | null;
  nationalcode?: string | null;
  accountname?: string | null;
  fname?: string | null;
  lname?: string | null;
  mobile?: string | null;
  productname?: string | null;
  branchname?: string | null;
  mainticket?: string | null;
  subticket?: string | null;
  reqtypeticket?: string | null;
  createdtime?: string | null;
  modifiedtime?: string | null;
  tickettype?: string | null;
  inputchannel?: string | null;
  complainttext?: string | null;
  maincomplaint?: string | null;
  complaintstatus?: string | null;
  finalanswer?: string | null;
  closeddate?: string | null;
  description?: string | null;
  mainrequest?: string | null;
  mainoffer?: string | null;
  ownername?: string | null;
};

export type CrmFetchRequest = {
  source: string;
  type: 'updated' | string;
  last_modified: string;
  last_ticketid: number | string;
  limit: number;
};

export type CrmFetchResponse = {
  success: boolean;
  error?: string;
  count?: number;
  /** Pagination flag (CRM sample uses `has_more`). */
  has_more?: boolean;
  /** Typo-tolerant alias some docs mention. */
  has_mode?: boolean;
  next_modified?: string | null;
  data?: CrmTicketRow[];
};

export type CrmSyncResult = {
  chunks: number;
  upserted: number;
  /** Tickets removed because they were older than the 1-year window. */
  deleted: number;
  /** Sync window start (`last_modified` for the first CRM request). */
  windowStart: string;
  lastModified: string;
  lastTicketId: string;
  hasMore: boolean;
  stoppedReason: 'complete' | 'disabled' | 'crm_error' | 'empty_chunk';
};
