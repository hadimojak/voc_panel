/**
 * Documented ticket field values from SMART / CRM.
 * Columns stay `varchar` — unknown values are still stored (see OpenEnum).
 *
 * Mapping to `/tickets` columns:
 * - نوع تیکت        → tickettype
 * - وضعیت           → complaintstatus
 * - نوع اصلی شکایت  → maincomplaint (also used with mainticket)
 * - نوع شکایت       → subticket
 * - علت شکایت       → reqtypeticket
 * - احساس           → sentiment
 * - اولویت          → priority
 */

/** نوع تیکت */
export enum TicketType {
  Conversation = 'گفت‌وگو',
  Connection = 'ارتباط‌دهی',
  Complaint = 'شکایت',
  /** CRM plural label seen in exports (same module as شکایت). */
  Complaints = 'شکایات',
  FollowUp = 'پیگیری',
  Request = 'درخواست',
  Suggestion = 'پیشنهاد',
}

/**
 * وضعیت — CRM detail statuses plus SMART status codes.
 * Raw CRM typos/aliases are included so historical rows stay valid.
 */
export enum TicketStatus {
  // SMART
  Pending = 'pending',
  InProgress = 'inProgress',
  Registered = 'registered',
  UnderReview = 'underReview',
  Referred = 'referred',
  Closed = 'closed',

  // شکایت / پیگیری (open)
  InProgressFa = 'در جریان',
  CustomerAffairsNote = 'ثبت یادداشت توسط امور مشتریان',
  RegisteredFa = 'ثبت شده',

  // شکایت / پیگیری (closed)
  RejectedUnaware = 'رد شده - عدم آگاهی',
  RejectedOutOfPolicy = 'رد شده - خارج از ضوابط',
  IncomingHandled = 'وارده - رسیدگی شده',
  IncomingOutOfAuthority = 'وارده - خارج از اختیارات اجرایی',
  ConvertedToComplaint = 'تبدیل به شکایت',

  // درخواست
  FollowUpOwnerNote = 'ثبت یادداشت توسط مالک پیگیری',
  Resolved = 'حل شده',
  Rejected = 'رد شده',

  // پیشنهاد
  InExecution = 'در حال اجرا',
  Acceptable = 'قابل قبول',
  Unacceptable = 'غیر قابل قبول',

  // CRM label variants seen in docs / legacy exports
  ClosedFa = 'بسته‌شده',
  ClosedFaSpaced = 'بسته شده',
  UnderReviewFa = 'در رسیدگی',
  AsleepTypo = 'دربخواب',
  InProgressTypo = 'درجریان',
  RegisteredTypo = 'تثبت شده',
  IncomingHandledTypo = 'واردرمیسیگی شده',
  RejectedUnawareTypo = 'در هفته - عدم آکاهی',
}

/** نوع اصلی شکایت (subject level1) — complaint + general call trees */
export enum MainComplaintType {
  ClaimPaymentProcess = 'فرآیند پرداخت خسارت',
  CaseEvaluationProcess = 'فرآیند ارزیابی پرونده',
  OrganizationalBehavior = 'رفتار سازمانی',
  IssuanceAndContract = 'صدور و قرارداد',
  AfterIssuance = 'پس از صدور',
  CustomerRelation = 'ارتباط با مشتری',
  Announcement = 'اطلاع‌رسانی',
  Issuance = 'صدور',
  Other = 'سایر',
  None = 'ندارد',
}

/** نوع شکایت (subject level2) */
export enum ComplaintType {
  PaymentDelay = 'تاخیر در پرداخت',
  AmountObjection = 'اعتراض به مبلغ',
  TreatmentCost = 'هزینه درمان',
  EvaluationDelay = 'تاخیر در ارزیابی',
  ExpertManner = 'نحوه کارشناسی',
  BranchBehavior = 'برخورد شعبه',
  CallCenterBehavior = 'برخورد مرکز تماس',
  IssuanceDelay = 'تاخیر در صدور',
  ContractTerms = 'شرایط قرارداد',
  ClaimReport = 'اعلام خسارت',
  ClaimPayment = 'پرداخت خسارت',
  ClaimEvaluation = 'ارزیابی خسارت',
  TreatmentCaseStatus = 'بررسی وضعیت پرونده درمانی',
  DocsAndTreatmentCost = 'مدارک و هزینه درمان',
  CaseInfo = 'اطلاعات پرونده',
  Endorsement = 'الحاقیه',
  FollowUp = 'پیگیری',
  Feedback = 'انتقادات و پیشنهادات',
  CustomerInfo = 'اطلاعات مشتری',
  CoverageCommitments = 'تعهدات و پوشش‌های قرارداد',
  DayInsuranceAddress = 'آدرس و اطلاعات بیمه دی',
  ServiceCenters = 'مراکز ارائه خدمات',
  Products = 'محصولات',
  IssuanceStatusCheck = 'بررسی وضعیت صدور',
  Purchase = 'خرید',
  None = 'ندارد',
}

/** علت شکایت (subject level3) */
export enum ComplaintCause {
  BankTransferDelay = 'دیرکرد حواله بانکی',
  PaymentDocsIncomplete = 'نقص مدارک پرداخت',
  TreatmentDeductions = 'کسورات درمانی',
  CoverageCeiling = 'سقف تعهدات',
  DelayRegisteringCost = 'تاخیر در ثبت هزینه در سامانه بیمه‌گری',
  CostNotRegisteredAfterReceipt = 'عدم ثبت هزینه در سامانه پس از دریافت',
  NoReceipt = 'عدم ارائه رسید',
  CaseReturned = 'عودت پرونده',
  CaseNotRegistered = 'ثبت نشدن پرونده',
  ExpertOpinionObjection = 'اعتراض به نظر ارزیاب',
  ReExpertRequest = 'درخواست کارشناسی مجدد',
  BranchResponseDelay = 'تاخیر پاسخگویی شعبه',
  NoNotification = 'عدم اطلاع‌رسانی',
  CallDrop = 'قطعی تماس',
  LongWait = 'انتظار طولانی',
  AuthenticityInquiry = 'استعلام اصالت',
  TransferStatus = 'وضعیت حواله',
  CancelAndEndorsement = 'فسخ و الحاقیه',
  RegisterClaimCase = 'ثبت پرونده خسارت',
  FollowClaimPayment = 'پیگیری پرداخت خسارت',
  PaymentDelay = 'تاخیر در پرداخت',
  AmountObjection = 'اعتراض به مبلغ',
  EvaluationDelay = 'تاخیر در ارزیابی پرونده',
  DirectCase = 'پرونده مستقیم',
  IndirectCase = 'پرونده غیرمستقیم',
  IncompleteCaseDocs = 'مدارک ناقص پرونده',
  CreatedAt = 'تاریخ ایجاد',
  CaseNumber = 'شماره پرونده',
  PolicyCoverage = 'پوشش بیمه‌نامه',
  PlateChange = 'تغییر پلاک',
  OwnershipChange = 'تغییر مالکیت',
  TicketStatus = 'وضعیت تیکت',
  Callback = 'تماس مجدد',
  AgentBehavior = 'رفتار کارشناس',
  ServiceQuality = 'کیفیت خدمات',
  FullName = 'نام و نام خانوادگی',
  PhoneNumber = 'شماره تماس',
  NationalId = 'کدملی',
  Branch = 'شعبه',
  WorkingHours = 'ساعات کاری',
  AutoClaimAssessors = 'ارزیابان خسارت خودرو',
  TreatmentRefs = 'مراجع درمانی',
  DocDeliveryCenters = 'مراکز تحویل اسناد',
  ContractedTreatmentCenters = 'مراکز خدمات درمانی طرف قرارداد',
  PolicyAuthenticity = 'استعلام اصالت بیمه‌نامه',
  StartEndDate = 'تاریخ شروع و پایان',
  IssuanceTransferStatus = 'وضعیت صدور حواله',
  PriceInquiry = 'استعلام قیمت',
  OnlineIssuance = 'صدور آنلاین',
  None = 'ندارد',
}

/** احساس (SMART enrichment) */
export enum TicketSentiment {
  Positive = 'positive',
  Neutral = 'neutral',
  Negative = 'negative',
}

/** اولویت (SMART enrichment) */
export enum TicketPriority {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}
