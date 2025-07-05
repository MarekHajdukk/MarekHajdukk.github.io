// Funkcja do wyświetlania aktualnej daty
function showCurrentDate(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        const today = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        element.textContent = today.toLocaleDateString('pl-PL', options);
    }
}

// Funkcja do zapisywania danych roślin w localStorage
function savePlants(plants) {
    localStorage.setItem('ogroDeckPlants', JSON.stringify(plants));
}

// Funkcja do pobierania danych roślin z localStorage
function getPlants() {
    const plants = localStorage.getItem('ogroDeckPlants');
    console.log('Pobrane dane roślin z localStorage:', plants);
    return plants ? JSON.parse(plants) : [];
}

// Funkcja do generowania unikalnego ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Funkcja do obliczania następnej daty
function calculateNextDate(date, days) {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + parseInt(days));
    return nextDate.toLocaleDateString('pl-PL');
}

// Funkcja do generowania powiadomień o nadchodzących wydarzeniach
function generateNotifications() {
    const plants = getPlants();
    const today = new Date();
    const notifications = [];
    
    plants.forEach(plant => {
        // Sprawdź podlewanie
        if (plant.wateringFrequency) {
            let nextWateringDate;
            
            if (plant.lastWatered) {
                nextWateringDate = calculateNextEvent(new Date(plant.lastWatered), plant.wateringFrequency);
            } else if (plant.createdAt) {
                nextWateringDate = calculateNextEvent(new Date(plant.createdAt), plant.wateringFrequency);
            } else {
                nextWateringDate = calculateNextEvent(new Date(), plant.wateringFrequency);
            }
            
            if (nextWateringDate) {
                const daysUntilWatering = Math.ceil((nextWateringDate - today) / (1000 * 60 * 60 * 24));
                
                if (daysUntilWatering >= 0 && daysUntilWatering <= 7) {
                    let message = '';
                    if (daysUntilWatering === 0) {
                        message = `Podlewanie rośliny ${plant.name} dzisiaj`;
                    } else if (daysUntilWatering === 1) {
                        message = `Podlewanie rośliny ${plant.name} jutro`;
                    } else {
                        message = `Podlewanie rośliny ${plant.name} za ${daysUntilWatering} dni`;
                    }
                    
                    notifications.push({
                        type: 'watering',
                        message: message,
                        plantId: plant.id,
                        daysUntil: daysUntilWatering
                    });
                }
            }
        }
        
        // Sprawdź nawożenie
        if (plant.fertilizingFrequency) {
            let nextFertilizingDate;
            
            if (plant.lastFertilized) {
                nextFertilizingDate = calculateNextEvent(new Date(plant.lastFertilized), plant.fertilizingFrequency);
            } else if (plant.createdAt) {
                nextFertilizingDate = calculateNextEvent(new Date(plant.createdAt), plant.fertilizingFrequency);
            } else {
                nextFertilizingDate = calculateNextEvent(new Date(), plant.fertilizingFrequency);
            }
            
            if (nextFertilizingDate) {
                const daysUntilFertilizing = Math.ceil((nextFertilizingDate - today) / (1000 * 60 * 60 * 24));
                
                if (daysUntilFertilizing >= 0 && daysUntilFertilizing <= 7) {
                    let message = '';
                    if (daysUntilFertilizing === 0) {
                        message = `Nawożenie rośliny ${plant.name} dzisiaj`;
                    } else if (daysUntilFertilizing === 1) {
                        message = `Nawożenie rośliny ${plant.name} jutro`;
                    } else {
                        message = `Nawożenie rośliny ${plant.name} za ${daysUntilFertilizing} dni`;
                    }
                    
                    notifications.push({
                        type: 'fertilizing',
                        message: message,
                        plantId: plant.id,
                        daysUntil: daysUntilFertilizing
                    });
                }
            }
        }
    });
    
    // Sortuj powiadomienia według liczby dni do wydarzenia
    notifications.sort((a, b) => a.daysUntil - b.daysUntil);
    
    return notifications;
}

// Funkcja do wyświetlania powiadomień na stronie głównej
function displayNotifications() {
    // Priorytetowo szukamy kontenera po ID, a dopiero potem po klasie
    const remindersContainer = document.getElementById('notifications-container') || document.querySelector('.reminders');
    if (!remindersContainer) {
        console.error('Nie znaleziono kontenera powiadomień');
        return;
    }
    
    const notifications = generateNotifications();
    console.log('Wygenerowane powiadomienia:', notifications);
    
    // Wyczyść kontener powiadomień
    remindersContainer.innerHTML = '';
    
    if (notifications.length === 0) {
        remindersContainer.innerHTML = '<li class="reminder-item"><div>Brak nadchodzących wydarzeń</div></li>';
        return;
    }
    
    // Wyświetl maksymalnie 5 powiadomień
    const notificationsToShow = notifications.slice(0, 5);
    
    notificationsToShow.forEach(notification => {
        const reminderItem = document.createElement('li');
        reminderItem.className = 'reminder-item';
        
        const icon = notification.type === 'watering' ? 'fa-tint' : 'fa-prescription-bottle-alt';
        
        reminderItem.innerHTML = `
            <div><i class="fas ${icon} reminder-icon"></i> ${notification.message}</div>
            <button class="button secondary small notification-action" data-type="${notification.type}" data-id="${notification.plantId}">Zrobione</button>
        `;
        
        remindersContainer.appendChild(reminderItem);
    });
    
    // Dodaj obsługę przycisków "Zrobione"
    document.querySelectorAll('.notification-action').forEach(button => {
        button.addEventListener('click', function() {
            const plantId = this.getAttribute('data-id');
            const type = this.getAttribute('data-type');
            
            if (type === 'watering') {
                waterPlant(plantId);
            } else if (type === 'fertilizing') {
                fertilizePlant(plantId);
            }
            
            // Odśwież powiadomienia
            displayNotifications();
        });
    });
}
    document.querySelectorAll('.notification-action').forEach(button => {
        button.addEventListener('click', function() {
            const plantId = this.getAttribute('data-id');
            const type = this.getAttribute('data-type');
            
            if (type === 'watering') {
                waterPlant(plantId);
            } else if (type === 'fertilizing') {
                fertilizePlant(plantId);
            }
            
            // Odśwież powiadomienia
            displayNotifications();
        });
    });


// Funkcja do nawożenia rośliny
function fertilizePlant(plantId) {
    const plants = getPlants();
    const plantIndex = plants.findIndex(p => p.id === plantId);
    
    if (plantIndex !== -1) {
        plants[plantIndex].lastFertilized = new Date().toISOString();
        savePlants(plants);
        renderPlantCards(); // Odśwież karty
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM załadowany - inicjalizacja aplikacji');
    
    // Sprawdź, na której podstronie jesteśmy
    const currentPage = window.location.pathname.split('/').pop();
    console.log('Aktualna strona:', currentPage);
    
    // Aktywuj odpowiedni link w nawigacji
    const links = document.querySelectorAll('.sidebar nav a.tab-link');
    links.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'home.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // Wykonaj odpowiednie akcje w zależności od strony
    if (currentPage === 'home.html' || currentPage === '') {
        // Strona główna
        showCurrentDate('today-date');
        updateWeatherLocationDisplay();
        simulateWeatherLoad();
        setTimeout(() => generateCalendar('calendar-home'), 100);
        setTimeout(() => displayNotifications(), 200);
    } else if (currentPage === 'plants.html') {
        // Strona z roślinami
        renderPlantCards();
    } else if (currentPage === 'calendar.html') {
        // Strona z kalendarzem
        showCurrentDate('today-date-calendar');
        setTimeout(() => generateCalendar('calendar-view'), 100);
    }

    // Wywołanie funkcji wyświetlania daty
    showCurrentDate('today-date');
    showCurrentDate('today-date-calendar');

    // Funkcja do renderowania kart roślin
    function renderPlantCards() {
        const cardsContainer = document.querySelector('.plant-cards');
        if (!cardsContainer) return;

        const plants = getPlants();
        cardsContainer.innerHTML = ''; // Wyczyść kontener

        plants.forEach(plant => {
            const nextWatering = plant.wateringFrequency ? calculateNextDate(new Date(), parseInt(plant.wateringFrequency)) : 'Nie ustawiono';
            const nextFertilizing = plant.fertilizingFrequency ? calculateNextDate(new Date(), parseInt(plant.fertilizingFrequency)) : 'Nie ustawiono';

            const card = document.createElement('div');
            card.className = 'plant-card';
            card.innerHTML = `
                <div class="plant-thumbnail-wrapper">
                    <img src="${plant.image || `https://via.placeholder.com/260x180/B0BEC5/4A4A4A?text=${encodeURIComponent(plant.name)}`}" alt="${plant.name}" class="plant-thumbnail">
                </div>
                <h3>${plant.name}</h3>
                <p><i class="fas fa-info-circle"></i>Gatunek: <strong>${plant.type || 'Nie określono'}</strong></p>
                <p><i class="fas fa-calendar-plus"></i>Data nabycia: <strong>${plant.acquisitionDate || 'Nie określono'}</strong></p>
                <p><i class="fas fa-tint"></i>Następne podlewanie: <strong>${nextWatering}</strong></p>
                <p><i class="fas fa-prescription-bottle-alt"></i>Następne nawożenie: <strong>${nextFertilizing}</strong></p>
                <div class="actions">
                    <button class="button secondary small water-plant" data-id="${plant.id}"><i class="fas fa-tint"></i>Podlej</button>
                    <button class="button small plant-details" data-id="${plant.id}"><i class="fas fa-search"></i>Szczegóły</button>
                </div>`;
            cardsContainer.appendChild(card);
        });

        // Dodaj obsługę przycisków
        document.querySelectorAll('.water-plant').forEach(button => {
            button.addEventListener('click', function() {
                const plantId = this.getAttribute('data-id');
                waterPlant(plantId);
            });
        });
        
        // Dodaj obsługę przycisków szczegółów
        document.querySelectorAll('.plant-details').forEach(button => {
            button.addEventListener('click', function() {
                const plantId = this.getAttribute('data-id');
                showPlantDetails(plantId);
            });
        });
    }

    // Funkcja do podlewania rośliny
    function waterPlant(plantId) {
        const plants = getPlants();
        const plantIndex = plants.findIndex(p => p.id === plantId);
        
        if (plantIndex !== -1) {
            plants[plantIndex].lastWatered = new Date().toISOString();
            savePlants(plants);
            renderPlantCards(); // Odśwież karty
        }
    }
    
    // Funkcja do usuwania rośliny
    function deletePlant(plantId) {
        const plants = getPlants();
        const plantIndex = plants.findIndex(p => p.id === plantId);
        
        if (plantIndex !== -1) {
            const plantName = plants[plantIndex].name;
            plants.splice(plantIndex, 1);
            savePlants(plants);
            renderPlantCards(); // Odśwież karty
        }
    }

    // Inicjalizacja kart roślin przy ładowaniu strony
    // Wywołujemy renderPlantCards bezpośrednio, aby upewnić się, że karty są wyświetlane
    renderPlantCards();
    
    // Funkcja do wyświetlania szczegółów rośliny
    function showPlantDetails(plantId) {
        const plants = getPlants();
        const plant = plants.find(p => p.id === plantId);
        
        if (!plant) {
            alert('Nie znaleziono rośliny!');
            return;
        }
        
        // Oblicz daty podlewania i nawożenia
        const nextWatering = plant.wateringFrequency ? calculateNextDate(new Date(), parseInt(plant.wateringFrequency)) : 'Nie ustawiono';
        const nextFertilizing = plant.fertilizingFrequency ? calculateNextDate(new Date(), parseInt(plant.fertilizingFrequency)) : 'Nie ustawiono';
        
        // Oblicz ostatnie daty podlewania i nawożenia
        const lastWatered = plant.lastWatered ? new Date(plant.lastWatered).toLocaleDateString('pl-PL') : 'Nigdy';
        const lastFertilized = plant.lastFertilized ? new Date(plant.lastFertilized).toLocaleDateString('pl-PL') : 'Nigdy';
        
        // Przygotuj zawartość modalu
        const modalContent = document.getElementById('plant-details-content');
        modalContent.innerHTML = `
            <div class="plant-details-view">
                <div class="plant-details-header">
                    <img src="${plant.image || `https://via.placeholder.com/260x180/B0BEC5/4A4A4A?text=${encodeURIComponent(plant.name)}`}" alt="${plant.name}" class="plant-details-image">
                    <div class="plant-details-title">
                        <h2>${plant.name}</h2>
                        <p><i class="fas fa-info-circle"></i> <strong>Gatunek:</strong> ${plant.type || 'Nie określono'}</p>
                        <p><i class="fas fa-calendar-plus"></i> <strong>Data nabycia:</strong> ${plant.acquisitionDate || 'Nie określono'}</p>
                    </div>
                </div>
                
                <div class="plant-details-info">
                    <div class="plant-details-info-item">
                        <h3><i class="fas fa-tint"></i> Podlewanie</h3>
                        <p><strong>Częstotliwość:</strong> ${plant.wateringFrequency ? `Co ${plant.wateringFrequency} dni` : 'Nie ustawiono'}</p>
                        <p><strong>Ostatnie podlewanie:</strong> ${lastWatered}</p>
                        <p><strong>Następne podlewanie:</strong> ${nextWatering}</p>
                    </div>
                    
                    <div class="plant-details-info-item">
                        <h3><i class="fas fa-prescription-bottle-alt"></i> Nawożenie</h3>
                        <p><strong>Częstotliwość:</strong> ${plant.fertilizingFrequency ? `Co ${plant.fertilizingFrequency} dni` : 'Nie ustawiono'}</p>
                        <p><strong>Ostatnie nawożenie:</strong> ${lastFertilized}</p>
                        <p><strong>Następne nawożenie:</strong> ${nextFertilizing}</p>
                    </div>
                </div>
                
                ${plant.notes ? `
                <div class="plant-details-notes">
                    <h3><i class="fas fa-sticky-note"></i> Notatki</h3>
                    <p>${plant.notes}</p>
                </div>` : ''}
                
                <div class="plant-details-actions">
                    <button class="button edit-plant" data-id="${plant.id}"><i class="fas fa-edit"></i> Edytuj</button>
                    <button class="button secondary water-plant" data-id="${plant.id}"><i class="fas fa-tint"></i> Podlej</button>
                    <button class="button secondary fertilize-plant" data-id="${plant.id}"><i class="fas fa-prescription-bottle-alt"></i> Nawóź</button>
                    <button class="button danger delete-plant" data-id="${plant.id}"><i class="fas fa-trash"></i> Usuń</button>
                    <button class="button modal-close-btn"><i class="fas fa-times"></i> Zamknij</button>
                </div>
            </div>
            
            <div class="plant-edit-form">
                <h2><i class="fas fa-edit"></i> Edycja rośliny</h2>
                <form id="edit-plant-form" data-id="${plant.id}">
                    <div class="form-row">
                        <label for="edit-plant-name">Nazwa rośliny:</label>
                        <input type="text" id="edit-plant-name" name="edit-plant-name" value="${plant.name}" required>
                    </div>
                    
                    <div class="form-row">
                        <label for="edit-plant-type">Gatunek (opcjonalnie):</label>
                        <input type="text" id="edit-plant-type" name="edit-plant-type" value="${plant.type || ''}">
                    </div>
                    
                    <div class="form-row">
                        <label for="edit-plant-acquisition-date">Data nabycia:</label>
                        <input type="date" id="edit-plant-acquisition-date" name="edit-plant-acquisition-date" value="${plant.acquisitionDate || ''}" required>
                    </div>
                    
                    <div class="form-grid">
                        <div class="form-row">
                            <label for="edit-watering-frequency">Częstotliwość podlewania (dni):</label>
                            <input type="number" id="edit-watering-frequency" name="edit-watering-frequency" value="${plant.wateringFrequency || ''}" min="1">
                        </div>
                        
                        <div class="form-row">
                            <label for="edit-fertilizing-frequency">Częstotliwość nawożenia (dni):</label>
                            <input type="number" id="edit-fertilizing-frequency" name="edit-fertilizing-frequency" value="${plant.fertilizingFrequency || ''}" min="1">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <label for="edit-plant-notes">Opis / Notatki:</label>
                        <textarea id="edit-plant-notes" name="edit-plant-notes" rows="5">${plant.notes || ''}</textarea>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="button secondary cancel-edit"><i class="fas fa-times"></i> Anuluj</button>
                        <button type="submit" class="button"><i class="fas fa-save"></i> Zapisz zmiany</button>
                    </div>
                </form>
            </div>
        `;
        
        // Pokaż modal
        const modal = document.getElementById('plant-details-modal');
        modal.classList.add('active');
        
        // Referencje do widoków
        const detailsView = modalContent.querySelector('.plant-details-view');
        const editForm = modalContent.querySelector('.plant-edit-form');
        
        // Obsługa przycisku edycji
        const editButton = modalContent.querySelector('.edit-plant');
        editButton.addEventListener('click', function() {
            detailsView.classList.add('hidden');
            editForm.classList.add('active');
        });
        
        // Obsługa przycisku anulowania edycji
        const cancelButton = modalContent.querySelector('.cancel-edit');
        cancelButton.addEventListener('click', function() {
            editForm.classList.remove('active');
            detailsView.classList.remove('hidden');
        });
        
        // Obsługa formularza edycji
        const form = modalContent.querySelector('#edit-plant-form');
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const plantId = this.getAttribute('data-id');
            
            // Pobierz wartości z formularza
            const name = document.getElementById('edit-plant-name').value;
            const type = document.getElementById('edit-plant-type').value;
            const acquisitionDate = document.getElementById('edit-plant-acquisition-date').value;
            const wateringFrequency = document.getElementById('edit-watering-frequency').value;
            const fertilizingFrequency = document.getElementById('edit-fertilizing-frequency').value;
            const notes = document.getElementById('edit-plant-notes').value;
            
            // Zaktualizuj dane rośliny
            const plants = getPlants();
            const plantIndex = plants.findIndex(p => p.id === plantId);
            
            if (plantIndex !== -1) {
                // Zachowaj istniejące dane, które nie są edytowane
                const updatedPlant = {
                    ...plants[plantIndex],
                    name,
                    type,
                    acquisitionDate,
                    wateringFrequency,
                    fertilizingFrequency,
                    notes
                };
                
                plants[plantIndex] = updatedPlant;
                savePlants(plants);
                
                // Odśwież widok szczegółów i karty roślin
                showPlantDetails(plantId);
                renderPlantCards();
                
                alert('Roślina została zaktualizowana!');
            }
        });
        
        // Obsługa przycisku podlewania w modalu
        const waterButton = modalContent.querySelector('.water-plant');
        waterButton.addEventListener('click', function() {
            const plantId = this.getAttribute('data-id');
            waterPlant(plantId);
            // Odśwież zawartość modalu po podlaniu
            showPlantDetails(plantId);
        });
        
        // Obsługa przycisku nawożenia w modalu
        const fertilizeButton = modalContent.querySelector('.fertilize-plant');
        fertilizeButton.addEventListener('click', function() {
            const plantId = this.getAttribute('data-id');
            fertilizePlant(plantId);
            // Odśwież zawartość modalu po nawożeniu
            showPlantDetails(plantId);
        });
        
        // Obsługa przycisku usuwania rośliny
        const deleteButton = modalContent.querySelector('.delete-plant');
        deleteButton.addEventListener('click', function() {
            const plantId = this.getAttribute('data-id');
            if (confirm('Czy na pewno chcesz usunąć tę roślinę? Tej operacji nie można cofnąć.')) {
                deletePlant(plantId);
                modal.classList.remove('active');
            }
        });
        
        // Obsługa przycisku zamykania w modalu
        const closeButton = modalContent.querySelector('.modal-close-btn');
        closeButton.addEventListener('click', function() {
            modal.classList.remove('active');
        });
    }
    
    // Obsługa przycisku zamykania modalu
    const closeModalButton = document.getElementById('close-plant-details');
    if (closeModalButton) {
        closeModalButton.addEventListener('click', function() {
            const modal = document.getElementById('plant-details-modal');
            modal.classList.remove('active');
        });
    }
    
    // Zamykanie modalu po kliknięciu poza jego zawartością
    const modal = document.getElementById('plant-details-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    }

    // Obsługa formularza dodawania rośliny
    const form = document.getElementById('plant-form');

    if (form) {
        console.log('Znaleziono formularz dodawania rośliny');
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('Przetwarzanie formularza dodawania rośliny');

            const name = document.getElementById('plant-name').value;
            const type = document.getElementById('plant-type').value;
            const acquisitionDate = document.getElementById('plant-acquisition-date').value;
            const wateringFrequency = document.getElementById('watering-frequency').value;
            const fertilizingFrequency = document.getElementById('fertilizing-frequency').value;
            const notes = document.getElementById('plant-notes').value;
            
            // Pobierz zdjęcie jeśli zostało dodane
            const imageInput = document.getElementById('plant-image');
            
            // Funkcja do zapisywania rośliny i przekierowania
            function saveNewPlant(imageUrl) {
                // Dodaj nową roślinę do localStorage
                const newPlant = {
                    id: generateId(),
                    name,
                    type,
                    acquisitionDate,
                    wateringFrequency,
                    fertilizingFrequency,
                    notes,
                    image: imageUrl,
                    createdAt: new Date().toISOString(),
                    lastWatered: null,
                    lastFertilized: null
                };
                
                console.log('Zapisywanie nowej rośliny:', newPlant.name);
                
                const plants = getPlants();
                plants.push(newPlant);
                savePlants(plants);
                
                alert('Roślina została dodana!');
                form.reset();
                
                // Przekierowanie do strony z roślinami
                console.log('Przekierowanie do strony z roślinami');
                window.location.href = 'plants.html';
            }
            
            if (imageInput && imageInput.files && imageInput.files[0]) {
                // Używamy FileReader do konwersji obrazu na Data URL
                const reader = new FileReader();
                reader.onload = function(e) {
                    saveNewPlant(e.target.result);
                };
                reader.readAsDataURL(imageInput.files[0]);
            } else {
                // Dodaj nową roślinę bez zdjęcia
                saveNewPlant('');
            }
        });
    }

    // Generowanie kalendarzy z małym opóźnieniem, aby upewnić się, że DOM jest gotowy
    setTimeout(() => {
        generateCalendar('calendar-home');
        generateCalendar('calendar-view');
    }, 100);


    // Funkcje pogodowe (jak w poprzedniej odpowiedzi)
    function updateWeatherLocationDisplay() {
        const locationInput = document.getElementById('user-location');
        const weatherLocationDisplay = document.getElementById('weather-location-display');
        if (locationInput && weatherLocationDisplay) {
            if (locationInput.value.trim() !== "") {
                weatherLocationDisplay.textContent = locationInput.value;
            } else {
                weatherLocationDisplay.textContent = "Twojej Lokalizacji";
            }
        }
    }

    function simulateWeatherLoad() {
        const placeholder = document.getElementById('weather-widget-placeholder');
        const loadedWidget = document.getElementById('weather-widget-loaded');
        
        if (!placeholder || !loadedWidget) return;

        placeholder.style.display = 'flex';
        loadedWidget.style.display = 'none';

        setTimeout(() => {
            placeholder.style.display = 'none';
            loadedWidget.style.display = 'flex';
            // Tutaj można by dodać logikę pobierania rzeczywistych danych pogodowych
        }, 1500);
    }

    // Nasłuchiwanie zmian w polu lokalizacji
    const locationInput = document.getElementById('user-location');
    if (locationInput) {
        locationInput.addEventListener('input', updateWeatherLocationDisplay);
    }

    // Obsługa formularza ustawień użytkownika (placeholder)
    const userSettingsForm = document.getElementById('user-settings-form');
    userSettingsForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        // Tutaj logika zapisu danych
    });

    const passwordChangeForm = document.getElementById('password-change-form');
    passwordChangeForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        // Tutaj logika zmiany hasła
    });

}); // Koniec głównego event listenera DOMContentLoaded

// Funkcja pomocnicza do sprawdzania, czy dwie daty to ten sam dzień
function isSameDay(date1, date2) {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
}

// Funkcja do obliczania następnej daty podlewania lub nawożenia
function calculateNextEvent(lastDate, frequency) {
    if (!lastDate || !frequency) return null;
    
    const lastEventDate = new Date(lastDate);
    const nextEventDate = new Date(lastEventDate);
    nextEventDate.setDate(lastEventDate.getDate() + parseInt(frequency));
    
    return nextEventDate;
}

// Funkcja do sprawdzania, czy na dany dzień przypada wydarzenie (podlewanie, nawożenie)
function getEventsForDay(year, month, day) {
    try {
        const plants = getPlants();
        const events = [];
        const checkDate = new Date(year, month, day);
        
        console.log('getEventsForDay - data sprawdzania:', checkDate);
        console.log('getEventsForDay - pobrane rośliny:', plants);
        
        if (!plants || !Array.isArray(plants)) {
            console.error('Nie znaleziono roślin lub dane są nieprawidłowe');
            return [];
        }
        
        if (plants.length === 0) {
            console.log('Brak roślin do sprawdzenia wydarzeń');
            return [];
        }
        
        plants.forEach(plant => {
            try {
                // Sprawdź podlewanie
                if (plant.wateringFrequency) {
                    let nextWateringDate;
                    
                    if (plant.lastWatered) {
                        // Jeśli była już podlewana, oblicz następną datę od ostatniego podlewania
                        nextWateringDate = calculateNextEvent(plant.lastWatered, plant.wateringFrequency);
                    } else if (plant.createdAt) {
                        // Jeśli nie była podlewana, użyj daty utworzenia
                        nextWateringDate = calculateNextEvent(plant.createdAt, plant.wateringFrequency);
                    } else {
                        // Jeśli nie ma daty utworzenia, użyj dzisiejszej daty
                        nextWateringDate = calculateNextEvent(new Date(), plant.wateringFrequency);
                    }
                    
                    if (nextWateringDate && isSameDay(nextWateringDate, checkDate)) {
                        events.push({
                            type: 'watering',
                            plantName: plant.name,
                            plantId: plant.id
                        });
                    }
                }
                
                // Sprawdź nawożenie
                if (plant.fertilizingFrequency) {
                    let nextFertilizingDate;
                    
                    if (plant.lastFertilized) {
                        // Jeśli była już nawożona, oblicz następną datę od ostatniego nawożenia
                        nextFertilizingDate = calculateNextEvent(plant.lastFertilized, plant.fertilizingFrequency);
                    } else if (plant.createdAt) {
                        // Jeśli nie była nawożona, użyj daty utworzenia
                        nextFertilizingDate = calculateNextEvent(plant.createdAt, plant.fertilizingFrequency);
                    } else {
                        // Jeśli nie ma daty utworzenia, użyj dzisiejszej daty
                        nextFertilizingDate = calculateNextEvent(new Date(), plant.fertilizingFrequency);
                    }
                    
                    if (nextFertilizingDate && isSameDay(nextFertilizingDate, checkDate)) {
                        events.push({
                            type: 'fertilizing',
                            plantName: plant.name,
                            plantId: plant.id
                        });
                    }
                }
            } catch (plantError) {
                console.error('Błąd podczas przetwarzania rośliny:', plant.name, plantError);
            }
        });
        
        console.log('getEventsForDay - znalezione wydarzenia:', events);
        return events;
    } catch (error) {
        console.error('Błąd podczas pobierania wydarzeń:', error);
        return [];
    }
}

// Funkcja generowania kalendarza z wydarzeniami
function generateCalendar(containerId) {
    try {
        console.log('Generowanie kalendarza dla kontenera:', containerId);
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('Nie znaleziono kontenera kalendarza:', containerId);
            return;
        }

        // Wyczyść kontener przed dodaniem nowego kalendarza
        container.innerHTML = '';

        const todayDate = new Date();
        const year = todayDate.getFullYear();
        const month = todayDate.getMonth();
        const monthNames = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];

        // Utwórz kontrolki nawigacji kalendarza
        const calendarControls = document.createElement('div');
        calendarControls.className = 'calendar-controls';
        container.appendChild(calendarControls);

        // Utwórz nagłówek kalendarza
        const calendarHeader = document.createElement('div');
        calendarHeader.className = 'calendar-header';
        calendarHeader.textContent = `${monthNames[month]} ${year}`;
        calendarControls.appendChild(calendarHeader);

        // Utwórz tabelę kalendarza
        const table = document.createElement('table');
        table.className = 'calendar-table'; // Dodajemy klasę dla tabeli
        container.appendChild(table);

        // Utwórz nagłówek tabeli
        const thead = document.createElement('thead');
        table.appendChild(thead);
        const headerRow = document.createElement('tr');
        thead.appendChild(headerRow);

        // Dodaj dni tygodnia
        const days = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd']; // Polski układ dni
        days.forEach(day => {
            const th = document.createElement('th');
            th.textContent = day;
            headerRow.appendChild(th);
        });

        // Utwórz ciało tabeli
        const tbody = document.createElement('tbody');
        table.appendChild(tbody);

        // Oblicz pierwszy dzień miesiąca (dostosowanie do polskiego kalendarza)
        let firstDayOfMonth = new Date(year, month, 1).getDay();
        if (firstDayOfMonth === 0) firstDayOfMonth = 6; // Niedziela staje się 6
        else firstDayOfMonth -= 1; // Poniedziałek (1) staje się 0, Wtorek (2) staje się 1 itd.

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        console.log('Dni w miesiącu:', daysInMonth, 'Pierwszy dzień miesiąca:', firstDayOfMonth);

        // Utwórz komórki kalendarza
        let currentRow = document.createElement('tr');
        tbody.appendChild(currentRow);

        // Dodaj puste komórki na początku miesiąca
        for (let i = 0; i < firstDayOfMonth; i++) {
            const emptyCell = document.createElement('td');
            currentRow.appendChild(emptyCell);
        }

        // Dodaj dni miesiąca
        for (let day = 1; day <= daysInMonth; day++) {
            // Nowa linia co 7 dni
            if ((firstDayOfMonth + day - 1) % 7 === 0 && day !== 1) {
                currentRow = document.createElement('tr');
                tbody.appendChild(currentRow);
            }
            
            // Utwórz komórkę dnia
            const dayCell = document.createElement('td');
            
            // Sprawdź, czy to dzisiejszy dzień
            if (day === todayDate.getDate() && month === todayDate.getMonth() && year === todayDate.getFullYear()) {
                dayCell.classList.add('today');
            }
            
            // Dodaj atrybuty daty
            dayCell.dataset.day = day;
            dayCell.dataset.month = month;
            dayCell.dataset.year = year;
            
            // Dodaj numer dnia
            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.textContent = day;
            dayCell.appendChild(dayNumber);
            
            // Sprawdź, czy na ten dzień przypada jakieś wydarzenie
            const events = getEventsForDay(year, month, day);
            
            // Dodaj ikony wydarzeń, jeśli istnieją
            if (events && events.length > 0) { // Dodajemy sprawdzenie, czy events istnieje
                dayCell.classList.add('has-event');
                
                const hasWatering = events.some(e => e.type === 'watering');
                const hasFertilizing = events.some(e => e.type === 'fertilizing');
                
                if (hasWatering) {
                    const wateringIcon = document.createElement('i');
                    wateringIcon.className = 'fas fa-tint event-icon watering-icon';
                    wateringIcon.title = 'Podlewanie';
                    dayCell.appendChild(wateringIcon);
                }
                
                if (hasFertilizing) {
                    const fertilizingIcon = document.createElement('i');
                    fertilizingIcon.className = 'fas fa-prescription-bottle-alt event-icon fertilizing-icon';
                    fertilizingIcon.title = 'Nawożenie';
                    dayCell.appendChild(fertilizingIcon);
                }
                
                // Dodaj tooltip z informacjami o wydarzeniach
                const tooltip = document.createElement('div');
                tooltip.className = 'event-tooltip';
                events.forEach(event => {
                    const eventItem = document.createElement('div');
                    eventItem.className = 'event-item';
                    eventItem.innerHTML = `<i class="fas ${event.type === 'watering' ? 'fa-tint' : 'fa-prescription-bottle-alt'}"></i> ${event.plantName} - ${event.type === 'watering' ? 'Podlewanie' : 'Nawożenie'}`;
                    tooltip.appendChild(eventItem);
                });
                dayCell.appendChild(tooltip);
                
                // Pokaż tooltip po najechaniu myszką
                dayCell.addEventListener('mouseenter', function() {
                    tooltip.style.display = 'block';
                });
                dayCell.addEventListener('mouseleave', function() {
                    tooltip.style.display = 'none';
                });
            }
            
            currentRow.appendChild(dayCell);
        }

        // Dopełnienie ostatniego tygodnia pustymi komórkami
        let lastDayOfMonth = (firstDayOfMonth + daysInMonth - 1) % 7;
        for (let i = lastDayOfMonth + 1; i <= 6; i++) { // Uzupełniamy do 6 (bo 0-6 to 7 dni)
            const emptyCell = document.createElement('td');
            currentRow.appendChild(emptyCell);
        }

        // Dodaj legendę pod kalendarzem
        const legend = document.createElement('div');
        legend.className = 'calendar-legend';
        
        const wateringLegend = document.createElement('div');
        wateringLegend.className = 'legend-item';
        wateringLegend.innerHTML = '<i class="fas fa-tint watering-icon"></i> Podlewanie';
        legend.appendChild(wateringLegend);
        
        const fertilizingLegend = document.createElement('div');
        fertilizingLegend.className = 'legend-item';
        fertilizingLegend.innerHTML = '<i class="fas fa-prescription-bottle-alt fertilizing-icon"></i> Nawożenie';
        legend.appendChild(fertilizingLegend);
        
        container.appendChild(legend);
        console.log('Kalendarz wygenerowany pomyślnie');
    } catch (error) {
        console.error('Błąd podczas generowania kalendarza:', error);
    }
}