import { UserRole } from '../user/user.entity';
import type { Permission } from './permission';

/** Mirrors smart-dashboard roleLabels / roleDescriptions / permissionLabels. */
export const roleLabels: Record<UserRole, string> = {
  [UserRole.agent]: 'اپراتور',
  [UserRole.supervisor]: 'سرپرست',
  [UserRole.admin]: 'مدیر',
};

export const roleDescriptions: Record<UserRole, string> = {
  [UserRole.agent]:
    'پاسخ به تماس، مشاهده اطلاعات مشتری، پیگیری تیکت و استفاده از پیشنهادهای AI',
  [UserRole.supervisor]:
    'مانیتورینگ اپراتورها، مدیریت صف، بررسی SLA، کنترل کیفیت و گزارش‌گیری',
  [UserRole.admin]:
    'مدیریت کاربران و دسترسی‌ها، سناریوها و قوانین، گزارش‌های کلان و تنظیمات سیستم',
};

export const permissionLabels: Record<Permission, string> = {
  'dashboard.view': 'داشبورد، Analytics و گزارش‌ها',
  'tickets.view': 'مشاهده و پیگیری تیکت‌ها',
  'calls.view': 'مشاهده تماس‌ها، فایل صوتی و تحلیل AI',
  'calls.receive': 'دریافت Popup تماس ورودی و دسته‌بندی سه‌سطحی',
  'customers.view': 'پروفایل مشتری',
  'admin.manage': 'مدیریت کاربران، دسترسی‌ها و تنظیمات سیستم',
};
