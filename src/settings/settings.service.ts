import {
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateScenarioDto } from './dto/create-scenario.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { IntegrationEntity } from './integration.entity';
import { ScenarioEntity } from './scenario.entity';
import {
  INTEGRATION_IDS,
  type IntegrationId,
  type IntegrationStatus,
} from './settings.enums';
import { SystemSettingsEntity } from './system-settings.entity';

export type SystemSettingsDto = {
  slaDays: number;
  defaultPageSize: number;
  negativeSentimentAlert: number;
  repeatCallThreshold: number;
  incomingCallPopup: boolean;
  autoTagging: boolean;
  transcription: boolean;
  voiceRetentionDays: number;
};

export type IntegrationDto = {
  id: IntegrationId;
  status: IntegrationStatus;
  endpoint: string;
  lastSyncAt?: Date;
  latencyMs?: number;
  enabled: boolean;
};

export type ScenarioDto = {
  id: string;
  name: string;
  description: string;
  triggerSubject?: string;
  keywords: string[];
  active: boolean;
  suggestionCount: number;
};

const DEFAULT_SETTINGS: SystemSettingsDto = {
  slaDays: 7,
  defaultPageSize: 20,
  negativeSentimentAlert: 0.3,
  repeatCallThreshold: 3,
  incomingCallPopup: true,
  autoTagging: true,
  transcription: true,
  voiceRetentionDays: 365,
};

const DEFAULT_INTEGRATIONS: Array<
  Omit<IntegrationDto, 'lastSyncAt' | 'latencyMs'> & {
    latencyMs: number;
  }
> = [
  {
    id: 'crm',
    status: 'connected',
    endpoint: 'https://crm.dayins.local/api',
    latencyMs: 120,
    enabled: true,
  },
  {
    id: 'coreInsurance',
    status: 'connected',
    endpoint: 'https://core.dayins.local/api/v2',
    latencyMs: 240,
    enabled: true,
  },
  {
    id: 'callCenter',
    status: 'connected',
    endpoint: 'https://sitak.dayins.local/cti',
    latencyMs: 85,
    enabled: true,
  },
  {
    id: 'voices',
    status: 'degraded',
    endpoint: 'https://voices.dayins.local/recordings',
    latencyMs: 1350,
    enabled: true,
  },
  {
    id: 'ai',
    status: 'connected',
    endpoint: 'https://ai.dayins.local/v1',
    latencyMs: 410,
    enabled: true,
  },
];

const DEFAULT_SCENARIOS: Array<Omit<ScenarioDto, 'id'>> = [
  {
    name: 'پیگیری فوری پرونده خسارت',
    description:
      'پرونده خسارتی که بیش از SLA معطل مانده، با اولویت بالا به کارشناس خسارت ارجاع شود.',
    triggerSubject: 'پس از صدور',
    keywords: ['خسارت', 'تاخیر', 'پرداخت'],
    active: true,
    suggestionCount: 412,
  },
  {
    name: 'ارجاع به ارزیاب',
    description: 'درخواست ارزیابی مجدد خودرو به نزدیک‌ترین ارزیاب شعبه ارسال شود.',
    triggerSubject: 'پس از صدور',
    keywords: ['ارزیاب', 'ارزیابی', 'عودت'],
    active: true,
    suggestionCount: 188,
  },
  {
    name: 'دلجویی و ارجاع به سرپرست',
    description:
      'برای مکالمات با احساس منفی، ابتدا دلجویی و سپس ارجاع به سرپرست انجام شود.',
    keywords: ['شکایت', 'نارضایتی', 'عصبانیت'],
    active: true,
    suggestionCount: 264,
  },
  {
    name: 'راهنمای مدارک درمان',
    description:
      'فهرست مدارک لازم برای پرونده‌های درمان از طریق پیامک برای مشتری ارسال شود.',
    triggerSubject: 'اطلاع‌رسانی',
    keywords: ['مدارک', 'درمان', 'نسخه'],
    active: true,
    suggestionCount: 97,
  },
  {
    name: 'اطلاع‌رسانی وضعیت صدور',
    description:
      'وضعیت صدور بیمه‌نامه از سامانه‌های بیمه‌ای استعلام و به مشتری اعلام شود.',
    triggerSubject: 'صدور',
    keywords: ['صدور', 'بیمه‌نامه', 'حواله'],
    active: false,
    suggestionCount: 41,
  },
];

@Injectable()
export class SettingsService implements OnModuleInit {
  private healthChecks = 0;

  constructor(
    @InjectRepository(SystemSettingsEntity)
    private readonly settingsRepo: Repository<SystemSettingsEntity>,
    @InjectRepository(IntegrationEntity)
    private readonly integrationRepo: Repository<IntegrationEntity>,
    @InjectRepository(ScenarioEntity)
    private readonly scenarioRepo: Repository<ScenarioEntity>,
  ) {}

  async onModuleInit() {
    await this.ensureDefaults();
  }

  async getSettings(): Promise<SystemSettingsDto> {
    await this.ensureDefaults();
    const row = await this.settingsRepo.findOneByOrFail({ id: 1 });
    return this.toSettingsDto(row);
  }

  async updateSettings(dto: UpdateSettingsDto): Promise<SystemSettingsDto> {
    await this.ensureDefaults();
    await this.settingsRepo.update({ id: 1 }, { ...dto });
    const row = await this.settingsRepo.findOneByOrFail({ id: 1 });
    return this.toSettingsDto(row);
  }

  async getIntegrations(): Promise<IntegrationDto[]> {
    await this.ensureDefaults();
    const rows = await this.integrationRepo.find({
      order: { id: 'ASC' },
    });
    return rows.map((row) => this.toIntegrationDto(row));
  }

  async checkIntegration(id: IntegrationId): Promise<IntegrationDto> {
    const row = await this.findIntegration(id);
    this.healthChecks += 1;

    if (!row.enabled) {
      row.status = 'disconnected';
      row.lastSyncAt = new Date();
      return this.toIntegrationDto(await this.integrationRepo.save(row));
    }

    const recovers = this.healthChecks % 2 === 1;
    const status: IntegrationStatus =
      row.status === 'connected' || recovers ? 'connected' : row.status;
    const base = status === 'connected' ? 90 : 1200;

    row.status = status;
    row.lastSyncAt = new Date();
    row.latencyMs = base + ((this.healthChecks * 37) % 160);

    return this.toIntegrationDto(await this.integrationRepo.save(row));
  }

  async setIntegrationEnabled(
    id: IntegrationId,
    enabled: boolean,
  ): Promise<IntegrationDto> {
    const row = await this.findIntegration(id);
    row.enabled = enabled;
    row.status = enabled ? 'connected' : 'disconnected';
    return this.toIntegrationDto(await this.integrationRepo.save(row));
  }

  async getScenarios(): Promise<ScenarioDto[]> {
    await this.ensureDefaults();
    const rows = await this.scenarioRepo.find({
      order: { createdAt: 'ASC' },
    });
    return rows.map((row) => this.toScenarioDto(row));
  }

  async createScenario(dto: CreateScenarioDto): Promise<ScenarioDto> {
    const row = this.scenarioRepo.create({
      name: dto.name.trim(),
      description: dto.description?.trim() ?? '',
      triggerSubject: dto.triggerSubject?.trim() || null,
      keywords: [...new Set((dto.keywords ?? []).map((k) => k.trim()).filter(Boolean))],
      active: true,
      suggestionCount: 0,
    });
    return this.toScenarioDto(await this.scenarioRepo.save(row));
  }

  async setScenarioActive(id: string, active: boolean): Promise<ScenarioDto> {
    const row = await this.scenarioRepo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Scenario ${id} not found`);
    row.active = active;
    return this.toScenarioDto(await this.scenarioRepo.save(row));
  }

  private async findIntegration(id: IntegrationId) {
    if (!(INTEGRATION_IDS as readonly string[]).includes(id)) {
      throw new NotFoundException(`Integration ${id} not found`);
    }
    const row = await this.integrationRepo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Integration ${id} not found`);
    return row;
  }

  private async ensureDefaults() {
    const settings = await this.settingsRepo.findOne({ where: { id: 1 } });
    if (!settings) {
      await this.settingsRepo.save(
        this.settingsRepo.create({ id: 1, ...DEFAULT_SETTINGS }),
      );
    }

    const integrationCount = await this.integrationRepo.count();
    if (integrationCount === 0) {
      const now = new Date();
      await this.integrationRepo.save(
        DEFAULT_INTEGRATIONS.map((item) =>
          this.integrationRepo.create({
            ...item,
            lastSyncAt: now,
          }),
        ),
      );
    }

    const scenarioCount = await this.scenarioRepo.count();
    if (scenarioCount === 0) {
      await this.scenarioRepo.save(
        DEFAULT_SCENARIOS.map((item) =>
          this.scenarioRepo.create({
            ...item,
            triggerSubject: item.triggerSubject ?? null,
          }),
        ),
      );
    }
  }

  private toSettingsDto(row: SystemSettingsEntity): SystemSettingsDto {
    return {
      slaDays: row.slaDays,
      defaultPageSize: row.defaultPageSize,
      negativeSentimentAlert: row.negativeSentimentAlert,
      repeatCallThreshold: row.repeatCallThreshold,
      incomingCallPopup: row.incomingCallPopup,
      autoTagging: row.autoTagging,
      transcription: row.transcription,
      voiceRetentionDays: row.voiceRetentionDays,
    };
  }

  private toIntegrationDto(row: IntegrationEntity): IntegrationDto {
    return {
      id: row.id,
      status: row.status,
      endpoint: row.endpoint,
      lastSyncAt: row.lastSyncAt ?? undefined,
      latencyMs: row.latencyMs ?? undefined,
      enabled: row.enabled,
    };
  }

  private toScenarioDto(row: ScenarioEntity): ScenarioDto {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      triggerSubject: row.triggerSubject ?? undefined,
      keywords: [...(row.keywords ?? [])],
      active: row.active,
      suggestionCount: row.suggestionCount,
    };
  }
}
