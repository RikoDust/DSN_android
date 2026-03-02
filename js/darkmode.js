// DARKMODE


// Ajouter au début du fichier, après les autres variables
let isDarkMode = false;

// Dans la fonction setupEventListeners(), ajouter :
document.getElementById('themeToggle').addEventListener('click', toggleTheme);

// Ajouter cette fonction après setupEventListeners()
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

// Dans la fonction DOMContentLoaded, ajouter après loadNotes() :
// Charger le thème sauvegardé
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    isDarkMode = true;
    document.body.classList.add('dark-mode');
    document.querySelector('#themeToggle i').classList.remove('fa-moon');
    document.querySelector('#themeToggle i').classList.add('fa-sun');
}
