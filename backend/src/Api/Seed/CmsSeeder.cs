using System.Text.Json;
using Api.Content;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Api.Seed;

/// <summary>
/// Seeds the full landing-page content (copy taken verbatim from design/hrast.html for en,
/// native Slovenian translation for sl) plus 6 published sample projects.
/// Idempotent: skipped entirely when any PageSection already exists.
/// </summary>
public static class CmsSeeder
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    public static async Task SeedAsync(AppDbContext db, ILogger logger)
    {
        if (await db.PageSections.AnyAsync())
        {
            logger.LogInformation("CMS seed skipped: PageSections already exist.");
            return;
        }

        var now = DateTime.UtcNow;
        foreach (var (key, sl, en) in Sections())
        {
            var jsonSl = JsonSerializer.Serialize(sl, Json);
            var jsonEn = JsonSerializer.Serialize(en, Json);

            foreach (var error in SectionSchemas.Validate(key, jsonSl).Concat(SectionSchemas.Validate(key, jsonEn)))
            {
                logger.LogWarning("Seed content for '{Key}' fails its own schema: {Error}", key, error);
            }

            db.PageSections.Add(new PageSection
            {
                Id = Guid.NewGuid(),
                Key = key,
                JsonSl = jsonSl,
                JsonEn = jsonEn,
                UpdatedAt = now,
                UpdatedBy = "seed",
            });
        }

        if (!await db.Projects.AnyAsync())
        {
            db.Projects.AddRange(Projects());
        }

        await db.SaveChangesAsync();
        logger.LogInformation("CMS seed complete: {Sections} sections, 6 projects.", SectionSchemas.Keys.Length);
    }

    private static IEnumerable<(string Key, object Sl, object En)> Sections()
    {
        yield return ("hero",
            new
            {
                label = "Vrhunsko mizarstvo · Ljubljana · od 1998",
                titleLines = new object[]
                {
                    new { text = "Prostori, zasnovani" },
                    new { text = "v masivnem lesu", em = "masivnem lesu" },
                },
                sub = "Kuhinje, kopalnice, spalnice in unikatni kosi pohištva — narisani, izdelani in vgrajeni v enem ateljeju.",
                imageCaption = new
                {
                    title = "Evropski hrast, radialno žagan",
                    meta = "Material, okoli katerega zgradimo dom",
                },
            },
            new
            {
                label = "Fine woodwork · Ljubljana · since 1998",
                titleLines = new object[]
                {
                    new { text = "Rooms composed" },
                    new { text = "in solid wood", em = "solid wood" },
                },
                sub = "Kitchens, bathrooms, bedrooms and singular pieces of furniture — drawn, built and installed by one atelier.",
                imageCaption = new
                {
                    title = "European oak, quarter-sawn",
                    meta = "The material we build a house around",
                },
            });

        yield return ("statement",
            new
            {
                label = "Atelje",
                text = "Izdelamo malo stvari, počasi, za ljudi, ki jih nameravajo obdržati vse življenje.",
                em = "vse življenje",
            },
            new
            {
                label = "The atelier",
                text = "We make few things, slowly, for people who intend to keep them for a lifetime.",
                em = "for a lifetime",
            });

        yield return ("rooms",
            new
            {
                label = "Atelje · kaj izdelujemo",
                title = "Vsak prostor, ena delavnica",
                items = new object[]
                {
                    new
                    {
                        numeral = "I",
                        title = "Kuhinja",
                        text = "Prostor, kjer se zgodi vse. Načrtovana po vaših navadah, potrjena v 3D, izdelana iz radialno žaganih desk.",
                        linkText = "Začnite s tem prostorom",
                        imageTag = new { title = "Hrastova kuhinja", meta = "Ljubljana · 2026" },
                        species = "oak",
                    },
                    new
                    {
                        numeral = "II",
                        title = "Kopalnica",
                        text = "Tiho shranjevanje iz vrst lesa, odpornih na vlago, in zaščitenih površin — zasnovano za najmirnejši prostor v hiši.",
                        linkText = "Začnite s tem prostorom",
                        imageTag = new { title = "Jesenova kopalniška omarica", meta = "Kranj · 2025" },
                        species = "ash",
                    },
                    new
                    {
                        numeral = "III",
                        title = "Spalnica",
                        text = "Garderobne omare in garderobne sobe, ki delujejo kot arhitektura — od tal do stropa, od roba do roba, neslišne na tečajih.",
                        linkText = "Začnite s tem prostorom",
                        imageTag = new { title = "Orehova garderobna omara", meta = "Bled · 2025" },
                        species = "walnut",
                    },
                    new
                    {
                        numeral = "IV",
                        title = "Unikatni kos",
                        text = "Miza, stopnišče, knjižna stena. Narisan na prazen list in izdelan samo enkrat, za en sam naslov.",
                        linkText = "Začnite s tem prostorom",
                        imageTag = new { title = "Jedilna miza št. 41", meta = "Škofja Loka · 2024" },
                        species = "oak",
                    },
                },
            },
            new
            {
                label = "The atelier · what we make",
                title = "Every room, one bench",
                items = new object[]
                {
                    new
                    {
                        numeral = "I",
                        title = "The kitchen",
                        text = "The room where everything happens. Planned around your habits, approved in 3D, built from quarter-sawn boards.",
                        linkText = "Begin with this room",
                        imageTag = new { title = "Oak kitchen", meta = "Ljubljana · 2026" },
                        species = "oak",
                    },
                    new
                    {
                        numeral = "II",
                        title = "The bathroom",
                        text = "Quiet storage in moisture-stable species and sealed finishes — composed for the calmest room of the house.",
                        linkText = "Begin with this room",
                        imageTag = new { title = "Ash vanity", meta = "Kranj · 2025" },
                        species = "ash",
                    },
                    new
                    {
                        numeral = "III",
                        title = "The bedroom",
                        text = "Wardrobes and walk-ins that read as architecture — floor to ceiling, edge to edge, silent on their hinges.",
                        linkText = "Begin with this room",
                        imageTag = new { title = "Walnut wardrobe", meta = "Bled · 2025" },
                        species = "walnut",
                    },
                    new
                    {
                        numeral = "IV",
                        title = "The singular piece",
                        text = "A table, a staircase, a library wall. Drawn from a blank sheet and made once, for one address only.",
                        linkText = "Begin with this room",
                        imageTag = new { title = "Dining table No. 41", meta = "Škofja Loka · 2024" },
                        species = "oak",
                    },
                },
            });

        yield return ("gallery",
            new { label = "Izbrana dela", title = "Iz galerije" },
            new { label = "Selected works", title = "From the gallery" });

        yield return ("videoSection",
            new
            {
                label = "Delavnica v gibanju",
                title = "Iz delavnice",
                youtubeId = (string?)null,
                videoUrl = "/films/workshop.mp4",
                captionTitle = "Od surove deske do dokončane kuhinje",
                captionMeta = "Posnetek iz našega ateljeja",
                instagramPosts = Array.Empty<string>(),
                videoPortrait = true,
                videoPoster = "/films/workshop-poster.jpg",
            },
            new
            {
                label = "The workshop, in motion",
                title = "From the workshop",
                youtubeId = (string?)null,
                videoUrl = "/films/workshop.mp4",
                captionTitle = "From rough board to finished kitchen",
                captionMeta = "A clip from our atelier",
                instagramPosts = Array.Empty<string>(),
                videoPortrait = true,
                videoPoster = "/films/workshop-poster.jpg",
            });

        yield return ("testimonial",
            new
            {
                quote = "Izmerili so naše krive stene iz 19. stoletja in izdelali kuhinjo, ki se jim prilega, kot bi tam zrasla.",
                who = "M. in T. Kovač — Ljubljana",
            },
            new
            {
                quote = "They measured our crooked 19th-century walls and made a kitchen that fits them like it grew there.",
                who = "M. & T. Kovač — Ljubljana",
            });

        yield return ("stats",
            new
            {
                items = new object[]
                {
                    new { value = 27, label = "Let obrti" },
                    new { value = 400, suffix = "+", label = "Opremljenih prostorov" },
                    new { value = 5, suffix = " let", label = "Garancije" },
                    new { value = 1, label = "Atelje, od začetka do konca" },
                },
            },
            new
            {
                items = new object[]
                {
                    new { value = 27, label = "Years of craft" },
                    new { value = 400, suffix = "+", label = "Rooms delivered" },
                    new { value = 5, suffix = " yr", label = "Warranty" },
                    new { value = 1, label = "Atelier, start to finish" },
                },
            });

        yield return ("contact",
            new
            {
                label = "Naročila · 2026",
                title = "Začnite s pogovorom",
                em = "pogovorom",
                text = "Povejte nam o prostoru. Obiščemo vas, izmerimo in se vrnemo s 3D-načrtom ter fiksno ponudbo — brez obveznosti.",
                ctaText = "Povpraševanje",
                altText = "ali pokličite",
                email = "atelier@hrast.si",
                phone = "+38641123456",
                phoneDisplay = "041 123 456",
                address = "Obrtna cona 12, Ljubljana",
            },
            new
            {
                label = "Commissions · 2026",
                title = "Begin with a conversation",
                em = "conversation",
                text = "Tell us about the room. We visit, measure, and return with a 3D design and a fixed quote — without obligation.",
                ctaText = "Enquire",
                altText = "or call",
                email = "atelier@hrast.si",
                phone = "+38641123456",
                phoneDisplay = "041 123 456",
                address = "Obrtna cona 12, Ljubljana",
            });

        var socials = new
        {
            instagram = "https://www.instagram.com/yourstudio",
            facebook = "https://www.facebook.com/yourstudio",
            youtube = "https://www.youtube.com/@yourstudio",
        };
        yield return ("socialLinks", socials, socials);

        yield return ("seo",
            new
            {
                title = "mazzidesign — vrhunsko mizarstvo",
                description = "Kuhinje, kopalnice, spalnice in unikatni kosi pohištva — narisani, izdelani in vgrajeni v enem ateljeju v Ljubljani.",
            },
            new
            {
                title = "mazzidesign — fine woodwork",
                description = "Kitchens, bathrooms, bedrooms and singular pieces of furniture — drawn, built and installed by one atelier in Ljubljana.",
            });
    }

    private static IEnumerable<Project> Projects()
    {
        yield return new Project
        {
            Id = Guid.NewGuid(),
            Slug = "penthouse-kitchen",
            Category = ProjectCategory.Kitchen,
            Species = WoodSpecies.Oak,
            Town = "Ljubljana",
            Year = 2026,
            SortOrder = 1,
            IsFeatured = true,
            Status = ProjectStatus.Published,
            TitleSl = "Kuhinja v penthousu",
            TitleEn = "Penthouse kitchen",
            DescriptionSl = "Devet metrov omar iz radialno žaganega hrasta, načrtovanih okoli jutranjega pogleda na grad.",
            DescriptionEn = "Nine metres of quarter-sawn oak cabinetry, planned around a morning view of the castle.",
        };

        yield return new Project
        {
            Id = Guid.NewGuid(),
            Slug = "library-wall",
            Category = ProjectCategory.Custom,
            Species = WoodSpecies.Walnut,
            Town = "Bled",
            Year = 2025,
            SortOrder = 2,
            IsFeatured = true,
            Status = ProjectStatus.Published,
            TitleSl = "Knjižna stena",
            TitleEn = "Library wall",
            DescriptionSl = "Orehove police od tal do stropa, izdelane za zbirko, ki je nastajala štirideset let.",
            DescriptionEn = "Floor-to-ceiling walnut shelving, built for a collection gathered over forty years.",
        };

        yield return new Project
        {
            Id = Guid.NewGuid(),
            Slug = "double-vanity",
            Category = ProjectCategory.Bath,
            Species = WoodSpecies.Ash,
            Town = "Maribor",
            Year = 2025,
            SortOrder = 3,
            IsFeatured = false,
            Status = ProjectStatus.Published,
            TitleSl = "Dvojna kopalniška omarica",
            TitleEn = "Double vanity",
            DescriptionSl = "Dva umivalnika v enem samem kosu jesenovine, zaščitenem za najmirnejši prostor v hiši.",
            DescriptionEn = "Two basins set into a single length of ash, sealed for the calmest room of the house.",
        };

        yield return new Project
        {
            Id = Guid.NewGuid(),
            Slug = "smoked-oak-kitchen",
            Category = ProjectCategory.Kitchen,
            Species = WoodSpecies.SmokedOak,
            Town = "Celje",
            Year = 2025,
            SortOrder = 4,
            IsFeatured = true,
            Status = ProjectStatus.Published,
            TitleSl = "Kuhinja iz dimljenega hrasta",
            TitleEn = "Smoked oak kitchen",
            DescriptionSl = "Fronte iz dimljenega hrasta pod svetlim kamnitim pultom — temno, mirno in narejeno za dotik.",
            DescriptionEn = "Smoked oak fronts under a pale stone worktop — dark, calm and made to be touched.",
        };

        yield return new Project
        {
            Id = Guid.NewGuid(),
            Slug = "staircase",
            Category = ProjectCategory.Millwork,
            Species = WoodSpecies.Oak,
            Town = "Škofja Loka",
            Year = 2024,
            SortOrder = 5,
            IsFeatured = false,
            Status = ProjectStatus.Published,
            TitleSl = "Stopnišče",
            TitleEn = "Staircase",
            DescriptionSl = "Hrastovo stopnišče z zavojem; vsaka stopnica je izrezana iz ene same deske.",
            DescriptionEn = "A quarter-turn oak staircase; each tread cut from a single board.",
        };

        yield return new Project
        {
            Id = Guid.NewGuid(),
            Slug = "walnut-wardrobe",
            Category = ProjectCategory.Bedroom,
            Species = WoodSpecies.Walnut,
            Town = "Bled",
            Year = 2025,
            SortOrder = 6,
            IsFeatured = false,
            Status = ProjectStatus.Published,
            TitleSl = "Orehova garderobna omara",
            TitleEn = "Walnut wardrobe",
            DescriptionSl = "Garderobna omara, ki deluje kot arhitektura — od tal do stropa, od roba do roba, neslišna na tečajih.",
            DescriptionEn = "A wardrobe that reads as architecture — floor to ceiling, edge to edge, silent on its hinges.",
        };
    }
}
