const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const { BOT_TOKEN } = process.env;
const getWelcomeMessage = (userName, useMention) => `👋 Доброго дня, ${useMention ? '@' : ''}${userName}.\nНапишіть з якої ви команди або будете видалені через 2 хвилини.`;
const TIMER_VALUE = 120000;

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

const newUsersMap = new Map();

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (msg.new_chat_members) {
    msg.new_chat_members.forEach((newMember) => {
      const newMemberUserName = newMember.username ? newMember.username : `${newMember.first_name || ''} ${newMember.last_name || ''}`;
      const newMemberUserId = newMember.id;
      const useMention = !!newMember.username;
    
      bot.sendMessage(chatId, getWelcomeMessage(newMemberUserName, useMention));
  
      const timer = setTimeout(() => {
        bot.getChatMember(chatId, newMemberUserId)
          .then((chatMember) => {
            if (chatMember.status === 'member') {
              bot.unbanChatMember(chatId, newMemberUserId);
              newUsersMap.delete(newMemberUserId);
            }
          })
          .catch((error) => {
            console.error('Checking user status - unexpected error: ', error);
          });
      }, TIMER_VALUE);
  
      newUsersMap.set(newMemberUserId, timer);
    })
  } else if (msg.text && newUsersMap.has(userId)) {
    clearTimeout(newUsersMap.get(userId));
    newUsersMap.delete(userId);
  }
});

console.log('Bot is running');