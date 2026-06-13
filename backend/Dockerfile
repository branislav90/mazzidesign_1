# syntax=docker/dockerfile:1
# .NET 8 ASP.NET Core API production image.

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Restore against nuget.org only (repo nuget.config clears machine feeds).
COPY nuget.config ./
COPY src/Api/Api.csproj src/Api/
COPY src/Domain/Domain.csproj src/Domain/
COPY src/Infrastructure/Infrastructure.csproj src/Infrastructure/
RUN dotnet restore src/Api/Api.csproj

COPY src/ src/
RUN dotnet publish src/Api/Api.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish ./
# Uploaded media lives here; mount a volume to persist it across restarts.
RUN mkdir -p /app/storage
ENV ASPNETCORE_URLS=http://+:5080
ENV Storage__Root=/app/storage
EXPOSE 5080
ENTRYPOINT ["dotnet", "Api.dll"]
