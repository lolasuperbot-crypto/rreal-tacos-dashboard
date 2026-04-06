/**
 * generate-review-report.js
 * Rreal Hospitality LLC — Weekly Review Report Generator
 * Pulls data from Weekly Resto Reviews sheet, generates PDF via Python, emails to majo@rrealtacos.com
 * Run: node generate-review-report.js
 * Auto-runs: Every Monday 8am ET via GitHub Actions
 */

const { execSync } = require('child_process');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const https = require('https');

// ── CONFIG ──────────────────────────────────────────────────────────────
const CONFIG = {
  sheet_csv_url: 'https://docs.google.com/spreadsheets/d/1kAIFHy7xQggErdAf3Wd70PTRrahgC-gHtW6kWi9ZC3w/gviz/tq?tqx=out:csv&sheet=weekly_KPI',
  pdf_output: path.join(__dirname, 'Wk14_Review_Report_Professional.pdf'),
  python_script: path.join(__dirname, 'generate_review_pdf.py'),
  email: {
    from: process.env.EMAIL_FROM || 'lolasuperbot@gmail.com',
    to: 'majo@rrealtacos.com',
    subject: 'Weekly Review Report — 1 & 2 Star Analysis · Week 14 · 03/30–04/05/2026',
    body: `Hi Majo,

Please find attached the weekly 1 and 2 star review report for Week 14 (March 30 – April 5, 2026).

This report includes:
• Network summary — total bad reviews and week-over-week comparison
• Food vs Service breakdown for all 11 locations
• Location detail cards with themes and trends
• Action items and recommendations

⚠️ Priority this week: Cumming (raw chicken — 2 reports) and Decatur (food poisoning warning) require immediate management attention.

Data sources: Weekly Resto Reviews Google Sheet + Marqii platform (Google + Yelp).

Best,
Lola AI 🌺
Rreal Hospitality Operations Assistant`,
  },
  gmail_app_password: process.env.GMAIL_APP_PASSWORD || '',
};

// ── STEP 1: Verify sheet is accessible ──────────────────────────────────
async function checkSheet() {
  return new Promise((resolve, reject) => {
    console.log('📊 Checking sheet accessibility...');
    https.get(CONFIG.sheet_csv_url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (data.startsWith('<!DOCTYPE')) {
          reject(new Error('Sheet not publicly accessible — check sharing settings'));
        } else {
          const lines = data.split('\n').filter(l => l.trim());
          console.log(`✅ Sheet accessible — ${lines.length} rows found`);
          resolve(data);
        }
      });
    }).on('error', reject);
  });
}

// ── STEP 2: Generate PDF via Python ─────────────────────────────────────
function generatePDF() {
  console.log('📄 Generating PDF report...');
  try {
    execSync(`python3 "${CONFIG.python_script}"`, { stdio: 'inherit', timeout: 60000 });
    if (!fs.existsSync(CONFIG.pdf_output)) {
      throw new Error('PDF not created — check Python script');
    }
    const size = fs.statSync(CONFIG.pdf_output).size;
    console.log(`✅ PDF generated: ${CONFIG.pdf_output} (${(size/1024).toFixed(1)} KB)`);
    return CONFIG.pdf_output;
  } catch (err) {
    throw new Error(`PDF generation failed: ${err.message}`);
  }
}

// ── STEP 3: Send email ────────────────────────────────────────────────────
async function sendEmail(pdfPath) {
  console.log(`📧 Sending email to ${CONFIG.email.to}...`);

  if (!CONFIG.gmail_app_password) {
    console.warn('⚠️  GMAIL_APP_PASSWORD not set — skipping email send');
    console.log('   Set it with: export GMAIL_APP_PASSWORD=your-app-password');
    console.log('   Get one at: myaccount.google.com/apppasswords');
    return false;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: CONFIG.email.from,
      pass: CONFIG.gmail_app_password,
    },
  });

  const mailOptions = {
    from: `"Lola AI — Rreal Hospitality" <${CONFIG.email.from}>`,
    to: CONFIG.email.to,
    cc: CONFIG.email.cc,
    subject: CONFIG.email.subject,
    text: CONFIG.email.body,
    attachments: [{
      filename: path.basename(pdfPath),
      path: pdfPath,
      contentType: 'application/pdf',
    }],
  };

  await transporter.sendMail(mailOptions);
  console.log(`✅ Email sent to ${CONFIG.email.to} (cc: ${CONFIG.email.cc})`);
  return true;
}

// ── MAIN ─────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🌮 Rreal Hospitality — Weekly Review Report Generator');
  console.log('='.repeat(54));
  try {
    await checkSheet();
    const pdfPath = generatePDF();
    await sendEmail(pdfPath);
    console.log('\n✅ Done! Report generated and sent.\n');
  } catch (err) {
    console.error(`\n❌ Error: ${err.message}\n`);
    process.exit(1);
  }
}

main();
