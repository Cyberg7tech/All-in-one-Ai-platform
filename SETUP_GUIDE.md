# Setup Guide for Supabase Auth Sync, Payments, and Email System

## 🚀 Features Implemented

1. **Supabase Auth Sync** - Automatic synchronization between auth.users and public.users
2. **Stripe Payment Integration** - Complete payment processing with webhooks
3. **LemonSqueezy Payment Integration** - Alternative payment provider
4. **Email System with Resend** - Professional email sending and management

## 📋 Prerequisites

- Supabase project with database access
- Stripe account (for payments)
- LemonSqueezy account (optional, for alternative payments)
- Resend account (for emails)

## 🗄️ Database Setup

### 1. Run the Auth Sync Script

In your Supabase SQL Editor, run:

```sql
-- Run this first to set up auth triggers
\i supabase/auth-sync.sql
```

### 2. Update Users Table

Run the subscription fields update:

```sql
-- Add subscription fields to users table
\i supabase/update-users-table.sql
```

## 🔧 Environment Variables

Add these to your `.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret

# LemonSqueezy Configuration (Optional)
LEMON_SQUEEZY_API_KEY=your_lemonsqueezy_api_key
LEMON_SQUEEZY_BASE_URL=https://your-store.lemonsqueezy.com
LEMON_SQUEEZY_STORE_ID=your_store_id
LEMON_SQUEEZY_WEBHOOK_SECRET=your_lemonsqueezy_webhook_secret

# Resend Configuration
RESEND_API_KEY=re_your_resend_api_key
```

## 🔗 Webhook Setup

### Stripe Webhooks

1. Go to your Stripe Dashboard → Webhooks
2. Add endpoint: `https://yourdomain.com/api/payments/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the webhook secret to your `.env` file

### LemonSqueezy Webhooks

1. Go to your LemonSqueezy Dashboard → Webhooks
2. Add endpoint: `https://yourdomain.com/api/payments/lemonsqueezy/webhook`
3. Select events:
   - `order_created`
   - `subscription_created`
   - `subscription_updated`
   - `subscription_cancelled`
   - `invoice_paid`
   - `invoice_payment_failed`
4. Copy the webhook secret to your `.env` file

## 🎯 Usage

### Payment Management

Access the billing dashboard at `/dashboard/billing` to:

- View current subscription status
- Choose between Stripe and LemonSqueezy
- Subscribe to different plans
- Cancel subscriptions
- View billing history

### Email Management

Access the email dashboard at `/dashboard/emails` to:

- Compose and send emails
- Use email templates
- View email history
- Manage email campaigns

### API Endpoints

#### Payments

- `POST /api/payments/stripe` - Create Stripe checkout session
- `POST /api/payments/lemonsqueezy` - Create LemonSqueezy checkout session
- `GET /api/subscription/plans` - Get available subscription plans
- `GET /api/subscription/user` - Get user subscription info
- `POST /api/subscription/cancel` - Cancel subscription

#### Emails

- `POST /api/emails/send` - Send email via Resend
- `GET /api/emails/history` - Get email history

## 🔒 Security Features

- **Row Level Security (RLS)** - All database operations are secured
- **Webhook Signature Verification** - Ensures webhook authenticity
- **User Authentication** - All API routes require authentication
- **Environment Variable Protection** - Sensitive keys are properly secured

## 📊 Database Schema

### Users Table (Extended)

```sql
-- Added subscription fields
subscription_status TEXT DEFAULT 'inactive'
subscription_id TEXT
subscription_provider TEXT DEFAULT 'stripe'
subscription_plan TEXT
subscription_start_date TIMESTAMP WITH TIME ZONE
subscription_end_date TIMESTAMP WITH TIME ZONE
billing_email TEXT
payment_method TEXT
```

### Subscription Plans Table

```sql
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10, 2) NOT NULL,
    price_yearly DECIMAL(10, 2) NOT NULL,
    stripe_price_id_monthly TEXT,
    stripe_price_id_yearly TEXT,
    lemonsqueezy_variant_id_monthly TEXT,
    lemonsqueezy_variant_id_yearly TEXT,
    features JSONB DEFAULT '[]',
    limits JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🚨 Troubleshooting

### Common Issues

1. **Auth Sync Not Working**
   - Check if triggers are created: `SELECT * FROM information_schema.triggers WHERE trigger_name LIKE '%auth%';`
   - Verify permissions: `GRANT USAGE ON SCHEMA auth TO postgres, anon, authenticated, service_role;`

2. **Webhook Failures**
   - Check webhook signatures in logs
   - Verify webhook URLs are accessible
   - Ensure environment variables are set correctly

3. **Payment Processing Errors**
   - Verify API keys are correct
   - Check Stripe/LemonSqueezy dashboard for errors
   - Ensure webhook endpoints are properly configured

4. **Email Sending Issues**
   - Verify Resend API key
   - Check domain verification in Resend dashboard
   - Review email content for compliance

### Debug Commands

```sql
-- Check auth triggers
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public';

-- Check user subscription status
SELECT id, email, subscription_status, subscription_plan
FROM users
WHERE id = auth.uid();

-- Check recent activities
SELECT * FROM activities
WHERE user_id = auth.uid()
ORDER BY timestamp DESC
LIMIT 10;
```

## 📈 Next Steps

1. **Customize Plans** - Update subscription plans in the database
2. **Branding** - Customize email templates and payment pages
3. **Analytics** - Add usage tracking and analytics
4. **Testing** - Test all payment flows in development
5. **Deployment** - Deploy to production with proper environment variables

## 🆘 Support

For issues or questions:

1. Check the troubleshooting section above
2. Review Supabase, Stripe, and Resend documentation
3. Check application logs for detailed error messages
4. Verify all environment variables are correctly set
