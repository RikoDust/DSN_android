// Données et état de l'application
let notes = [];
let currentNoteId = null;
let currentNoteType = null;
let scrollPosition = 0; // Pour sauvegarder la position du scroll


// Éléments DOM
const header = document.getElementById('header');
const addButton = document.getElementById('addButton');
const typeModal = document.getElementById('typeModal');
const formModal = document.getElementById('formModal');
const viewModal = document.getElementById('viewModal');
const notesContainer = document.getElementById('notesContainer');
const emptyState = document.getElementById('emptyState');
const noteForm = document.getElementById('noteForm');

// Icônes par type de note
const noteIcons = {
    simple: 'fa-pen',
    liste: 'fa-tasks',
    contact: 'fa-user',
    lieu: 'fa-map-marker-alt',
    tache: 'fa-calendar-check'
};

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    loadNotes();
    renderNotes();
    setupEventListeners();
});

// Configuration des écouteurs d'événements
function setupEventListeners() {
    // Scroll header
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Bouton d'ajout
    addButton.addEventListener('click', () => {
        openModal(typeModal);
    });

    // Bouton de toggle du thème
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Fermeture des modales
    document.getElementById('closeTypeModal').addEventListener('click', () => {
        closeModal(typeModal);
    });

    document.getElementById('closeFormModal').addEventListener('click', () => {
        closeModal(formModal);
    });

    document.getElementById('closeViewModal').addEventListener('click', () => {
        closeModal(viewModal);
        scrollPosition = 0; // Réinitialiser la position
    });

    // Clic en dehors de la modale
    [typeModal, formModal, viewModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
                if (modal === viewModal) {
                    scrollPosition = 0; // Réinitialiser la position
                }
            }
        });
    });

    // Sélection du type de note
    document.querySelectorAll('.note-type-item').forEach(item => {
        item.addEventListener('click', () => {
            const type = item.dataset.type;
            currentNoteType = type;
            closeModal(typeModal);
            showNoteForm(type);
        });
    });

    // Actions de visualisation
    document.getElementById('editBtn').addEventListener('click', editNote);
    document.getElementById('deleteBtn').addEventListener('click', deleteNote);
}

// Toggle du thème
function toggleTheme() {
    isDarkMode = !isDarkMode;
    const body = document.body;
    const themeIcon = document.querySelector('#themeToggle i');
    
    if (isDarkMode) {
        body.classList.add('dark-mode');
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
        localStorage.setItem('theme', 'dark');
    } else {
        body.classList.remove('dark-mode');
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
        localStorage.setItem('theme', 'light');
    }
}

// Gestion des modales
function openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    // Ne pas réinitialiser currentNoteId ici pour permettre les modifications multiples
}

// Affichage du formulaire selon le type
function showNoteForm(type, note = null) {
    const isEdit = note !== null;
    
    // Mettre à jour l'icône et le titre du header du formulaire
    const formIcon = document.getElementById('formIcon');
    formIcon.className = `fas ${noteIcons[type]}`;
    
    const formTitle = document.getElementById('formTitle');
    formTitle.textContent = isEdit ? note.name : 'Nouvelle note';
    
    let formHTML = '';

    switch (type) {
        case 'simple':
            formHTML = `
                <div class="form-group">
                    <label for="noteName">Nom de la note *</label>
                    <input type="text" id="noteName" required value="${note ? note.name : ''}">
                </div>
                <div class="form-group">
                    <label for="noteContent">Contenu</label>
                    <textarea id="noteContent">${note ? note.content : ''}</textarea>
                </div>
            `;
            break;

        case 'liste':
            formHTML = `
                <div class="form-group">
                    <label for="noteName">Nom de la note *</label>
                    <input type="text" id="noteName" required value="${note ? note.name : ''}">
                </div>
                <div class="form-group">
                    <label>Items de la liste</label>
                    <div class="list-items" id="listItems">
                        ${note && note.items ? note.items.map((item, index) => `
                            <div class="list-item">
                                <input type="text" value="${item.text}" data-index="${index}">
                                <button type="button" class="remove-item" onclick="removeListItem(this)">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        `).join('') : `
                            <div class="list-item">
                                <input type="text" placeholder="Item 1" data-index="0">
                                <button type="button" class="remove-item" onclick="removeListItem(this)">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        `}
                    </div>
                    <button type="button" class="add-item" onclick="addListItem()">
                        <i class="fas fa-plus"></i> Ajouter un item
                    </button>
                </div>
            `;
            break;

        case 'contact':
            formHTML = `
                <div class="form-group">
                    <label for="noteName">Nom du contact *</label>
                    <input type="text" id="noteName" required value="${note ? note.name : ''}">
                </div>
                <div class="form-group">
                    <label for="contactPhone">Téléphone</label>
                    <input type="tel" id="contactPhone" value="${note ? note.phone : ''}">
                </div>
                <div class="form-group">
                    <label for="contactEmail">Email</label>
                    <input type="email" id="contactEmail" value="${note ? note.email : ''}">
                </div>
            `;
            break;

        case 'lieu':
            formHTML = `
                <div class="form-group">
                    <label for="noteName">Nom du lieu *</label>
                    <input type="text" id="noteName" required value="${note ? note.name : ''}">
                </div>
                <div class="form-group">
                    <label for="placeAddress">Adresse</label>
                    <input type="text" id="placeAddress" value="${note ? note.address : ''}">
                </div>
                <div class="form-group">
                    <label for="placeNote">Note</label>
                    <textarea id="placeNote">${note ? note.note : ''}</textarea>
                </div>
            `;
            break;

        case 'tache':
            formHTML = `
                <div class="form-group">
                    <label for="noteName">Nom de la tâche *</label>
                    <input type="text" id="noteName" required value="${note ? note.name : ''}">
                </div>
                <div class="form-group">
                    <label for="taskDescription">Descriptif</label>
                    <textarea id="taskDescription">${note ? note.description : ''}</textarea>
                </div>
                <div class="form-group">
                    <label for="taskDate">Quand (Date)</label>
                    <input type="date" id="taskDate" value="${note ? note.taskDate : ''}">
                </div>
            `;
            break;
    }

    formHTML += `
        <button type="submit" class="btn btn-primary">
            ${isEdit ? 'Mettre à jour' : 'Enregistrer'}
        </button>
    `;

    noteForm.innerHTML = formHTML;
    noteForm.onsubmit = (e) => {
        e.preventDefault();
        saveNote(type, isEdit);
    };

    openModal(formModal);
}

// Gestion des items de liste
window.addListItem = function() {
    const listItems = document.getElementById('listItems');
    const index = listItems.children.length;
    const div = document.createElement('div');
    div.className = 'list-item';
    div.innerHTML = `
        <input type="text" placeholder="Item ${index + 1}" data-index="${index}">
        <button type="button" class="remove-item" onclick="removeListItem(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    listItems.appendChild(div);
};

window.removeListItem = function(btn) {
    const listItems = document.getElementById('listItems');
    if (listItems.children.length > 1) {
        btn.parentElement.remove();
    }
};

// Sauvegarde d'une note
function saveNote(type, isEdit) {
    const name = document.getElementById('noteName').value.trim();
    if (!name) return;

    const note = {
        id: isEdit ? currentNoteId : Date.now(),
        type: type,
        name: name,
        date: isEdit ? notes.find(n => n.id === currentNoteId).date : new Date().toISOString()
    };

    switch (type) {
        case 'simple':
            note.content = document.getElementById('noteContent').value;
            break;

        case 'liste':
            const inputs = Array.from(document.querySelectorAll('#listItems input'));
            note.items = inputs
                .map(input => ({
                    text: input.value.trim(),
                    checked: false
                }))
                .filter(item => item.text !== '');
            
            // Si on modifie, on garde l'état des checks
            if (isEdit) {
                const oldNote = notes.find(n => n.id === currentNoteId);
                if (oldNote && oldNote.items) {
                    note.items = note.items.map((item, index) => {
                        if (oldNote.items[index]) {
                            return {
                                text: item.text,
                                checked: oldNote.items[index].checked || false
                            };
                        }
                        return item;
                    });
                }
            }
            break;

        case 'contact':
            note.phone = document.getElementById('contactPhone').value;
            note.email = document.getElementById('contactEmail').value;
            break;

        case 'lieu':
            note.address = document.getElementById('placeAddress').value;
            note.note = document.getElementById('placeNote').value;
            break;

        case 'tache':
            note.description = document.getElementById('taskDescription').value;
            note.taskDate = document.getElementById('taskDate').value;
            break;
    }

    if (isEdit) {
        const index = notes.findIndex(n => n.id === currentNoteId);
        notes[index] = note;
    } else {
        notes.unshift(note);
    }

    saveNotes();
    renderNotes();
    closeModal(formModal);
    
    // Si on était en mode édition, rouvrir la modale de visualisation
    if (isEdit) {
        // Utiliser un petit délai pour permettre à la modale de formulaire de se fermer complètement
        setTimeout(() => {
            viewNote(currentNoteId);
        }, 100);
    } else {
        // Réinitialiser currentNoteId uniquement lors d'une nouvelle création
        currentNoteId = null;
        scrollPosition = 0;
    }
}

// Affichage des notes
function renderNotes() {
    if (notes.length === 0) {
        emptyState.style.display = 'block';
        notesContainer.innerHTML = '';
        notesContainer.appendChild(emptyState);
        return;
    }

    emptyState.style.display = 'none';

    // Grouper les notes par mois
    const groupedNotes = groupNotesByMonth(notes);
    
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

// Grouper les notes par mois
function groupNotesByMonth(notes) {
    const grouped = {};
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

    notes.forEach(note => {
        const date = new Date(note.date);
        const monthYear = `${months[date.getMonth()]} ${date.getFullYear()}`;
        
        if (!grouped[monthYear]) {
            grouped[monthYear] = [];
        }
        grouped[monthYear].push(note);
    });

    return grouped;
}

// Formatage de la date de tâche
function formatTaskDate(dateString) {
    if (!dateString) return 'Non définie';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
}

// Toggle check d'un item de liste
window.toggleListItem = function(noteId, itemIndex) {
    const note = notes.find(n => n.id === noteId);
    if (!note || !note.items || !note.items[itemIndex]) return;
    
    // Sauvegarder la position du scroll avant de modifier
    const listElement = document.querySelector('.view-field ul');
    if (listElement) {
        scrollPosition = listElement.scrollTop;
    }
    
    note.items[itemIndex].checked = !note.items[itemIndex].checked;
    saveNotes();
    
    // Rafraîchir l'affichage de la modale
    viewNote(noteId, true);
};

// Visualisation d'une note
window.viewNote = function(id, maintainScroll = false) {
    const note = notes.find(n => n.id === id);
    if (!note) return;

    currentNoteId = id;
    
    // Mettre à jour l'icône et le titre
    const iconElement = document.getElementById('viewIcon');
    iconElement.className = `fas ${noteIcons[note.type]}`;
    document.getElementById('viewTitle').textContent = note.name;

    let contentHTML = '';

    switch (note.type) {
        case 'simple':
            contentHTML = `
                <div class="view-field">
                    <label>Contenu</label>
                    <p>${note.content || 'Aucun contenu'}</p>
                </div>
            `;
            break;

        case 'liste':
            contentHTML = `
                <div class="view-field">
                    <label>Liste</label>
                    <ul id="noteListItems">
                        ${note.items.map((item, index) => `
                            <li class="${item.checked ? 'checked' : ''}" onclick="toggleListItem(${note.id}, ${index})">
                                <span class="item-text">${item.text}</span>
                                <i class="fas fa-check check-icon"></i>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
            break;

            case 'contact':
                const phoneLink = note.phone ? `<a href="tel:${note.phone}" style="color: inherit; text-decoration: none;">${note.phone}</a>` : 'Non renseigné';
                const emailLink = note.email ? `<a href="mailto:${note.email}" style="color: inherit; text-decoration: none;">${note.email}</a>` : 'Non renseigné';
                
                contentHTML = `
                    <div class="view-field">
                        <label>Téléphone</label>
                        <p>${phoneLink}</p>
                    </div>
                    <div class="view-field">
                        <label>Email</label>
                        <p>${emailLink}</p>
                    </div>
                    <div class="contact-actions">
                        ${note.phone ? `
                        <button class="btn-contact btn-phone" onclick="window.location.href='tel:${note.phone}'">
                            <i class="fas fa-phone"></i> Appeler
                        </button>
                        ` : ''}
                        ${note.email ? `
                        <button class="btn-contact btn-email" onclick="window.location.href='mailto:${note.email}'">
                            <i class="fas fa-envelope"></i> Envoyer un mail
                        </button>
                        ` : ''}
                    </div>
                `;
                break;

            case 'lieu':
                const addressLink = note.address ? 
                    `<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(note.address)}" target="_blank" style="color: inherit; text-decoration: none;">${note.address}</a>` 
                    : 'Non renseignée';
                
                contentHTML = `
                    <div class="view-field">
                        <label>Adresse</label>
                        <p>${addressLink}</p>
                    </div>
                    <div class="view-field">
                        <label>Note</label>
                        <p>${note.note || 'Aucune note'}</p>
                    </div>
                    ${note.address ? `
                    <div class="add-to-calendar">
                        <button class="btn-calendar" onclick="window.open('https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(note.address)}', '_blank')">
                            <i class="fas fa-map-marked-alt"></i> Ouvrir dans Maps
                        </button>
                    </div>
                    ` : ''}
                `;
                break;




            case 'tache':
                contentHTML = `
                    <div class="view-field">
                        <label>Descriptif</label>
                        <p>${note.description || 'Aucun descriptif'}</p>
                    </div>
                    <div class="view-field">
                        <label>Date</label>
                        <p>${formatTaskDate(note.taskDate)}</p>
                    </div>
                    ${note.taskDate ? `
                    <div class="add-to-calendar">
                        <button class="btn-calendar" onclick="addToCalendar(${note.id})">
                            <i class="fas fa-calendar-plus"></i> Ajouter à l'agenda
                        </button>
                    </div>
                    ` : ''}
                `;
          break;

        }





    document.getElementById('viewContent').innerHTML = contentHTML;
    
    // Si on maintient le scroll (après un toggle), restaurer la position
    if (maintainScroll && note.type === 'liste') {
        setTimeout(() => {
            const listElement = document.querySelector('.view-field ul');
            if (listElement) {
                listElement.scrollTop = scrollPosition;
            }
        }, 0);
    } else {
        scrollPosition = 0; // Réinitialiser si c'est une nouvelle ouverture
    }
    
    openModal(viewModal);
};

// Partage d'une note depuis la liste
window.shareNoteFromList = function(event, id) {
    event.stopPropagation();
    const note = notes.find(n => n.id === id);
    if (!note) return;

    let shareText = `${note.name}\n\n`;

    switch (note.type) {
        case 'simple':
            shareText += note.content;
            break;

        case 'liste':
            shareText += note.items.map((item, i) => {
                const checkbox = item.checked ? '[✓]' : '[ ]';
                return `${checkbox} ${item.text}`;
            }).join('\n');
            break;

        case 'contact':
            shareText += `Téléphone: ${note.phone || 'Non renseigné'}\n`;
            shareText += `Email: ${note.email || 'Non renseigné'}`;
            break;

        case 'lieu':
            shareText += `Adresse: ${note.address || 'Non renseignée'}\n`;
            shareText += `Note: ${note.note || 'Aucune note'}`;
            break;

        case 'tache':
            shareText += `Descriptif: ${note.description || 'Aucun descriptif'}\n`;
            shareText += `Date: ${formatTaskDate(note.taskDate)}`;
            break;
    }

    // Utilisation de l'API Web Share si disponible
    if (navigator.share) {
        navigator.share({
            title: note.name,
            text: shareText
        }).catch(err => console.log('Partage annulé'));
    } else {
        // Fallback: copier dans le presse-papier
        navigator.clipboard.writeText(shareText).then(() => {
            alert('Note copiée dans le presse-papier !');
        });
    }
};

// Modification d'une note
function editNote() {
    const note = notes.find(n => n.id === currentNoteId);
    if (!note) return;

    closeModal(viewModal);
    currentNoteType = note.type;
    scrollPosition = 0; // Réinitialiser la position du scroll
    // Ne pas réinitialiser currentNoteId pour permettre les modifications multiples
    showNoteForm(note.type, note);
}

// Suppression d'une note
function deleteNote() {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) return;

    notes = notes.filter(n => n.id !== currentNoteId);
    saveNotes();
    renderNotes();
    closeModal(viewModal);
    currentNoteId = null;
    scrollPosition = 0;
}

// Sauvegarde locale
function saveNotes() {
    localStorage.setItem('daysNotes', JSON.stringify(notes));
}

function loadNotes() {
    const saved = localStorage.getItem('daysNotes');
    if (saved) {
        notes = JSON.parse(saved);
    }
}







// Ajouter une tâche à l'agenda
window.addToCalendar = function(noteId) {
    const note = notes.find(n => n.id === noteId);
    if (!note || !note.taskDate) return;
    
    // Créer les dates pour l'événement
    const eventDate = new Date(note.taskDate);
    eventDate.setHours(9, 0, 0, 0); // Par défaut à 9h du matin
    
    const endDate = new Date(eventDate);
    endDate.setHours(10, 0, 0, 0); // 1 heure de durée
    
    // Formater les dates au format iCalendar (YYYYMMDDTHHMMSS)
    const formatDateForICal = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}${month}${day}T${hours}${minutes}${seconds}`;
    };
    
    const startDateTime = formatDateForICal(eventDate);
    const endDateTime = formatDateForICal(endDate);
    const now = formatDateForICal(new Date());
    
    // Créer le contenu du fichier .ics
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Day's Notes//Calendar//FR
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
DTSTART:${startDateTime}
DTEND:${endDateTime}
DTSTAMP:${now}
UID:${note.id}@daysnotes
CREATED:${now}
DESCRIPTION:${note.description || ''}
LAST-MODIFIED:${now}
LOCATION:
SEQUENCE:0
STATUS:CONFIRMED
SUMMARY:${note.name}
TRANSP:OPAQUE
END:VEVENT
END:VCALENDAR`;
    
    // Créer un blob et télécharger le fichier
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `${note.name.replace(/[^a-z0-9]/gi, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(link.href);
};
