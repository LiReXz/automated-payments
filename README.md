# 🏦 Automated Payments

<div align="center">

![GitHub Actions](https://img.shields.io/github/actions/workflow/status/LiReXz/automated-payments/daily.yaml?label=Daily%20Automation&logo=github)
![GitHub Actions](https://img.shields.io/github/actions/workflow/status/LiReXz/automated-payments/on-demand.yaml?label=Manual%20Execution&logo=github)
![Playwright](https://img.shields.io/badge/Playwright-1.40.0-green?logo=playwright)
![TypeScript](https://img.shields.io/badge/TypeScript-5.1.6-blue?logo=typescript)

**Multi-process automation system with configurable scripts and intelligent Telegram notifications**

</div>

---

## 📖 Description

This project automates deposit processes for multiple services using Playwright and GitHub Actions. The system intelligently detects transaction results and sends real-time notifications via Telegram.

### 🎯 Supported Services
- **Casa Ortega** - Virtual wallet deposits
- **Huerta a Casa** - Virtual wallet deposits

Scripts are configured via `choose-script.json` and can be enabled/disabled individually.

## ⚙️ Script Configuration

Scripts are configured via `choose-script.json`:

```json
{
  "scripts": {
    "casaortega": {
      "enabled": true,
      "path": "scripts/casaortega.spec.ts",
      "name": "CASA ORTEGA"
    },
    "huertaacasa": {
      "enabled": true,
      "path": "scripts/huertaacasa.spec.ts",
      "name": "HUERTA A CASA"
    }
  }
}
```

**To enable/disable a script**: Change `"enabled"` to `true` or `false`

## 🚀 Workflows

### 🕐 Daily Automation (`daily.yaml`)
- **Execution**: Automatic at **15:00 Spanish time** (Monday to Friday)
- **Respects**: Holidays defined in `holidays.txt`
- **Time zones**: Automatically adjusts for Spanish summer/winter time
- **Runs**: All enabled scripts in `choose-script.json`

### 🎮 Manual Execution (`on-demand.yaml`)
- **Execution**: Manual from GitHub Actions
- **Function**: Testing and on-demand executions
- **Runs**: All enabled scripts in `choose-script.json`

## 📋 Environment Variables (GitHub Secrets)

Configure the following variables in **GitHub Secrets** (`Settings > Secrets and variables > Actions`):

### 🔐 Account Credentials
- `USER_EMAIL` - Account email
- `USER_PASSWORD` - Account password

### 💳 Card Data
- `CARD_NUMBER` - Card number (no spaces)
- `CARD_EXPIRY` - Expiration date (MM/YY format)
- `CARD_CVV` - Security code

### 📱 Telegram Configuration
- `BOT_TOKEN` - Get from [@BotFather](https://t.me/botfather)
- `CHAT_ID` - Your chat ID (send message to bot, then visit `https://api.telegram.org/bot<TOKEN>/getUpdates`)

## 🔔 Notifications

The system sends individual Telegram notifications for each enabled script:

### ✅ Successful Transaction
```
🏦 CASA ORTEGA - DAILY
✅ SUCCESS
Transaction completed successfully
🕐 2025-11-21 15:00:00 CET
```
**No files sent** - Normal operation

### ❌ Denied Transaction
```
� HUERTA A CASA - ON DEMAND
❌ DENIED
Transaction was denied by the bank
🕐 2025-11-21 15:00:00 CET
```
**No files sent** - Payment processor rejection (not a technical error)

### ⚠️ Technical Error
```
🏦 CASA ORTEGA - DAILY
💥 ERROR
Technical error occurred during execution
🕐 2025-11-21 15:00:00 CET
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
│   ├── casaortega.spec.ts  # Casa Ortega automation
│   └── huertaacasa.spec.ts # Huerta a Casa automation
├── choose-script.json      # Script configuration
├── holidays.txt            # Holiday management
└── playwright.config.ts
```

## 🛠️ Quick Setup

1. **Clone**: `git clone https://github.com/LiReXz/automated-payments.git`
2. **Configure**: Add all environment variables to GitHub Secrets
3. **Enable/Disable**: Edit `choose-script.json` to select which scripts to run
4. **Test**: Use manual execution workflow for testing
5. **Schedule**: Daily workflow runs automatically

---

<div align="center">

**⚠️ For personal and educational use only. Use responsibly.**

</div>
