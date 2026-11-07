import 'reflect-metadata';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { chunk } from 'lodash';
import * as XLSX from 'xlsx';
import { toGregorian } from 'jalaali-js';
import { AppDataSource } from './data-source';
import { CallEntity } from '../call/call.entity';
import { CustomerEntity } from '../customer/customer.entity';

const EXCEL_PATH =
  process.env.CALL_RECORDS_XLSX ??
  path.resolve(
    process.env.USERPROFILE ?? '',
    'Downloads',
    'call_records (1).xlsx',
  );

const COL = {
  callid: 'شماره رکورد',
  calltype: 'نوع تماس',
  createdtime: 'زمان ایجاد',
  nationalcode: 'کدملی',
  fname: 'نام مشتری انفرادی',
  lname: 'نام خانوادگی مشتری انفرادی',
  mobile: 'موبایل',
  accountname: 'مشتری سازمانی',
  branchname: 'نام شعبه',
  productname: 'نوع بیمه نامه',
  inputchannel: 'کانال ورودی',
  ownername: 'مالک رکورد',
} as const;

const toLatinDigits = (value: string) =>
  value
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));

const blank = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  const text = toLatinDigits(String(value)).trim();
  if (!text || text === '-' || text === '--' || text === '—') return null;
  return text;
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
  if (!digits) return null;
  if (/^0+$/.test(digits) || /^1+$/.test(digits)) return null;
  return digits.padStart(10, '0').slice(-10);
};

/** Parse Jalali «1405-07-07 09:38» / Persian digits into a Date. */
const parseJalaliDateTime = (value: string | null): Date | null => {
  if (!value) return null;
  const latin = toLatinDigits(value).replace(/\u200c/g, ' ').trim();
  const match = latin.match(
    /^(\d{3,4})[-\/](\d{1,2})[-\/](\d{1,2})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/,
  );
  if (!match) {
    const asDate = new Date(latin);
    return Number.isNaN(asDate.getTime()) ? null : asDate;
  }
  const [, jy, jm, jd, hh = '0', mm = '0', ss = '0'] = match;
  const { gy, gm, gd } = toGregorian(Number(jy), Number(jm), Number(jd));
  return new Date(
    gy,
    gm - 1,
    gd,
    Number(hh),
    Number(mm),
    Number(ss),
  );
};

const normalizeCallType = (value: string | null): string | null => {
  if (!value) return null;
  if (value === 'ارتباط دهی' || value === 'ارتباط‌دهی') return 'ارتباط‌دهی';
  if (value === 'گفت و گو' || value === 'گفت‌وگو') return 'گفت‌وگو';
  return value;
};

const isPlaceholderName = (value: string | null) =>
  !value || value === '-' || value === '--';

const customerKey = (
  nationalcode: string | null,
  mobile: string | null,
): string | null => {
  if (nationalcode) return nationalcode;
  if (mobile) return `M-${mobile}`;
  return null;
};

function rowToCall(row: Record<string, unknown>): Partial<CallEntity> | null {
  const callid = blank(row[COL.callid]);
  if (!callid) return null;

  const nationalcode = normalizeNationalCode(blank(row[COL.nationalcode]));
  const mobile = normalizeMobile(blank(row[COL.mobile]));
  let fname = blank(row[COL.fname]);
  let lname = blank(row[COL.lname]);
  if (isPlaceholderName(fname)) fname = null;
  if (isPlaceholderName(lname)) lname = null;

  let accountname = blank(row[COL.accountname]);
  if (isPlaceholderName(accountname)) accountname = null;

  return {
    callid,
    calltype: normalizeCallType(blank(row[COL.calltype])),
    createdtime: parseJalaliDateTime(blank(row[COL.createdtime])),
    nationalcode,
    fname,
    lname,
    mobile,
    accountname,
    branchname: blank(row[COL.branchname]),
    productname: blank(row[COL.productname]),
    inputchannel: blank(row[COL.inputchannel]),
    ownername: blank(row[COL.ownername]),
    direction: 'inbound',
    status: 'answered',
    durationsec: 0,
    waitsec: 0,
    sentiment: null,
    priority: null,
  };
}

function mergeCustomer(
  current: Partial<CustomerEntity> | undefined,
  call: Partial<CallEntity>,
  key: string,
): Partial<CustomerEntity> {
  const created = call.createdtime ?? null;
  const next: Partial<CustomerEntity> = {
    nationalcode: key,
    fname: call.fname ?? current?.fname ?? null,
    lname: call.lname ?? current?.lname ?? null,
    mobile: call.mobile ?? current?.mobile ?? null,
    accountname: call.accountname ?? current?.accountname ?? null,
    branchname: call.branchname ?? current?.branchname ?? null,
    productname: call.productname ?? current?.productname ?? null,
    kind: call.accountname ? 'corporate' : (current?.kind ?? 'individual'),
    status: 'active',
    isvip: current?.isvip ?? false,
    gender: current?.gender ?? null,
    activepolicycount: current?.activepolicycount ?? 0,
    openticketcount: current?.openticketcount ?? 0,
    callcount: (current?.callcount ?? 0) + 1,
    lastinteractionat: (() => {
      const prev = current?.lastinteractionat ?? null;
      if (!created) return prev;
      if (!prev) return created;
      return created > prev ? created : prev;
    })(),
    lastsentiment: current?.lastsentiment ?? null,
    customersince: (() => {
      const prev = current?.customersince ?? null;
      if (!created) return prev;
      if (!prev) return created;
      return created < prev ? created : prev;
    })(),
  };

  if (!next.kind || next.kind === 'individual') {
    next.kind = next.accountname ? 'corporate' : 'individual';
  }

  return next;
}

async function seed() {
  try {
    if (!fs.existsSync(EXCEL_PATH)) {
      throw new Error(`Excel not found: ${EXCEL_PATH}`);
    }

    console.log(`Reading ${EXCEL_PATH}...`);
    const workbook = XLSX.readFile(EXCEL_PATH);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: null,
    });
    console.log(`Excel rows: ${rows.length}`);

    const calls: Partial<CallEntity>[] = [];
    for (const row of rows) {
      const call = rowToCall(row);
      if (call) calls.push(call);
    }
    console.log(`Valid calls: ${calls.length}`);

    const customers = new Map<string, Partial<CustomerEntity>>();
    for (const call of calls) {
      const key = customerKey(call.nationalcode ?? null, call.mobile ?? null);
      if (!key) continue;
      customers.set(key, mergeCustomer(customers.get(key), call, key));
    }
    console.log(`Unique customers: ${customers.size}`);

    await AppDataSource.initialize();
    const callRepo = AppDataSource.getRepository(CallEntity);
    const customerRepo = AppDataSource.getRepository(CustomerEntity);

    for (const batch of chunk(calls, 200)) {
      await callRepo.upsert(batch as CallEntity[], ['callid']);
    }
    console.log(`✅ Upserted ${calls.length} calls`);

    const customerList = [...customers.values()];
    for (const batch of chunk(customerList, 200)) {
      await customerRepo.upsert(batch as CustomerEntity[], ['nationalcode']);
    }
    console.log(`✅ Upserted ${customerList.length} customers`);

    const callCount = await callRepo.count();
    const customerCount = await customerRepo.count();
    console.log(`DB totals — calls: ${callCount}, customers: ${customerCount}`);

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed');
    console.error(error);
    process.exit(1);
  }
}

void seed();
