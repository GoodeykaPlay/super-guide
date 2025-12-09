# 🚀 Автоматическая загрузка обновлений в GitHub
# PowerShell скрипт

$ErrorActionPreference = "Stop"

Write-Host "🚀 Автоматическая загрузка обновлений в GitHub" -ForegroundColor Cyan
Write-Host ""

$REPO_URL = "https://github.com/GoodeykaPlay/super-guide.git"
$WEB_FOLDER = "C:\Users\egork\AndroidStudioProjects\Goodeyka\web"
$PROJECT_FOLDER = "C:\Users\egork\AndroidStudioProjects\Goodeyka"

# Проверка папки web
if (-not (Test-Path $WEB_FOLDER)) {
    Write-Host "❌ Папка web не найдена: $WEB_FOLDER" -ForegroundColor Red
    Read-Host "Нажми Enter для выхода"
    exit 1
}

Write-Host "✅ Папка web найдена" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Выбери способ загрузки:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Через Git (автоматически)" -ForegroundColor White
Write-Host "2. Открыть страницу загрузки в браузере" -ForegroundColor White
Write-Host "3. Показать инструкции" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Введи номер (1-3)"

switch ($choice) {
    "1" {
        # Проверка Git
        try {
            $gitVersion = git --version 2>&1
            Write-Host "✅ Git найден: $gitVersion" -ForegroundColor Green
        } catch {
            Write-Host "❌ Git не установлен!" -ForegroundColor Red
            Write-Host ""
            Write-Host "Установи Git: https://git-scm.com/download/win" -ForegroundColor Yellow
            Write-Host "Или используй вариант 2 (веб-интерфейс)" -ForegroundColor Yellow
            Read-Host "Нажми Enter для выхода"
            exit 1
        }

        Write-Host ""
        Write-Host "📍 Переход в папку проекта..." -ForegroundColor Cyan
        Set-Location $PROJECT_FOLDER

        # Проверка репозитория
        if (-not (Test-Path ".git")) {
            Write-Host "Инициализация Git репозитория..." -ForegroundColor Yellow
            git init
            git branch -M main
            git remote add origin $REPO_URL 2>$null
        }

        Write-Host ""
        Write-Host "📤 Добавление файлов..." -ForegroundColor Cyan
        git add web/
        git add .github/ 2>$null

        Write-Host ""
        $commitMsg = Read-Host "Введи сообщение (или нажми Enter для 'Update game files')"
        if ([string]::IsNullOrWhiteSpace($commitMsg)) {
            $commitMsg = "Update game files"
        }

        Write-Host "💾 Создание коммита..." -ForegroundColor Cyan
        git commit -m $commitMsg

        Write-Host ""
        Write-Host "🚀 Загрузка в GitHub..." -ForegroundColor Cyan
        try {
            git push origin main
            Write-Host ""
            Write-Host "✅ Файлы успешно загружены!" -ForegroundColor Green
            Write-Host ""
            Write-Host "⏳ Подожди 1-3 минуты, пока игра обновится." -ForegroundColor Yellow
            Write-Host "🔗 URL: https://goodeykaplay.github.io/super-guide/web/game.html" -ForegroundColor Cyan
        } catch {
            Write-Host ""
            Write-Host "⚠️ Ошибка при загрузке!" -ForegroundColor Red
            Write-Host "Возможно, нужно настроить доступ к репозиторию." -ForegroundColor Yellow
            Write-Host ""
            Write-Host "Попробуй вариант 2 (веб-интерфейс)" -ForegroundColor Yellow
        }
    }
    "2" {
        Write-Host ""
        Write-Host "🌐 Открываю страницу загрузки в браузере..." -ForegroundColor Cyan
        Start-Process "https://github.com/GoodeykaPlay/super-guide/upload/main/web"
        Write-Host ""
        Write-Host "📋 Инструкция:" -ForegroundColor Yellow
        Write-Host "1. Перетащи файлы из папки: $WEB_FOLDER" -ForegroundColor White
        Write-Host "2. Напиши сообщение: 'Update game files'" -ForegroundColor White
        Write-Host "3. Нажми 'Commit changes'" -ForegroundColor White
        Write-Host ""
        Write-Host "После этого игра обновится автоматически через 1-3 минуты!" -ForegroundColor Green
    }
    "3" {
        Write-Host ""
        Write-Host "📖 ИНСТРУКЦИИ ПО ЗАГРУЗКЕ ОБНОВЛЕНИЙ" -ForegroundColor Cyan
        Write-Host "====================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Способ 1: Git командная строка" -ForegroundColor Yellow
        Write-Host "----------------------------------------" -ForegroundColor Gray
        Write-Host "1. Открой PowerShell в папке проекта" -ForegroundColor White
        Write-Host "2. Выполни команды:" -ForegroundColor White
        Write-Host "   git add web/" -ForegroundColor Cyan
        Write-Host "   git commit -m 'Update game files'" -ForegroundColor Cyan
        Write-Host "   git push origin main" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Способ 2: Веб-интерфейс" -ForegroundColor Yellow
        Write-Host "----------------------------------------" -ForegroundColor Gray
        Write-Host "1. Открой: https://github.com/GoodeykaPlay/super-guide" -ForegroundColor White
        Write-Host "2. Нажми 'Add file' → 'Upload files'" -ForegroundColor White
        Write-Host "3. Перетащи файлы из папки web" -ForegroundColor White
        Write-Host "4. Нажми 'Commit changes'" -ForegroundColor White
        Write-Host ""
        Write-Host "====================================" -ForegroundColor Cyan
    }
    default {
        Write-Host "❌ Неверный выбор!" -ForegroundColor Red
    }
}

Write-Host ""
Read-Host "Нажми Enter для выхода"

