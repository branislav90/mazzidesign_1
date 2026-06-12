using MailKit.Net.Smtp;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;

namespace Infrastructure.Email;

/// <summary>
/// Sends the workshop notification email over SMTP (MailKit). The HTML body may reference
/// the snapshot via <c>cid:snapshot</c>; the raw enquiry JSON is attached.
/// Never throws — if SMTP is unconfigured or unreachable the rendered email is logged instead.
/// </summary>
public class EnquiryEmailSender
{
    private readonly SmtpOptions _options;
    private readonly ILogger<EnquiryEmailSender> _logger;

    public EnquiryEmailSender(IOptions<SmtpOptions> options, ILogger<EnquiryEmailSender> logger)
    {
        _options = options.Value;
        _logger = logger;
    }

    public async Task SendAsync(
        string subject,
        string htmlBody,
        byte[]? snapshotPng,
        string rawJson,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(_options.Host))
        {
            _logger.LogInformation(
                "SMTP not configured (Smtp:Host missing); enquiry email not sent. Subject: {Subject}. Rendered body:\n{Body}",
                subject, htmlBody);
            return;
        }

        try
        {
            var message = new MimeMessage();
            message.From.Add(MailboxAddress.Parse(_options.From));
            message.To.Add(MailboxAddress.Parse(_options.To));
            message.Subject = subject;

            var builder = new BodyBuilder { HtmlBody = htmlBody };
            if (snapshotPng is { Length: > 0 })
            {
                var inline = builder.LinkedResources.Add(
                    "snapshot.png", snapshotPng, new ContentType("image", "png"));
                inline.ContentId = "snapshot";
            }

            builder.Attachments.Add(
                "enquiry.json",
                System.Text.Encoding.UTF8.GetBytes(rawJson),
                new ContentType("application", "json"));

            message.Body = builder.ToMessageBody();

            using var client = new SmtpClient();
            await client.ConnectAsync(_options.Host, _options.Port, MailKit.Security.SecureSocketOptions.Auto, ct);
            await client.SendAsync(message, ct);
            await client.DisconnectAsync(true, ct);

            _logger.LogInformation("Enquiry email sent to {To}: {Subject}", _options.To, subject);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex,
                "Failed to send enquiry email ({Subject}); continuing. Rendered body:\n{Body}",
                subject, htmlBody);
        }
    }
}
