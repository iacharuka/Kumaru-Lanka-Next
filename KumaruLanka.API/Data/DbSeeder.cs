using KumaruLanka.API.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace KumaruLanka.API.Data;

/// <summary>
/// Seeds the database with initial tours, destinations, vehicles, and reviews.
/// Call from Program.cs after db.Database.MigrateAsync()
/// </summary>
public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        await EnsureItineraryTableAsync(db);
        await SeedUsersAsync(db);
        await SeedVehiclesAsync(db);
        await SeedToursAsync(db);
        await SeedDestinationsAsync(db);
        await SeedReviewsAsync(db);
    }

    private static async Task EnsureItineraryTableAsync(AppDbContext db)
    {
        await db.Database.ExecuteSqlRawAsync("""
            IF OBJECT_ID(N'[Itineraries]', N'U') IS NULL
            BEGIN
                CREATE TABLE [Itineraries] (
                    [Id] int NOT NULL IDENTITY,
                    [TripName] nvarchar(max) NOT NULL,
                    [Days] int NOT NULL,
                    [Travelers] int NOT NULL,
                    [Pace] nvarchar(max) NOT NULL,
                    [StopsJson] nvarchar(max) NOT NULL,
                    [OwnerName] nvarchar(max) NOT NULL,
                    [OwnerEmail] nvarchar(max) NOT NULL,
                    [UserId] int NULL,
                    [CreatedAt] datetime2 NOT NULL,
                    [UpdatedAt] datetime2 NOT NULL,
                    CONSTRAINT [PK_Itineraries] PRIMARY KEY ([Id]),
                    CONSTRAINT [FK_Itineraries_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE SET NULL
                );

                CREATE INDEX [IX_Itineraries_UserId] ON [Itineraries] ([UserId]);
            END
            """);
    }

    private static async Task SeedUsersAsync(AppDbContext db)
    {
        if (db.Users.Any()) return;

        var now = DateTime.UtcNow;
        db.Users.AddRange(
            new User
            {
                FullName = "Kumaru Admin",
                Email = "admin@kumarulanka.lk",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@Kumaru1"),
                Role = "admin",
                IsActive = true,
                CreatedAt = now
            },
            new User
            {
                FullName = "John Doe",
                Email = "john@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123"),
                Role = "User",
                IsActive = true,
                CreatedAt = now
            },
            new User
            {
                FullName = "Jane Doe",
                Email = "jane@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("SecurePass456"),
                Role = "User",
                IsActive = true,
                CreatedAt = now
            }
        );

        await db.SaveChangesAsync();
    }

    // ── Vehicles ──────────────────────────────────────────
    private static async Task SeedVehiclesAsync(AppDbContext db)
    {
        if (db.Vehicles.Any()) return;
        db.Vehicles.AddRange(
            new Vehicle { Slug="tuk", Name="Tuk-Tuk",     Icon="🛺", Tagline="Authentic Sri Lankan experience", Description="Perfect for city tours and short trips.",               PricePerDay=25,  Passengers="1–3", Luggage="Small bags only",     HasAC=false, Features=J(new[]{"City tours","Short trips","Local experience","Easy parking"}) },
            new Vehicle { Slug="car", Name="Private Car",  Icon="🚗", Tagline="Comfortable inter-city travel",  Description="AC sedan for couples and small families.",              PricePerDay=55,  Passengers="1–4", Luggage="2 large bags",        HasAC=true,  Features=J(new[]{"Full AC","Inter-city travel","Comfortable seats","Phone charger"}) },
            new Vehicle { Slug="van", Name="AC Van",       Icon="🚐", Tagline="Spacious family & group travel", Description="Roomy AC van with ample luggage space.",                PricePerDay=75,  Passengers="5–8", Luggage="4–6 large bags",      HasAC=true,  Features=J(new[]{"Full AC","Large luggage space","Reclining seats","USB charging","Wi-Fi optional"}) },
            new Vehicle { Slug="bus", Name="Mini Bus",     Icon="🚌", Tagline="Large groups & corporate tours", Description="Ideal for larger groups and corporate travel.",         PricePerDay=110, Passengers="9–20",Luggage="Large group luggage",   HasAC=true,  Features=J(new[]{"Full AC","PA system","Reclining seats","Large storage","USB ports"}) }
        );
        await db.SaveChangesAsync();
    }

    // ── Tours ─────────────────────────────────────────────
    private static async Task SeedToursAsync(AppDbContext db)
    {
        if (db.Tours.Any()) return;
        db.Tours.AddRange(
            new Tour { Title="Cultural Triangle Discovery",    Category="cultural",   Duration="5 Days", PaxRange="2–10", Accommodation="4-star hotel",    Price=349, Rating=5.0, ReviewCount=128, ImageUrl="https://images.unsplash.com/photo-1566296314736-6eaea1755728?w=600&q=80", Tags=J(new[]{"Cultural","Guided"}),        Description="Visit Sigiriya, Dambulla Cave Temple, Polonnaruwa, and Anuradhapura with an expert historian guide.", Highlights=J(new[]{"Sigiriya Rock Fortress","Dambulla Cave Temple","Polonnaruwa Ruins","Anuradhapura Sacred City"}), Includes=J(new[]{"AC transport","English guide","4-star hotels","Breakfast & dinner","Entry tickets"}) },
            new Tour { Title="Ella Mountain Adventure",       Category="adventure",  Duration="3 Days", PaxRange="2–8",  Accommodation="Boutique stay",   Price=219, Rating=5.0, ReviewCount=94,  ImageUrl="https://images.unsplash.com/photo-1586022045247-c94c5c937962?w=600&q=80", Tags=J(new[]{"Adventure","Hiking"}),       Description="Hike Little Adam's Peak, ride the Nine Arches Bridge train, and sip tea at a highland estate.",    Highlights=J(new[]{"Little Adam's Peak","Nine Arches Bridge","Tea estate visit","Ravana Falls"}), Includes=J(new[]{"AC transport","Guide","Boutique hotel","Breakfast","Train tickets"}) },
            new Tour { Title="Yala & Udawalawe Safari",       Category="wildlife",   Duration="4 Days", PaxRange="2–6",  Accommodation="Eco lodge",       Price=289, Rating=5.0, ReviewCount=76,  ImageUrl="https://images.unsplash.com/photo-1534476478164-b15a2fd8b035?w=600&q=80", Tags=J(new[]{"Wildlife","Safari"}),        Description="Spot leopards, elephants, and exotic birds on game drives through two premier national parks.",     Highlights=J(new[]{"Leopard spotting","Elephant herds","Bird watching","Eco lodge experience"}), Includes=J(new[]{"AC transport","Safari jeep","Eco lodge","All meals","Park entry fees"}) },
            new Tour { Title="South Coast Beach Escape",      Category="beach",      Duration="5 Days", PaxRange="2–12", Accommodation="Beach resort",    Price=379, Rating=4.5, ReviewCount=112, ImageUrl="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80", Tags=J(new[]{"Beach","Relaxation"}),       Description="Whale watching in Mirissa, surfing at Weligama, sunset strolls along the Galle Fort ramparts.",    Highlights=J(new[]{"Whale watching","Surfing lessons","Galle Fort tour","Turtle hatchery"}), Includes=J(new[]{"AC transport","Beach resort","Breakfast","Whale watching boat","Surf instructor"}) },
            new Tour { Title="Kandy & Nuwara Eliya Highlights",Category="cultural",  Duration="3 Days", PaxRange="2–10", Accommodation="Heritage hotel",  Price=199, Rating=5.0, ReviewCount=201, ImageUrl="https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=600&q=80", Tags=J(new[]{"Cultural","Festival"}),      Description="Temple of the Tooth Relic, Royal Botanical Gardens, a scenic train ride through tea country.",     Highlights=J(new[]{"Temple of the Tooth","Royal Botanical Gardens","Scenic train ride","Tea factory tour"}), Includes=J(new[]{"AC transport","Guide","Heritage hotel","Breakfast","Train tickets"}) },
            new Tour { Title="Island Hopping & Diving",       Category="adventure",  Duration="6 Days", PaxRange="2–8",  Accommodation="Dive resort",     Price=459, Rating=5.0, ReviewCount=58,  ImageUrl="https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&q=80", Tags=J(new[]{"Adventure","Diving"}),       Description="Snorkel at Pigeon Island, dive the coral reefs of Trincomalee, and explore Pasikuda's lagoon.",    Highlights=J(new[]{"Pigeon Island snorkeling","Trincomalee diving","Pasikuda lagoon","Whale shark spotting"}), Includes=J(new[]{"AC transport","Dive resort","Dive equipment","All meals","Boat trips"}) },
            new Tour { Title="Colombo City & Street Food Tour",Category="cultural",  Duration="1 Day",  PaxRange="2–12", Accommodation="N/A",             Price=59,  Rating=4.8, ReviewCount=310, ImageUrl="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80", Tags=J(new[]{"Cultural","Food"}),          Description="Explore Colombo's colonial architecture, bustling markets, and hidden street food gems by tuk-tuk.",Highlights=J(new[]{"Pettah Market","Gangaramaya Temple","Galle Face Green","Street food crawl"}), Includes=J(new[]{"Tuk-tuk transport","English guide","Street food tastings","Entry fees"}) },
            new Tour { Title="Adam's Peak Sunrise Pilgrimage",Category="adventure",  Duration="2 Days", PaxRange="2–10", Accommodation="Guesthouse",      Price=129, Rating=4.9, ReviewCount=87,  ImageUrl="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80", Tags=J(new[]{"Adventure","Spiritual"}),    Description="Night hike to the sacred Sri Pada (Adam's Peak) to witness a breathtaking sunrise from the summit.",Highlights=J(new[]{"Midnight start hike","Summit sunrise","Shadow of the Peak","Sacred footprint shrine"}), Includes=J(new[]{"AC transport","Guide","Guesthouse","Dinner & breakfast","Torch & gear"}) },
            new Tour { Title="Ayurveda & Wellness Retreat",   Category="wellness",   Duration="7 Days", PaxRange="1–4",  Accommodation="Ayurveda resort", Price=799, Rating=5.0, ReviewCount=43,  ImageUrl="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80", Tags=J(new[]{"Wellness","Ayurveda"}),       Description="A transformative week of traditional Ayurvedic treatments, yoga, meditation, and organic cuisine.",  Highlights=J(new[]{"Daily Ayurvedic treatments","Yoga & meditation","Herbal garden walk","Organic farm meals"}), Includes=J(new[]{"All treatments","Yoga sessions","Resort stay","All meals","Doctor consultation"}) },
            new Tour { Title="Jaffna & North Sri Lanka Discovery",Category="cultural",Duration="4 Days",PaxRange="2–8",  Accommodation="Boutique hotel",  Price=269, Rating=4.7, ReviewCount=35,  ImageUrl="https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=600&q=80", Tags=J(new[]{"Cultural","Off-beat"}),      Description="Discover the unique Tamil culture, ancient Nainativu island temple, and the stunning Casuarina Beach.",Highlights=J(new[]{"Jaffna Fort","Nainativu Island temple","Casuarina Beach","Local Tamil cuisine"}), Includes=J(new[]{"AC transport","Guide","Boutique hotel","Breakfast","Boat to Nainativu"}) },
            new Tour { Title="Rainforest & Waterfall Trail",  Category="adventure",  Duration="2 Days", PaxRange="2–8",  Accommodation="Forest lodge",    Price=149, Rating=4.9, ReviewCount=62,  ImageUrl="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80", Tags=J(new[]{"Adventure","Nature"}),       Description="Trek through Sinharaja Rainforest, a UNESCO World Heritage site teeming with endemic wildlife.",    Highlights=J(new[]{"Sinharaja Forest trek","Endemic bird spotting","Natural waterfalls","Night forest sounds"}), Includes=J(new[]{"AC transport","Forest guide","Lodge stay","All meals","Trekking gear"}) },
            new Tour { Title="Full Island 10-Day Grand Tour", Category="cultural",   Duration="10 Days",PaxRange="2–10", Accommodation="Mixed 3–4 star",  Price=899, Rating=5.0, ReviewCount=154, ImageUrl="https://images.unsplash.com/photo-1562602833-0f4ab2fc46e5?w=600&q=80", Tags=J(new[]{"Cultural","Adventure","Beach"}),Description="The ultimate Sri Lanka experience — Cultural Triangle, highlands, safari, and south coast beaches.",Highlights=J(new[]{"Sigiriya","Kandy & Ella","Yala Safari","Galle & Mirissa beach"}), Includes=J(new[]{"AC van","Expert guide","All hotels","Most meals","All entry tickets"}) }
        );
        await db.SaveChangesAsync();
    }

    // ── Destinations ──────────────────────────────────────
    private static async Task SeedDestinationsAsync(AppDbContext db)
    {
        if (db.Destinations.Any()) return;
        db.Destinations.AddRange(
            new Destination { Name="Sigiriya",        Subtitle="Ancient Rock Fortress",      Region="Cultural Triangle",   Badge="UNESCO",     ImageUrl="https://images.unsplash.com/photo-1566296314736-6eaea1755728?w=600&q=80", Description="A 5th-century rock fortress rising 200m above the jungle.",  BestTime="Jan–Apr",  Distance="169km from Colombo", Type="heritage" },
            new Destination { Name="Kandy",           Subtitle="City of the Sacred Tooth",   Region="Hill Country",        Badge="UNESCO",     ImageUrl="https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=600&q=80", Description="The last royal capital of Sri Lanka.",                       BestTime="Year-round",Distance="116km from Colombo", Type="cultural" },
            new Destination { Name="Ella",            Subtitle="Misty Hills & Tea Trails",   Region="Uva Province",        Badge="Trending",   ImageUrl="https://images.unsplash.com/photo-1586022045247-c94c5c937962?w=600&q=80", Description="A charming highland village with breathtaking valley views.", BestTime="Dec–Mar",  Distance="197km from Colombo", Type="adventure"},
            new Destination { Name="Galle",           Subtitle="Colonial Dutch Fort",        Region="Southern Province",   Badge="UNESCO",     ImageUrl="https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&q=80", Description="A perfectly preserved 17th-century Dutch colonial fort.",    BestTime="Nov–Apr",  Distance="119km from Colombo", Type="heritage" },
            new Destination { Name="Yala National Park",Subtitle="Sri Lanka's Premier Safari",Region="Southern Province",  Badge=null,         ImageUrl="https://images.unsplash.com/photo-1534476478164-b15a2fd8b035?w=600&q=80", Description="Home to the world's highest density of leopards.",           BestTime="Feb–Jul",  Distance="298km from Colombo", Type="wildlife" },
            new Destination { Name="Mirissa",         Subtitle="Whale Watching & Beaches",   Region="Southern Coast",      Badge="Hot",        ImageUrl="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80", Description="Famous for blue whale and dolphin watching.",               BestTime="Nov–Apr",  Distance="150km from Colombo", Type="beach"   },
            new Destination { Name="Nuwara Eliya",    Subtitle="Little England of Sri Lanka",Region="Central Province",    Badge=null,         ImageUrl="https://images.unsplash.com/photo-1582610116397-edb318620f90?w=600&q=80", Description="A former British hill station surrounded by tea estates.",   BestTime="Dec–Mar",  Distance="181km from Colombo", Type="nature"  },
            new Destination { Name="Trincomalee",     Subtitle="East Coast Diving Paradise", Region="Eastern Province",    Badge="Hidden Gem", ImageUrl="https://images.unsplash.com/photo-1511316695145-4992006ffddb?w=600&q=80", Description="Crystal-clear waters with pristine coral reefs.",            BestTime="Apr–Sep",  Distance="257km from Colombo", Type="beach"   },
            new Destination { Name="Anuradhapura",    Subtitle="Ancient Sacred Capital",     Region="North Central Province",Badge="UNESCO",    ImageUrl="https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=600&q=80", Description="One of the ancient capitals of Sri Lanka.",                 BestTime="Jan–Apr",  Distance="206km from Colombo", Type="heritage"},
            new Destination { Name="Sinharaja Forest",Subtitle="Rainforest UNESCO Reserve",  Region="Sabaragamuwa",        Badge="UNESCO",     ImageUrl="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80", Description="Sri Lanka's last viable area of primary tropical rainforest.",BestTime="Aug–Sep",  Distance="140km from Colombo", Type="nature"  }
        );
        await db.SaveChangesAsync();
    }

    // ── Reviews ───────────────────────────────────────────
    private static async Task SeedReviewsAsync(AppDbContext db)
    {
        if (db.Reviews.Any()) return;
        db.Reviews.AddRange(
            new Review { Name="Sarah Mitchell",   Country="United Kingdom", Flag="🇬🇧", Avatar="SM", AvatarColor="#e07b39", Rating=5, Text="Absolutely incredible experience! Our driver Pradeep was knowledgeable, friendly, and showed us hidden gems we'd never have found on our own.", TourTitle="Cultural Triangle Discovery",    ReviewDate="March 2025"    },
            new Review { Name="Marcus Keller",    Country="Germany",        Flag="🇩🇪", Avatar="MK", AvatarColor="#2e7d32", Rating=5, Text="The Yala safari was breathtaking — we spotted 3 leopards in one morning! The eco lodge was cosy and the guides were passionate about conservation.", TourTitle="Yala & Udawalawe Safari",       ReviewDate="February 2025" },
            new Review { Name="Amélie Laurent",   Country="France",         Flag="🇫🇷", Avatar="AL", AvatarColor="#1565c0", Rating=5, Text="We hired an AC van for 10 days and it was the best decision. Our driver spoke perfect French and English. Sri Lanka stole our hearts!",           TourTitle="AC Van – 10 Day Island Tour",   ReviewDate="January 2025"  },
            new Review { Name="Tanaka Nori",      Country="Japan",          Flag="🇯🇵", Avatar="TN", AvatarColor="#6a1b9a", Rating=5, Text="The Ella adventure package was perfect for us. The Nine Arches Bridge train ride was magical. Booking was so easy!",                               TourTitle="Ella Mountain Adventure",       ReviewDate="December 2024" },
            new Review { Name="Riya Chakraborty", Country="India",          Flag="🇮🇳", Avatar="RC", AvatarColor="#00796b", Rating=5, Text="A seamless trip from start to finish. Hotel pickups were punctual, guides were expert storytellers. The perfect honeymoon getaway!",               TourTitle="South Coast Beach Escape",      ReviewDate="November 2024" },
            new Review { Name="James Williams",   Country="Australia",      Flag="🇦🇺", Avatar="JW", AvatarColor="#c62828", Rating=5, Text="Booked a tuk-tuk tour around Colombo and it was hilarious and amazing. Driver took us to local eateries we'd never find in guidebooks. 10/10.",  TourTitle="Colombo City & Street Food Tour",ReviewDate="October 2024"  },
            new Review { Name="Emma Johansson",   Country="Sweden",         Flag="🇸🇪", Avatar="EJ", AvatarColor="#0277bd", Rating=5, Text="The Ayurveda retreat was life-changing. Seven days of complete wellness. I left feeling like a new person. Worth every penny.",                    TourTitle="Ayurveda & Wellness Retreat",   ReviewDate="September 2024"},
            new Review { Name="Carlos Mendez",    Country="Spain",          Flag="🇪🇸", Avatar="CM", AvatarColor="#bf360c", Rating=5, Text="Jaffna is incredibly underrated — the Tamil culture, the temples, the food! Kumaru Lanka gave us an experience unlike any other.",             TourTitle="Jaffna & North Sri Lanka Discovery",ReviewDate="August 2024"}
        );
        await db.SaveChangesAsync();
    }

    private static string J(object obj) => JsonSerializer.Serialize(obj);
}
