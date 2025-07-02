document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.main-content-wrapper .tab'); // Celujemy w zakładki w nowym wrapperze
    const links = document.querySelectorAll('.sidebar nav a.tab-link');

    function activateTab(hash) {
        const targetHash = hash.replace('#', '');
        tabs.forEach(tab => {
            tab.style.display = (tab.id === targetHash) ? 'block' : 'none';
        });

        links.forEach(link => {
            if (link.getAttribute('href') === '#' + targetHash) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        
        // Aktualizacja informacji o lokalizacji na stronie głównej i symulacja pogody
        if (targetHash === 'home') {
            updateWeatherLocationDisplay();
            simulateWeatherLoad();
        }
    }

    const initialHash = location.hash || '#home'; // Domyślnie #home
    activateTab(initialHash);

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            // e.preventDefault(); // Zapobiega domyślnej akcji skoku, jeśli nie chcemy zmiany URL
            const hash = link.getAttribute('href');
            history.pushState(null, null, hash); // Zmienia URL bez przeładowania strony dla lepszego UX
            activateTab(hash);
        });
    });
    
    // Pozwala na nawigację przy użyciu przycisków wstecz/dalej przeglądarki
    window.addEventListener('popstate', () => {
        activateTab(location.hash || '#home');
    });


    function showCurrentDate(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            const today = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            element.textContent = today.toLocaleDateString('pl-PL', options);
        }
    }

    showCurrentDate('today-date');
    showCurrentDate('today-date-calendar');

    const form = document.getElementById('plant-form');
    // const cardsContainer = document.querySelector('.plant-cards'); // Przeniesione, bo cardsContainer jest tylko w index.html

    form?.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('plant-name').value;
        const type = document.getElementById('plant-type').value;
        const date = document.getElementById('plant-date').value;

        // Logika dodawania karty - jeśli jesteśmy na stronie index.html
        // Ta część jest problematyczna, bo script.js jest współdzielony.
        // Idealnie, logika dodawania karty powinna być w skrypcie tylko dla index.html lub przekazywać dane inaczej.
        // Dla uproszczenia, zostawiam jak było, ale to wymagałoby refaktoryzacji dla produkcji.
        const cardsContainer = document.querySelector('.plant-cards'); 
        if (cardsContainer) { // Sprawdzamy czy element istnieje (czyli czy jesteśmy na index.html)
            const card = document.createElement('div');
            card.className = 'plant-card';
            // Dostosuj innerHTML do nowej struktury karty
            card.innerHTML = `
                <div class="plant-thumbnail-wrapper">
                    <img src="https://via.placeholder.com/260x180/B0BEC5/4A4A4A?text=${encodeURIComponent(name)}" alt="${name}" class="plant-thumbnail">
                </div>
                <h3>${name}</h3>
                <p><i class="fas fa-info-circle"></i>Gatunek: <strong>${type}</strong></p>
                <p><i class="fas fa-calendar-plus"></i>Data nabycia: <strong>${date}</strong></p>
                <div class="actions">
                    <button class="button secondary small"><i class="fas fa-check"></i>Akcja 1</button>
                    <button class="button small">Akcja 2</button>
                </div>`;
            cardsContainer.appendChild(card);
        }
        
        form.reset();
        // Opcjonalnie: Przekierowanie z powrotem do listy roślin po dodaniu
        // window.location.href = 'index.html#plants'; 
    });

    // Kalendarz - bez zmian w logice, ale upewnij się, że ID kontenerów są poprawne
    generateCalendar('calendar-home');
    generateCalendar('calendar-view');


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
        alert('Ustawienia użytkownika zapisane (symulacja).');
        // Tutaj logika zapisu danych
    });

    const passwordChangeForm = document.getElementById('password-change-form');
    passwordChangeForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Hasło zmienione (symulacja).');
        // Tutaj logika zmiany hasła
    });

}); // Koniec głównego event listenera DOMContentLoaded

// Funkcja generowania kalendarza (pozostaje bez zmian, jeśli jej logika jest OK)
function generateCalendar(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const todayDate = new Date(); // Używamy tej samej nazwy zmiennej co w showCurrentDate
    const year = todayDate.getFullYear();
    const month = todayDate.getMonth();

    // Dzień tygodnia pierwszego dnia miesiąca (0 - Niedziela, 1 - Poniedziałek, ..., 6 - Sobota)
    // Dostosowanie do polskiego kalendarza, gdzie tydzień zaczyna się od poniedziałku
    let firstDayOfMonth = new Date(year, month, 1).getDay();
    if (firstDayOfMonth === 0) firstDayOfMonth = 6; // Niedziela staje się 6
    else firstDayOfMonth -=1; // Poniedziałek (1) staje się 0, Wtorek (2) staje się 1 itd.


    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let calendarHTML = '<table><thead><tr>';
    const days = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd']; // Polski układ dni
    days.forEach(day => calendarHTML += `<th>${day}</th>`);
    calendarHTML += '</tr></thead><tbody><tr>';

    for (let i = 0; i < firstDayOfMonth; i++) {
        calendarHTML += '<td></td>';
    }

    for (let day = 1; day <= daysInMonth; day++) {
        // Nowa linia co 7 dni, zaczynając od pierwszego dnia miesiąca
        if ((firstDayOfMonth + day -1) % 7 === 0 && day !== 1) {
             calendarHTML += '</tr><tr>';
        }
        let cellClass = '';
        if (day === todayDate.getDate() && month === todayDate.getMonth() && year === todayDate.getFullYear()) {
            cellClass = 'today'; // Klasa dla dzisiejszego dnia
        }
        // Tutaj można dodać logikę dla 'has-event'
        // if (isEventOnThisDay(year, month, day)) { cellClass += ' has-event'; }
        calendarHTML += `<td class="${cellClass}">${day}</td>`;
    }

    // Dopełnienie ostatniego tygodnia pustymi komórkami
    let lastDayOfMonth = (firstDayOfMonth + daysInMonth -1) % 7;
    for (let i = lastDayOfMonth; i < 6; i++) { // Uzupełniamy do 6 (bo 0-6 to 7 dni)
        calendarHTML += '<td></td>';
    }


    calendarHTML += '</tr></tbody></table>';
    container.innerHTML = calendarHTML;
}