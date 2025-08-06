const { createClient } = require('@supabase/supabase-js');

class SubscriptionService {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
  }

  async handleInquiry(chatId, user, request) {
    try {
      // Проверяем, есть ли уже подписка
      const { data: existingSubscription } = await this.supabase
        .from('subscriptions')
        .select('*')
        .eq('chat_id', chatId)
        .single();

      if (existingSubscription) {
        return {
          message: `📱 **Ваша подписка активна!**

⏰ Время уведомлений: ${existingSubscription.notification_time || '09:00'}
📅 Статус: ${existingSubscription.is_active ? 'Активна' : 'Неактивна'}

💡 **Управление подпиской:**
• "отписаться" - отключить уведомления
• "изменить время" - настроить время уведомлений
• "статистика" - посмотреть историю рекомендаций`,
          keyboard: {
            inline_keyboard: [
              [
                { text: '🔕 Отписаться', callback_data: 'unsubscribe' },
                { text: '⏰ Изменить время', callback_data: 'change_time' }
              ],
              [
                { text: '📊 Статистика', callback_data: 'statistics' },
                { text: '🏠 Главное меню', callback_data: 'main_menu' }
              ]
            ]
          }
        };
      } else {
        return {
          message: `📱 **Подписка на арома-советы**

Получайте ежедневные рекомендации по эфирным маслам!

✨ **Что включено:**
• Ежедневные советы по ароматерапии
• Рекомендации по настроению
• Новости о маслах
• Сезонные советы

⏰ **Время уведомлений:** 09:00 (по умолчанию)

Хотите подписаться?`,
          keyboard: {
            inline_keyboard: [
              [
                { text: '✅ Подписаться', callback_data: 'subscribe_confirm' },
                { text: '❌ Отмена', callback_data: 'main_menu' }
              ]
            ]
          }
        };
      }
    } catch (error) {
      console.error('Error handling subscription inquiry:', error);
      return {
        message: '❌ Произошла ошибка при проверке подписки. Попробуйте позже.',
        keyboard: {
          inline_keyboard: [
            [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
          ]
        }
      };
    }
  }

  async handleCallback(chatId, user, data) {
    try {
      switch (data) {
        case 'subscribe_confirm':
          return await this.subscribeUser(chatId, user);
        
        case 'unsubscribe':
          return await this.unsubscribeUser(chatId);
        
        case 'change_time':
          return await this.showTimeOptions(chatId);
        
        case 'statistics':
          return await this.showStatistics(chatId);
        
        default:
          return {
            message: '❌ Неизвестная команда',
            keyboard: {
              inline_keyboard: [
                [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
              ]
            }
          };
      }
    } catch (error) {
      console.error('Error handling subscription callback:', error);
      return {
        message: '❌ Произошла ошибка. Попробуйте позже.',
        keyboard: {
          inline_keyboard: [
            [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
          ]
        }
      };
    }
  }

  async subscribeUser(chatId, user) {
    try {
      const { error } = await this.supabase
        .from('subscriptions')
        .insert({
          chat_id: chatId,
          user_id: user.id,
          username: user.username || user.first_name,
          is_active: true,
          notification_time: '09:00',
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error subscribing user:', error);
        return {
          message: '❌ Ошибка при подписке. Попробуйте позже.',
          keyboard: {
            inline_keyboard: [
              [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
            ]
          }
        };
      }

      return {
        message: `✅ **Подписка оформлена!**

🌿 Теперь вы будете получать ежедневные арома-советы в 09:00.

💡 **Первая рекомендация:**
Попробуйте **лаванду** для расслабления вечером или **мяту** для энергии утром!

📱 Управление подпиской доступно в главном меню.`,
        keyboard: {
          inline_keyboard: [
            [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
          ]
        }
      };
    } catch (error) {
      console.error('Error subscribing user:', error);
      return {
        message: '❌ Ошибка при подписке. Попробуйте позже.',
        keyboard: {
          inline_keyboard: [
            [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
          ]
        }
      };
    }
  }

  async unsubscribeUser(chatId) {
    try {
      const { error } = await this.supabase
        .from('subscriptions')
        .update({ is_active: false })
        .eq('chat_id', chatId);

      if (error) {
        console.error('Error unsubscribing user:', error);
        return {
          message: '❌ Ошибка при отписке. Попробуйте позже.',
          keyboard: {
            inline_keyboard: [
              [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
            ]
          }
        };
      }

      return {
        message: `🔕 **Подписка отключена**

Вы больше не будете получать ежедневные уведомления.

💡 Можете в любой момент подписаться снова через главное меню!`,
        keyboard: {
          inline_keyboard: [
            [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
          ]
        }
      };
    } catch (error) {
      console.error('Error unsubscribing user:', error);
      return {
        message: '❌ Ошибка при отписке. Попробуйте позже.',
        keyboard: {
          inline_keyboard: [
            [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
          ]
        }
      };
    }
  }

  async showTimeOptions(chatId) {
    const timeOptions = [
      '07:00', '08:00', '09:00', '10:00', '12:00',
      '15:00', '18:00', '20:00', '21:00'
    ];

    const keyboard = {
      inline_keyboard: []
    };

    // Группируем кнопки по 3 в ряд
    for (let i = 0; i < timeOptions.length; i += 3) {
      const row = timeOptions.slice(i, i + 3).map(time => ({
        text: time,
        callback_data: `set_time:${time}`
      }));
      keyboard.inline_keyboard.push(row);
    }

    keyboard.inline_keyboard.push([
      { text: '🏠 Главное меню', callback_data: 'main_menu' }
    ]);

    return {
      message: `⏰ **Выберите время уведомлений**

В какое время вы хотите получать ежедневные арома-советы?`,
      keyboard: keyboard
    };
  }

  async showStatistics(chatId) {
    try {
      const { data: subscription } = await this.supabase
        .from('subscriptions')
        .select('*')
        .eq('chat_id', chatId)
        .single();

      if (!subscription) {
        return {
          message: '❌ Подписка не найдена',
          keyboard: {
            inline_keyboard: [
              [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
            ]
          }
        };
      }

      const daysSubscribed = Math.floor(
        (new Date() - new Date(subscription.created_at)) / (1000 * 60 * 60 * 24)
      );

      return {
        message: `📊 **Ваша статистика**

📅 Подписаны: ${daysSubscribed} дней
⏰ Время уведомлений: ${subscription.notification_time}
📱 Статус: ${subscription.is_active ? 'Активна' : 'Неактивна'}

💡 Продолжайте использовать ароматерапию для здоровья и хорошего настроения!`,
        keyboard: {
          inline_keyboard: [
            [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
          ]
        }
      };
    } catch (error) {
      console.error('Error showing statistics:', error);
      return {
        message: '❌ Ошибка при получении статистики',
        keyboard: {
          inline_keyboard: [
            [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
          ]
        }
      };
    }
  }
}

module.exports = SubscriptionService; 