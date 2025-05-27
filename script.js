function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        ${message}
    `;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 2200);
}

class ThemeManager {
    constructor() {
        this.themeButtons = document.querySelectorAll('.palette-btn');
        this.init();
    }
    init() {
        this.loadTheme();
        this.themeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.setTheme(btn.dataset.theme));
        });
    }
    setTheme(themeName) {
        document.documentElement.setAttribute('data-theme', themeName);
        localStorage.setItem('selectedTheme', themeName);
        this.updateActiveState(themeName);
    }
    loadTheme() {
        const savedTheme = localStorage.getItem('selectedTheme') || 'blissful-blues';
        this.setTheme(savedTheme);
    }
    updateActiveState(themeName) {
        this.themeButtons.forEach(btn => {
            if (btn.dataset.theme === themeName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
}

function updateHeaderText() {
    const currentHour = new Date().getHours();
    const titleElement = document.querySelector('.title');
    let timeGreeting;
    if (currentHour >= 5 && currentHour < 12) {
        timeGreeting = " Rise and Organize";
    } else if (currentHour >= 12 && currentHour < 17) {
        timeGreeting = " Midday Momentum";
    } else {
        timeGreeting = " Wrap-up Wizard";
    }
    if (titleElement) {
        titleElement.innerHTML = `<i class="fas fa-check-circle"></i> ${timeGreeting}`;
    }
}

function updateLiveClock() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    document.getElementById('live-hours').textContent = hours;
    document.getElementById('live-minutes').textContent = minutes;
    document.getElementById('live-seconds').textContent = seconds;
}

document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
    updateHeaderText();
    setInterval(updateHeaderText, 3600000);
    updateLiveClock();
    setInterval(updateLiveClock, 1000);

    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    let filter = 'all';

    const todoList = document.getElementById('todo-list');
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const totalCount = document.getElementById('total-count');
    const completedCount = document.getElementById('completed-count');
    const emptyState = document.getElementById('empty-state');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const clearAllBtn = document.getElementById('clear-all');

    function renderTodos() {
        todoList.innerHTML = '';
        let filtered = todos;
        if (filter === 'pending') filtered = todos.filter(t => !t.completed);
        else if (filter === 'completed') filtered = todos.filter(t => t.completed);

        if (filtered.length === 0) {
            emptyState.style.display = 'flex';
        } else {
            emptyState.style.display = 'none';
        }

        filtered.forEach((todo, idx) => {
            const li = document.createElement('li');
            li.className = todo.completed ? 'completed' : '';
            li.dataset.id = todo.id;
            li.innerHTML = `
                <span>${todo.text}</span>
                <div class="actions">
                    <button title="Toggle Complete" onclick="toggleTodo('${todo.id}')">
                        <i class="fas ${todo.completed ? 'fa-undo' : 'fa-check'}"></i>
                    </button>
                    <button title="Delete" onclick="deleteTodo('${todo.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            todoList.appendChild(li);
        });

        totalCount.textContent = todos.length;
        completedCount.textContent = todos.filter(t => t.completed).length;
    }

    window.toggleTodo = function(id) {
        const idx = todos.findIndex(t => t.id == id);
        if (idx !== -1) {
            todos[idx].completed = !todos[idx].completed;
            saveTodos();
            renderTodos();
            showToast(todos[idx].completed ? "Task marked as completed" : "Task marked as pending", "success");
        }
    };

    window.deleteTodo = function(id) {
        const idx = todos.findIndex(t => t.id == id);
        const li = document.querySelector(`li[data-id="${id}"]`);
        if (li) {
            li.classList.add('removing');
            setTimeout(() => {
                if (idx !== -1) {
                    todos.splice(idx, 1);
                    saveTodos();
                    renderTodos();
                    showToast("Task removed", "error");
                }
            }, 300);
        }
    };

    function saveTodos() {
        localStorage.setItem('todos', JSON.stringify(todos));
    }

    todoForm.addEventListener('submit', e => {
        e.preventDefault();
        const text = todoInput.value.trim();
        if (!text) return;
        const newTodo = {
            text,
            completed: false,
            id: Date.now()
        };
        todos.push(newTodo);
        saveTodos();
        renderTodos();
        showToast("Task added successfully!", "success");
        todoInput.value = '';
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filter = btn.dataset.filter;
            renderTodos();
        });
    });

    clearAllBtn.addEventListener('click', () => {
        if (todos.length === 0) return;
        if (confirm('Clear all tasks?')) {
            todos = [];
            saveTodos();
            renderTodos();
            showToast("All tasks cleared", "error");
        }
    });

    renderTodos();
});
