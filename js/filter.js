// FILTRE DE NOTE PAR TYPE


// Système de filtrage des notes
let currentFilter = 'all';

// Mapping des types de notes avec leurs boutons
const filterMapping = {
    'all': 'all',
    'simple': 'fa-pen',
    'liste': 'fa-tasks',
    'contact': 'fa-user',
    'lieu': 'fa-map-marker-alt',
    'tache': 'fa-calendar-check'
};

// Initialisation du système de filtrage
function initFilterSystem() {
    const filterButtons = document.querySelectorAll('.filter-select button');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            handleFilterClick(button);
        });
    });
    
    // Définir le bouton "All" comme actif par défaut
    setActiveFilter('all');
}

// Gérer le clic sur un bouton de filtre
function handleFilterClick(button) {
    const buttonText = button.textContent.trim().toLowerCase();
    const buttonIcon = button.querySelector('i');
    
    let filterType = 'all';
    
    if (buttonText === 'all') {
        filterType = 'all';
    } else if (buttonIcon) {
        // Trouver le type correspondant à l'icône
        const iconClass = Array.from(buttonIcon.classList).find(cls => cls.startsWith('fa-') && cls !== 'fas');
        filterType = Object.keys(filterMapping).find(key => filterMapping[key] === iconClass) || 'all';
    }
    
    setActiveFilter(filterType);
    applyFilter(filterType);
}

// Définir le filtre actif visuellement
function setActiveFilter(filterType) {
    currentFilter = filterType;
    const filterButtons = document.querySelectorAll('.filter-select button');
    
    filterButtons.forEach(button => {
        const buttonText = button.textContent.trim().toLowerCase();
        const buttonIcon = button.querySelector('i');
        
        let isActive = false;
        
        if (filterType === 'all' && buttonText === 'all') {
            isActive = true;
        } else if (filterType !== 'all' && buttonIcon) {
            const iconClass = Array.from(buttonIcon.classList).find(cls => cls.startsWith('fa-') && cls !== 'fas');
            isActive = filterMapping[filterType] === iconClass;
        }
        
        if (isActive) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

// Appliquer le filtre aux notes affichées
function applyFilter(filterType) {
    let filteredNotes;
    
    if (filterType === 'all') {
        filteredNotes = notes;
    } else {
        filteredNotes = notes.filter(note => note.type === filterType);
    }
    
    renderFilteredNotes(filteredNotes);
}

// Afficher les notes filtrées
function renderFilteredNotes(filteredNotes) {
    if (filteredNotes.length === 0) {
        emptyState.style.display = 'block';
        notesContainer.innerHTML = '';
        notesContainer.appendChild(emptyState);
        
        // Modifier le message selon le filtre
        const emptyMessage = emptyState.querySelector('p');
        if (currentFilter === 'all') {
            emptyMessage.textContent = 'Commencez par créer votre première note';
        } else {
            const filterNames = {
                'simple': 'notes simples',
                'liste': 'listes',
                'contact': 'contacts',
                'lieu': 'lieux',
                'tache': 'tâches'
            };
            emptyMessage.textContent = `Aucune ${filterNames[currentFilter] || 'note'} pour le moment`;
        }
        return;
    }

    emptyState.style.display = 'none';

    // Grouper les notes par mois
    const groupedNotes = groupNotesByMonth(filteredNotes);
    
    let html = '';
    for (const [month, monthNotes] of Object.entries(groupedNotes)) {
        html += `
            <div class="month-group">
                <div class="month-label">${month}</div>
                ${monthNotes.map(note => `
                    <div class="note-item-wrapper">
                        <div class="note-item" onclick="viewNote(${note.id})">
                            <i class="fas ${noteIcons[note.type]}"></i>
                            <div class="note-item-content">
                                <span>${note.name}</span>
                            </div>
                        </div>
                        <button class="share-button" onclick="shareNoteFromList(event, ${note.id})">
                            <i class="fas fa-share-alt"></i>
                            <span class="share-tooltip">Partager</span>
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    }

    notesContainer.innerHTML = html;
}

// Réinitialiser le filtre à "All"
function resetFilter() {
    setActiveFilter('all');
    applyFilter('all');
}

// Initialiser le système au chargement du document
document.addEventListener('DOMContentLoaded', () => {
    initFilterSystem();
});
