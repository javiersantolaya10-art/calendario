const monthYearElement = document.getElementById('monthYear');
const calendarGrid = document.getElementById('calendarGrid');
const prevMonthButton = document.getElementById('prevMonth');
const nextMonthButton = document.getElementById('nextMonth');
const eventForm = document.getElementById('eventForm');
const eventText = document.getElementById('eventText');
const eventList = document.getElementById('eventList');
const selectedDateTitle = document.getElementById('selectedDateTitle');
const toast = document.getElementById('toast');

let currentDate = new Date();
let selectedDate = new Date();
const STORAGE_KEY = 'calendarioPersonalEventos';

function getEvents() {
  const saved = localStorage.getItem(STORAGE_KEY);
  try {
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    return {};
  }
}

function saveEvents(events) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

function formatDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatDateLabel(date) {
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleDateString('es-ES', { month: 'long' });

  monthYearElement.textContent = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;
  calendarGrid.innerHTML = '';

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const dayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;

  const events = getEvents();
  const daysInMonth = lastDayOfMonth.getDate();

  for (let i = 0; i < dayOfWeek; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'day-cell inactive';
    calendarGrid.appendChild(emptyCell);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateKey = formatDateKey(date);
    const dayCell = document.createElement('button');
    dayCell.type = 'button';
    dayCell.className = 'day-cell';
    dayCell.dataset.date = dateKey;

    const currentDay = new Date();
    const isToday = date.toDateString() === currentDay.toDateString();
    const isSelected = date.toDateString() === selectedDate.toDateString();

    if (isToday) {
      dayCell.classList.add('current');
    }
    if (isSelected) {
      dayCell.classList.add('selected');
    }

    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day;
    dayCell.appendChild(dayNumber);

    const eventItems = events[dateKey] || [];
    if (eventItems.length > 0) {
      for (let i = 0; i < Math.min(2, eventItems.length); i++) {
        const chip = document.createElement('span');
        chip.className = 'event-chip';
        chip.textContent = eventItems[i];
        dayCell.appendChild(chip);
      }
      if (eventItems.length > 2) {
        const moreChip = document.createElement('span');
        moreChip.className = 'event-chip';
        moreChip.textContent = `+${eventItems.length - 2} más`;
        dayCell.appendChild(moreChip);
      }
    }

    dayCell.addEventListener('click', () => handleDayClick(date));
    calendarGrid.appendChild(dayCell);
  }

  updateSelectedDatePanel();
}

function updateSelectedDatePanel() {
  selectedDateTitle.textContent = formatDateLabel(selectedDate);
  eventList.innerHTML = '';

  const events = getEvents();
  const dateKey = formatDateKey(selectedDate);
  const eventItems = events[dateKey] || [];

  if (eventItems.length === 0) {
    const emptyMessage = document.createElement('li');
    emptyMessage.textContent = 'No hay eventos para este día. Haz clic en el día para añadir uno.';
    eventList.appendChild(emptyMessage);
    return;
  }

  eventItems.forEach((text, index) => {
    const item = document.createElement('li');
    const label = document.createElement('p');
    label.textContent = text;
    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.textContent = 'Eliminar';
    removeButton.addEventListener('click', () => removeEvent(index));
    item.appendChild(label);
    item.appendChild(removeButton);
    eventList.appendChild(item);
  });
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timeoutId);
  showToast.timeoutId = setTimeout(() => {
    toast.classList.remove('show');
  }, 1800);
}

function handleDayClick(date) {
  selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (selectedDate.getMonth() !== currentDate.getMonth()) {
    currentDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  }
  renderCalendar();
}

function addEvent(event) {
  event.preventDefault();
  const description = eventText.value.trim();
  if (!description) return;

  const events = getEvents();
  const dateKey = formatDateKey(selectedDate);

  if (!events[dateKey]) {
    events[dateKey] = [];
  }
  events[dateKey].push(description);
  saveEvents(events);

  eventText.value = '';
  renderCalendar();
  showToast('Evento guardado con éxito');
}

function removeEvent(index) {
  const events = getEvents();
  const dateKey = formatDateKey(selectedDate);
  if (!events[dateKey]) return;

  events[dateKey].splice(index, 1);
  if (events[dateKey].length === 0) {
    delete events[dateKey];
  }
  saveEvents(events);
  renderCalendar();
  showToast('Evento eliminado');
}

prevMonthButton.addEventListener('click', () => {
  currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  renderCalendar();
});

nextMonthButton.addEventListener('click', () => {
  currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
  renderCalendar();
});

eventForm.addEventListener('submit', addEvent);

selectedDate = new Date();
renderCalendar();
