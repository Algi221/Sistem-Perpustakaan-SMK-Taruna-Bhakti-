/**
 * Email Helper untuk kirim email
 * Setup: Tambahkan ke .env.local:
 * SMTP_HOST=smtp.gmail.com
 * SMTP_PORT=587
 * SMTP_USER=your-email@gmail.com
 * SMTP_PASSWORD=your-app-password
 * SMTP_FROM=noreply@perpustakaan.com
 */

import nodemailer from 'nodemailer';

// Buat transporter (singleton)
let transporter = null;

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = parseInt(process.env.SMTP_PORT || '587');
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASSWORD;

  if (!smtpUser || !smtpPassword) {
    console.warn('SMTP credentials tidak di-set. Email tidak akan terkirim.');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465, // true untuk 465, false untuk port lain
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
  });

  return transporter;
}

/**
 * Kirim email verifikasi untuk reset password
 * @param {string} to - Email tujuan
 * @param {string} name - Nama user
 * @param {string} verificationToken - Token verifikasi
 * @returns {Promise<Object>} Hasil pengiriman email
 */
export async function sendVerificationEmail(to, name, verificationToken) {
  try {
    const transporter = getTransporter();
    if (!transporter) {
      throw new Error('SMTP transporter tidak tersedia');
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const verificationUrl = `${baseUrl}/reset-password/verify?token=${verificationToken}`;

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: to,
      subject: 'Verifikasi Reset Password - Perpustakaan',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Reset Password</h1>
            </div>
            <div class="content">
              <p>Halo <strong>${name}</strong>,</p>
              <p>Kami menerima permintaan reset password untuk akun Anda. Untuk melanjutkan, silakan klik tombol di bawah ini untuk verifikasi email Anda:</p>
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verifikasi Email</a>
              </div>
              <p>Atau copy link berikut ke browser Anda:</p>
              <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
              <p><strong>Penting:</strong></p>
              <ul>
                <li>Link ini hanya berlaku selama 24 jam</li>
                <li>Setelah verifikasi, admin akan meninjau permintaan Anda</li>
                <li>Jika Anda tidak meminta reset password, abaikan email ini</li>
              </ul>
              <p>Terima kasih,<br>Tim Perpustakaan</p>
            </div>
            <div class="footer">
              <p>Email ini dikirim otomatis, mohon jangan membalas email ini.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Halo ${name},
        
        Kami menerima permintaan reset password untuk akun Anda. 
        Untuk melanjutkan, silakan buka link berikut:
        
        ${verificationUrl}
        
        Link ini hanya berlaku selama 24 jam.
        Setelah verifikasi, admin akan meninjau permintaan Anda.
        
        Jika Anda tidak meminta reset password, abaikan email ini.
        
        Terima kasih,
        Tim Perpustakaan
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email verifikasi terkirim:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error kirim email verifikasi:', error);
    throw new Error(`Gagal mengirim email: ${error.message}`);
  }
}

/**
 * Kirim email notifikasi setelah admin approve reset password
 * @param {string} to - Email tujuan
 * @param {string} name - Nama user
 * @param {string} resetToken - Token untuk reset password
 * @returns {Promise<Object>} Hasil pengiriman email
 */
export async function sendResetPasswordEmail(to, name, resetToken) {
  try {
    const transporter = getTransporter();
    if (!transporter) {
      throw new Error('SMTP transporter tidak tersedia');
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: to,
      subject: 'Reset Password Disetujui - Perpustakaan',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Reset Password Disetujui</h1>
            </div>
            <div class="content">
              <p>Halo <strong>${name}</strong>,</p>
              <p>Permintaan reset password Anda telah <strong>disetujui oleh admin</strong>. Sekarang Anda dapat <strong>mengatur password baru sendiri</strong> dengan mengklik tombol di bawah ini:</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              <p>Atau copy link berikut ke browser Anda:</p>
              <p style="word-break: break-all; color: #10b981;">${resetUrl}</p>
              <p><strong>Penting:</strong></p>
              <ul>
                <li>Link ini hanya berlaku selama 24 jam</li>
                <li>Anda akan diminta untuk <strong>mengisi password baru sendiri</strong> setelah klik link</li>
                <li>Setelah reset password, Anda dapat login dengan password baru</li>
                <li>Jika Anda tidak meminta reset password, segera hubungi admin</li>
              </ul>
              <p>Terima kasih,<br>Tim Perpustakaan</p>
            </div>
            <div class="footer">
              <p>Email ini dikirim otomatis, mohon jangan membalas email ini.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Halo ${name},
        
        Permintaan reset password Anda telah disetujui oleh admin.
        Sekarang Anda dapat mengatur password baru sendiri dengan membuka link berikut:
        
        ${resetUrl}
        
        Link ini hanya berlaku selama 24 jam.
        Setelah reset password, Anda dapat login dengan password baru.
        
        Jika Anda tidak meminta reset password, segera hubungi admin.
        
        Terima kasih,
        Tim Perpustakaan
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email reset password terkirim:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error kirim email reset password:', error);
    throw new Error(`Gagal mengirim email: ${error.message}`);
  }
}

