// Глобальные переменные
let tracks = [];
let filteredTracks = [];
let currentTrackIndex = 0;
let isPlaying = false;
let currentTab = 'all';
let favorites = JSON.parse(localStorage.getItem('musicFavorites')) || [];
const audioPlayer = document.getElementById('audioPlayer');

// Загрузка треков
async function loadTracks() {
    try {
        const response = await fetch('/api/tracks');
        tracks = await response.json();
        filteredTracks = [...tracks];
        renderTracks(filteredTracks);
        createSparkles();
        createStars();
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        document.getElementById('tracksList').innerHTML = 
            '<div class="loading">❌ Ошибка загрузки</div>';
    }
}



// Отрисовка треков
function renderTracks(tracksToRender) {
    const tracksList = document.getElementById('tracksList');
    
    if (tracksToRender.length === 0) {
        tracksList.innerHTML = currentTab === 'favorites' 
            ? '<div class="loading">❤️ Избранное пусто</div>' 
            : '<div class="loading">🔍 Ничего не найдено</div>';
        return;
    }
    
    tracksList.innerHTML = '';
    
    tracksToRender.forEach((track, index) => {
        const card = document.createElement('div');
        card.className = 'track-card';
        
        const isCurrent = tracks[currentTrackIndex]?.id === track.id;
        if (isCurrent && isPlaying) {
            card.classList.add('playing');
        }
        
        const isFavorite = favorites.includes(track.id);
        
        // HTML структуры карточки
        card.innerHTML = `
            <div class="track-top-row">
                <button class="play-btn" data-track-id="${track.id}">${isCurrent && isPlaying ? '⏸' : '▶'}</button>
                <div class="track-info">
                    <h3>${track.title}</h3>
                    <p>${track.artist}</p>
                </div>
                <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-track-id="${track.id}">${isFavorite ? '❤️' : '🤍'}</button>
            </div>
            
            <!-- Прогресс бар внутри карточки -->
            <div class="track-progress-container">
                <span class="current-time">0:00</span>
                <input type="range" class="track-progress-bar" value="0" min="0" max="100" step="0.1" data-track-id="${track.id}">
                <span class="duration">${track.duration}</span>
            </div>
        `;
        
        // Клик по карточке (запуск)
        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('favorite-btn') && 
                !e.target.classList.contains('track-progress-bar') &&
                !e.target.classList.contains('play-btn')) {
                const trackIndex = tracksToRender.indexOf(track);
                playTrackByIndex(trackIndex);
            }
        });
        
        // Кнопка Play
        card.querySelector('.play-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            const trackIndex = tracksToRender.indexOf(track);
            playTrackByIndex(trackIndex);
        });
        
        // Кнопка Избранное
        card.querySelector('.favorite-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(track.id);
            renderTracks(tracksToRender);
        });
        
        // Прогресс бар (перемотка)
        const progressBar = card.querySelector('.track-progress-bar');
        progressBar.addEventListener('input', (e) => {
            e.stopPropagation();
            if (tracks[currentTrackIndex]?.id === track.id) {
                const time = (e.target.value / 100) * audioPlayer.duration;
                audioPlayer.currentTime = time;
                updateAllProgressBars(); // Обновить отображение времени сразу
            }
        });
        
        tracksList.appendChild(card);
    });
    
    // Если что-то играет, обновляем прогресс бары сразу после рендера
    if (isPlaying) {
        updateAllProgressBars();
    }
}

// Переключение избранного
function toggleFavorite(trackId) {
    const index = favorites.indexOf(trackId);
    if (index === -1) {
        favorites.push(trackId);
    } else {
        favorites.splice(index, 1);
    }
    localStorage.setItem('musicFavorites', JSON.stringify(favorites));
    if (currentTab === 'favorites') {
        filterTracks();
    }
}

// Фильтрация
function filterTracks() {
    if (currentTab === 'favorites') {
        filteredTracks = tracks.filter(track => favorites.includes(track.id));
    } else {
        filteredTracks = [...tracks];
    }
    renderTracks(filteredTracks);
}

// Вкладки
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTab = btn.dataset.tab;
        filterTracks();
    });
});

function findTrackIndex(trackId) {
    return tracks.findIndex(t => t.id === trackId);
}

// Помог сделать свечение и ивыбор без паузы
function updateInterface(forceGreen = false) {
    const isActuallyPlaying = !audioPlayer.paused && audioPlayer.readyState >= 2;
    const currentId = tracks[currentTrackIndex] ? tracks[currentTrackIndex].id : -1;

    document.querySelectorAll('.track-card').forEach(card => {
        const btn = card.querySelector('.play-btn');
        const trackId = parseInt(btn.dataset.trackId);
        const progressBar = card.querySelector('.track-progress-bar');
        const timeDisplay = card.querySelector('.current-time');

        // Проверяем, этот ли трек сейчас выбран
        if (trackId === currentId) {
            // Логика цвета кнопки:
            // Зеленый, если: (реально играет) ИЛИ (мы форсируем цвет при переключении)
            const shouldBeGreen = isActuallyPlaying || forceGreen;

            if (shouldBeGreen) {
                btn.textContent = '⏸';
                card.classList.add('playing'); // Добавляет зеленое свечение через CSS
                
                // Обновление прогресса
                if (audioPlayer.duration) {
                    const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
                    progressBar.value = percent;
                    if(timeDisplay) timeDisplay.textContent = formatTime(audioPlayer.currentTime);
                }
            } else {
                // Серый режим (Пауза или ошибка)
                btn.textContent = '▶';
                card.classList.remove('playing');
            }
        } else {
            // Другие треки всегда серые
            btn.textContent = '▶';
            card.classList.remove('playing');
            if(progressBar) progressBar.value = 0;
            if(timeDisplay) timeDisplay.textContent = "0:00";
        }
    });
}

// Не забудьте оставить слушатели событий, они тоже вызывают updateInterface()
audioPlayer.addEventListener('play', () => updateInterface(false));
audioPlayer.addEventListener('pause', () => updateInterface(false));
audioPlayer.addEventListener('timeupdate', () => updateInterface(false));
audioPlayer.addEventListener('ended', () => {
    handleNext();
});
// Воспроизведение
// Помог сделать свечение и ивыбор без паузы
// 1. Главная функция запуска (ИСПРАВЛЕННАЯ)
// 1. ГЛАВНАЯ ФУНКЦИЯ ЗАПУСКА (УНИВЕРСАЛЬНАЯ)
function playTrackByIndex(index) {
    // Проверка границ текущего отображаемого списка
    if (!filteredTracks || index < 0 || index >= filteredTracks.length) {
        console.error("❌ Индекс вне диапазона!");
        return;
    }

    const track = filteredTracks[index]; // Трек из текущего вида (поиск или все)
    const globalIndex = findTrackIndex(track.id); // Реальный индекс в полной базе
    
    if (globalIndex === -1) return;

    // Проверяем, тот ли это трек
    const isSameTrack = (tracks[currentTrackIndex]?.id === track.id);

    // 🛑 СЦЕНАРИЙ ПАУЗЫ: Только если кликнули на ТОТ ЖЕ трек, который УЖЕ играет
    if (isSameTrack && !audioPlayer.paused) {
        audioPlayer.pause();
        updateInterface(); // Обновляем кнопки (станут серыми)
        return;
    }

    // ▶️ СЦЕНАРИЙ ЗАПУСКА (Новый трек ИЛИ тот же трек был на паузе)
    currentTrackIndex = globalIndex;
    
    console.log(`🚀 Запуск: ${track.title}`);

    // ⚡ МАГИЯ МГНОВЕННОГО ПЕРЕКЛЮЧЕНИЯ:
    // 1. Жестко останавливаем всё, что было
    audioPlayer.pause();
    // 2. Сбрасываем время в ноль
    audioPlayer.currentTime = 0;
    // 3. Очищаем источник (разрываем связь со старым файлом)
    audioPlayer.src = ''; 
    
    // 4. МГНОВЕННО рисуем зеленый интерфейс (пользователь видит реакцию сразу)
    updateInterface(true); 

    // 5. Небольшая техническая задержка для сброса буфера браузера
    setTimeout(() => {
        // Устанавливаем новый файл
        audioPlayer.src = track.url;
        audioPlayer.load(); // Принудительная перезагрузка
        
        // Пытаемся играть
        const playPromise = audioPlayer.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                // Успех: музыка играет, подтверждаем интерфейс
                updateInterface(false);
            }).catch(error => {
                console.error("❌ Ошибка воспроизведения:", error);
                updateInterface(false);
            });
        }
    }, 50); // 50мс достаточно для любого браузера
}

// Обновление кнопок Play и прогресс баров
function updatePlayButtons() {
    document.querySelectorAll('.track-card').forEach(card => {
        const btn = card.querySelector('.play-btn');
        const trackId = parseInt(btn.dataset.trackId);
        const isCurrent = tracks[currentTrackIndex]?.id === trackId;
        
        if (isCurrent && isPlaying) {
            btn.textContent = '⏸';
            card.classList.add('playing');
        } else {
            btn.textContent = '▶';
            card.classList.remove('playing');
            // Сброс прогресса для неактивных треков визуально (опционально)
            // card.querySelector('.current-time').textContent = '0:00';
            // card.querySelector('.track-progress-bar').value = 0;
        }
    });
    updateAllProgressBars();
}

// Обновление всех прогресс баров (для текущего трека)
function updateAllProgressBars() {
    if (!audioPlayer.duration) return;
    
    const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    const currentTimeStr = formatTime(audioPlayer.currentTime);
    
    document.querySelectorAll('.track-card').forEach(card => {
        const trackId = parseInt(card.querySelector('.play-btn').dataset.trackId);
        
        if (tracks[currentTrackIndex]?.id === trackId) {
            const bar = card.querySelector('.track-progress-bar');
            const timeDisplay = card.querySelector('.current-time');
            
            // Обновляем только если пользователь не тянет ползунок (можно добавить флаг)
            if (document.activeElement !== bar) {
                bar.value = percent;
                timeDisplay.textContent = currentTimeStr;
            }
        }
    });
}


// 🎲 Случайный трек
// Получилось также обработать бзе паузы
// Обработчик кнопки РАНДОМ
document.getElementById('randomBtn').addEventListener('click', () => {
    if (!tracks || tracks.length === 0) return;

    // 1. Выбираем случайный индекс
    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * tracks.length);
    } while (randomIndex === currentTrackIndex && tracks.length > 1); 
    // Исключаем повтор текущего трека, если треков больше 1

    const track = tracks[randomIndex];
    
    console.log(`🎲 Рандом: запускаем ${track.title}`);

    // 2. МГНОВЕННО обновляем индекс и интерфейс (зеленая подсветка сразу!)
    currentTrackIndex = randomIndex;
    
    // Останавливаем текущее воспроизведение перед новым
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
    audioPlayer.src = '';
    
    // 🟢 ПОДСВЕЧИВАЕМ ЗЕЛЕНЫМ СРАЗУ (forceGreen = true)
    updateInterface(true); 

    // Анимация самой кнопки рандома
    const btn = document.getElementById('randomBtn');
    btn.style.transform = 'scale(0.9)';
    setTimeout(() => btn.style.transform = 'scale(1)', 150);

    // 3. Запуск с небольшой задержкой для сброса буфера (как в playTrackByIndex)
    setTimeout(() => {
        audioPlayer.src = track.url;
        audioPlayer.load();
        
        const playPromise = audioPlayer.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log("✅ Рандом трек играет");
                // Подтверждаем интерфейс (остается зеленым)
                updateInterface(false); 
            }).catch(error => {
                console.error("❌ Ошибка рандома:", error);
                updateInterface(false);
            });
        }
    }, 50);
});

// Слушатели аудио
audioPlayer.addEventListener('timeupdate', () => {
    updateAllProgressBars();
});

audioPlayer.addEventListener('ended', () => {
    document.getElementById('nextBtnGlobal').click();
});


function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Поиск
document.getElementById('searchInput').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    if (currentTab === 'favorites') {
        filteredTracks = query 
            ? tracks.filter(t => favorites.includes(t.id) && (t.title.toLowerCase().includes(query) || t.artist.toLowerCase().includes(query)))
            : tracks.filter(t => favorites.includes(t.id));
    } else {
        filteredTracks = query 
            ? tracks.filter(t => t.title.toLowerCase().includes(query) || t.artist.toLowerCase().includes(query))
            : [...tracks];
    }
    renderTracks(filteredTracks);
});

// Эффекты фона
function createSparkles() {
    const sparklesContainer = document.querySelector('.sparkles');
    if (!sparklesContainer) return;
    for (let i = 0; i < 30; i++) {
        const sparkle = document.createElement('span');
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const size = Math.random() * 4 + 2;
        const delay = Math.random() * 3;
        const duration = Math.random() * 2 + 2;
        sparkle.style.cssText = `
            position: absolute; left: ${x}%; top: ${y}%;
            width: ${size}px; height: ${size}px;
            background: ${getRandomColor()}; border-radius: 50%;
            box-shadow: 0 0 ${size * 2}px ${getRandomColor()};
            animation: sparkleFloat ${duration}s ease-in-out infinite;
            animation-delay: ${delay}s; pointer-events: none; opacity: 0.8;
        `;
        sparklesContainer.appendChild(sparkle);
    }
    if (!document.getElementById('sparkleKeyframes')) {
        const style = document.createElement('style');
        style.id = 'sparkleKeyframes';
        style.textContent = `
            @keyframes sparkleFloat {
                0%, 100% { opacity: 0; transform: scale(0) translateY(0); }
                20% { opacity: 1; }
                50% { opacity: 0.9; transform: scale(1) translateY(-15px); box-shadow: 0 0 20px currentColor; }
                80% { opacity: 0.5; }
            }
        `;
        document.head.appendChild(style);
    }
}

function createStars() {
    const starsContainer = document.querySelector('.stars');
    if (!starsContainer) return;
    for (let i = 0; i < 50; i++) {
        const star = document.createElement('span');
        const x = Math.random() * 100;
        const y = Math.random() * 60;
        const size = Math.random() * 2 + 1;
        const delay = Math.random() * 5;
        star.style.cssText = `
            position: absolute; left: ${x}%; top: ${y}%;
            width: ${size}px; height: ${size}px; background: #fff;
            border-radius: 50%; animation: starTwinkle ${Math.random() * 3 + 2}s ease-in-out infinite;
            animation-delay: ${delay}s; pointer-events: none; opacity: ${Math.random() * 0.5 + 0.3};
        `;
        starsContainer.appendChild(star);
    }
    if (!document.getElementById('starKeyframes')) {
        const style = document.createElement('style');
        style.id = 'starKeyframes';
        style.textContent = `
            @keyframes starTwinkle {
                0%, 100% { opacity: 0.3; transform: scale(1); }
                50% { opacity: 1; transform: scale(1.2); }
            }
        `;
        document.head.appendChild(style);
    }
}

function getRandomColor() {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#fee140'];
    return colors[Math.floor(Math.random() * colors.length)];
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('SW registered:', reg))
        .catch(err => console.error('SW error:', err));
}

// 1. Функция перехода к следующему треку (используется автоматически)
function goToNextTrack() {
    if (!tracks || tracks.length === 0) return;
    
    // Вычисляем индекс следующего трека
    currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
    
    console.log("⏭ Авто-переключение на трек:", tracks[currentTrackIndex].title);
    
    // Запускаем его (без лишних проверок, просто играем)
    const track = tracks[currentTrackIndex];
    
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
    audioPlayer.src = '';
    
    // Сразу подсвечиваем интерфейс
    updateInterface(true);

    setTimeout(() => {
        audioPlayer.src = track.url;
        audioPlayer.load();
        
        const playPromise = audioPlayer.play();
        if (playPromise !== undefined) {
            playPromise.then(() => updateInterface(false))
                       .catch(err => console.error("Ошибка авто-переключения:", err));
        }
    }, 50);
}

// 2. Функция перехода к предыдущему треку (на случай если вернете кнопку)
function goToPrevTrack() {
    if (!tracks || tracks.length === 0) return;
    
    if (audioPlayer.currentTime > 3) {
        audioPlayer.currentTime = 0;
    } else {
        currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
        playTrackByIndex(currentTrackIndex);
    }
}

// 3. Обработчик окончания трека (САМОЕ ВАЖНОЕ!)
// Когда трек заканчивается, браузер вызывает это событие
audioPlayer.addEventListener('ended', () => {
    console.log("🏁 Трек закончился. Запускаем следующий...");
    goToNextTrack();
});

// 4. Обработчик кнопки РАНДОМ
const randomBtn = document.getElementById('randomBtn');
if (randomBtn) {
    randomBtn.addEventListener('click', () => {
        if (!tracks || tracks.length === 0) return;

        let randomIndex;
        // Выбираем случайный трек, отличный от текущего
        do {
            randomIndex = Math.floor(Math.random() * tracks.length);
        } while (randomIndex === currentTrackIndex && tracks.length > 1);

        const track = tracks[randomIndex];
        currentTrackIndex = randomIndex;

        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        audioPlayer.src = '';
        
        updateInterface(true); 

        const btn = document.getElementById('randomBtn');
        btn.style.transform = 'scale(0.9)';
        setTimeout(() => btn.style.transform = 'scale(1)', 150);

        setTimeout(() => {
            audioPlayer.src = track.url;
            audioPlayer.load();
            
            const playPromise = audioPlayer.play();
            if (playPromise !== undefined) {
                playPromise.then(() => updateInterface(false))
                           .catch(err => console.error(err));
            }
        }, 50);
    });
}

// 5. Поиск (остается без изменений)
document.getElementById('searchInput').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    if (currentTab === 'favorites') {
        filteredTracks = query 
            ? tracks.filter(t => favorites.includes(t.id) && (t.title.toLowerCase().includes(query) || t.artist.toLowerCase().includes(query)))
            : tracks.filter(t => favorites.includes(t.id));
    } else {
        filteredTracks = query 
            ? tracks.filter(t => t.title.toLowerCase().includes(query) || t.artist.toLowerCase().includes(query))
            : [...tracks];
    }
    renderTracks(filteredTracks);
});


loadTracks();
