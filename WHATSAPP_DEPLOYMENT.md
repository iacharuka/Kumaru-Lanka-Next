# WhatsApp Integration - Deployment Checklist

## Pre-Deployment ✅

### Backend Setup
- [ ] Created `IWhatsAppService.cs`
- [ ] Created `WhatsAppService.cs`
- [ ] Created `WhatsAppController.cs`
- [ ] Updated `BookingService.cs` with WhatsApp integration
- [ ] Updated `Program.cs` with service registration
- [ ] Added WhatsApp config to `appsettings.json`
- [ ] Compiled code successfully (`dotnet build`)
- [ ] No compilation errors or warnings

### Configuration
- [ ] Get Twilio Account SID from https://www.twilio.com/console
- [ ] Get Twilio Auth Token
- [ ] Created WhatsApp Sandbox in Twilio
- [ ] Have WhatsApp sandbox phone number (e.g., `whatsapp:+1415555555`)
- [ ] Updated all credentials in `appsettings.json`
- [ ] Created `.env` file for sensitive credentials (dev only)
- [ ] Added environment variables for production

### Local Testing
- [ ] Installed ngrok (for webhook testing)
- [ ] API runs locally: `dotnet run`
- [ ] ngrok tunnel active: `ngrok http 5000`
- [ ] Webhook URL configured in Twilio Console
- [ ] Test message sent successfully
- [ ] Booking created in database
- [ ] Confirmation message received
- [ ] Phone number formatting works for multiple formats

### Database
- [ ] Database connection string verified
- [ ] Tours table has active packages
- [ ] Bookings table ready
- [ ] No migrations needed (schema unchanged)

## Staging Deployment 🚀

### Infrastructure
- [ ] Staging server configured
- [ ] SQL Server instance available
- [ ] Staging database prepared
- [ ] Database backups enabled
- [ ] Logging configured

### Application Deployment
- [ ] Backend deployed to staging
- [ ] Environment variables set correctly
- [ ] Application starts without errors
- [ ] Health check endpoint working
- [ ] Logs accessible and monitored

### WhatsApp Configuration - Staging
- [ ] Twilio webhook URL updated (staging domain)
- [ ] Staging webhook URL is: `https://staging-api.kumarulanka.lk/api/whatsapp/webhook`
- [ ] Twilio credentials match staging environment
- [ ] Test messages work from staging

### Testing - Staging
- [ ] Send test message: "packages"
- [ ] Receive package list
- [ ] Make test booking via WhatsApp
- [ ] Booking appears in database
- [ ] Confirmation message received
- [ ] Email confirmation sent
- [ ] Booking reference format: `CE-YYYY-###`

### Monitoring - Staging
- [ ] Application monitoring enabled (e.g., Application Insights)
- [ ] Error logging configured
- [ ] WhatsApp webhook logs accessible
- [ ] Performance metrics being tracked
- [ ] Alerts configured for failures

## Frontend Integration (Next.js) 🎨

- [ ] Created WhatsAppBrowseButton component
- [ ] Created WhatsAppLink component
- [ ] Created PackageWithWhatsApp component
- [ ] Created WhatsAppBookingWidget component
- [ ] Added WhatsApp button to packages page
- [ ] Added WhatsApp button to booking page
- [ ] Environment variables configured
- [ ] Analytics events tracking WhatsApp clicks
- [ ] Mobile responsiveness tested
- [ ] Styling matches brand

## Documentation ✍️

- [ ] WHATSAPP_INTEGRATION.md created (full setup guide)
- [ ] WHATSAPP_QUICK_START.md created (5-min setup)
- [ ] WHATSAPP_ARCHITECTURE.md created (system design)
- [ ] WHATSAPP_FRONTEND.md created (UI components)
- [ ] README.md updated with WhatsApp info
- [ ] API documentation updated
- [ ] Code comments added to services
- [ ] Error handling documented

## Production Deployment 🌍

### Pre-Production Review
- [ ] Code review completed
- [ ] Security audit passed
- [ ] Performance testing done
- [ ] Load testing passed (target: 1000 req/min)
- [ ] Error handling tested
- [ ] Edge cases handled

### Twilio Upgrade (Sandbox → Production)
- [ ] Applied for WhatsApp Business Account with Twilio
- [ ] Business verification completed
- [ ] Production phone number approved
- [ ] Production credentials obtained
- [ ] Credentials rotated and stored securely

### Production Configuration
- [ ] Production WhatsApp phone number in `appsettings.json`
- [ ] Production Twilio Account SID set
- [ ] Production Twilio Auth Token set
- [ ] Environment variables verified
- [ ] Database backup scheduled

### Production Webhook Setup
- [ ] Twilio webhook URL: `https://api.kumarulanka.lk/api/whatsapp/webhook`
- [ ] Webhook tested and verified
- [ ] SSL certificate valid
- [ ] Webhook signature validation implemented (optional but recommended)

### Production API Deployment
- [ ] Code deployed to production
- [ ] Database migrations run (if any)
- [ ] Services verified running
- [ ] Health check passing
- [ ] Monitoring enabled

### Production Testing
- [ ] Send live test booking via WhatsApp
- [ ] Verify booking in production database
- [ ] Confirm WhatsApp message received
- [ ] Confirm email notification sent
- [ ] Test with different phone formats

### Production Monitoring
- [ ] Application Insights/logging active
- [ ] WhatsApp webhook logs monitored
- [ ] Error alerts configured
- [ ] Performance alerts configured
- [ ] Database performance monitored
- [ ] API rate limits monitored

### Rate Limiting
- [ ] Global rate limit: 300 req/min ✅
- [ ] Monitor Twilio webhook throughput
- [ ] Prepare for scaling if needed
- [ ] Have escalation procedure ready

## Rollback Plan 🔄

- [ ] Keep previous API version available
- [ ] Database backup created before deployment
- [ ] Rollback procedure documented
- [ ] Team trained on rollback process
- [ ] Time estimate for rollback: ~15 mins

### If Issues Occur
1. Stop WhatsApp service (disable webhook URL in Twilio)
2. Investigate logs
3. Rollback to previous version if needed
4. Communicate status to customers
5. Test fixes in staging
6. Redeploy when fixed

## Post-Deployment 📊

### Day 1 (Launch Day)
- [ ] Monitor logs continuously
- [ ] Watch error rates
- [ ] Monitor Twilio costs
- [ ] Send test message every hour
- [ ] Have team on standby

### Week 1
- [ ] Monitor booking creation rate
- [ ] Track customer feedback
- [ ] Check message delivery rate
- [ ] Monitor API response times
- [ ] Review error logs daily

### Week 2-4
- [ ] Analyze booking source distribution
- [ ] Calculate ROI/cost-per-booking
- [ ] Gather customer feedback
- [ ] Optimize message templates if needed
- [ ] Plan for next iteration

### Monthly (Ongoing)
- [ ] Review WhatsApp integration metrics
- [ ] Update documentation based on learnings
- [ ] Optimize performance if needed
- [ ] Plan new features
- [ ] Audit security

## Cost Management 💰

- [ ] Twilio account billing set up
- [ ] Cost limit alerts configured
- [ ] Monthly budget: ~$50-100 (estimated)
- [ ] Actual cost tracking spreadsheet
- [ ] ROI calculator for WhatsApp bookings

### Cost Reduction Ideas
- [ ] Use template messages (cheaper)
- [ ] Batch messages when possible
- [ ] Monitor for spam/abuse
- [ ] Set budget alerts

## Scaling Plan 📈

### Current Capacity
- Database: 10,000+ concurrent bookings/day ✅
- API: 300 req/min ✅
- WhatsApp: 600 messages/min (Twilio limit) ✅

### If Exceeding Capacity
- [ ] Upgrade Twilio to higher tier
- [ ] Increase API rate limits
- [ ] Add database read replicas
- [ ] Implement message queue (Redis)
- [ ] Scale horizontally

## Support & Troubleshooting

### Common Issues
1. **Webhook not receiving messages**
   - Check webhook URL in Twilio Console
   - Verify ngrok/domain is accessible
   - Check firewall rules

2. **Messages not sending**
   - Verify credentials in appsettings.json
   - Check phone number format
   - Verify Twilio account has balance

3. **Booking not creating**
   - Check message format
   - Review API logs
   - Verify database connection

### Support Contacts
- Twilio Support: https://support.twilio.com
- Kumaru Lanka Dev Team: [your-team-email]
- On-call: [on-call-phone]

## Final Checklist ✅

- [ ] All code committed to git
- [ ] All tests passing
- [ ] Documentation complete and reviewed
- [ ] Credentials stored securely
- [ ] Backup plans in place
- [ ] Team trained
- [ ] Monitoring configured
- [ ] Ready for production! 🚀

---

**Deployment Date:** _______________

**Deployed By:** _______________

**Reviewed By:** _______________

**Notes:**
