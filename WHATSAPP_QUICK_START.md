# WhatsApp Booking - Quick Setup

## 📋 Checklist

- [ ] Get Twilio Account (free trial available)
- [ ] Enable WhatsApp Sandbox
- [ ] Add credentials to `appsettings.json`
- [ ] Test webhook locally with ngrok
- [ ] Deploy and configure production webhook

## 🚀 Quick Start

### 1. Get Credentials (5 min)
1. Create account: https://www.twilio.com/console
2. Find **Account SID** and **Auth Token** in Dashboard
3. Go to Messaging > WhatsApp > Sandbox
4. Copy sandbox phone number

### 2. Configure Backend (2 min)
```json
// KumaruLanka.API/appsettings.json
"WhatsApp": {
  "TwilioAccountSid": "ACxxxxxxxxxxxxxxxxxxxxxxxxx",
  "TwilioAuthToken": "xxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "TwilioPhoneNumber": "whatsapp:+1415555555"
}
```

### 3. Test Locally (10 min)

**Terminal 1 - Run API:**
```bash
cd KumaruLanka.API
dotnet run
```

**Terminal 2 - Expose with ngrok:**
```bash
ngrok http 5000
```

**Terminal 3 - Set Twilio Webhook:**
- Go to Twilio Console > WhatsApp > Settings
- Webhook URL: `https://YOUR_NGROK_URL/api/whatsapp/webhook`
- Method: `POST`

### 4. Test Messages
```bash
# Send package list
curl "http://localhost:5000/api/whatsapp/packages?phone=%2B1234567890"

# Simulate incoming booking message
curl -X POST http://localhost:5000/api/whatsapp/webhook \
  -d "From=whatsapp:%2B1234567890&To=whatsapp:%2B1415555555&Body=1" \
  -H "Content-Type: application/x-www-form-urlencoded"
```

## 📱 Customer Usage

### Scenario 1: Browse Packages
```
Customer → "Hi, show me packages"
Bot ↙ [Shows all packages with prices]
Customer → "1"
Bot ↙ [Sends confirmation with Booking Ref]
```

### Scenario 2: Direct Booking
```
Customer → "1\nJohn Doe\n2\n2026-06-20"
Bot ↙ [Creates booking automatically + sends confirmation]
```

## 🔧 Code Files

| File | Purpose |
|------|---------|
| `IWhatsAppService.cs` | Interface definition |
| `WhatsAppService.cs` | Twilio integration |
| `WhatsAppController.cs` | API endpoints |
| `BookingService.cs` | Updated to send WhatsApp confirmations |
| `Program.cs` | Service registration |
| `appsettings.json` | Configuration |

## 📊 API Endpoints

```
GET  /api/whatsapp/packages?phone=+1234567890
     → Send package list to customer

POST /api/whatsapp/send-confirmation/{bookingRef}
     → Manually send confirmation message

POST /api/whatsapp/webhook
     → Receive incoming messages from Twilio
```

## 🐛 Debug Tips

### Message not sending?
```csharp
// Check logs in WhatsAppService
// Verify phone format: whatsapp:+1234567890
// Ensure Twilio credentials are correct
```

### Webhook not receiving?
```bash
# Test locally with ngrok
ngrok http 5000
# Copy URL to Twilio Dashboard

# Check in Twilio Console > WhatsApp > Message Logs
```

### Booking not created?
```csharp
// Check WhatsAppController logs
// Verify message format:
// Line 1: Package number
// Line 2: Name
// Line 3: Number of people
// Line 4: Date (YYYY-MM-DD)
```

## 💰 Cost Estimate

| Action | Cost |
|--------|------|
| Outbound message | $0.026 - $0.030 |
| Inbound message | FREE |
| Monthly (2000 bookings) | ~$50-100 |

## 📚 Resources

- [Twilio WhatsApp Docs](https://www.twilio.com/docs/whatsapp)
- [Phone Number Formats](https://www.twilio.com/docs/phone-numbers/phone-number-formats)
- [Full Integration Guide](./WHATSAPP_INTEGRATION.md)

## 🔐 Security Notes

✅ Keep credentials in `appsettings.json` (local only)  
✅ Use environment variables in production  
✅ Don't commit real credentials to git  
✅ Validate webhook signatures (Twilio)  

## 🚢 Production Deployment

### Environment Variables
```bash
# .env or deployment config
WhatsApp__TwilioAccountSid=ACxxxxxxxxxx
WhatsApp__TwilioAuthToken=xxxxxxxxxxxx
WhatsApp__TwilioPhoneNumber=whatsapp:+94701234567
```

### Webhook URL
Update in Twilio Console:
```
https://api.kumarulanka.lk/api/whatsapp/webhook
```

### Rate Limits
Already configured in `Program.cs`:
- General: 300 req/min
- Chat: 20 req/min

## ❓ FAQ

**Q: Can I use WhatsApp without Twilio?**  
A: Yes, but you need business verification. Twilio is easiest option.

**Q: How long does setup take?**  
A: ~30 min for sandbox, ~1-2 weeks for production account.

**Q: What if customer doesn't follow message format?**  
A: Bot sends package list again as fallback.

**Q: Can I send promotional messages?**  
A: Only to opted-in customers. WhatsApp has strict policies.

**Q: How do I track booking source?**  
A: Check `booking.Message = "Booked via WhatsApp"` field.

---

For full details, see [WHATSAPP_INTEGRATION.md](./WHATSAPP_INTEGRATION.md)
