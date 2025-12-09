#!/usr/bin/env python3
"""
Простой бот для отправки уведомлений об обновлениях игры.
Использование: python bot_notifier.py "Сообщение об обновлении"
"""

import sys
import requests
import os
from typing import List

# Получи токен от @BotFather
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "твой-токен-бота")

# Список ID чатов/пользователей для уведомлений
# Чтобы узнать свой ID, напиши боту @userinfobot
CHAT_IDS: List[int] = []

def send_update(message: str, chat_ids: List[int] = None):
    """Отправляет сообщение об обновлении в указанные чаты."""
    if chat_ids is None:
        chat_ids = CHAT_IDS
    
    if not chat_ids:
        print("⚠️  Список CHAT_IDS пуст! Добавь ID пользователей/чатов.")
        return
    
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    
    for chat_id in chat_ids:
        try:
            response = requests.post(url, json={
                "chat_id": chat_id,
                "text": message,
                "parse_mode": "HTML"
            })
            response.raise_for_status()
            print(f"✅ Сообщение отправлено в чат {chat_id}")
        except requests.exceptions.RequestException as e:
            print(f"❌ Ошибка отправки в чат {chat_id}: {e}")

def main():
    if len(sys.argv) < 2:
        example_message = """🎮 <b>Обновление игры Bolt Catcher!</b>

✨ Новые функции:
• Бомбы теперь вращаются и меняют направление
• Увеличен шанс появления бомб
• Улучшен дизайн в стиле 90-х

Играй прямо в Telegram! 🚀"""
        print("Использование: python bot_notifier.py 'Твое сообщение'")
        print("\nПример сообщения:")
        print(example_message)
        return
    
    message = sys.argv[1]
    send_update(message)

if __name__ == "__main__":
    main()



