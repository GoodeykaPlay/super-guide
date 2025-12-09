# 📤 Загрузка проекта в GitHub

## Вариант 1: Через GitHub Desktop (рекомендуется)

1. **Скачай GitHub Desktop:** https://desktop.github.com/
2. **Установи и войди** в свой аккаунт GitHub
3. **File → Clone Repository → URL**
4. Вставь: `https://github.com/GoodeykaPlay/super-guide.git`
5. Выбери папку для клонирования
6. **Скопируй все файлы** из `C:\Users\egork\AndroidStudioProjects\Goodeyka` в клонированную папку
7. В GitHub Desktop:
   - Нажми **Commit to main**
   - Напиши сообщение: "Initial commit: Bolt Catcher game"
   - Нажми **Push origin**

## Вариант 2: Через веб-интерфейс GitHub

1. Открой: https://github.com/GoodeykaPlay/super-guide
2. Нажми **"uploading an existing file"** или **"Add file" → "Upload files"**
3. Перетащи все файлы из папки `Goodeyka` (кроме папки `app/build`)
4. Нажми **Commit changes**

## Вариант 3: Через командную строку (если установлен Git)

```bash
cd C:\Users\egork\AndroidStudioProjects\Goodeyka
git init
git add .
git commit -m "Initial commit: Bolt Catcher game"
git branch -M main
git remote add origin https://github.com/GoodeykaPlay/super-guide.git
git push -u origin main
```

## После загрузки: Настройка GitHub Pages

1. Открой: https://github.com/GoodeykaPlay/super-guide/settings/pages
2. В разделе **Source**:
   - Выбери ветку: `main`
   - Выбери папку: `/web`
3. Нажми **Save**
4. Подожди 1-2 минуты
5. Твой URL: **https://goodeykaplay.github.io/super-guide/web/game.html**

---

## 🎯 Следующий шаг: Настройка Web App в Telegram

После того как GitHub Pages заработает, используй этот URL для настройки бота!

