// ===================================
// Global Variables & State
// ===================================
let elementTypes = JSON.parse(localStorage.getItem('element-types')) || getDefaultElementTypes();
let rundown = JSON.parse(localStorage.getItem('rundown-data')) || [];
let customColumns = JSON.parse(localStorage.getItem('custom-columns')) || [];
let currentRow = 0;
let previewRow = null;
let globalTimer = null;
let endTime = null;
let startTime = null;
let isDarkMode = localStorage.getItem('dark-mode') === 'true';

// ===================================
// Default Element Types
// ===================================
function getDefaultElementTypes() {
    return [
        {
            id: 'story',
            name: 'Story',
            color: '#3b82f6',
            icon: 'fa-newspaper',
            duration: '02:00',
            fields: ['description', 'notes']
        },
        {
            id: 'vt',
            name: 'VT',
            color: '#8b5cf6',
            icon: 'fa-video',
            duration: '01:30',
            fields: ['description', 'notes']
        },
        {
            id: 'live',
            name: 'Live',
            color: '#ef4444',
            icon: 'fa-tower-broadcast',
            duration: '03:00',
            fields: ['description', 'notes']
        },
        {
            id: 'break',
            name: 'Pause',
            color: '#f59e0b',
            icon: 'fa-mug-hot',
            duration: '05:00',
            fields: ['description', 'notes']
        },
        {
            id: 'intro',
            name: 'Intro',
            color: '#10b981',
            icon: 'fa-play',
            duration: '00:30',
            fields: ['description', 'notes']
        }
    ];
}

// ===================================
// DOM Elements
// ===================================
const rundownName = document.getElementById('rundown-name');
const currentTimeEl = document.getElementById('current-time');
const endTimeInput = document.getElementById('end-time');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const tbody = document.getElementById('rundown-body');
const elementsList = document.getElementById('elements-list');
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsBtn = document.getElementById('close-settings');
const saveSettingsBtn = document.getElementById('save-settings');
const addElementTypeBtn = document.getElementById('add-element-type');
const addNewTypeBtn = document.getElementById('add-new-type');
const elementTypesList = document.getElementById('element-types-list');
const themeToggle = document.getElementById('theme-toggle');
const saveIndicator = document.getElementById('save-indicator');
const emptyState = document.getElementById('empty-state');
const fabAddRow = document.getElementById('fab-add-row');
const totalDurationEl = document.getElementById('total-duration');
const calculatedEndTimeEl = document.getElementById('calculated-end-time');
const addColumnBtn = document.getElementById('add-column-btn');
const tableHeader = document.getElementById('table-header');

// ===================================
// Initialization
// ===================================
function init() {
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        themeToggle.checked = true;
    }
    
    rundownName.value = localStorage.getItem('rundown-name') || 'Mein Rundown';
    
    // Restore running state from localStorage
    const wasRunning = localStorage.getItem('rundown-running') === 'true';
    if (wasRunning) {
        const savedStartTime = localStorage.getItem('start-time');
        const savedEndTime = localStorage.getItem('end-time');
        const savedCurrentRow = localStorage.getItem('current-row');
        const savedPreviewRow = localStorage.getItem('preview-row');
        
        if (savedStartTime) {
            startTime = new Date(savedStartTime);
            endTime = savedEndTime ? new Date(savedEndTime) : null;
            currentRow = savedCurrentRow ? parseInt(savedCurrentRow) : 0;
            previewRow = savedPreviewRow && savedPreviewRow !== 'null' ? parseInt(savedPreviewRow) : null;
            
            // Recalculate countdowns based on elapsed time
            const now = new Date();
            const elapsedSeconds = Math.floor((now - startTime) / 1000);
            
            let totalSecondsBeforeCurrent = 0;
            for (let i = 0; i < currentRow; i++) {
                totalSecondsBeforeCurrent += parseTime(rundown[i].duration || '00:00');
            }
            
            const secondsIntoCurrent = elapsedSeconds - totalSecondsBeforeCurrent;
            const currentDuration = parseTime(rundown[currentRow].duration || '00:00');
            const remainingSeconds = currentDuration - secondsIntoCurrent;
            
            if (remainingSeconds > 0) {
                rundown[currentRow].countdown = formatTime(remainingSeconds);
            } else {
                // Find the correct current row based on elapsed time
                let accumulatedTime = 0;
                for (let i = 0; i < rundown.length; i++) {
                    const rowDuration = parseTime(rundown[i].duration || '00:00');
                    if (accumulatedTime + rowDuration > elapsedSeconds) {
                        currentRow = i;
                        const timeIntoRow = elapsedSeconds - accumulatedTime;
                        rundown[i].countdown = formatTime(rowDuration - timeIntoRow);
                        break;
                    }
                    accumulatedTime += rowDuration;
                }
            }
            
            // Restart timer
            globalTimer = setInterval(updateCountdown, 1000);
            startBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
            startBtn.onclick = pauseRundown;
            
            // Set end time input if available
            if (endTime) {
                endTimeInput.value = endTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
            }
        }
    }
    
    renderElementsList();
    renderRundown();
    updateCurrentTime();
    
    setInterval(updateCurrentTime, 1000);
    
    setupEventListeners();
    
    // Set initial onclick handler ONLY if timer is not running
    // (if timer was restored, onclick is already set above)
    if (!globalTimer && !startBtn.onclick) {
        startBtn.onclick = startRundown;
    }
}

// ===================================
// Event Listeners
// ===================================
function setupEventListeners() {
    rundownName.addEventListener('input', () => {
        localStorage.setItem('rundown-name', rundownName.value);
        showSaveIndicator();
    });
    
    // Don't add event listener for startBtn - use onclick instead
    // startBtn will use onclick handler set in init/startRundown/pauseRundown/resetRundown
    
    resetBtn.addEventListener('click', resetRundown);
    
    settingsBtn.addEventListener('click', () => openModal());
    closeSettingsBtn.addEventListener('click', () => closeModal());
    saveSettingsBtn.addEventListener('click', () => {
        saveSettings();
        closeModal();
    });
    
    addElementTypeBtn.addEventListener('click', () => openModal());
    addNewTypeBtn.addEventListener('click', addNewElementType);
    
    themeToggle.addEventListener('change', toggleDarkMode);
    
    fabAddRow.addEventListener('click', () => addEmptyRow());
    
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) closeModal();
    });
    
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    addColumnBtn.addEventListener('click', addCustomColumn);
    
    setupColumnResizing();
}

// ===================================
// Keyboard Shortcuts
// ===================================
function handleKeyboardShortcuts(e) {
    if (e.code === 'Space' && globalTimer && !e.target.isContentEditable) {
        e.preventDefault();
        takePreviewedRow();
    }
}

function takePreviewedRow() {
    if (previewRow !== null && previewRow !== currentRow) {
        currentRow = previewRow;
        rundown[currentRow].countdown = rundown[currentRow].duration;
        previewRow = null;
        localStorage.setItem('current-row', currentRow.toString());
        localStorage.setItem('preview-row', 'null');
        
        // Update classes only, don't re-render
        updateRowClasses();
        
        // Update countdown display for the new current row
        const rows = tbody.querySelectorAll('.rundown-row');
        if (rows[currentRow]) {
            const countdownCell = rows[currentRow].querySelector('.col-countdown');
            if (countdownCell) {
                const countdownSeconds = parseTime(rundown[currentRow].countdown);
                let countdownClass = 'countdown-display';
                if (countdownSeconds < 30 && countdownSeconds > 10) {
                    countdownClass += ' warning';
                } else if (countdownSeconds <= 10) {
                    countdownClass += ' danger';
                }
                countdownCell.innerHTML = `<span class="${countdownClass}">${rundown[currentRow].countdown}</span>`;
            }
        }
        
        showSaveIndicator();
    } else {
        // If no preview, go to next row
        if (currentRow < rundown.length - 1) {
            currentRow++;
            if (currentRow < rundown.length) {
                rundown[currentRow].countdown = rundown[currentRow].duration;
            }
            previewRow = null;
            localStorage.setItem('current-row', currentRow.toString());
            localStorage.setItem('preview-row', 'null');
            
            // Update classes only, don't re-render
            updateRowClasses();
            
            // Update countdown display for the new current row
            const rows = tbody.querySelectorAll('.rundown-row');
            if (rows[currentRow]) {
                const countdownCell = rows[currentRow].querySelector('.col-countdown');
                if (countdownCell) {
                    const countdownSeconds = parseTime(rundown[currentRow].countdown);
                    let countdownClass = 'countdown-display';
                    if (countdownSeconds < 30 && countdownSeconds > 10) {
                        countdownClass += ' warning';
                    } else if (countdownSeconds <= 10) {
                        countdownClass += ' danger';
                    }
                    countdownCell.innerHTML = `<span class="${countdownClass}">${rundown[currentRow].countdown}</span>`;
                }
            }
            
            showSaveIndicator();
        }
    }
}

// ===================================
// Time Functions
// ===================================
function updateCurrentTime() {
    const now = new Date();
    currentTimeEl.textContent = now.toLocaleTimeString('de-DE');
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function parseTime(timeStr) {
    const [mins, secs] = timeStr.split(':').map(Number);
    return mins * 60 + secs;
}

// ===================================
// Element Types Management
// ===================================
function renderElementsList() {
    elementsList.innerHTML = '';
    
    elementTypes.forEach((type, index) => {
        const div = document.createElement('div');
        div.className = 'element-item';
        div.innerHTML = `
            <div class="element-color" style="background: ${type.color}"></div>
            <div class="element-info">
                <div class="element-name">
                    <i class="fas ${type.icon}"></i> ${type.name}
                </div>
                <div class="element-duration">${type.duration}</div>
            </div>
            <div class="element-actions">
                <button class="icon-btn" onclick="editElementType(${index})" title="Bearbeiten">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
        `;
        
        div.addEventListener('click', (e) => {
            if (!e.target.closest('.element-actions')) {
                addRowFromType(type);
            }
        });
        
        elementsList.appendChild(div);
    });
    
    saveElementTypes();
}

function renderElementTypesSettings() {
    elementTypesList.innerHTML = '';
    
    elementTypes.forEach((type, index) => {
        const div = document.createElement('div');
        div.className = 'element-type-item';
        div.innerHTML = `
            <button class="icon-picker-btn" onclick="openIconPicker(${index})" title="Icon auswählen">
                <i class="fas ${type.icon}"></i>
            </button>
            <input type="color" value="${type.color}" onchange="updateElementTypeColor(${index}, this.value)">
            <input type="text" placeholder="Name" value="${type.name}" onchange="updateElementTypeName(${index}, this.value)">
            <input type="text" placeholder="Dauer (MM:SS)" value="${type.duration}" onchange="updateElementTypeDuration(${index}, this.value)">
            <button class="icon-btn" onclick="deleteElementType(${index})" title="Löschen">
                <i class="fas fa-trash"></i>
            </button>
        `;
        elementTypesList.appendChild(div);
    });
}

function addNewElementType() {
    elementTypes.push({
        id: 'custom_' + Date.now(),
        name: 'Neuer Typ',
        color: '#6366f1',
        icon: 'fa-circle',
        duration: '01:00',
        fields: ['description', 'notes']
    });
    renderElementTypesSettings();
}

function updateElementTypeColor(index, color) {
    elementTypes[index].color = color;
}

function updateElementTypeName(index, name) {
    elementTypes[index].name = name;
}

function updateElementTypeDuration(index, duration) {
    if (/^\d{1,2}:\d{2}$/.test(duration.trim())) {
        elementTypes[index].duration = duration.trim();
    } else {
        alert('Bitte gib die Dauer im Format MM:SS ein (z.B. 02:30)');
        renderElementTypesSettings();
    }
}

function deleteElementType(index) {
    if (elementTypes.length <= 1) {
        alert('Du musst mindestens einen Elementtyp behalten!');
        return;
    }
    
    if (confirm('Möchtest du diesen Elementtyp wirklich löschen?')) {
        elementTypes.splice(index, 1);
        renderElementTypesSettings();
    }
}

function editElementType(index) {
    openModal();
    setTimeout(() => {
        const items = elementTypesList.children;
        if (items[index]) {
            items[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 100);
}

function saveElementTypes() {
    localStorage.setItem('element-types', JSON.stringify(elementTypes));
}

// ===================================
// Icon Picker
// ===================================
const broadcastIcons = [
    // Broadcast & Media
    { icon: 'fa-tower-broadcast', name: 'Live Broadcast' },
    { icon: 'fa-satellite-dish', name: 'Satellite' },
    { icon: 'fa-microphone', name: 'Microphone' },
    { icon: 'fa-video', name: 'Video' },
    { icon: 'fa-camera', name: 'Camera' },
    { icon: 'fa-film', name: 'Film' },
    { icon: 'fa-clapperboard', name: 'Clapperboard' },
    { icon: 'fa-circle', name: 'Record' },
    
    // Content Types
    { icon: 'fa-newspaper', name: 'News/Story' },
    { icon: 'fa-bullhorn', name: 'Announcement' },
    { icon: 'fa-comments', name: 'Interview' },
    { icon: 'fa-users', name: 'Panel Discussion' },
    { icon: 'fa-chart-line', name: 'Graphics/Charts' },
    { icon: 'fa-image', name: 'Image' },
    { icon: 'fa-photo-film', name: 'Photo Gallery' },
    
    // Show Elements
    { icon: 'fa-play', name: 'Intro/Start' },
    { icon: 'fa-stop', name: 'Outro/End' },
    { icon: 'fa-mug-hot', name: 'Break/Pause' },
    { icon: 'fa-ad', name: 'Commercial' },
    { icon: 'fa-music', name: 'Music' },
    { icon: 'fa-trophy', name: 'Sports' },
    { icon: 'fa-cloud-sun', name: 'Weather' },
    { icon: 'fa-traffic-light', name: 'Traffic' },
    
    // Technical
    { icon: 'fa-signal', name: 'Signal' },
    { icon: 'fa-wifi', name: 'Streaming' },
    { icon: 'fa-server', name: 'Server' },
    { icon: 'fa-headphones', name: 'Audio' },
    { icon: 'fa-volume-high', name: 'Sound' },
    { icon: 'fa-sliders', name: 'Control' },
    
    // Actions
    { icon: 'fa-forward', name: 'Next' },
    { icon: 'fa-backward', name: 'Previous' },
    { icon: 'fa-pause', name: 'Pause' },
    { icon: 'fa-clock', name: 'Timer' },
    { icon: 'fa-hourglass', name: 'Countdown' },
    { icon: 'fa-bell', name: 'Alert' },
    { icon: 'fa-flag-checkered', name: 'Finish' },
    { icon: 'fa-star', name: 'Featured' },
    
    // Misc
    { icon: 'fa-globe', name: 'World/International' },
    { icon: 'fa-location-dot', name: 'Location' },
    { icon: 'fa-phone', name: 'Phone-In' },
    { icon: 'fa-envelope', name: 'Messages' },
    { icon: 'fa-question', name: 'Q&A' },
    { icon: 'fa-lightbulb', name: 'Idea/Tip' },
    { icon: 'fa-fire', name: 'Hot Topic' },
    { icon: 'fa-heart', name: 'Human Interest' }
];

let currentIconPickerIndex = null;

function openIconPicker(elementIndex) {
    currentIconPickerIndex = elementIndex;
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.id = 'icon-picker-modal';
    
    modal.innerHTML = `
        <div class="modal-content icon-picker-content">
            <div class="modal-header">
                <h2><i class="fas fa-icons"></i> Icon auswählen</h2>
                <button class="modal-close" onclick="closeIconPicker()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="icon-search">
                    <input type="text" id="icon-search-input" placeholder="Icon suchen..." onkeyup="filterIcons(this.value)">
                </div>
                <div class="icon-grid" id="icon-grid">
                    ${broadcastIcons.map(item => `
                        <button class="icon-option ${elementTypes[elementIndex].icon === item.icon ? 'selected' : ''}" 
                                onclick="selectIcon('${item.icon}')" 
                                title="${item.name}">
                            <i class="fas ${item.icon}"></i>
                            <span class="icon-name">${item.name}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Focus search input
    setTimeout(() => {
        document.getElementById('icon-search-input').focus();
    }, 100);
}

function closeIconPicker() {
    const modal = document.getElementById('icon-picker-modal');
    if (modal) {
        modal.remove();
    }
    currentIconPickerIndex = null;
}

function selectIcon(iconClass) {
    if (currentIconPickerIndex !== null) {
        elementTypes[currentIconPickerIndex].icon = iconClass;
        renderElementTypesSettings();
        closeIconPicker();
    }
}

function filterIcons(searchTerm) {
    const grid = document.getElementById('icon-grid');
    const term = searchTerm.toLowerCase();
    
    grid.innerHTML = broadcastIcons
        .filter(item => item.name.toLowerCase().includes(term) || item.icon.includes(term))
        .map(item => `
            <button class="icon-option ${elementTypes[currentIconPickerIndex].icon === item.icon ? 'selected' : ''}" 
                    onclick="selectIcon('${item.icon}')" 
                    title="${item.name}">
                <i class="fas ${item.icon}"></i>
                <span class="icon-name">${item.name}</span>
            </button>
        `).join('');
}

// ===================================
// Column Management
// ===================================
function addCustomColumn() {
    const columnName = prompt('Name der neuen Spalte:');
    if (columnName && columnName.trim()) {
        customColumns.push({
            id: 'custom_' + Date.now(),
            name: columnName.trim(),
            width: 150
        });
        localStorage.setItem('custom-columns', JSON.stringify(customColumns));
        renderTableHeader();
        renderRundown();
    }
}

function deleteCustomColumn(columnId) {
    if (confirm('Möchtest du diese Spalte wirklich löschen?')) {
        customColumns = customColumns.filter(col => col.id !== columnId);
        localStorage.setItem('custom-columns', JSON.stringify(customColumns));
        
        rundown.forEach(row => {
            if (row.customData) {
                delete row.customData[columnId];
            }
        });
        
        renderTableHeader();
        renderRundown();
    }
}

function renderTableHeader() {
    // Define column order - stored in localStorage
    let columnOrder = JSON.parse(localStorage.getItem('column-order')) || [
        'number', 'starttime', 'status', 'type', 'countdown', 'duration', 'description', 'notes'
    ];
    
    const baseColumnDefs = {
        'number': { class: 'col-number', label: '#', draggable: false },
        'starttime': { class: 'col-starttime', label: 'Startzeit', draggable: true },
        'status': { class: 'col-status', label: 'Status', draggable: true },
        'type': { class: 'col-type', label: 'Typ', draggable: true },
        'countdown': { class: 'col-countdown', label: 'Countdown', draggable: true },
        'duration': { class: 'col-duration', label: 'Dauer', draggable: true },
        'description': { class: 'col-description', label: 'Beschreibung', draggable: true },
        'notes': { class: 'col-notes', label: 'Notizen', draggable: true }
    };
    
    tableHeader.innerHTML = '';
    
    // Render base columns in order
    columnOrder.forEach(colId => {
        const colDef = baseColumnDefs[colId];
        if (colDef) {
            const th = document.createElement('th');
            th.className = `${colDef.class} resizable`;
            th.dataset.columnId = colId;
            if (colDef.draggable) {
                th.draggable = true;
                th.classList.add('draggable-column');
            }
            th.innerHTML = `
                ${colDef.draggable ? '<i class="fas fa-grip-vertical column-drag-handle"></i>' : ''}
                ${colDef.label}
                <div class="resizer"></div>
            `;
            tableHeader.appendChild(th);
        }
    });
    
    // Render custom columns
    customColumns.forEach(col => {
        const th = document.createElement('th');
        th.className = 'col-custom resizable draggable-column';
        th.dataset.columnId = col.id;
        th.draggable = true;
        th.style.minWidth = col.width + 'px';
        th.innerHTML = `
            <i class="fas fa-grip-vertical column-drag-handle"></i>
            ${col.name}
            <button class="delete-column-btn" onclick="deleteCustomColumn('${col.id}')" title="Spalte löschen">
                <i class="fas fa-times"></i>
            </button>
            <div class="resizer"></div>
        `;
        tableHeader.appendChild(th);
    });
    
    // Add actions column (not draggable)
    const actionsHeader = document.createElement('th');
    actionsHeader.className = 'col-actions';
    actionsHeader.textContent = 'Aktionen';
    tableHeader.appendChild(actionsHeader);
    
    setupColumnResizing();
    setupColumnDragDrop();
}

function setupColumnResizing() {
    const resizableHeaders = document.querySelectorAll('.resizable');
    
    resizableHeaders.forEach(header => {
        const resizer = header.querySelector('.resizer');
        if (!resizer) return;
        
        let startX, startWidth;
        
        const mouseDownHandler = (e) => {
            startX = e.pageX;
            startWidth = header.offsetWidth;
            
            resizer.classList.add('resizing');
            document.addEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('mouseup', mouseUpHandler);
            
            e.preventDefault();
        };
        
        const mouseMoveHandler = (e) => {
            const width = startWidth + (e.pageX - startX);
            if (width > 50) {
                header.style.width = width + 'px';
                header.style.minWidth = width + 'px';
                
                // Update narrow class for status and type columns
                updateColumnNarrowClass(header, width);
                
                const columnId = header.dataset.columnId;
                if (columnId) {
                    const column = customColumns.find(col => col.id === columnId);
                    if (column) {
                        column.width = width;
                        localStorage.setItem('custom-columns', JSON.stringify(customColumns));
                    }
                }
            }
        };
        
        const mouseUpHandler = () => {
            resizer.classList.remove('resizing');
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
        };
        
        resizer.addEventListener('mousedown', mouseDownHandler);
    });
}

function updateColumnNarrowClass(header, width) {
    const isStatusCol = header.classList.contains('col-status');
    const isTypeCol = header.classList.contains('col-type');
    
    if (isStatusCol || isTypeCol) {
        const threshold = 80; // Width threshold for showing/hiding text
        const columnClass = isStatusCol ? '.col-status' : '.col-type';
        const bodyCells = document.querySelectorAll(`tbody ${columnClass}`);
        
        if (width < threshold) {
            bodyCells.forEach(cell => cell.classList.add('narrow'));
        } else {
            bodyCells.forEach(cell => cell.classList.remove('narrow'));
        }
    }
}

// ===================================
// Column Drag and Drop
// ===================================
let draggedColumn = null;

function setupColumnDragDrop() {
    const draggableHeaders = document.querySelectorAll('.draggable-column');
    
    draggableHeaders.forEach(header => {
        header.addEventListener('dragstart', handleColumnDragStart);
        header.addEventListener('dragover', handleColumnDragOver);
        header.addEventListener('drop', handleColumnDrop);
        header.addEventListener('dragend', handleColumnDragEnd);
        header.addEventListener('dragleave', handleColumnDragLeave);
    });
}

function handleColumnDragStart(e) {
    draggedColumn = e.currentTarget;
    e.currentTarget.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', e.currentTarget.dataset.columnId);
}

function handleColumnDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    
    const target = e.currentTarget;
    if (target !== draggedColumn && target.classList.contains('draggable-column')) {
        target.classList.add('column-drag-over');
    }
    
    return false;
}

function handleColumnDragLeave(e) {
    e.currentTarget.classList.remove('column-drag-over');
}

function handleColumnDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    
    e.currentTarget.classList.remove('column-drag-over');
    
    const dropTarget = e.currentTarget;
    
    if (draggedColumn !== dropTarget && dropTarget.classList.contains('draggable-column')) {
        const draggedId = draggedColumn.dataset.columnId;
        const dropId = dropTarget.dataset.columnId;
        
        // Check if both are base columns or both are custom columns
        const draggedIsCustom = draggedColumn.classList.contains('col-custom');
        const dropIsCustom = dropTarget.classList.contains('col-custom');
        
        if (!draggedIsCustom && !dropIsCustom) {
            // Both are base columns - reorder in columnOrder
            let columnOrder = JSON.parse(localStorage.getItem('column-order')) || [
                'number', 'starttime', 'status', 'type', 'countdown', 'duration', 'description', 'notes'
            ];
            
            const draggedIndex = columnOrder.indexOf(draggedId);
            const dropIndex = columnOrder.indexOf(dropId);
            
            if (draggedIndex !== -1 && dropIndex !== -1) {
                columnOrder.splice(draggedIndex, 1);
                columnOrder.splice(dropIndex, 0, draggedId);
                localStorage.setItem('column-order', JSON.stringify(columnOrder));
                
                renderTableHeader();
                renderRundown();
                showSaveIndicator();
            }
        } else if (draggedIsCustom && dropIsCustom) {
            // Both are custom columns - reorder in customColumns array
            const draggedIndex = customColumns.findIndex(col => col.id === draggedId);
            const dropIndex = customColumns.findIndex(col => col.id === dropId);
            
            if (draggedIndex !== -1 && dropIndex !== -1) {
                const item = customColumns.splice(draggedIndex, 1)[0];
                customColumns.splice(dropIndex, 0, item);
                localStorage.setItem('custom-columns', JSON.stringify(customColumns));
                
                renderTableHeader();
                renderRundown();
                showSaveIndicator();
            }
        }
    }
    
    return false;
}

function handleColumnDragEnd(e) {
    e.currentTarget.classList.remove('dragging');
    
    document.querySelectorAll('.column-drag-over').forEach(el => {
        el.classList.remove('column-drag-over');
    });
}

// ===================================
// Time Calculations
// ===================================
function calculateTotalDuration() {
    let totalSeconds = 0;
    rundown.forEach(row => {
        totalSeconds += parseTime(row.duration || '00:00');
    });
    return formatTime(totalSeconds);
}

function calculateEndTime() {
    if (!startTime) return '--:--';
    
    const totalSeconds = rundown.reduce((sum, row) => {
        return sum + parseTime(row.duration || '00:00');
    }, 0);
    
    const endDate = new Date(startTime.getTime() + totalSeconds * 1000);
    return endDate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

function calculateStartTime(index) {
    if (!startTime || !globalTimer) return '--:--';
    
    let secondsBeforeThis = 0;
    for (let i = 0; i < index; i++) {
        secondsBeforeThis += parseTime(rundown[i].duration || '00:00');
    }
    
    const rowStartTime = new Date(startTime.getTime() + secondsBeforeThis * 1000);
    return rowStartTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

function updateTimeDisplays() {
    totalDurationEl.textContent = calculateTotalDuration();
    calculatedEndTimeEl.textContent = calculateEndTime();
}

// ===================================
// Rundown Management
// ===================================
function updateRowClasses() {
    const rows = tbody.querySelectorAll('.rundown-row');
    
    rows.forEach((tr, index) => {
        // Remove all status classes
        tr.classList.remove('active', 'preview', 'next', 'completed');
        
        // Add appropriate class
        if (index === currentRow && globalTimer) {
            tr.classList.add('active');
        } else if (index === previewRow && globalTimer) {
            tr.classList.add('preview');
        } else if (index === currentRow + 1 && globalTimer && previewRow === null) {
            tr.classList.add('next');
        } else if (index < currentRow && globalTimer) {
            tr.classList.add('completed');
        }
        
        // Update status badge
        const statusCell = tr.querySelector('.col-status');
        if (statusCell) {
            let statusClass = 'status-upcoming';
            let statusText = 'Anstehend';
            let statusIcon = 'fa-clock';
            
            if (index === currentRow && globalTimer) {
                statusClass = 'status-active';
                statusText = 'ON AIR';
                statusIcon = 'fa-circle';
            } else if (index === previewRow && globalTimer) {
                statusClass = 'status-preview';
                statusText = 'PREVIEW';
                statusIcon = 'fa-eye';
            } else if (index === currentRow + 1 && globalTimer && previewRow === null) {
                statusClass = 'status-next';
                statusText = 'Nächster';
                statusIcon = 'fa-forward';
            } else if (index < currentRow && globalTimer) {
                statusClass = 'status-completed';
                statusText = 'Fertig';
                statusIcon = 'fa-check';
            }
            
            statusCell.innerHTML = `<span class="status-badge ${statusClass}"><i class="fas ${statusIcon}"></i><span class="badge-text"> ${statusText}</span></span>`;
        }
    });
}

function renderRundown() {
    tbody.innerHTML = '';
    
    if (rundown.length === 0) {
        emptyState.classList.add('show');
        return;
    } else {
        emptyState.classList.remove('show');
    }
    
    // Get column order
    let columnOrder = JSON.parse(localStorage.getItem('column-order')) || [
        'number', 'starttime', 'status', 'type', 'countdown', 'duration', 'description', 'notes'
    ];
    
    rundown.forEach((row, index) => {
        const tr = document.createElement('tr');
        tr.className = 'rundown-row';
        tr.draggable = true;
        tr.dataset.index = index;
        
        if (index === currentRow && globalTimer) {
            tr.classList.add('active');
        } else if (index === previewRow && globalTimer) {
            tr.classList.add('preview');
        } else if (index === currentRow + 1 && globalTimer && previewRow === null) {
            tr.classList.add('next');
        } else if (index < currentRow && globalTimer) {
            tr.classList.add('completed');
        }
        
        // Drag & Drop handlers - ALWAYS active, even during timer
        tr.addEventListener('dragstart', handleDragStart);
        tr.addEventListener('dragover', handleDragOver);
        tr.addEventListener('drop', handleDrop);
        tr.addEventListener('dragend', handleDragEnd);
        tr.addEventListener('dragleave', handleDragLeave);
        
        // CRITICAL FIX for Chrome: Also add drop listener to prevent default on dragenter
        tr.addEventListener('dragenter', (e) => {
            e.preventDefault();
            return false;
        });
        
        // Preview functionality - only when timer is running
        // Single click = Preview (unless it's the current row)
        tr.addEventListener('click', (e) => {
            if (!globalTimer) return; // Only work when timer is running
            // Don't interfere with editable cells, row actions, or if dragging
            if (e.target.closest('.editable') || e.target.closest('.row-actions') || tr.classList.contains('dragging')) {
                return;
            }
            if (index !== currentRow) {
                // Update preview without full re-render
                const oldPreview = previewRow;
                previewRow = index;
                localStorage.setItem('preview-row', index.toString());
                
                // Update classes only
                updateRowClasses();
            }
        });
        
        // Double click = Take (jump to this row)
        tr.addEventListener('dblclick', (e) => {
            if (!globalTimer) return; // Only work when timer is running
            // Don't interfere with editable cells, row actions, or if dragging
            if (e.target.closest('.editable') || e.target.closest('.row-actions') || tr.classList.contains('dragging')) {
                return;
            }
            e.preventDefault();
            currentRow = index;
            rundown[currentRow].countdown = rundown[currentRow].duration;
            previewRow = null;
            localStorage.setItem('current-row', currentRow.toString());
            localStorage.setItem('preview-row', 'null');
            
            // Update classes only, don't re-render
            updateRowClasses();
            
            // Update countdown display for the new current row
            const rows = tbody.querySelectorAll('.rundown-row');
            if (rows[index]) {
                const countdownCell = rows[index].querySelector('.col-countdown');
                if (countdownCell) {
                    const countdownSeconds = parseTime(rundown[index].countdown);
                    let countdownClass = 'countdown-display';
                    if (countdownSeconds < 30 && countdownSeconds > 10) {
                        countdownClass += ' warning';
                    } else if (countdownSeconds <= 10) {
                        countdownClass += ' danger';
                    }
                    countdownCell.innerHTML = `<span class="${countdownClass}">${rundown[index].countdown}</span>`;
                }
            }
            
            showSaveIndicator();
        });
        
        const elementType = elementTypes.find(t => t.id === row.typeId) || elementTypes[0] || {
            id: 'default',
            name: 'Standard',
            color: '#6366f1',
            icon: 'fa-circle',
            duration: '01:00'
        };
        
        // Create cells map for easy access
        const cells = {};
        
        // Number cell
        cells['number'] = document.createElement('td');
        cells['number'].className = 'col-number';
        cells['number'].textContent = index + 1;
        
        // StartTime cell
        cells['starttime'] = document.createElement('td');
        cells['starttime'].className = 'col-starttime';
        cells['starttime'].textContent = calculateStartTime(index);
        
        // Status cell
        cells['status'] = document.createElement('td');
        cells['status'].className = 'col-status';
        let statusClass = 'status-upcoming';
        let statusText = 'Anstehend';
        let statusIcon = 'fa-clock';
        
        if (index === currentRow && globalTimer) {
            statusClass = 'status-active';
            statusText = 'ON AIR';
            statusIcon = 'fa-circle';
        } else if (index === previewRow && globalTimer) {
            statusClass = 'status-preview';
            statusText = 'PREVIEW';
            statusIcon = 'fa-eye';
        } else if (index === currentRow + 1 && globalTimer && previewRow === null) {
            statusClass = 'status-next';
            statusText = 'Nächster';
            statusIcon = 'fa-forward';
        } else if (index < currentRow && globalTimer) {
            statusClass = 'status-completed';
            statusText = 'Fertig';
            statusIcon = 'fa-check';
        }
        
        cells['status'].innerHTML = `<span class="status-badge ${statusClass}"><i class="fas ${statusIcon}"></i><span class="badge-text"> ${statusText}</span></span>`;
        
        // Type cell
        cells['type'] = document.createElement('td');
        cells['type'].className = 'col-type';
        cells['type'].innerHTML = `<span class="type-badge" style="border-color: ${elementType.color}; background: ${elementType.color}15;">
            <i class="fas ${elementType.icon}"></i><span class="badge-text"> ${elementType.name}</span>
        </span>`;
        
        // Countdown cell
        cells['countdown'] = document.createElement('td');
        cells['countdown'].className = 'col-countdown';
        const countdownSeconds = parseTime(row.countdown || row.duration);
        let countdownClass = 'countdown-display';
        if (countdownSeconds < 30 && countdownSeconds > 10) {
            countdownClass += ' warning';
        } else if (countdownSeconds <= 10) {
            countdownClass += ' danger';
        }
        cells['countdown'].innerHTML = `<span class="${countdownClass}">${row.countdown || row.duration}</span>`;
        
        // Duration cell
        cells['duration'] = document.createElement('td');
        cells['duration'].className = 'col-duration editable';
        cells['duration'].contentEditable = true;
        cells['duration'].textContent = row.duration || '00:00';
        cells['duration'].addEventListener('blur', () => {
            const newDuration = cells['duration'].textContent.trim();
            if (/^\d{1,2}:\d{2}$/.test(newDuration)) {
                row.duration = newDuration;
                row.countdown = newDuration;
                saveRundown();
                showSaveIndicator();
            } else {
                alert('Bitte gib die Dauer im Format MM:SS ein (z.B. 02:30)');
                cells['duration'].textContent = row.duration;
            }
        });
        
        // Description cell
        cells['description'] = document.createElement('td');
        cells['description'].className = 'col-description editable';
        cells['description'].contentEditable = true;
        cells['description'].textContent = row.description || '';
        cells['description'].addEventListener('blur', () => {
            row.description = cells['description'].textContent.trim();
            saveRundown();
            showSaveIndicator();
        });
        
        // Notes cell
        cells['notes'] = document.createElement('td');
        cells['notes'].className = 'col-notes editable';
        cells['notes'].contentEditable = true;
        cells['notes'].textContent = row.notes || '';
        cells['notes'].addEventListener('blur', () => {
            row.notes = cells['notes'].textContent.trim();
            saveRundown();
            showSaveIndicator();
        });
        
        // Append base columns in the correct order
        columnOrder.forEach(colId => {
            if (cells[colId]) {
                tr.appendChild(cells[colId]);
            }
        });
        
        // Add custom columns
        if (!row.customData) row.customData = {};
        customColumns.forEach(col => {
            const tdCustom = document.createElement('td');
            tdCustom.className = 'col-custom editable';
            tdCustom.contentEditable = true;
            tdCustom.textContent = row.customData[col.id] || '';
            tdCustom.addEventListener('blur', () => {
                row.customData[col.id] = tdCustom.textContent.trim();
                saveRundown();
                showSaveIndicator();
            });
            tr.appendChild(tdCustom);
        });
        
        // Actions cell (always last)
        const tdActions = document.createElement('td');
        tdActions.className = 'col-actions';
        tdActions.innerHTML = `
            <div class="row-actions">
                <button class="action-btn" onclick="moveRowUp(${index})" title="Nach oben">
                    <i class="fas fa-arrow-up"></i>
                </button>
                <button class="action-btn" onclick="moveRowDown(${index})" title="Nach unten">
                    <i class="fas fa-arrow-down"></i>
                </button>
                <button class="action-btn" onclick="deleteRow(${index})" title="Löschen">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        tr.appendChild(tdActions);
        
        tbody.appendChild(tr);
    });
    
    saveRundown();
    updateTimeDisplays();
}

// ===================================
// Drag and Drop Functions
// ===================================
let draggedElement = null;
let draggedIndex = null;

function handleDragStart(e) {
    // Don't allow dragging if user is editing a cell or clicking on action buttons
    if (e.target.closest('.editable') || e.target.closest('.row-actions')) {
        e.preventDefault();
        return false;
    }
    
    draggedElement = e.currentTarget;
    draggedIndex = parseInt(e.currentTarget.dataset.index);
    e.currentTarget.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);
}

function handleDragOver(e) {
    // CRITICAL: Prevent default FIRST
    if (e.preventDefault) {
        e.preventDefault();
    }
    
    // CRITICAL: Must set dropEffect to allow drop
    e.dataTransfer.dropEffect = 'move';
    
    const target = e.currentTarget;
    
    // Only show drag-over effect if it's a different row
    if (target !== draggedElement && target.classList.contains('rundown-row')) {
        // Only update if not already set (reduces flickering)
        if (!target.classList.contains('drag-over')) {
            // Remove drag-over from all rows first
            document.querySelectorAll('.rundown-row').forEach(row => {
                row.classList.remove('drag-over');
            });
            
            // Add to current target
            target.classList.add('drag-over');
        }
    }
    
    return false;
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const dropTarget = e.currentTarget;
    dropTarget.classList.remove('drag-over');
    
    if (draggedElement && draggedElement !== dropTarget) {
        const dropIndex = parseInt(dropTarget.dataset.index);
        
        // Move in data array
        const item = rundown.splice(draggedIndex, 1)[0];
        rundown.splice(dropIndex, 0, item);
        
        // Update current row tracking
        if (currentRow === draggedIndex) {
            currentRow = dropIndex;
        } else if (draggedIndex < currentRow && dropIndex >= currentRow) {
            currentRow--;
        } else if (draggedIndex > currentRow && dropIndex <= currentRow) {
            currentRow++;
        }
        
        // Update preview row tracking
        if (previewRow === draggedIndex) {
            previewRow = dropIndex;
        } else if (draggedIndex < previewRow && dropIndex >= previewRow) {
            previewRow--;
        } else if (draggedIndex > previewRow && dropIndex <= previewRow) {
            previewRow++;
        }
        
        // Save and re-render
        localStorage.setItem('current-row', currentRow.toString());
        if (previewRow !== null) {
            localStorage.setItem('preview-row', previewRow.toString());
        }
        
        renderRundown();
        showSaveIndicator();
    }
    
    return false;
}

function handleDragEnd(e) {
    e.currentTarget.classList.remove('dragging');
    
    document.querySelectorAll('.drag-over').forEach(el => {
        el.classList.remove('drag-over');
    });
}

function addRowFromType(type) {
    const newRow = {
        typeId: type.id,
        duration: type.duration,
        countdown: type.duration,
        description: '',
        notes: '',
        color: type.color
    };
    
    rundown.push(newRow);
    renderRundown();
    showSaveIndicator();
    
    setTimeout(() => {
        const rows = tbody.children;
        if (rows.length > 0) {
            rows[rows.length - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 100);
}

function addEmptyRow() {
    if (elementTypes.length === 0) {
        alert('Bitte erstelle zuerst einen Elementtyp in den Einstellungen!');
        openModal();
        return;
    }
    const defaultType = elementTypes[0];
    addRowFromType(defaultType);
}

function deleteRow(index) {
    if (confirm('Möchtest du diese Zeile wirklich löschen?')) {
        rundown.splice(index, 1);
        if (currentRow >= rundown.length) {
            currentRow = Math.max(0, rundown.length - 1);
        }
        if (previewRow >= rundown.length) {
            previewRow = null;
        }
        renderRundown();
        showSaveIndicator();
    }
}

function moveRowUp(index) {
    if (index > 0) {
        [rundown[index], rundown[index - 1]] = [rundown[index - 1], rundown[index]];
        if (currentRow === index) currentRow--;
        else if (currentRow === index - 1) currentRow++;
        if (previewRow === index) previewRow--;
        else if (previewRow === index - 1) previewRow++;
        renderRundown();
        showSaveIndicator();
    }
}

function moveRowDown(index) {
    if (index < rundown.length - 1) {
        [rundown[index], rundown[index + 1]] = [rundown[index + 1], rundown[index]];
        if (currentRow === index) currentRow++;
        else if (currentRow === index + 1) currentRow--;
        if (previewRow === index) previewRow++;
        else if (previewRow === index + 1) previewRow--;
        renderRundown();
        showSaveIndicator();
    }
}

function saveRundown() {
    localStorage.setItem('rundown-data', JSON.stringify(rundown));
}

// ===================================
// Rundown Control
// ===================================
function startRundown() {
    if (rundown.length === 0) {
        alert('Bitte füge mindestens eine Zeile hinzu!');
        return;
    }
    
    // FIRST: Set globalTimer so renderRundown knows timer is running
    if (globalTimer) clearInterval(globalTimer);
    globalTimer = setInterval(updateCountdown, 1000);
    
    // THEN: Set all the state
    startTime = new Date();
    localStorage.setItem('start-time', startTime.toISOString());
    localStorage.setItem('rundown-running', 'true');
    
    if (endTimeInput.value) {
        endTime = new Date();
        const [hours, minutes] = endTimeInput.value.split(':');
        endTime.setHours(hours, minutes, 0, 0);
        
        if (endTime < startTime) {
            endTime.setDate(endTime.getDate() + 1);
        }
    } else {
        const totalSeconds = rundown.reduce((sum, row) => {
            return sum + parseTime(row.duration || '00:00');
        }, 0);
        endTime = new Date(startTime.getTime() + totalSeconds * 1000);
    }
    
    localStorage.setItem('end-time', endTime.toISOString());
    
    currentRow = 0;
    previewRow = null;
    localStorage.setItem('current-row', currentRow.toString());
    localStorage.setItem('preview-row', 'null');
    
    rundown.forEach(row => {
        row.countdown = row.duration;
    });
    
    startBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
    startBtn.onclick = pauseRundown;
    
    // FINALLY: Render with globalTimer already set
    renderRundown();
}

function pauseRundown() {
    if (globalTimer) {
        clearInterval(globalTimer);
        globalTimer = null;
        localStorage.setItem('rundown-running', 'false');
        startBtn.innerHTML = '<i class="fas fa-play"></i> Fortsetzen';
        startBtn.onclick = resumeRundown;
    }
}

function resumeRundown() {
    globalTimer = setInterval(updateCountdown, 1000);
    localStorage.setItem('rundown-running', 'true');
    startBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
    startBtn.onclick = pauseRundown;
}

function resetRundown() {
    if (globalTimer) {
        clearInterval(globalTimer);
        globalTimer = null;
    }
    
    currentRow = 0;
    previewRow = null;
    startTime = null;
    endTime = null;
    
    localStorage.setItem('rundown-running', 'false');
    localStorage.setItem('current-row', '0');
    localStorage.setItem('preview-row', 'null');
    localStorage.removeItem('start-time');
    localStorage.removeItem('end-time');
    
    rundown.forEach(row => {
        row.countdown = row.duration;
    });
    
    startBtn.innerHTML = '<i class="fas fa-play"></i> Start';
    startBtn.onclick = startRundown;
    
    // Full re-render to update cursor styles and remove click handlers
    renderRundown();
}

function updateCountdown() {
    if (currentRow >= rundown.length) {
        clearInterval(globalTimer);
        globalTimer = null;
        alert('Rundown abgeschlossen!');
        resetRundown();
        return;
    }
    
    const row = rundown[currentRow];
    const currentSeconds = parseTime(row.countdown);
    
    if (currentSeconds <= 0) {
        // Check if there's a preview set - jump to preview instead of next
        if (previewRow !== null && previewRow !== currentRow) {
            currentRow = previewRow;
            rundown[currentRow].countdown = rundown[currentRow].duration;
            previewRow = null;
        } else {
            // No preview - go to next row
            currentRow++;
            if (currentRow < rundown.length) {
                rundown[currentRow].countdown = rundown[currentRow].duration;
            }
        }
        
        localStorage.setItem('current-row', currentRow.toString());
        localStorage.setItem('preview-row', 'null');
    } else {
        row.countdown = formatTime(currentSeconds - 1);
    }
    
    // Update only the countdown display, not the entire table
    updateCountdownDisplay();
}

function updateCountdownDisplay() {
    const rows = tbody.querySelectorAll('.rundown-row');
    
    // Check if any cell is currently being edited
    const activeElement = document.activeElement;
    const isEditingCell = activeElement && activeElement.isContentEditable;
    
    rows.forEach((tr, index) => {
        // Only update countdown cell - don't touch editable cells
        const countdownCell = tr.querySelector('.col-countdown');
        if (countdownCell && rundown[index]) {
            const countdownSeconds = parseTime(rundown[index].countdown);
            let countdownClass = 'countdown-display';
            if (countdownSeconds < 30 && countdownSeconds > 10) {
                countdownClass += ' warning';
            } else if (countdownSeconds <= 10) {
                countdownClass += ' danger';
            }
            
            // Only update if content actually changed to avoid disrupting focus
            const newContent = `<span class="${countdownClass}">${rundown[index].countdown}</span>`;
            if (countdownCell.innerHTML !== newContent) {
                countdownCell.innerHTML = newContent;
            }
        }
        
        // Update starttime cell (not editable) - but skip if user is editing
        const starttimeCell = tr.querySelector('.col-starttime');
        if (starttimeCell && !isEditingCell) {
            const newStarttime = calculateStartTime(index);
            if (starttimeCell.textContent !== newStarttime) {
                starttimeCell.textContent = newStarttime;
            }
        }
    });
    
    // Update row classes if current row changed
    updateRowClasses();
}

// ===================================
// Modal Management
// ===================================
function openModal() {
    settingsModal.classList.add('show');
    renderElementTypesSettings();
}

function closeModal() {
    settingsModal.classList.remove('show');
}

function saveSettings() {
    if (elementTypes.length === 0) {
        alert('Du musst mindestens einen Elementtyp haben!');
        elementTypes = getDefaultElementTypes();
    }
    saveElementTypes();
    renderElementsList();
    showSaveIndicator();
}

// ===================================
// Theme Management
// ===================================
function toggleDarkMode() {
    isDarkMode = themeToggle.checked;
    document.body.classList.toggle('dark-mode', isDarkMode);
    localStorage.setItem('dark-mode', isDarkMode);
}

// ===================================
// UI Helpers
// ===================================
function showSaveIndicator() {
    saveIndicator.classList.add('show');
    setTimeout(() => {
        saveIndicator.classList.remove('show');
    }, 2000);
}

// ===================================
// Initialize App
// ===================================
init();
renderTableHeader();
updateTimeDisplays();
