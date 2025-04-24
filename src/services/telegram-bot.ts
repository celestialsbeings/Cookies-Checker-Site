import { Telegraf } from 'telegraf';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { config, validateConfig, ensureDirectories } from '../config';

// Validate required environment variables
validateConfig();

if (!config.TELEGRAM_BOT_TOKEN) {
    throw new Error('TELEGRAM_BOT_TOKEN is required');
}

const bot = new Telegraf(config.TELEGRAM_BOT_TOKEN);

// Ensure all required directories exist
ensureDirectories();
console.log('Directories checked and created if needed');
console.log('Cookies directory:', config.COOKIES_DIR);

// Function to download and process file
async function downloadAndProcessFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    console.log('Downloading from URL:', url);
    console.log('Saving to:', dest);

    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
        return;
      }

      let data = '';
      response.setEncoding('utf8');

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        // Write the actual content to file
        fs.writeFileSync(dest, data.trim());
        console.log('File downloaded and processed successfully');
        resolve();
      });

      response.on('error', (err) => {
        fs.unlink(dest, () => reject(err));
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

bot.command('start', async (ctx) => {
  console.log('Received /start command');
  await ctx.reply(
    '🎮 *Welcome to the Cookie Collector Bot!*\n\n' +
    'I help manage your cookie distribution system. Send me .txt files to add them as cookies.\n\n' +
    '*Commands:*\n' +
    '🔹 /start - Show this help message\n' +
    '🔹 /count - Check available cookies\n' +
    '🔹 /stats - View detailed statistics\n' +
    '🔹 /clear - Clear all cookies (admin only)\n' +
    '🔹 /backup - Backup current cookies\n' +
    '🔹 /health - Check system status\n\n' +
    '*Tips:*\n' +
    '• Send .txt files to add new cookies\n' +
    '• Use /stats to monitor usage\n' +
    '• Get alerts when cookies run low',
    { parse_mode: 'Markdown' }
  );
});

bot.on('document', async (ctx) => {
  console.log('Received document:', ctx.message.document);

  try {
    const file = ctx.message.document;

    // Check if it's a text file
    if (!file.file_name?.endsWith('.txt')) {
      await ctx.reply('Sorry, I can only accept .txt files!');
      return;
    }

    // Get file info
    console.log('Getting file info for:', file.file_id);
    const fileLink = await ctx.telegram.getFile(file.file_id);
    console.log('File link received:', fileLink);

    if (!fileLink.file_path) {
      console.error('No file path in response');
      await ctx.reply('Error: Could not get file path');
      return;
    }

    // Construct download URL
    const fileUrl = `https://api.telegram.org/file/bot${config.TELEGRAM_BOT_TOKEN}/${fileLink.file_path}`;
    console.log('Constructed file URL');

    // Generate unique filename
    const timestamp = Date.now();
    const uniqueFilename = `cookie_${timestamp}.txt`;
    const savePath = path.join(config.COOKIES_DIR, uniqueFilename);

    // Download and save file
    console.log('Starting file download...');
    await downloadAndProcessFile(fileUrl, savePath);

    // Verify file was saved
    if (fs.existsSync(savePath)) {
      const fileSize = fs.statSync(savePath).size;
      console.log('File saved successfully. Size:', fileSize, 'bytes');

      // Count remaining cookies
      const cookieFiles = fs.readdirSync(config.COOKIES_DIR);
      await ctx.reply(
        '✅ Cookie file saved successfully!\n\n' +
        `File size: ${fileSize} bytes\n` +
        `Total cookies available: ${cookieFiles.length}`
      );
    } else {
      throw new Error('File was not saved properly');
    }

  } catch (error) {
    console.error('Error processing file:', error);
    await ctx.reply(
      '❌ Sorry, there was an error processing your file:\n\n' +
      (error instanceof Error ? error.message : 'Unknown error')
    );
  }
});

bot.command('count', async (ctx) => {
  console.log('Received /count command');
  try {
    const cookieFiles = fs.readdirSync(config.COOKIES_DIR);
    await ctx.reply(`🍪 Current number of available cookies: ${cookieFiles.length}`);
  } catch (error) {
    console.error('Error counting cookies:', error);
    await ctx.reply('❌ Error counting cookies');
  }
});

bot.command('stats', async (ctx) => {
  console.log('Received /stats command');
  try {
    const cookieFiles = fs.readdirSync(config.COOKIES_DIR);
    const totalSize = cookieFiles.reduce((acc, file) => {
      return acc + fs.statSync(path.join(config.COOKIES_DIR, file)).size;
    }, 0);

    const stats = {
      total: cookieFiles.length,
      totalSizeKB: (totalSize / 1024).toFixed(2),
      oldestFile: '',
      newestFile: '',
      lowStock: cookieFiles.length <= 10
    };

    if (cookieFiles.length > 0) {
      const fileStats = cookieFiles.map(file => ({
        name: file,
        time: fs.statSync(path.join(config.COOKIES_DIR, file)).mtime.getTime()
      }));

      const oldest = fileStats.reduce((min, curr) => curr.time < min.time ? curr : min);
      const newest = fileStats.reduce((max, curr) => curr.time > max.time ? curr : max);

      stats.oldestFile = new Date(oldest.time).toLocaleString();
      stats.newestFile = new Date(newest.time).toLocaleString();
    }

    await ctx.reply(
      '📊 *Cookie System Statistics*\n\n' +
      `*Available Cookies:* ${stats.total}\n` +
      `*Total Size:* ${stats.totalSizeKB} KB\n` +
      `*Status:* ${stats.lowStock ? '⚠️ Low Stock' : '✅ Good'}\n\n` +
      (stats.oldestFile ?
        `*Oldest Cookie:* ${stats.oldestFile}\n` +
        `*Newest Cookie:* ${stats.newestFile}\n` : '') +
      `\n*System Health:* ${stats.total > 0 ? '🟢 Operational' : '🔴 Needs Attention'}`,
      { parse_mode: 'Markdown' }
    );
  } catch (error) {
    console.error('Error getting stats:', error);
    await ctx.reply('❌ Error retrieving statistics');
  }
});

bot.command('health', async (ctx) => {
  console.log('Received /health command');
  try {
    const cookieFiles = fs.readdirSync(config.COOKIES_DIR);
    const dirExists = fs.existsSync(config.COOKIES_DIR);
    const dirWritable = await new Promise(resolve => {
      fs.access(config.COOKIES_DIR, fs.constants.W_OK, (err) => {
        resolve(!err);
      });
    });

    await ctx.reply(
      '🏥 *System Health Check*\n\n' +
      `*Cookie Directory:* ${dirExists ? '✅' : '❌'}\n` +
      `*Write Permission:* ${dirWritable ? '✅' : '❌'}\n` +
      `*Cookie Count:* ${cookieFiles.length}\n` +
      `*Storage Status:* ${cookieFiles.length > 10 ? '✅ Good' : '⚠️ Low'}\n` +
      `*Bot Status:* ✅ Online\n\n` +
      `*Overall Health:* ${
        dirExists && dirWritable && cookieFiles.length > 0
          ? '🟢 System Healthy'
          : '🔴 Needs Attention'
      }`,
      { parse_mode: 'Markdown' }
    );
  } catch (error) {
    console.error('Error checking health:', error);
    await ctx.reply('❌ Error checking system health');
  }
});

bot.command('backup', async (ctx) => {
  console.log('Received /backup command');
  try {
    const cookieFiles = fs.readdirSync(config.COOKIES_DIR);
    const backupDir = config.BACKUP_DIR;

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `backup-${timestamp}`);
    fs.mkdirSync(backupPath);

    for (const file of cookieFiles) {
      fs.copyFileSync(
        path.join(config.COOKIES_DIR, file),
        path.join(backupPath, file)
      );
    }

    await ctx.reply(
      '💾 *Backup Complete*\n\n' +
      `*Files Backed Up:* ${cookieFiles.length}\n` +
      `*Backup Location:* \`cookie-backups/backup-${timestamp}\`\n` +
      '*Status:* ✅ Success',
      { parse_mode: 'Markdown' }
    );
  } catch (error) {
    console.error('Error creating backup:', error);
    await ctx.reply('❌ Error creating backup');
  }
});

bot.command('clear', async (ctx) => {
  console.log('Received /clear command');
  try {
    const files = fs.readdirSync(config.COOKIES_DIR);
    for (const file of files) {
      fs.unlinkSync(path.join(config.COOKIES_DIR, file));
    }
    await ctx.reply('🗑️ All cookies have been cleared!');
  } catch (error) {
    console.error('Error clearing cookies:', error);
    await ctx.reply('❌ Error clearing cookies');
  }
});

// Start the bot
console.log('Starting bot with token:', config.TELEGRAM_BOT_TOKEN.slice(0, 5) + '...');
bot.launch().then(() => {
  console.log('🤖 Telegram bot is running!');
  console.log('Cookies directory:', config.COOKIES_DIR);
}).catch(error => {
  console.error('Failed to start bot:', error);
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
