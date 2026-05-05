# WhatsApp Booking Integration Guide

## Overview
This guide enables your Kumaru Lanka users to browse and book tour packages directly through WhatsApp, using Twilio's WhatsApp Business API.

## Features
✅ Users can request package list via WhatsApp  
✅ Automatic package list delivery with pricing  
✅ WhatsApp-based booking with natural language parsing  
✅ Automatic booking confirmation with reference number  
✅ Direct WhatsApp messages to customers  

## Setup Steps

### 1. Create Twilio Account
1. Go to [Twilio Console](https://www.twilio.com/console)
2. Sign up and verify your phone number
3. Create a new project
4. Note your **Account SID** and **Auth Token** (find in Dashboard)

### 2. Enable WhatsApp Sandbox
1. In Twilio Console, go to **Messaging > WhatsApp > Sandbox Settings**
2. Copy your WhatsApp sandbox number (e.g., `whatsapp:+1415555555`)
3. Join the sandbox by sending "join [code]" to the provided number
4. Test the connection works

### 3. Configure Backend

#### Update `appsettings.json`:
```json
{
  "WhatsApp": {
    "TwilioAccountSid": "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "TwilioAuthToken": "your_auth_token_here",
    "TwilioPhoneNumber": "whatsapp:+1415555555"
  }
}
```

#### For Production (Environment Variables):
```bash
WhatsApp__TwilioAccountSid=ACxxxxxxxxxxxxxx
WhatsApp__TwilioAuthToken=your_token
WhatsApp__TwilioPhoneNumber=whatsapp:+1415555555
```

### 4. Configure Twilio Webhook

#### In Twilio Console:
1. Go to **Messaging > WhatsApp > Settings > Webhook URL**
2. Set **When a message comes in**: 
   ```
   https://your-domain.com/api/whatsapp/webhook
   ```
3. Method: **HTTP POST**
4. Save

#### Local Development (Testing):
Use ngrok to expose your local server:
```bash
ngrok http 5000  # or your port
# Then use: https://xxxx-xx-xxx-xxx-xx.ngrok.io/api/whatsapp/webhook
```

## API Endpoints

### 1. Get Package List
**Endpoint:** `GET /api/whatsapp/packages`

**Query Parameters:**
- `phone` (required): Customer's phone number (e.g., `+1234567890`)

**Example:**
```bash
curl "https://your-api.com/api/whatsapp/packages?phone=%2B1234567890"
```

**Response:**
```json
{
  "message": "Package list sent to WhatsApp"
}
```

### 2. Send Booking Confirmation
**Endpoint:** `POST /api/whatsapp/send-confirmation/{bookingRef}`

**Example:**
```bash
curl -X POST "https://your-api.com/api/whatsapp/send-confirmation/CE-2025-001"
```

**Response:**
```json
{
  "message": "Confirmation sent"
}
```

### 3. Receive Webhook (Automatic)
**Endpoint:** `POST /api/whatsapp/webhook`

Twilio automatically sends incoming messages here. The system:
- Parses user requests
- Sends package lists if requested
- Creates bookings automatically
- Sends confirmation messages

## Usage Examples

### Customer Booking Flow

**Step 1:** Customer sends a message to your WhatsApp number
```
Hi, I want to book a tour
```

**Response (Automatic):**
```
🏝️ Kumaru Lanka Tour Packages

Reply with the package number to book:

1. *Sigiriya Cultural Triangle*
   Duration: 3 Days
   Price: LKR 25,000
   Rating: ⭐ 4.8/5

2. *South Coast Beach Tour*
   Duration: 4 Days
   Price: LKR 35,000
   Rating: ⭐ 4.6/5

[... more packages ...]
```

**Step 2:** Customer books
```
1
John Doe
3
2026-06-15
```

**Response (Automatic):**
```
🎉 Booking Confirmation - Kumaru Lanka

Booking Reference: CE-2026-001
Package: Sigiriya Cultural Triangle
Travel Date: 15 Jun 2026
Number of Guests: 3
Total Amount: LKR 75,000

Thank you for booking with us! 🙏
```

## Message Format

For customers to book via WhatsApp, they should send:

```
[Package Number]
[Full Name]
[Number of Guests]
[Travel Date (YYYY-MM-DD)]
[Optional: Additional Details]
```

**Example:**
```
2
Jane Smith
2
2026-07-20
Vegetarian meals needed
```

## Testing

### Test Package List Request
```bash
curl -X GET \
  "http://localhost:5000/api/whatsapp/packages?phone=%2B9471234567" \
  -H "Content-Type: application/x-www-form-urlencoded"
```

### Test Webhook Locally
```bash
curl -X POST http://localhost:5000/api/whatsapp/webhook \
  -d "From=whatsapp:%2B1234567890&To=whatsapp:%2B1415555555&Body=1" \
  -H "Content-Type: application/x-www-form-urlencoded"
```

## Frontend Integration

### React/Next.js Example

```typescript
// Send package list via WhatsApp
const requestWhatsAppPackages = async (phone: string) => {
  const response = await fetch(
    `/api/whatsapp/packages?phone=${encodeURIComponent(phone)}`
  );
  return response.json();
};

// In your UI
<button onClick={() => requestWhatsAppPackages("+1234567890")}>
  📱 Browse Packages on WhatsApp
</button>
```

## Troubleshooting

### Webhook not receiving messages
- Check Twilio webhook URL is correct
- Verify ngrok is running (for local testing)
- Check API logs in Twilio Console
- Ensure `POST` method is selected

### Messages not sending
- Verify WhatsApp credentials in `appsettings.json`
- Check recipient phone number format (must include country code)
- Ensure you've joined the WhatsApp sandbox
- Check Twilio account balance

### Booking not created
- Verify tour ID exists in database
- Check phone number format
- Review API logs for parsing errors

## Production Deployment

### Before Going Live:

1. **Get WhatsApp Business Account:**
   - Move from sandbox to production WhatsApp number
   - Apply for business verification with Twilio
   - This allows more messages and removes sandbox restrictions

2. **Update Configuration:**
   ```
   WhatsApp__TwilioPhoneNumber=whatsapp:+94701234567  # Your actual number
   ```

3. **Increase Rate Limits:**
   - Update `Program.cs` rate limits if needed
   - WhatsApp webhook is high-volume

4. **Enable Message Logging:**
   - Store WhatsApp conversations in database
   - Track booking sources for analytics

5. **Test Thoroughly:**
   - Create test bookings
   - Verify payment integration
   - Test edge cases

## Cost Considerations

**Twilio Pricing (approx):**
- Outbound WhatsApp messages: $0.0263 - $0.0300 per message
- Inbound messages: FREE
- Estimate: ~$50-100/month for 2000 bookings

**Recommendation:** Use WhatsApp for pre-booking inquiries, confirmations, and customer service to reduce operational costs.

## Advanced Features (Future Enhancements)

- [ ] Payment link via WhatsApp (Stripe integration)
- [ ] Itinerary sharing via WhatsApp
- [ ] Real-time booking status updates
- [ ] AI-powered natural language processing for bookings
- [ ] Multi-language support
- [ ] Group bookings with cost splitting
- [ ] Reminder messages before travel date

## Support

For issues with:
- **Twilio Integration:** See [Twilio Docs](https://www.twilio.com/docs/whatsapp)
- **Kumaru Lanka API:** Check logs in `{workspace}/logs/`
- **Booking System:** See [BACKEND_FRONTEND_INTEGRATION.md](./BACKEND_FRONTEND_INTEGRATION.md)

## Database Schema Update (Optional)

To track WhatsApp bookings, consider adding to the `Booking` model:

```csharp
public string? BookingSource { get; set; } = "website"; // "whatsapp", "website", "email"
public string? WhatsAppMessageSid { get; set; }
public DateTime? WhatsAppConfirmedAt { get; set; }
```

Then apply migration:
```bash
dotnet ef migrations add AddWhatsAppFields
dotnet ef database update
```
