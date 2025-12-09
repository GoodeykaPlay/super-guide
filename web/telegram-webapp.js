// Telegram Web App API integration
if (window.Telegram && window.Telegram.WebApp) {
  const tg = window.Telegram.WebApp;
  
  tg.ready();
  tg.expand();
  
  // Настройка темы
  const setTheme = () => {
    const colorScheme = tg.colorScheme || 'light';
    const themeParams = tg.themeParams || {};
    
    if (themeParams.bg_color) {
      document.documentElement.style.setProperty('--tg-bg', themeParams.bg_color);
    }
    if (themeParams.text_color) {
      document.documentElement.style.setProperty('--tg-text', themeParams.text_color);
    }
    if (themeParams.hint_color) {
      document.documentElement.style.setProperty('--tg-hint', themeParams.hint_color);
    }
    if (themeParams.button_color) {
      document.documentElement.style.setProperty('--tg-button', themeParams.button_color);
    }
    if (themeParams.button_text_color) {
      document.documentElement.style.setProperty('--tg-button-text', themeParams.button_text_color);
    }
  };
  
  setTheme();
  tg.onEvent('themeChanged', setTheme);
  
  // Отправка данных о рекорде в бота (опционально)
  window.sendScoreToBot = (score) => {
    if (tg.sendData) {
      tg.sendData(JSON.stringify({ type: 'score', value: score }));
    }
  };
  
  // Показ главной кнопки (опционально)
  window.showMainButton = (text, callback) => {
    tg.MainButton.setText(text);
    tg.MainButton.show();
    tg.MainButton.onClick(callback);
  };
  
  window.hideMainButton = () => {
    tg.MainButton.hide();
  };
  
  // Вибрация при взрыве
  window.vibrate = (pattern = [100]) => {
    if (tg.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('medium');
    }
  };
  
  // Функция для поделиться игрой с друзьями
  window.shareGame = () => {
    if (tg.shareUrl) {
      // Используем встроенную функцию Telegram для поделиться
      tg.shareUrl('https://t.me/share/url?url=' + encodeURIComponent(window.location.href) + '&text=' + encodeURIComponent('🎮 Попробуй эту крутую игру! Поймай болты, избегай бомбы!'));
    } else if (tg.openTelegramLink) {
      // Альтернативный способ через открытие ссылки
      tg.openTelegramLink('https://t.me/share/url?url=' + encodeURIComponent(window.location.href) + '&text=' + encodeURIComponent('🎮 Попробуй эту крутую игру!'));
    } else if (navigator.share) {
      // Используем Web Share API если доступен
      navigator.share({
        title: 'Goodeyka Bolt Catcher',
        text: '🎮 Попробуй эту крутую игру! Поймай болты, избегай бомбы!',
        url: window.location.href
      });
    } else {
      // Fallback: копируем ссылку в буфер обмена
      navigator.clipboard.writeText(window.location.href).then(() => {
        tg.showAlert('Ссылка скопирована! Отправь её друзьям в Telegram.');
      });
    }
  };
  
  // Функция для открытия бота в Telegram
  window.openBot = (botUsername) => {
    if (tg.openTelegramLink) {
      tg.openTelegramLink(`https://t.me/${botUsername}`);
    } else {
      window.open(`https://t.me/${botUsername}`, '_blank');
    }
  };
  
  console.log('Telegram Web App initialized');
} else {
  console.log('Running outside Telegram');
  
  // Fallback функции для работы вне Telegram
  window.sendScoreToBot = () => {};
  window.showMainButton = () => {};
  window.hideMainButton = () => {};
  window.vibrate = () => {};
  window.shareGame = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Goodeyka Bolt Catcher',
        text: '🎮 Попробуй эту крутую игру! Поймай болты, избегай бомбы!',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Ссылка скопирована! Отправь её друзьям.');
      });
    }
  };
  window.openBot = (botUsername) => {
    window.open(`https://t.me/${botUsername}`, '_blank');
  };
}


