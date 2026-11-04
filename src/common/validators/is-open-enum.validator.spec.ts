import { validate } from 'class-validator';
import { IsOptional } from 'class-validator';
import { TicketType } from '../../ticket/enums/ticket.enums';
import { IsOpenEnum } from './is-open-enum.validator';

class SampleDto {
  @IsOptional()
  @IsOpenEnum(TicketType)
  tickettype?: string | null;
}

describe('IsOpenEnum', () => {
  it('accepts known enum values', async () => {
    const dto = Object.assign(new SampleDto(), {
      tickettype: TicketType.Complaint,
    });
    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('accepts unknown CRM strings without failing', async () => {
    const dto = Object.assign(new SampleDto(), {
      tickettype: 'نوع جدید که در enum نیست',
    });
    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rejects non-string values', async () => {
    const dto = Object.assign(new SampleDto(), { tickettype: 42 as never });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('allows null / undefined', async () => {
    await expect(validate(new SampleDto())).resolves.toHaveLength(0);
    const dto = Object.assign(new SampleDto(), { tickettype: null });
    await expect(validate(dto)).resolves.toHaveLength(0);
  });
});
