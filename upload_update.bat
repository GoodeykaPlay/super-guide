@echo off
chcp 65001 >nul
echo 🚀 Автоматическая загрузка обновлений в GitHub
echo.

set REPO_URL=https://github.com/GoodeykaPlay/super-guide.git
set WEB_FOLDER=C:\Users\egork\AndroidStudioProjects\Goodeyka\web

echo 📁 Проверка папки web...
if not exist "%WEB_FOLDER%" (
    echo ❌ Папка web не найдена: %WEB_FOLDER%
    pause
    exit /b 1
)

echo ✅ Папка web найдена
echo.

echo 📋 Выбери способ загрузки:
echo.
echo 1. Через GitHub Desktop (рекомендуется)
echo 2. Через Git командную строку
echo 3. Через веб-интерфейс (откроется браузер)
echo 4. Показать инструкции
echo.
set /p choice="Введи номер (1-4): "

if "%choice%"=="1" goto github_desktop
if "%choice%"=="2" goto git_cli
if "%choice%"=="3" goto web_upload
if "%choice%"=="4" goto instructions
goto end

:github_desktop
echo.
echo 📦 Открываю GitHub Desktop...
echo.
echo Инструкция:
echo 1. В GitHub Desktop выбери репозиторий: super-guide
echo 2. Нажми "Fetch origin" для обновления
echo 3. Внеси изменения (если нужно)
echo 4. Напиши сообщение: "Update game files"
echo 5. Нажми "Commit to main"
echo 6. Нажми "Push origin"
echo.
echo После этого игра обновится автоматически через 1-3 минуты!
pause
goto end

:git_cli
echo.
echo 🔧 Проверка Git...
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git не установлен!
    echo.
    echo Установи Git: https://git-scm.com/download/win
    echo Или используй вариант 1 (GitHub Desktop)
    pause
    goto end
)

echo ✅ Git найден
echo.
echo 📍 Переход в папку проекта...
cd /d "C:\Users\egork\AndroidStudioProjects\Goodeyka"

echo.
echo 🔄 Проверка репозитория...
if not exist ".git" (
    echo Инициализация Git репозитория...
    git init
    git branch -M main
    git remote add origin %REPO_URL% 2>nul
)

echo.
echo 📤 Добавление файлов...
git add web/
git add .github/

echo.
echo 💾 Создание коммита...
set /p commit_msg="Введи сообщение (или нажми Enter для 'Update game files'): "
if "%commit_msg%"=="" set commit_msg=Update game files
git commit -m "%commit_msg%"

echo.
echo 🚀 Загрузка в GitHub...
git push origin main

if errorlevel 1 (
    echo.
    echo ⚠️ Ошибка при загрузке!
    echo Возможно, нужно настроить доступ к репозиторию.
    echo.
    echo Попробуй вариант 1 (GitHub Desktop) или 3 (веб-интерфейс)
) else (
    echo.
    echo ✅ Файлы успешно загружены!
    echo.
    echo ⏳ Подожди 1-3 минуты, пока игра обновится.
    echo 🔗 URL: https://goodeykaplay.github.io/super-guide/web/game.html
)

pause
goto end

:web_upload
echo.
echo 🌐 Открываю страницу загрузки в браузере...
echo.
echo ⚠️ Если открылась не та страница, открой вручную:
echo    https://github.com/GoodeykaPlay/super-guide/upload/main/web
echo.
pause
start https://github.com/GoodeykaPlay/super-guide/upload/main/web
echo.
echo 📋 Инструкция:
echo.
echo 1. Открой папку: %WEB_FOLDER%
echo 2. Выдели все файлы (Ctrl+A)
echo 3. Перетащи файлы в окно браузера (на страницу GitHub)
echo 4. Внизу страницы напиши: "Update game files"
echo 5. Нажми зелёную кнопку "Commit changes"
echo.
echo ✅ После этого игра обновится автоматически через 1-3 минуты!
echo.
echo 🔗 Если страница не открылась, скопируй эту ссылку:
echo    https://github.com/GoodeykaPlay/super-guide/upload/main/web
echo.
pause
goto end

:instructions
echo.
echo 📖 ИНСТРУКЦИИ ПО ЗАГРУЗКЕ ОБНОВЛЕНИЙ
echo ====================================
echo.
echo Способ 1: GitHub Desktop (САМЫЙ ПРОСТОЙ)
echo ----------------------------------------
echo 1. Установи GitHub Desktop: https://desktop.github.com/
echo 2. Войди в свой аккаунт GitHub
echo 3. Клонируй репозиторий: super-guide
echo 4. Когда нужно обновить:
echo    - Открой GitHub Desktop
echo    - Выбери репозиторий super-guide
echo    - Нажми "Fetch origin"
echo    - Внеси изменения (если нужно)
echo    - Напиши сообщение и нажми "Commit to main"
echo    - Нажми "Push origin"
echo    - Готово! Игра обновится через 1-3 минуты
echo.
echo Способ 2: Git командная строка
echo ----------------------------------------
echo 1. Установи Git: https://git-scm.com/download/win
echo 2. Открой командную строку в папке проекта
echo 3. Выполни команды:
echo    git add web/
echo    git commit -m "Update game files"
echo    git push origin main
echo.
echo Способ 3: Веб-интерфейс
echo ----------------------------------------
echo 1. Открой: https://github.com/GoodeykaPlay/super-guide
echo 2. Нажми "Add file" → "Upload files"
echo 3. Перетащи файлы из папки web
echo 4. Нажми "Commit changes"
echo.
echo ====================================
pause
goto end

:end
exit /b 0

