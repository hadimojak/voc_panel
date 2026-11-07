import { mapCrmRowToTicket } from './crm-ticket.mapper';

describe('mapCrmRowToTicket', () => {
  it('maps CRM sample fields and turns blanks into null', () => {
    const ticket = mapCrmRowToTicket({
      ticketid: '8993822',
      ticket_no: 'TT1419891',
      nationalcode: '3611286834',
      accountname: 'خوشه پروران زیست فناور',
      fname: 'مریم',
      lname: 'زینلی مقدم',
      mobile: '09919941745',
      productname: 'درمان - درمان تکمیلی',
      branchname: 'مشهد',
      mainticket: 'مراجع درمانی',
      subticket: 'پذیرش مراجع درمانی',
      reqtypeticket: 'مشکل در کاربری رسا',
      createdtime: '2025-07-16 20:59:18',
      modifiedtime: '2025-07-19 16:55:48',
      tickettype: 'شکایات',
      inputchannel: 'تلفن',
      complainttext: 'باسلام',
      maincomplaint: 'مراجع درمانی',
      complaintstatus: 'وارده-رسیدگی شده',
      finalanswer: '',
      closeddate: '2025-07-19',
      description: '',
      mainrequest: '',
      mainoffer: '',
      ownername: 'رابط امور مشتریان',
    });

    expect(ticket.ticketid).toBe('8993822');
    expect(ticket.ticket_no).toBe('TT1419891');
    expect(ticket.tickettype).toBe('شکایات');
    expect(ticket.finalanswer).toBeNull();
    expect(ticket.mainrequest).toBeNull();
    expect(ticket.mainoffer).toBeNull();
    expect(ticket.closeddate).toBe('2025-07-19');
  });
});
