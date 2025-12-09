#!/bin/bash

# Скрипт для быстрой настройки Telegram бота
# Использование: ./setup_bot.sh

echo "🤖 Настройка Telegram бота для Goodeyka Games"
echo ""

# Проверка наличия curl
if ! command -v curl &> /dev/null; then
    echo "❌ Ошибка: curl не установлен. Установи curl и попробуй снова."
    exit 1
fi

# Запрос токена бота
read -p "Введи токен бота (от @BotFather): " BOT_TOKEN

if [ -z "$BOT_TOKEN" ]; then
    echo "❌ Токен не может быть пустым!"
    exit 1
fi

# Запрос username бота
read -p "Введи username бота (без @): " BOT_USERNAME

if [ -z "$BOT_USERNAME" ]; then
    echo "❌ Username не может быть пустым!"
    exit 1
fi

# Запрос URL игры
read -p "Введи URL игры (например: https://username.github.io/Goodeyka/web/game.html): " GAME_URL

if [ -z "$GAME_URL" ]; then
    echo "❌ URL не может быть пустым!"
    exit 1
fi

echo ""
echo "📋 Проверка бота..."

# Проверка токена
RESPONSE=$(curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getMe")

if echo "$RESPONSE" | grep -q '"ok":true'; then
    BOT_NAME=$(echo "$RESPONSE" | grep -o '"first_name":"[^"]*' | cut -d'"' -f4)
    echo "✅ Бот найден: $BOT_NAME"
else
    echo "❌ Ошибка: Неверный токен бота!"
    exit 1
fi

echo ""
echo "📝 Инструкции для настройки Web App:"
echo ""
echo "1. Открой Telegram и найди @BotFather"
echo "2. Отправь команду: /newapp"
echo "3. Выбери бота: $BOT_NAME"
echo "4. Заполни данные:"
echo "   - Title: Goodeyka Bolt Catcher"
echo "   - Short name: bolt-catcher"
echo "   - Description: Поймай болты, избегай бомбы! Классическая аркада в стиле 90-х"
echo "   - Web App URL: $GAME_URL"
echo "   - Photo: Загрузи скриншот игры (640x360px)"
echo ""
echo "5. После создания Web App, отправь: /setmenubutton"
echo "6. Выбери своего бота и выбери созданное Web App"
echo ""
echo "🎮 Готово! Теперь открой бота: https://t.me/$BOT_USERNAME"
echo ""


