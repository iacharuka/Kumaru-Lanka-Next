# WhatsApp Booking Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CUSTOMER (WhatsApp)                      │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                    WhatsApp Messages
                           │
                ┌──────────▼──────────┐
                │  TWILIO WhatsApp    │
                │  Business API       │
                └──────────┬──────────┘
                           │
                    HTTP POST/Webhook
                           │
        ┌──────────────────▼──────────────────┐
        │    KumaruLanka.API                  │
        │  WhatsAppController                 │
        │  - /api/whatsapp/webhook            │
        │  - /api/whatsapp/packages           │
        │  - /api/whatsapp/send-confirmation  │
        └──────────┬──────────────────────────┘
                   │
        ┌──────────▼───────────────┐
        │  WhatsAppService         │
        │  - Parse Messages        │
        │  - Format Phone Numbers  │
        │  - Send Messages         │
        └──────────┬───────────────┘
                   │
        ┌──────────┼───────────────┐
        │          │               │
   ┌────▼────┐ ┌──▼──────┐ ┌──────▼─────┐
   │BookingDB│ │ToursDB  │ │EmailService│
   └─────────┘ └─────────┘ └────────────┘
```

## Customer Booking Flow

```
1. REQUEST PACKAGES
   Customer: "Hi, show me packages"
   │
   ├─→ WhatsAppController.ReceiveMessage()
   │   └─→ Send package list
   │
   └─← Bot: "🏝️ Kumaru Lanka Tour Packages..."

2. SELECT & BOOK
   Customer: "1\nJohn Doe\n2\n2026-06-20"
   │
   ├─→ WhatsAppController.ReceiveMessage()
   │   ├─→ WhatsAppService.ParseBookingMessageAsync()
   │   └─→ BookingService.CreateAsync()
   │
   └─← Bot: "🎉 Booking Confirmation - Booking Ref: CE-2026-001"

3. AUTO-CONFIRMATION (if phone format valid)
   ├─→ BookingService sends email (via EmailService)
   └─→ BookingService sends WhatsApp (via WhatsAppService)
```

## Message Format Guide

### Request Package List
```
User sends any of:
- "packages"
- "tours"
- "list"
- "show"
- "1"
- "2"

Bot responds with formatted package list
```

### Make Booking
```
Format:
[Package Number]
[Full Name]
[Number of People]
[Travel Date - YYYY-MM-DD]

Example:
1
Jane Smith
3
2026-07-15

Valid response = Booking created + Confirmation sent
Invalid response = Package list resent
```

## Data Flow - Booking Creation

```
POST /api/whatsapp/webhook
│
├─ Validate incoming message
├─ Extract: From, To, Body
│
├─ Check if "packages" keyword
│   ├─ YES → Send package list
│   └─ NO → Try parsing as booking
│
├─ Parse booking message
│   ├─ Extract: TourId, Name, Pax, Date
│   └─ Validate format
│
├─ Create booking in database
│   ├─ New Booking record
│   ├─ Calculate total amount
│   └─ Set status = "pending"
│
├─ Send email confirmation
│   └─ Fire and forget (async)
│
├─ Send WhatsApp confirmation
│   ├─ Format message with booking details
│   ├─ Send via Twilio API
│   └─ Fire and forget (async)
│
└─ Return 200 OK
```

## Integration Points

### With BookingService
- Creates booking records
- Calculates prices
- Stores booking reference
- Integrates with existing email system

### With TourService  
- Fetches active packages
- Gets tour prices
- Retrieves tour names

### With Database
- Reads: Tours (packages)
- Writes: Bookings
- No schema changes required

## Error Handling

```
WhatsApp Message → Parse
                  ├─ If parse fails
                  │  └─ Send package list as fallback
                  │
                  ├─ If phone format invalid
                  │  └─ Log error, don't send
                  │
                  ├─ If Twilio request fails
                  │  └─ Log error, retry logic
                  │
                  └─ If booking creation fails
                     └─ Send error message to customer
```

## Rate Limiting

```
Global Rate Limit: 300 req/min (per IP)
WhatsApp webhook: Counted in global limit
Recommendation: Monitor and adjust based on traffic

Example scaling:
- 100 customers/day = ~10 req/min
- 1000 customers/day = ~100 req/min
- 10000 customers/day = ~1000 req/min (upgrade plan)
```

## Deployment Architecture

```
Production Setup
└─ Kumaru Lanka API (Docker)
   ├─ WhatsAppController
   ├─ WhatsAppService
   └─ IHttpClientFactory (for Twilio API calls)
      │
      ├─→ Twilio API (twilio.com)
      │   └─→ WhatsApp Business API
      │       ├─→ Send messages
      │       └─→ Receive webhooks
      │
      ├─→ Database (SQL Server)
      │   └─→ Store bookings
      │
      └─→ Email Service
          └─→ Send confirmation emails
```

## Database Schema (No Changes Required)

The existing `Booking` model supports WhatsApp:
```csharp
public class Booking
{
    public int Id { get; set; }
    public string BookingRef { get; set; }     // ← Used as reference
    public string Phone { get; set; }          // ← WhatsApp number
    public string Message { get; set; }        // ← Can store "via WhatsApp"
    public string Status { get; set; }         // ← pending, confirmed, etc
    public DateTime TravelDate { get; set; }   // ← From WhatsApp message
    public int NumberOfPax { get; set; }       // ← From WhatsApp message
    public decimal TotalAmount { get; set; }   // ← Calculated price
    // ... other fields remain unchanged
}
```

### Optional Enhancements (Future)
```csharp
public string? BookingSource { get; set; } = "website"; // "whatsapp"
public string? WhatsAppMessageSid { get; set; }
public DateTime? WhatsAppConfirmedAt { get; set; }
```

## Testing Checklist

- [ ] Localhost runs without errors
- [ ] WhatsApp service is registered (dependency injection)
- [ ] appsettings.json has WhatsApp config
- [ ] ngrok tunnel is running
- [ ] Twilio webhook URL is configured
- [ ] Test message sends successfully
- [ ] Booking is created in database
- [ ] Confirmation message is received
- [ ] Phone number format is handled correctly
- [ ] Error messages don't expose sensitive data

## Performance Considerations

```
Response Times (estimated):
- Receive message: < 100ms
- Parse message: < 50ms
- Create booking: < 200ms
- Send email: < 1000ms (async)
- Send WhatsApp: < 1000ms (async, fire-and-forget)

Throughput:
- Concurrent messages: Limited by Twilio rate limits
- Database writes: 1000+ bookings/min
- WhatsApp sends: 600+ messages/min (Twilio standard)
```

## Security Considerations

✅ **Implemented:**
- Phone number validation
- Message content validation
- Error logging without sensitive data
- Secure credential storage

⚠️ **To Implement (Future):**
- Twilio webhook signature verification
- Rate limiting per phone number
- Message encryption
- Audit logging
- GDPR compliance (data retention)

## Monitoring & Analytics

```json
Metrics to track:
{
  "total_whatsapp_messages_received": 1234,
  "total_whatsapp_bookings_created": 567,
  "average_response_time_ms": 450,
  "failed_messages": 12,
  "failed_bookings": 3,
  "cost_per_booking": "$0.05"
}
```

For details, see:
- [WHATSAPP_INTEGRATION.md](./WHATSAPP_INTEGRATION.md)
- [WHATSAPP_QUICK_START.md](./WHATSAPP_QUICK_START.md)
