const SmtpTransport = require('./smtpmailer');
const { getSMTPconfig } = require('./misc');

describe('smtpmailer', () => {
  test('is created', () => {
    const smtpTransport = new SmtpTransport(getSMTPconfig('johannroehl.de'));
    expect(smtpTransport).toBeInstanceOf(SmtpTransport);
  });
});