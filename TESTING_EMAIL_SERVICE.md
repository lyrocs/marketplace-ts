# Email Service Testing Guide

This guide provides comprehensive instructions for testing the password reset email functionality in marketplace-ts.

## Prerequisites

Before testing, ensure you have:

1. **Backend running** with environment variables configured
2. **Frontend running** on configured FRONTEND_URL
3. **Email provider configured** (Resend or SMTP)
4. **Test user account** in the database

---

## Environment Setup

The marketplace-ts email service supports two providers:

- **Resend** (Recommended) - Modern API-based email service, simpler setup
- **SMTP** (Traditional) - Works with any SMTP provider (Gmail, SendGrid, etc.)

### Option A: Resend Setup (Recommended)

**Why Resend?**
- ✅ Simple API key setup (no SMTP configuration)
- ✅ Better deliverability than personal Gmail
- ✅ Free tier: 100 emails/day, 3,000/month
- ✅ No need for app passwords or 2FA
- ✅ Better for production use

**Setup Steps:**

1. **Sign up for Resend**
   - Go to: https://resend.com/
   - Create a free account
   - Verify your email

2. **Get API Key**
   - Go to: https://resend.com/api-keys
   - Click "Create API Key"
   - Give it a name (e.g., "Marketplace Development")
   - Copy the API key (starts with `re_`)

3. **Add to `.env`**
   ```bash
   # Email Provider Configuration
   EMAIL_PROVIDER=resend
   EMAIL_FROM=onboarding@resend.dev  # Use this for testing

   # Resend API Key
   RESEND_API_KEY=re_your_api_key_here

   # Frontend URL (where reset links will point)
   FRONTEND_URL=http://localhost:3000
   ```

4. **For Production (Custom Domain)**
   - Add and verify your domain in Resend dashboard
   - Update `EMAIL_FROM` to use your domain:
   ```bash
   EMAIL_FROM=noreply@yourdomain.com
   ```

**That's it!** Resend is ready to use. No SMTP configuration needed.

---

### Option B: SMTP Setup (Traditional)

If you prefer using SMTP or have existing SMTP credentials:

```bash
# Email Provider Configuration
EMAIL_PROVIDER=smtp
EMAIL_FROM=noreply@marketplace.com

# Frontend URL
FRONTEND_URL=http://localhost:3000

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@marketplace.com
```

### 1. Configure SMTP Settings (If using SMTP)

Add these to your `.env` file in the project root:

```bash
# Gmail Example (Recommended for testing)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@marketplace.com

# Frontend URL (where reset links will point)
FRONTEND_URL=http://localhost:3000
```

### 2. Get Gmail App Password

If using Gmail for testing:

1. Enable 2-Factor Authentication on your Google Account
2. Go to: https://myaccount.google.com/apppasswords
3. Generate an "App Password" for "Mail"
4. Use the 16-character password in `SMTP_PASS`

### 3. Alternative SMTP Providers

**SendGrid:**
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

**Mailgun:**
```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASS=your-mailgun-smtp-password
```

**AWS SES:**
```bash
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-aws-ses-username
SMTP_PASS=your-aws-ses-password
```

---

## Testing Procedure

### Test 1: Complete Password Reset Flow (Happy Path)

**Steps:**

1. **Start Services**
   ```bash
   # Terminal 1 - Backend
   cd apps/back
   pnpm dev

   # Terminal 2 - Frontend
   cd apps/web
   pnpm dev
   ```

   **Check backend startup logs:**
   - For Resend: `✓ Resend email provider initialized`
   - For SMTP: `✓ SMTP email provider initialized`

2. **Navigate to Forgot Password**
   - Open browser: http://localhost:3000/forgot-password
   - Enter a valid user email address
   - Click "Send Reset Link"

3. **Verify Backend Logs**
   - Check backend terminal for:

   **Resend:**
   ```
   ✓ Password reset email sent via Resend to: user@example.com
   ```

   **SMTP:**
   ```
   ✓ Password reset email sent via SMTP to: user@example.com
   ```

4. **Check Email Inbox**
   - Open the email inbox for the user
   - Look for email with subject: "Password Reset Request"
   - Verify email contains:
     - User's name
     - Reset button
     - Plain text reset URL
     - Expiry warning (1 hour)
     - Security tips

5. **Click Reset Link**
   - Click the "Reset Password" button in email
   - OR copy/paste the plain URL
   - Should redirect to: http://localhost:3000/reset-password/[token]

6. **Submit New Password**
   - Enter new password (min 8 characters)
   - Enter same password in "Confirm" field
   - Click "Update Password"

7. **Verify Success**
   - Should see success message: "Password Updated"
   - Click "Sign In Now"
   - Should redirect to login page

8. **Test New Password**
   - Login with email and NEW password
   - Should successfully authenticate

**Expected Results:**
- ✅ Email received within seconds
- ✅ Reset link works
- ✅ Password updated successfully
- ✅ Can login with new password
- ✅ Cannot login with old password

---

### Test 2: Email Enumeration Prevention

**Purpose:** Verify that the API doesn't reveal whether an email exists in the database.

**Steps:**

1. Navigate to: http://localhost:3000/forgot-password
2. Enter a **non-existent email**: `nonexistent@example.com`
3. Click "Send Reset Link"

**Expected Results:**
- ✅ Shows success message: "Check your email"
- ✅ No email actually sent
- ✅ Backend logs show: no error, silent skip
- ✅ Same response as valid email (security)

---

### Test 3: Token Expiration

**Purpose:** Verify tokens expire after 1 hour.

**Steps:**

1. Request password reset for valid user
2. Get the token from email URL: `.../reset-password/[THIS-IS-THE-TOKEN]`
3. Wait 1 hour (or manually expire in database for faster testing)
4. Try to use the token

**Expected Results:**
- ✅ Shows error: "Invalid or expired reset token"
- ✅ Cannot reset password
- ✅ User must request new reset link

**Fast Testing (Database Method):**
```sql
-- Manually expire a token for immediate testing
UPDATE password_reset_tokens
SET expires_at = NOW() - INTERVAL '1 hour'
WHERE token = 'your-token-here';
```

---

### Test 4: Token Single-Use Protection

**Purpose:** Verify tokens can only be used once.

**Steps:**

1. Request password reset
2. Click reset link and set new password
3. **Try to use the same link again**
4. Click the same reset link from email

**Expected Results:**
- ✅ First use: Success
- ✅ Second use: Error "Invalid or expired reset token"
- ✅ Token marked as `used_at` in database

---

### Test 5: Password Validation

**Purpose:** Test frontend and backend validation.

**Test Cases:**

| Test Case | Password | Confirm Password | Expected Result |
|-----------|----------|------------------|-----------------|
| Too short | `abc123` | `abc123` | ❌ Error: "Password must be at least 8 characters" |
| Mismatch | `password123` | `password456` | ❌ Error: "Passwords do not match" |
| Valid | `MySecure123!` | `MySecure123!` | ✅ Success |
| Empty | `` | `` | ❌ Browser validation error |

---

### Test 6: Email Template Rendering

**Purpose:** Verify email looks professional and renders correctly.

**Checklist:**

Open the received email and verify:

- [ ] Header shows "Marketplace" branding
- [ ] Greeting includes user's name: "Hello [Name]"
- [ ] Blue "Reset Password" button is visible
- [ ] Button links to correct URL with token
- [ ] Plain text URL is displayed below button
- [ ] Warning box shows expiry time: "1 hour"
- [ ] Security tips section is present
- [ ] Footer shows current year
- [ ] No HTML/styling issues
- [ ] Responsive on mobile (if checking mobile inbox)

---

### Test 7: Email Provider Connection Issues

**Purpose:** Verify graceful handling of email failures.

**For Resend:**

1. **Temporarily break Resend config** (invalid API key)
   ```bash
   RESEND_API_KEY=re_invalid_key_12345
   ```

2. Restart backend
3. Request password reset

**Expected Results:**
- ✅ Backend logs error: "Failed to send password reset email via Resend"
- ✅ Frontend still shows success (security - no enumeration)
- ✅ User doesn't see error message
- ✅ App doesn't crash

4. **Fix Resend config** and test again

**For SMTP:**

1. **Temporarily break SMTP config** (wrong password)
   ```bash
   SMTP_PASS=wrong-password
   ```

2. Restart backend
3. Request password reset

**Expected Results:**
- ✅ Backend logs error: "Failed to send password reset email via SMTP"
- ✅ Frontend still shows success (security - no enumeration)
- ✅ User doesn't see error message
- ✅ App doesn't crash

4. **Fix SMTP config** and test again

---

### Test 8: Concurrent Reset Requests

**Purpose:** Test multiple reset requests for same user.

**Steps:**

1. Request reset for user A → generates token1
2. Request reset again for user A → generates token2
3. Both tokens should be in database
4. Both tokens should work independently
5. Each can only be used once

**Expected Results:**
- ✅ Both tokens valid until expiry
- ✅ Using token1 doesn't invalidate token2
- ✅ Latest email contains latest token
- ✅ User can use any valid, unused token

---

### Test 9: GraphQL API Direct Testing

**Purpose:** Test GraphQL mutations directly.

**Setup:** Open GraphQL Playground at http://localhost:3001/graphql

**Mutation 1: Request Reset**
```graphql
mutation {
  requestPasswordReset(email: "test@example.com") {
    success
  }
}
```

**Expected:** Returns `{ success: true }` and sends email

**Mutation 2: Reset Password**
```graphql
mutation {
  resetPassword(
    token: "your-token-from-email"
    password: "NewPassword123!"
  ) {
    success
  }
}
```

**Expected:** Returns `{ success: true }` and updates password

**Mutation 3: Invalid Token**
```graphql
mutation {
  resetPassword(
    token: "invalid-token-12345"
    password: "NewPassword123!"
  ) {
    success
  }
}
```

**Expected:** Returns GraphQL error

---

## Troubleshooting

### Problem: No Email Received

**First, check which provider you're using:**
```bash
echo $EMAIL_PROVIDER  # Should show 'resend' or 'smtp'
```

**For Resend:**

1. **API Key correct?**
   ```bash
   echo $RESEND_API_KEY  # Should start with 're_'
   ```

2. **Check Resend Dashboard**
   - Go to: https://resend.com/emails
   - View email send history
   - Check for errors or bounces

3. **Email domain verified?**
   - For production domains, verify ownership in Resend dashboard
   - For testing, use `onboarding@resend.dev`

4. **Rate limits reached?**
   - Free tier: 100/day, 3,000/month
   - Check usage in Resend dashboard

**For SMTP:**

1. **SMTP credentials correct?**
   ```bash
   # View current env vars
   echo $SMTP_HOST
   echo $SMTP_USER
   ```

2. **Email in spam folder?**
   - Check junk/spam folder
   - Add sender to safe list

3. **SMTP port blocked?**
   - Try port 465 instead of 587
   - Check firewall settings

4. **Gmail "Less secure app" access?**
   - Use App Password instead
   - Enable 2FA first

**For Both Providers:**

1. **Backend logs show error?**
   - Look for "Failed to send password reset email"
   - Check error details

2. **Backend started correctly?**
   - Should see initialization message:
   - `✓ Resend email provider initialized` or
   - `✓ SMTP email provider initialized`

### Problem: Want to Switch Email Providers

**To switch from SMTP to Resend:**

1. Update `.env`:
   ```bash
   EMAIL_PROVIDER=resend
   RESEND_API_KEY=re_your_api_key
   EMAIL_FROM=onboarding@resend.dev
   ```

2. Restart backend
3. Verify logs show: `✓ Resend email provider initialized`

**To switch from Resend to SMTP:**

1. Update `.env`:
   ```bash
   EMAIL_PROVIDER=smtp
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   SMTP_FROM=noreply@marketplace.com
   ```

2. Restart backend
3. Verify logs show: `✓ SMTP email provider initialized`

### Problem: Reset Link Doesn't Work

**Check:**

1. **Token in URL matches database?**
   ```sql
   SELECT * FROM password_reset_tokens
   WHERE token = 'token-from-url';
   ```

2. **Token expired?**
   - Check `expires_at` column
   - Should be future timestamp

3. **Token already used?**
   - Check `used_at` column
   - Should be NULL if not used

4. **FRONTEND_URL correct?**
   - Links use FRONTEND_URL from env
   - Should match where frontend runs

### Problem: GraphQL Errors

**Check:**

1. **Backend running?** - Should be on port 3001
2. **Database connected?** - Check Prisma connection
3. **User exists?** - Verify email in database
4. **Schema generated?** - Run `pnpm prisma generate`

---

## Database Verification

### Check Token Creation

```sql
-- View all reset tokens
SELECT
  prt.token,
  prt.expires_at,
  prt.used_at,
  prt.created_at,
  u.email,
  u.name
FROM password_reset_tokens prt
JOIN users u ON u.id = prt.user_id
ORDER BY prt.created_at DESC;
```

### Check Password Changed

```sql
-- Verify password hash updated (won't show actual password)
SELECT id, email, name, updated_at
FROM users
WHERE email = 'test@example.com';
```

### Clean Up Test Tokens

```sql
-- Delete old/expired tokens
DELETE FROM password_reset_tokens
WHERE expires_at < NOW() OR used_at IS NOT NULL;
```

---

## Performance Testing

### Load Test: Concurrent Requests

Use this script to test multiple simultaneous password reset requests:

```bash
#!/bin/bash
# test-concurrent-resets.sh

for i in {1..10}; do
  curl -X POST http://localhost:3001/graphql \
    -H "Content-Type: application/json" \
    -d '{
      "query": "mutation { requestPasswordReset(email: \"test@example.com\") { success } }"
    }' &
done
wait
```

**Expected:**
- All requests succeed
- All emails sent
- No database deadlocks
- Response time < 2 seconds

---

## Success Criteria Checklist

After testing, verify:

- [ ] Password reset email sent within 5 seconds
- [ ] Email contains working reset link with token
- [ ] Link opens frontend reset page
- [ ] User can set new password
- [ ] Token becomes invalid after use
- [ ] Expired tokens show error
- [ ] Email errors logged but don't expose to user
- [ ] Email enumeration prevented (always returns success)
- [ ] Can login with new password
- [ ] Cannot login with old password
- [ ] Email template looks professional
- [ ] Works on mobile email clients
- [ ] No console errors in frontend
- [ ] No uncaught errors in backend

---

## Next Steps After Testing

Once all tests pass:

1. **Update .env.example** - Done ✅
2. **Document for team** - Share this guide
3. **Set up production SMTP** - Use production email service
4. **Configure monitoring** - Track email delivery rates
5. **Consider enhancements:**
   - Email templates for multiple languages
   - Welcome emails on registration
   - Email verification on signup
   - Deal notification emails
   - Email queue with retry logic (Bull/BullMQ)

---

## Email Template Customization

To customize the email template, edit:
```
apps/back/src/templates/emails/password-reset.hbs
```

Changes you can make:
- Colors (currently using indigo: #4F46E5)
- Logo/branding
- Text content
- Layout
- Additional warnings or tips

After editing, restart backend to see changes.

---

## Production Recommendations

### Recommended: Use Resend for Production

**Why Resend?**
- ✅ Built for modern applications
- ✅ Automatic SPF/DKIM/DMARC setup
- ✅ 99.9% delivery rate
- ✅ Built-in monitoring dashboard
- ✅ Webhook support for events
- ✅ Better deliverability than SMTP
- ✅ Generous free tier: 3,000 emails/month
- ✅ Simple pricing: $20/month for 50K emails

**Production Setup:**

1. **Verify your domain**
   - Add your domain in Resend dashboard
   - Add DNS records (TXT, MX, CNAME)
   - Verify domain ownership

2. **Update environment variables**
   ```bash
   EMAIL_PROVIDER=resend
   RESEND_API_KEY=re_your_production_key
   EMAIL_FROM=noreply@yourdomain.com
   ```

3. **Set up webhooks** (optional)
   - Track email opens, clicks, bounces
   - Configure in Resend dashboard
   - Point to: https://yourdomain.com/api/webhooks/email

4. **Monitor email analytics**
   - View real-time stats in Resend dashboard
   - Track delivery, open, click rates
   - Monitor bounce rates

### Alternative: SMTP for Production

If you prefer SMTP or have existing infrastructure:

1. **Use dedicated email service**
   - SendGrid, Mailgun, AWS SES recommended
   - Better deliverability than Gmail
   - Better monitoring and analytics

2. **Set up SPF/DKIM/DMARC**
   - Prevents emails going to spam
   - Improves sender reputation

3. **Use custom domain**
   - e.g., noreply@yourdomain.com
   - Looks more professional

4. **Enable TLS in production**
   ```typescript
   tls: {
     rejectUnauthorized: true, // Set to true in production
   }
   ```

5. **Set up email monitoring**
   - Track delivery rates
   - Monitor bounce rates
   - Alert on failures

### Both Providers

1. **Rate limiting**
   - Already implemented in auth service
   - Prevents abuse of password reset

2. **Use environment-specific API keys**
   - Separate keys for dev/staging/production
   - Easier to rotate and monitor

---

## Support

If you encounter issues:

1. Check backend logs for detailed error messages
2. Verify environment variables are loaded correctly
3. Test SMTP credentials manually (via mail client)
4. Review this testing guide again
5. Check GitHub issues for similar problems

---

**Testing completed on:** [DATE]
**Tested by:** [NAME]
**Status:** [ ] PASS / [ ] FAIL
**Notes:**
