using System.Net.Http.Json;

namespace Api.Services;

/// <summary>
/// Fire-and-forget POST to the Next.js revalidation webhook after published data changes.
/// Failures are logged at Warning and never propagate.
/// </summary>
public class FrontendRevalidator
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<FrontendRevalidator> _logger;

    public FrontendRevalidator(
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<FrontendRevalidator> logger)
    {
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
        _logger = logger;
    }

    public void Trigger()
    {
        var baseUrl = _configuration["Frontend:BaseUrl"];
        var secret = _configuration["Frontend:RevalidateSecret"];
        if (string.IsNullOrWhiteSpace(baseUrl) || string.IsNullOrWhiteSpace(secret))
        {
            _logger.LogDebug("Frontend revalidation skipped: Frontend:BaseUrl/RevalidateSecret not configured.");
            return;
        }

        var url = $"{baseUrl.TrimEnd('/')}/api/revalidate";
        _ = Task.Run(async () =>
        {
            try
            {
                using var client = _httpClientFactory.CreateClient("frontend-revalidate");
                using var request = new HttpRequestMessage(HttpMethod.Post, url)
                {
                    Content = JsonContent.Create(new { tags = new[] { "content", "projects" } }),
                };
                request.Headers.Add("X-Revalidate-Secret", secret);

                using var response = await client.SendAsync(request);
                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning(
                        "Frontend revalidation returned {StatusCode} from {Url}.", (int)response.StatusCode, url);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Frontend revalidation call to {Url} failed.", url);
            }
        });
    }
}
