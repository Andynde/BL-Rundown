// ===================================
// Global Variables
// ===================================
let updateInterval = null;
let lastUpdateTime = null;

// ===================================
// DOM Elements
// ===================================
const rundownNameEl = document.getElementById('rundown-name');
const statusIndicator = document.getElementById('status-indicator');
const statusText = document.getElementById('status-text');
const currentTimeEl = document.getElementById('current-time');
const startTimeEl = document.getElementById('start-time');
const totalDurationEl = document.getElementById('total-duration');
const endTimeEl = document.getElementById('end-time');

// Current Point
const currentNumberEl = document.getElementById('current-number');
const currentTypeEl = document.getElementById('current-type');
const currentDescriptionEl = document.getElementById('current-description');
const currentStartTimeEl = document.getElementById('current-start-time');
const currentDurationEl = document.getElementById('current-duration');
const currentCountdownEl = document.getElementById('current-countdown');

// Next Point
const nextNumberEl = document.getElementById('next-number');
const nextTypeEl = document.getElementById('next-type');
const nextDescriptionEl = document.getElementById('next-description');
const nextStartTimeEl = document.getElementById('next-start-time');
const nextDurationEl = document.getElementById('next-duration');

// Preview Point
const previewSection = document.getElementById('preview-section');
const previewNumberEl = document.getElementById('preview-number');
const previewTypeEl = document.getElementById('preview-type');
const previewDescriptionEl = document.getElementById('preview-description');
const previewStartTimeEl = document.getElementById('preview-start-time');
const previewDurationEl = document.getElementById('preview-duration');

// Footer
const connectionIcon = document.getElementById('connection-icon');
const connectionText = document.getElementById('connection-text');
const lastUpdateEl = document.getElementById('last-update');

// ===================================
// Utility Functions
// ===================================
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function parseTime(timeStr) {
    if (!timeStr) return 0;
    const [mins, secs] = timeStr.split(':').map(Number);
    return mins * 60 + secs;
}

function updateCurrentTime() {
    const now = new Date();
    currentTimeEl.textContent = now.toLocaleTimeString('de-DE');
}

function calculateStartTime(rundown, index, startTime) {
    if (!startTime) return '--:--';
    
    let secondsBeforeThis = 0;
    for (let i = 0; i < index; i++) {
        secondsBeforeThis += parseTime(rundown[i].duration || '00:00');
    }
    
    const rowStartTime = new Date(new Date(startTime).getTime() + secondsBeforeThis * 1000);
    return rowStartTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

function calculateTotalDuration(rundown) {
    let totalSeconds = 0;
    rundown.forEach(row => {
        totalSeconds += parseTime(row.duration || '00:00');
    });
    return formatTime(totalSeconds);
}

// ===================================
// Data Loading
// ===================================
function loadRundownData() {
    try {
        // Load data from localStorage
        const rundownName = localStorage.getItem('rundown-name') || 'Rundown Vorschau';
        const rundown = JSON.parse(localStorage.getItem('rundown-data')) || [];
        const elementTypes = JSON.parse(localStorage.getItem('element-types')) || [];
        
        // Check if rundown is running
        const isRunning = localStorage.getItem('rundown-running') === 'true';
        const currentRow = parseInt(localStorage.getItem('current-row') || '0');
        const previewRow = localStorage.getItem('preview-row');
        const startTime = localStorage.getItem('start-time');
        const endTime = localStorage.getItem('end-time');
        
        // Update header
        rundownNameEl.textContent = rundownName;
        
        // Update status
        if (isRunning) {
            statusIndicator.classList.add('running');
            statusText.textContent = 'Live';
        } else {
            statusIndicator.classList.remove('running');
            statusText.textContent = 'Bereit';
        }
        
        // Update time overview
        if (startTime) {
            const start = new Date(startTime);
            startTimeEl.textContent = start.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
        } else {
            startTimeEl.textContent = '--:--';
        }
        
        totalDurationEl.textContent = calculateTotalDuration(rundown);
        
        if (endTime) {
            const end = new Date(endTime);
            endTimeEl.textContent = end.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
        } else {
            endTimeEl.textContent = '--:--';
        }
        
        // Update current point
        if (rundown.length > 0 && currentRow < rundown.length) {
            const current = rundown[currentRow];
            const elementType = elementTypes.find(t => t.id === current.typeId) || {
                name: 'Standard',
                color: '#6366f1',
                icon: 'fa-circle'
            };
            
            currentNumberEl.textContent = currentRow + 1;
            currentTypeEl.innerHTML = `<i class="fas ${elementType.icon}" style="color: ${elementType.color}"></i><span>${elementType.name}</span>`;
            currentDescriptionEl.textContent = current.description || 'Keine Beschreibung';
            currentStartTimeEl.textContent = calculateStartTime(rundown, currentRow, startTime);
            currentDurationEl.textContent = current.duration || '00:00';
            currentCountdownEl.textContent = current.countdown || current.duration || '00:00';
            
            // Add warning/danger classes to countdown
            const countdownSeconds = parseTime(current.countdown || current.duration);
            currentCountdownEl.classList.remove('warning', 'danger');
            if (countdownSeconds < 30 && countdownSeconds > 10) {
                currentCountdownEl.classList.add('warning');
            } else if (countdownSeconds <= 10) {
                currentCountdownEl.classList.add('danger');
            }
            
            document.getElementById('current-point').classList.remove('empty');
        } else {
            currentNumberEl.textContent = '-';
            currentTypeEl.innerHTML = '<i class="fas fa-circle"></i><span>-</span>';
            currentDescriptionEl.textContent = 'Kein aktiver Punkt';
            currentStartTimeEl.textContent = '--:--';
            currentDurationEl.textContent = '00:00';
            currentCountdownEl.textContent = '00:00';
            document.getElementById('current-point').classList.add('empty');
        }
        
        // Update next point
        const nextRow = currentRow + 1;
        if (rundown.length > 0 && nextRow < rundown.length) {
            const next = rundown[nextRow];
            const elementType = elementTypes.find(t => t.id === next.typeId) || {
                name: 'Standard',
                color: '#6366f1',
                icon: 'fa-circle'
            };
            
            nextNumberEl.textContent = nextRow + 1;
            nextTypeEl.innerHTML = `<i class="fas ${elementType.icon}" style="color: ${elementType.color}"></i><span>${elementType.name}</span>`;
            nextDescriptionEl.textContent = next.description || 'Keine Beschreibung';
            nextStartTimeEl.textContent = calculateStartTime(rundown, nextRow, startTime);
            nextDurationEl.textContent = next.duration || '00:00';
            document.getElementById('next-point').classList.remove('empty');
        } else {
            nextNumberEl.textContent = '-';
            nextTypeEl.innerHTML = '<i class="fas fa-circle"></i><span>-</span>';
            nextDescriptionEl.textContent = 'Kein nächster Punkt';
            nextStartTimeEl.textContent = '--:--';
            nextDurationEl.textContent = '00:00';
            document.getElementById('next-point').classList.add('empty');
        }
        
        // Update preview point (if exists)
        if (previewRow !== null && previewRow !== 'null') {
            const previewIndex = parseInt(previewRow);
            if (rundown.length > 0 && previewIndex < rundown.length && previewIndex !== currentRow) {
                const preview = rundown[previewIndex];
                const elementType = elementTypes.find(t => t.id === preview.typeId) || {
                    name: 'Standard',
                    color: '#6366f1',
                    icon: 'fa-circle'
                };
                
                previewNumberEl.textContent = previewIndex + 1;
                previewTypeEl.innerHTML = `<i class="fas ${elementType.icon}" style="color: ${elementType.color}"></i><span>${elementType.name}</span>`;
                previewDescriptionEl.textContent = preview.description || 'Keine Beschreibung';
                previewStartTimeEl.textContent = calculateStartTime(rundown, previewIndex, startTime);
                previewDurationEl.textContent = preview.duration || '00:00';
                previewSection.style.display = 'block';
            } else {
                previewSection.style.display = 'none';
            }
        } else {
            previewSection.style.display = 'none';
        }
        
        // Update connection status
        connectionIcon.className = 'fas fa-link';
        connectionText.textContent = 'Verbunden mit Rundown';
        
        // Update last update time
        lastUpdateTime = new Date();
        lastUpdateEl.textContent = lastUpdateTime.toLocaleTimeString('de-DE');
        
    } catch (error) {
        console.error('Fehler beim Laden der Rundown-Daten:', error);
        connectionIcon.className = 'fas fa-unlink';
        connectionText.textContent = 'Verbindung unterbrochen';
        document.querySelector('.connection-status').classList.add('disconnected');
    }
}

// ===================================
// Storage Event Listener
// ===================================
window.addEventListener('storage', (e) => {
    // Reload data when localStorage changes (from main app)
    if (e.key && (
        e.key === 'rundown-data' ||
        e.key === 'rundown-name' ||
        e.key === 'rundown-running' ||
        e.key === 'current-row' ||
        e.key === 'preview-row' ||
        e.key === 'start-time' ||
        e.key === 'end-time'
    )) {
        loadRundownData();
    }
});

// ===================================
// Initialization
// ===================================
function init() {
    // Update current time
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    
    // Load initial data
    loadRundownData();
    
    // Refresh data every second
    updateInterval = setInterval(loadRundownData, 1000);
}

// Start the preview
init();
