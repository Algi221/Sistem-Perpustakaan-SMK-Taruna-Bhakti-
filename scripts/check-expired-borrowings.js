/**
 * Script untuk mengecek dan membatalkan peminjaman yang pending > 1 jam
 * Bisa dijalankan secara manual atau sebagai cron job
 * 
 * Usage:
 * node scripts/check-expired-borrowings.js
 * 
 * Atau untuk production, setup cron job:
 * */5 * * * * curl -X GET http://your-domain.com/api/cron/check-expired-borrowings
 */

const http = require('http');
const https = require('https');

const API_URL = process.env.API_URL || 'http://localhost:3000';
const CRON_SECRET = process.env.CRON_SECRET || '';

async function checkExpiredBorrowings() {
  const url = new URL(`${API_URL}/api/cron/check-expired-borrowings`);
  const protocol = url.protocol === 'https:' ? https : http;
  
  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      headers: CRON_SECRET ? {
        'Authorization': `Bearer ${CRON_SECRET}`
      } : {}
    };

    const req = protocol.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (res.statusCode === 200) {
            console.log('✅ Success:', result.message);
            if (result.cancelledCount > 0) {
              console.log(`   Cancelled ${result.cancelledCount} borrowings`);
              console.log(`   IDs: ${result.cancelledIds.join(', ')}`);
            }
            resolve(result);
          } else {
            console.error('❌ Error:', result.error || result.message);
            reject(new Error(result.error || 'Unknown error'));
          }
        } catch (error) {
          console.error('❌ Parse error:', error);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error);
      reject(error);
    });

    req.end();
  });
}

// Run if executed directly
if (require.main === module) {
  console.log('🔄 Checking for expired borrowings...');
  checkExpiredBorrowings()
    .then(() => {
      console.log('✅ Done');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Failed:', error);
      process.exit(1);
    });
}

module.exports = { checkExpiredBorrowings };


