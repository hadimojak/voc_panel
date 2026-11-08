/** Single ticket/call row returned by CRM `voc_fetch_all` / `voc_fetch_all_calls`. */
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

/**
 * Exact CRM request body from `tickets_all.txt` / `calls_all.txt`:
 * `{"source":"smart","type":"new","last_ticketid":0,"limit":10}`
 * No other fields (no last_modified, no type=updated).
 */
export type CrmNewFetchRequest = {
  source: string;
  type: 'new';
  last_ticketid: number;
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
  next_ticketid?: string | number | null;
  next_modified?: string | null;
  data?: CrmTicketRow[];
};

export type CrmSyncStream = 'tickets' | 'calls';

export type CrmStreamStatus = {
  stream: CrmSyncStream;
  lastTicketId: string;
  chunksProcessed: number;
  itemsUpserted: number;
  updatedAt: string | null;
  lastRunAt: string | null;
  lastStoppedReason: string | null;
  lastError: string | null;
  running: boolean;
  fetchUrl: string;
};

export type CrmSyncStatusResponse = {
  tickets: CrmStreamStatus;
  calls: CrmStreamStatus;
  cursorFile: string;
};

export type CrmSyncStartResponse = {
  started: boolean;
  stream: CrmSyncStream;
  running: boolean;
  lastTicketId: string;
};

export type CrmSyncResult = {
  stream: CrmSyncStream;
  chunks: number;
  upserted: number;
  lastTicketId: string;
  hasMore: boolean;
  stoppedReason: 'complete' | 'disabled' | 'crm_error' | 'empty_chunk';
};
