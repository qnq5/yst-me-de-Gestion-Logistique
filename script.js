// Global variables for maps and tracking
let map;
let markers = {};
let vehicleData = {
    'PAR-TNG-001': {
        type: 'truck',
        route: [
            { lat: 48.8566, lng: 2.3522, name: 'Paris' },
            { lat: 45.7589, lng: 4.8414, name: 'Lyon' },
            { lat: 43.2965, lng: -5.6795, name: 'Madrid' },
            { lat: 36.1408, lng: -5.4535, name: 'Algésiras' }
        ],
        currentPosition: 0,
        status: 'on-time'
    },
    'MED-234': {
        type: 'ship',
        route: [
            { lat: 36.1408, lng: -5.4535, name: 'Algésiras' },
            { lat: 35.7595, lng: -5.9340, name: 'Tanger Med' }
        ],
        currentPosition: 0,
        status: 'delayed',
        delay: 120 // minutes
    }
};

// App state tracking
const appState = {
    activeTab: 'visualization',
    darkMode: false,
    notifications: [],
    searchResults: [],
    lastAction: null
};

// Initialize map and tracking
function initializeMap() {
    map = L.map('map').setView([41.8719, -2.8750], 5); // Center view on Spain

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Initialize markers for each vehicle
    for (let vehicleId in vehicleData) {
        const vehicle = vehicleData[vehicleId];
        const position = vehicle.route[vehicle.currentPosition];
        const icon = L.divIcon({
            className: `vehicle-marker ${vehicle.type}`,
            html: `<i class="fas fa-${vehicle.type === 'truck' ? 'truck' : 'ship'}"></i>`,
            iconSize: [30, 30]
        });

        markers[vehicleId] = L.marker([position.lat, position.lng], { icon }).addTo(map);
        drawRoute(vehicle.route);
    }

    // Start real-time updates
    setInterval(updateVehiclePositions, 5000);
}

// Draw route on map
function drawRoute(route) {
    const points = route.map(point => [point.lat, point.lng]);
    L.polyline(points, {
        color: '#3498db',
        weight: 3,
        opacity: 0.6
    }).addTo(map);
}

// Update vehicle positions
function updateVehiclePositions() {
    for (let vehicleId in vehicleData) {
        const vehicle = vehicleData[vehicleId];
        
        // Simulate movement along route
        if (Math.random() > 0.7) { // 30% chance to move
            vehicle.currentPosition = Math.min(
                vehicle.currentPosition + 1,
                vehicle.route.length - 1
            );

            const newPos = vehicle.route[vehicle.currentPosition];
            markers[vehicleId].setLatLng([newPos.lat, newPos.lng]);

            // Update status and UI
            updateVehicleStatus(vehicleId);
        }
    }
}

// Update vehicle status in UI
function updateVehicleStatus(vehicleId) {
    const vehicle = vehicleData[vehicleId];
    const statusElement = document.querySelector(`#${vehicleId} .status`);
    
    if (statusElement) {
        if (vehicle.status === 'delayed') {
            statusElement.textContent = `Retard: ${Math.floor(vehicle.delay / 60)}h${vehicle.delay % 60}min`;
            statusElement.className = 'status delayed';
        } else {
            statusElement.textContent = 'À l\'heure';
            statusElement.className = 'status on-time';
        }
    }
}

// Tab handling
function openTab(tabName) {
    const tabContents = document.getElementsByClassName('tab-content');
    const tabButtons = document.getElementsByClassName('tab-btn');

    Array.from(tabContents).forEach(tab => tab.classList.remove('active'));
    Array.from(tabButtons).forEach(btn => btn.classList.remove('active'));

    document.getElementById(tabName).classList.add('active');
    event.currentTarget.classList.add('active');

    // Initialize map when switching to tracking tab
    if (tabName === 'tracking' && !map) {
        initializeMap();
    }
}

// TMS Functions
function optimizeRoutes() {
    const mode = document.getElementById('routeOptimizationMode').value;
    // Simulate route optimization
    showNotification('Optimisation des routes en cours...', 'info');
    setTimeout(() => {
        showNotification('Routes optimisées avec succès!', 'success');
    }, 2000);
}

// Notification system
function showNotification(message, type = 'info', details = '') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    let icon;
    switch(type) {
        case 'success':
            icon = 'check-circle';
            break;
        case 'warning':
            icon = 'exclamation-triangle';
            break;
        case 'error':
            icon = 'times-circle';
            break;
        default:
            icon = 'info-circle';
    }
    
    notification.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <div class="notification-content">
            <span class="notification-title">${message}</span>
            ${details ? `<span class="notification-details">${details}</span>` : ''}
        </div>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    document.body.appendChild(notification);
    
    // Add slide-in animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Auto-dismiss after timeout unless it's an error
    if (type !== 'error') {
        setTimeout(() => {
            dismissNotification(notification);
        }, 5000);
    }
    
    // Add click event to dismiss button
    const closeBtn = notification.querySelector('.notification-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            dismissNotification(notification);
        });
    }
    
    return notification;
}

// Dismiss notification with animation
function dismissNotification(notification) {
    notification.classList.remove('show');
    notification.classList.add('hide');
    
    setTimeout(() => {
        notification.remove();
    }, 300); // Match the CSS transition duration
}

// Visual feedback when elements are clicked
function animateElement(element, animationClass) {
    element.classList.add(animationClass);
    
    // Remove the animation class after the animation completes
    setTimeout(() => {
        element.classList.remove(animationClass);
    }, 300);
}

// Initialize analytics charts
function initializeCharts() {
    // Check if we're on the analytics tab or if it will be shown soon
    if (!document.getElementById('analytics').classList.contains('active') && 
        !appState.activeTab === 'analytics') {
        // Schedule initialization for when the tab is opened
        return;
    }
    
    // Time Performance Chart
    const timeCtx = document.getElementById('timePerformanceChart');
    if (timeCtx) {
        new Chart(timeCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil'],
                datasets: [{
                    label: 'Temps de Transit (jours)',
                    data: [12, 11, 10, 9, 8, 9, 8],
                    borderColor: '#4e73df',
                    backgroundColor: 'rgba(78, 115, 223, 0.1)',
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Temps d\'Attente (heures)',
                    data: [24, 20, 22, 18, 16, 14, 12],
                    borderColor: '#f6c23e',
                    backgroundColor: 'rgba(246, 194, 62, 0.1)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    },
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: false,
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            drawBorder: false
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }
    
    // Cost Analysis Chart
    const costCtx = document.getElementById('costAnalysisChart');
    if (costCtx) {
        new Chart(costCtx, {
            type: 'bar',
            data: {
                labels: ['Transport Terrestre', 'Transport Maritime', 'Douanes', 'Stockage', 'Manutention'],
                datasets: [{
                    label: 'Coûts Actuels (k€)',
                    data: [25, 12, 8, 5, 10],
                    backgroundColor: 'rgba(78, 115, 223, 0.8)'
                }, {
                    label: 'Coûts Prévus (k€)',
                    data: [22, 10, 8, 4, 9],
                    backgroundColor: 'rgba(54, 185, 204, 0.8)'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Coût (k€)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top'
                    }
                }
            }
        });
    }
    
    // Route Efficiency Chart
    const efficiencyCtx = document.getElementById('routeEfficiencyChart');
    if (efficiencyCtx) {
        new Chart(efficiencyCtx, {
            type: 'radar',
            data: {
                labels: ['Rapidité', 'Coût', 'Sécurité', 'Fiabilité', 'Impact Environnemental'],
                datasets: [{
                    label: 'Route Actuelle',
                    data: [85, 70, 90, 80, 65],
                    backgroundColor: 'rgba(78, 115, 223, 0.2)',
                    borderColor: 'rgba(78, 115, 223, 0.8)',
                    pointBackgroundColor: 'rgba(78, 115, 223, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(78, 115, 223, 1)'
                }, {
                    label: 'Route Alternative',
                    data: [70, 85, 75, 90, 80],
                    backgroundColor: 'rgba(28, 200, 138, 0.2)',
                    borderColor: 'rgba(28, 200, 138, 0.8)',
                    pointBackgroundColor: 'rgba(28, 200, 138, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(28, 200, 138, 1)'
                }]
            },
            options: {
                elements: {
                    line: {
                        tension: 0.1
                    }
                },
                scales: {
                    r: {
                        angleLines: {
                            display: true
                        },
                        suggestedMin: 0,
                        suggestedMax: 100
                    }
                }
            }
        });
    }
    
    // Delay Prediction Chart
    const delayCtx = document.getElementById('delayPredictionChart');
    if (delayCtx) {
        new Chart(delayCtx, {
            type: 'doughnut',
            data: {
                labels: ['Aucun Retard', 'Retard < 1 jour', 'Retard 1-2 jours', 'Retard > 2 jours'],
                datasets: [{
                    data: [65, 20, 10, 5],
                    backgroundColor: [
                        'rgba(28, 200, 138, 0.8)',
                        'rgba(54, 185, 204, 0.8)',
                        'rgba(246, 194, 62, 0.8)',
                        'rgba(231, 74, 59, 0.8)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((acc, data) => acc + data, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${percentage}% (${value} expéditions)`;
                            }
                        }
                    }
                }
            }
        });
    }
}

// Initialize chart event handlers
function setupChartEvents() {
    // Add event listener to the time range dropdown to update charts
    const timeRangeSelect = document.getElementById('timeRange');
    if (timeRangeSelect) {
        timeRangeSelect.addEventListener('change', function() {
            // Show loading state
            showNotification('Mise à jour des graphiques...', 'info');
            
            // Simulate data loading
            setTimeout(() => {
                // Reinitialize the charts with "new" data
                initializeCharts();
                
                showNotification('Graphiques mis à jour', 'success');
            }, 800);
        });
    }
}

// Tab handling with chart initialization
function openTab(tabName) {
    // Update app state
    appState.activeTab = tabName;
    
    const tabContents = document.getElementsByClassName('tab-content');
    const tabButtons = document.getElementsByClassName('tab-btn');

    Array.from(tabContents).forEach(tab => tab.classList.remove('active'));
    Array.from(tabButtons).forEach(btn => btn.classList.remove('active'));

    document.getElementById(tabName).classList.add('active');
    
    // Update active button - handle the case when it's called programmatically
    const activeButton = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }

    // Initialize map when switching to tracking tab
    if (tabName === 'gps' && !map) {
        initializeMap();
    }
    
    // Initialize charts when switching to analytics tab
    if (tabName === 'analytics') {
        // Initialize charts with a slight delay to ensure DOM is ready
        setTimeout(() => {
            initializeCharts();
            setupChartEvents();
        }, 100);
    }
}

// Show notification center
function showNotificationCenter() {
    // Create modal for notification center if it doesn't exist
    let notificationCenter = document.getElementById('notification-center');
    
    if (!notificationCenter) {
        notificationCenter = document.createElement('div');
        notificationCenter.id = 'notification-center';
        notificationCenter.className = 'modal';
        
        notificationCenter.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-bell"></i> Centre de Notifications</h2>
                    <button class="close-btn"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <div class="notification-filters">
                        <button class="filter-btn active" data-filter="all">Tous</button>
                        <button class="filter-btn" data-filter="unread">Non lus</button>
                        <button class="filter-btn" data-filter="important">Importants</button>
                    </div>
                    <div class="notification-list">
                        <div class="notification-item unread important">
                            <div class="notification-icon warning">
                                <i class="fas fa-exclamation-triangle"></i>
                            </div>
                            <div class="notification-content">
                                <h4>Retard possible</h4>
                                <p>Expédition #PAR-TNG-001 pourrait être retardée</p>
                                <span class="timestamp">Il y a 15 minutes</span>
                            </div>
                            <div class="notification-actions">
                                <button class="action-btn"><i class="fas fa-check"></i></button>
                                <button class="action-btn"><i class="fas fa-star"></i></button>
                            </div>
                        </div>
                        <div class="notification-item">
                            <div class="notification-icon info">
                                <i class="fas fa-info-circle"></i>
                            </div>
                            <div class="notification-content">
                                <h4>Nouvelle expédition</h4>
                                <p>Expédition #MAR-FEZ-002 créée avec succès</p>
                                <span class="timestamp">Il y a 2 heures</span>
                            </div>
                            <div class="notification-actions">
                                <button class="action-btn"><i class="fas fa-check"></i></button>
                                <button class="action-btn"><i class="fas fa-star"></i></button>
                            </div>
                        </div>
                        <div class="notification-item unread">
                            <div class="notification-icon success">
                                <i class="fas fa-check-circle"></i>
                            </div>
                            <div class="notification-content">
                                <h4>Livraison complétée</h4>
                                <p>Expédition #ALG-TNG-003 livrée</p>
                                <span class="timestamp">Il y a 6 heures</span>
                            </div>
                            <div class="notification-actions">
                                <button class="action-btn"><i class="fas fa-check"></i></button>
                                <button class="action-btn"><i class="fas fa-star"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notificationCenter);
        
        // Add event listener to close button
        const closeBtn = notificationCenter.querySelector('.close-btn');
        closeBtn.addEventListener('click', () => {
            notificationCenter.classList.remove('show');
        });
        
        // Add event listeners for notification actions
        notificationCenter.querySelectorAll('.notification-actions .action-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                animateElement(this, 'btn-clicked');
                const action = this.querySelector('i').classList.contains('fa-check') ? 'marquer comme lu' : 'marquer comme important';
                showNotification(`Notification ${action}`, 'success');
            });
        });
        
        // Add event listeners for filter buttons
        notificationCenter.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                // Remove active class from all buttons
                notificationCenter.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                this.classList.add('active');
                
                // Apply filter
                const filter = this.getAttribute('data-filter');
                const items = notificationCenter.querySelectorAll('.notification-item');
                
                items.forEach(item => {
                    if (filter === 'all') {
                        item.style.display = 'flex';
                    } else if (filter === 'unread') {
                        item.style.display = item.classList.contains('unread') ? 'flex' : 'none';
                    } else if (filter === 'important') {
                        item.style.display = item.classList.contains('important') ? 'flex' : 'none';
                    }
                });
            });
        });
    }
    
    // Show the notification center
    notificationCenter.classList.add('show');
    showNotification('Centre de notifications ouvert', 'info');
}

// Show profile management
function showProfileManagement() {
    // Create modal for profile management if it doesn't exist
    let profileModal = document.getElementById('profile-modal');
    
    if (!profileModal) {
        profileModal = document.createElement('div');
        profileModal.id = 'profile-modal';
        profileModal.className = 'modal';
        
        profileModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-user"></i> Gestion du Profil</h2>
                    <button class="close-btn"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <div class="profile-info">
                        <div class="profile-avatar">
                            <i class="fas fa-user-circle"></i>
                            <button class="change-avatar-btn"><i class="fas fa-camera"></i></button>
                        </div>
                        <div class="profile-details">
                            <h3>Mohammed A.</h3>
                            <p>Responsable Logistique</p>
                            <p><i class="fas fa-envelope"></i> m.ahmed@aymacof.com</p>
                        </div>
                    </div>
                    <div class="profile-settings">
                        <h3>Paramètres du compte</h3>
                        <form id="profile-form">
                            <div class="form-group">
                                <label for="profile-name">Nom complet</label>
                                <input type="text" id="profile-name" value="Mohammed Ahmed">
                            </div>
                            <div class="form-group">
                                <label for="profile-email">Email</label>
                                <input type="email" id="profile-email" value="m.ahmed@aymacof.com">
                            </div>
                            <div class="form-group">
                                <label for="profile-lang">Langue</label>
                                <select id="profile-lang">
                                    <option value="fr">Français</option>
                                    <option value="en">English</option>
                                    <option value="ar">العربية</option>
                                </select>
                            </div>
                            <div class="form-actions">
                                <button type="submit" class="submit-btn">Enregistrer les modifications</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(profileModal);
        
        // Add event listener to close button
        const closeBtn = profileModal.querySelector('.close-btn');
        closeBtn.addEventListener('click', () => {
            profileModal.classList.remove('show');
        });
        
        // Add event listener to form submit
        const profileForm = profileModal.querySelector('#profile-form');
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            showNotification('Profil mis à jour avec succès', 'success');
            setTimeout(() => {
                profileModal.classList.remove('show');
            }, 1000);
        });
    }
    
    // Show the profile modal
    profileModal.classList.add('show');
    showNotification('Gestion du profil ouverte', 'info');
}

// Show settings
function showSettings() {
    // Create modal for settings if it doesn't exist
    let settingsModal = document.getElementById('settings-modal');
    
    if (!settingsModal) {
        settingsModal = document.createElement('div');
        settingsModal.id = 'settings-modal';
        settingsModal.className = 'modal';
        
        settingsModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-cog"></i> Paramètres</h2>
                    <button class="close-btn"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <div class="settings-container">
                        <div class="settings-section">
                            <h3>Apparence</h3>
                            <div class="setting-item">
                                <span>Thème</span>
                                <div class="theme-selector">
                                    <button class="theme-btn light ${!appState.darkMode ? 'active' : ''}" data-theme="light">
                                        <i class="fas fa-sun"></i> Clair
                                    </button>
                                    <button class="theme-btn dark ${appState.darkMode ? 'active' : ''}" data-theme="dark">
                                        <i class="fas fa-moon"></i> Sombre
                                    </button>
                                </div>
                            </div>
                            <div class="setting-item">
                                <span>Taille de texte</span>
                                <div class="text-size-selector">
                                    <button class="text-size-btn" data-size="small">A</button>
                                    <button class="text-size-btn active" data-size="medium">A</button>
                                    <button class="text-size-btn" data-size="large">A</button>
                                </div>
                            </div>
                        </div>
                        <div class="settings-section">
                            <h3>Notifications</h3>
                            <div class="setting-item">
                                <span>Notifications email</span>
                                <label class="switch">
                                    <input type="checkbox" checked>
                                    <span class="slider round"></span>
                                </label>
                            </div>
                            <div class="setting-item">
                                <span>Sons des notifications</span>
                                <label class="switch">
                                    <input type="checkbox" checked>
                                    <span class="slider round"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(settingsModal);
        
        // Add event listener to close button
        const closeBtn = settingsModal.querySelector('.close-btn');
        closeBtn.addEventListener('click', () => {
            settingsModal.classList.remove('show');
        });
        
        // Add event listeners for theme buttons
        settingsModal.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const theme = this.getAttribute('data-theme');
                
                // Update active state
                settingsModal.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Apply theme
                if (theme === 'dark') {
                    document.documentElement.setAttribute('data-theme', 'dark');
                    localStorage.setItem('theme', 'dark');
                    appState.darkMode = true;
                    const themeIcon = document.querySelector('.theme-toggle i');
                    if (themeIcon) {
                        themeIcon.classList.remove('fa-moon');
                        themeIcon.classList.add('fa-sun');
                    }
                } else {
                    document.documentElement.removeAttribute('data-theme');
                    localStorage.setItem('theme', 'light');
                    appState.darkMode = false;
                    const themeIcon = document.querySelector('.theme-toggle i');
                    if (themeIcon) {
                        themeIcon.classList.remove('fa-sun');
                        themeIcon.classList.add('fa-moon');
                    }
                }
                
                showNotification(`Thème ${theme === 'dark' ? 'sombre' : 'clair'} appliqué`, 'success');
            });
        });
        
        // Add event listeners for text size buttons
        settingsModal.querySelectorAll('.text-size-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const size = this.getAttribute('data-size');
                
                // Update active state
                settingsModal.querySelectorAll('.text-size-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Apply text size
                document.body.classList.remove('text-small', 'text-medium', 'text-large');
                document.body.classList.add(`text-${size}`);
                
                showNotification(`Taille de texte modifiée`, 'success');
            });
        });
        
        // Add event listeners for switches
        settingsModal.querySelectorAll('.switch input').forEach(input => {
            input.addEventListener('change', function() {
                const settingType = this.closest('.setting-item').querySelector('span').textContent;
                const state = this.checked ? 'activées' : 'désactivées';
                showNotification(`${settingType} ${state}`, 'success');
            });
        });
    }
    
    // Show the settings modal
    settingsModal.classList.add('show');
    showNotification('Paramètres ouverts', 'info');
}

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    
    // Setup tab button click handlers
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            openTab(tabName);
            
            // Visual feedback that the tab was clicked
            animateElement(this, 'tab-btn-clicked');
        });
    });

    // Initialize dark mode toggle
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        console.log('Theme toggle found');
        themeToggle.addEventListener('click', toggleDarkMode);
        
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            appState.darkMode = true;
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            }
        }
    } else {
        console.log('Theme toggle not found');
    }
    
    // Setup navigation links with enhanced functionality
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const action = this.getAttribute('data-tooltip');
            
            if (this.classList.contains('notification-link')) {
                showNotificationCenter();
            } else if (this.querySelector('i.fa-user')) {
                showProfileManagement();
            } else if (this.querySelector('i.fa-cog')) {
                showSettings();
            } else {
                showNotification(action + ' sélectionné', 'info');
            }
            
            // Visual feedback
            animateElement(this, 'nav-link-clicked');
        });
    });
    
    // Initialize search functionality
    initializeSearch();
    
    // Add interactivity to stat cards
    initializeStatCards();
    
    // Show visualization tab by default
    openTab('visualization');
    
    // Initialize charts
    initializeCharts();
    
    console.log('Initialization complete');
});

// Toggle dark mode
function toggleDarkMode() {
    console.log('Toggling dark mode');
    const icon = document.querySelector('.theme-toggle i');
    
    if (document.documentElement.getAttribute('data-theme') === 'dark') {
        // Switch to light mode
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        if (icon) {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    } else {
        // Switch to dark mode
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        if (icon) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
    }
}

// Theme toggle functionality
function initializeThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    const icon = themeToggle.querySelector('i');
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }
    
    themeToggle.addEventListener('click', function() {
        // Toggle theme
        if (document.documentElement.getAttribute('data-theme') === 'dark') {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
    });
}

// Search functionality
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase();
        
        // Display search results or suggestions based on input
        if (query.length > 2) {
            showSearchResults(query);
        } else {
            hideSearchResults();
        }
    });
    
    // Add clear functionality when clicking X (if any)
    const clearSearch = document.querySelector('.search-clear');
    if (clearSearch) {
        clearSearch.addEventListener('click', function() {
            searchInput.value = '';
            hideSearchResults();
        });
    }
}

// Display search results
function showSearchResults(query) {
    // In a real app, this would search through actual data
    let results = [];
    
    // Simulate finding results
    const exampleItems = [
        { id: 'PAR-TNG-001', name: 'Expédition Textile Paris-Tanger', status: 'En cours' },
        { id: 'MAR-FEZ-002', name: 'Transport Marseille-Fez', status: 'En attente' },
        { id: 'ALG-TNG-003', name: 'Ferry Algésiras-Tanger Med', status: 'En retard' }
    ];
    
    results = exampleItems.filter(item => 
        item.id.toLowerCase().includes(query) || 
        item.name.toLowerCase().includes(query) ||
        item.status.toLowerCase().includes(query)
    );
    
    // Check if search results container exists, if not create it
    let searchResults = document.querySelector('.search-results');
    if (!searchResults) {
        searchResults = document.createElement('div');
        searchResults.className = 'search-results';
        document.querySelector('.search-section').appendChild(searchResults);
    }
    
    // Clear previous results
    searchResults.innerHTML = '';
    
    if (results.length > 0) {
        results.forEach(result => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            resultItem.innerHTML = `
                <div class="result-id">${result.id}</div>
                <div class="result-name">${result.name}</div>
                <div class="result-status ${result.status === 'En retard' ? 'status-late' : ''}">${result.status}</div>
            `;
            
            // Add click handler
            resultItem.addEventListener('click', function() {
                // Navigate to the detailed view or perform action
                alert(`Affichage des détails pour: ${result.id}`);
                hideSearchResults();
            });
            
            searchResults.appendChild(resultItem);
        });
        
        searchResults.style.display = 'block';
    } else {
        searchResults.innerHTML = '<div class="no-results">Aucun résultat trouvé</div>';
        searchResults.style.display = 'block';
    }
}

// Hide search results
function hideSearchResults() {
    const searchResults = document.querySelector('.search-results');
    if (searchResults) {
        searchResults.style.display = 'none';
    }
}

// Initialize stat cards with interactivity
function initializeStatCards() {
    const statCards = document.querySelectorAll('.stat-card');
    
    statCards.forEach(card => {
        card.addEventListener('click', function() {
            const cardType = this.querySelector('.stat-info span').textContent;
            
            // Navigate to appropriate tab based on card type
            let targetTab = 'visualization';
            
            if (cardType.includes('Retards')) {
                targetTab = 'delay-solutions';
            } else if (cardType.includes('Expéditions')) {
                targetTab = 'gps';
            } else if (cardType.includes('Livraisons')) {
                targetTab = 'analytics';
            }
            
            // Click on the appropriate tab button
            document.querySelector(`[data-tab="${targetTab}"]`).click();
        });
    });
}
