@echo off
chcp 65001 >nul
echo 🤖 Настройка Telegram бота для Goodeyka Games
echo.

set /p BOT_TOKEN="Введи токен бота (от @BotFather): "

if "%BOT_TOKEN%"=="" (
    echo ❌ Токен не может быть пустым!
    exit /b 1
)

set /p BOT_USERNAME="Введи username бота (без @): "

if "%BOT_USERNAME%"=="" (
    echo ❌ Username не может быть пустым!
    exit /b 1
)

set /p GAME_URL="Введи URL игры (например: https://username.github.io/Goodeyka/web/game.html): "

if "%GAME_URL%"=="" (
    echo ❌ URL не может быть пустым!
    exit /b 1
)

echo.
echo 📋 Проверка бота...

curl -s "https://api.telegram.org/bot%BOT_TOKEN%/getMe" > temp_response.json 2>nul

findstr /C:"\"ok\":true" temp_response.json >nul
if %errorlevel% equ 0 (
    echo ✅ Бот найден!
) else (
    echo ❌ Ошибка: Неверный токен бота!
    del temp_response.json 2>nul
    exit /b 1
)

del temp_response.json 2>nul

echo.
echo 📝 Инструкции для настройки Web App:
echo.
echo 1. Открой Telegram и найди @BotFather
echo 2. Отправь команду: /newapp
echo 3. Выбери своего бота
echo 4. Заполни данные:
echo    - Title: Goodeyka Bolt Catcher
echo    - Short name: bolt-catcher
echo    - Description: Поймай болты, избегай бомбы! Классическая аркада в стиле 90-х
echo    - Web App URL: %GAME_URL%
echo    - Photo: Загрузи скриншот игры (640x360px)
echo.
echo 5. После создания Web App, отправь: /setmenubutton
echo 6. Выбери своего бота и выбери созданное Web App
echo.
echo 🎮 Готово! Теперь открой бота: https://t.me/%BOT_USERNAME%
echo.

pause


