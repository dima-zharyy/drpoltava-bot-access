const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const { BOT_TOKEN } = process.env;
const getWelcomeMessage = (userName) => `👋 Доброго дня, @${userName}.\nНапишіть з якої ви команди або будете видалені через 2 хвилини.`;
const TIMER_VALUE = 120000;

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

const newUsersMap = new Map();

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (msg.new_chat_members) {
    const newMember = msg.new_chat_members[0];
    
    bot.sendMessage(chatId, getWelcomeMessage(newMember.username));

    const timer = setTimeout(() => {
      bot.getChatMember(chatId, userId)
        .then((chatMember) => {
          if (chatMember.status === 'member') {
            bot.unbanChatMember(chatId, userId);
            newUsersMap.delete(userId);
          }
        })
        .catch((error) => {
          console.error('Checking user status - unexpected error: ', error);
        });
    }, TIMER_VALUE);

    newUsersMap.set(userId, timer);
  } else if (msg.text && newUsersMap.has(userId)) {
    clearTimeout(newUsersMap.get(userId));
    newUsersMap.delete(userId);
  }
});

console.log('Bot is running');