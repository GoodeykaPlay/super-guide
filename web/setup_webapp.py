#!/usr/bin/env python3
"""
Скрипт для автоматической настройки Web App в Telegram боте
Использование: python setup_webapp.py
"""

import urllib.request
import urllib.parse
import json

# Данные бота
BOT_TOKEN = "8404480343:AAF32AzDHrzFwFCnWONcBSnovjCnitLkh8A"
BOT_USERNAME = "BolBOOM_bot"
GAME_URL = "https://goodeykaplay.github.io/super-guide/web/game.html"

def check_bot():
    """Проверяет, что бот работает"""
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/getMe"
    try:
        with urllib.request.urlopen(url) as response:
            data = json.loads(response.read().decode())
            if data.get("ok"):
                bot_info = data.get("result", {})
                print(f"✅ Бот найден: {bot_info.get('first_name')} (@{bot_info.get('username')})")
                return True
            else:
                print(f"❌ Ошибка: {data.get('description', 'Неизвестная ошибка')}")
                return False
    except Exception as e:
        print(f"❌ Ошибка при проверке бота: {e}")
        return False

def create_webapp():
    """Создаёт Web App через Bot API"""
    # К сожалению, Bot API не поддерживает создание Web App напрямую
    # Это нужно делать через @BotFather вручную
    print("\n📝 Инструкции для создания Web App:")
    print("=" * 60)
    print("1. Открой Telegram и найди @BotFather")
    print("2. Отправь команду: /newapp")
    print("3. Выбери бота: BolBOOM_bot")
    print("4. Заполни данные:")
    print(f"   Title: Goodeyka Bolt Catcher")
    print(f"   Short name: bolt-catcher")
    print(f"   Description: Поймай болты, избегай бомбы! Классическая аркада в стиле 90-х")
    print(f"   Web App URL: {GAME_URL}")
    print("   Photo: Загрузи скриншот игры (640x360px)")
    print("=" * 60)

def set_menu_button():
    """Пытается установить кнопку меню через Bot API"""
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/setChatMenuButton"
    
    # Пробуем установить кнопку меню для бота
    payload = {
        "menu_button": {
            "type": "web_app",
            "text": "🎮 Играть",
            "web_app": {
                "url": GAME_URL
            }
        }
    }
    
    try:
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode())
            if result.get("ok"):
                print("✅ Кнопка меню установлена!")
                return True
            else:
                print(f"⚠️ Не удалось установить кнопку меню: {result.get('description', 'Неизвестная ошибка')}")
                print("   Попробуй установить вручную через @BotFather: /setmenubutton")
                return False
    except Exception as e:
        print(f"⚠️ Ошибка при установке кнопки меню: {e}")
        print("   Попробуй установить вручную через @BotFather: /setmenubutton")
        return False

def main():
    print("🤖 Настройка Web App для BolBOOM_bot")
    print("=" * 60)
    
    # Проверка бота
    if not check_bot():
        return
    
    # Инструкции для создания Web App
    create_webapp()
    
    # Попытка установить кнопку меню
    print("\n🔧 Попытка установить кнопку меню...")
    set_menu_button()
    
    print("\n" + "=" * 60)
    print("📱 Следующие шаги:")
    print("1. Создай Web App через @BotFather (инструкции выше)")
    print("2. Если кнопка меню не установилась автоматически:")
    print("   - Отправь @BotFather: /setmenubutton")
    print("   - Выбери бота и созданное Web App")
    print("3. Открой бота: https://t.me/BolBOOM_bot")
    print("4. Нажми на кнопку с игрой и играй! 🎮")
    print("=" * 60)

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"❌ Ошибка: {e}")

