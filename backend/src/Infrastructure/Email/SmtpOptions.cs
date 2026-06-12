namespace Infrastructure.Email;

public class SmtpOptions
{
    public const string SectionName = "Smtp";

    public string? Host { get; set; }
    public int Port { get; set; } = 25;
    public string From { get; set; } = "web@woodwork.local";
    public string To { get; set; } = "workshop@woodwork.local";
}
