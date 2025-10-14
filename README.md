# 🏦 Automated Payments - Casa Ortega

<div align="center">

![GitHub Actions](https://img.shields.io/github/actions/workflow/status/LiReXz/automated-payments/daily.yaml?label=Daily%20Automation&logo=github)
![GitHub Actions](https://img.shields.io/github/actions/workflow/status/LiReXz/automated-payments/on-demand.yaml?label=Manual%20Execution&logo=github)
![Playwright](https://img.shields.io/badge/Playwright-1.40.0-green?logo=playwright)
![TypeScript](https://img.shields.io/badge/TypeScript-5.1.6-blue?logo=typescript)

**Automation system for Casa Ortega deposits with intelligent Telegram notifications**

</div>

---

## 📖 Description

This project automates the deposit process for **Casa Ortega** virtual wallet using Playwright and GitHub Actions. The system intelligently detects transaction results and sends real-time notifications via Telegram.

## 🚀 Workflows

### 🕐 Daily Automation (`daily.yaml`)
- **Execution**: Automatic at **15:00 Spanish time** (Monday to Friday)
- **Respects**: Holidays defined in `holidays.txt`
- **Time zones**: Automatically adjusts for Spanish summer/winter time

### 🎮 Manual Execution (`on-demand.yaml`)
- **Execution**: Manual from GitHub Actions
- **Function**: Testing and on-demand executions

## 📋 Environment Variables (GitHub Secrets)

Configure the following variables in **GitHub Secrets** (`Settings > Secrets and variables > Actions`):

### 🔐 Casa Ortega Credentials
- `USER_EMAIL` - Your Casa Ortega account email
- `USER_PASSWORD` - Account password

### 💳 Card Data
- `CARD_NUMBER` - Card number (no spaces)
- `CARD_EXPIRY` - Expiration date (MM/YY format)
- `CARD_CVV` - Security code

### 📱 Telegram Configuration
- `BOT_TOKEN` - Get from [@BotFather](https://t.me/botfather)
- `CHAT_ID` - Your chat ID (send message to bot, then visit `https://api.telegram.org/bot<TOKEN>/getUpdates`)

## 🔔 Notifications

The system sends intelligent Telegram notifications with different states:

### ✅ Successful Transaction
```
🏦 Automated Payments - DAILY
✅ SUCCESS: 🎉 Casa Ortega automatic deposit completed successfully!
Date: 14/10/2025 15:00
```
**No files sent** - Normal operation

### ❌ Denied Transaction
```
🏦 Automated Payments - MANUAL
❌ TRANSACTION DENIED: 💳 The transaction was denied by the payment processor.
Date: 14/10/2025 15:00
```
**No files sent** - Payment processor rejection (not a technical error)

### ⚠️ Technical Error
```
🏦 Automated Payments - DAILY
❌ TECHNICAL ERROR: ⚠️ Technical error in workflow execution. Review the logs.
Date: 14/10/2025 15:00
📁 Debugging files attached
```
**Files included** - For technical troubleshooting only

## 📁 File Delivery

**Files are only sent for technical errors or unknown status** - not for successful or denied transactions.

- **Automatic ZIP compression** of screenshots, reports, and logs
- **Direct delivery** via Telegram (no GitHub artifacts)
- **Size optimization** for files larger than 50MB

## 🔒 Security

- **GitHub Secrets** for all sensitive information with automatic masking
- **Value masking** in logs to prevent credential exposure
- **No token exposure** in URLs or logs
- **Selective file delivery** only for technical debugging
- All sensitive data automatically filtered in GitHub Actions logs

## 📁 Project Structure

```
automated-payments/
├── .github/workflows/
│   ├── daily.yaml          # Daily automation
│   └── on-demand.yaml      # Manual execution
├── scripts/
│   └── deposit-wallet.spec.ts
├── holidays.txt            # Holiday management
└── playwright.config.ts
```

## 🛠️ Quick Setup

1. **Clone**: `git clone https://github.com/LiReXz/automated-payments.git`
2. **Configure**: Add all environment variables to GitHub Secrets
3. **Test**: Use manual execution workflow for testing
4. **Schedule**: Daily workflow runs automatically

---

<div align="center">

**⚠️ For personal and educational use only. Use responsibly.**

</div>
