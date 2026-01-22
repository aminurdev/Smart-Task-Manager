// Task Manager Class
class TaskManager {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.cacheDOMElements();
        this.attachEventListeners();
        this.renderTasks();
        this.updateStats();
    }

    cacheDOMElements() {
        this.taskInput = document.getElementById('taskInput');
        this.prioritySelect = document.getElementById('prioritySelect');
        this.addTaskBtn = document.getElementById('addTaskBtn');
        this.tasksContainer = document.getElementById('tasksContainer');
        this.emptyState = document.getElementById('emptyState');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.totalTasksEl = document.getElementById('totalTasks');
        this.completedTasksEl = document.getElementById('completedTasks');
        this.pendingTasksEl = document.getElementById('pendingTasks');
    }

    attachEventListeners() {
        this.addTaskBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.renderTasks();
            });
        });
    }

    addTask() {
        const taskText = this.taskInput.value.trim();
        const priority = this.prioritySelect.value;

        if (!taskText) {
            this.shakeInput();
            return;
        }

        const task = {
            id: Date.now(),
            text: taskText,
            priority: priority,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.unshift(task);
        this.saveTasks();
        this.taskInput.value = '';
        this.renderTasks();
        this.updateStats();
        this.showNotification('Task added successfully!');
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        this.showNotification('Task deleted!');
    }

    toggleTask(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
        }
    }

    filterTasks() {
        switch (this.currentFilter) {
            case 'active':
                return this.tasks.filter(task => !task.completed);
            case 'completed':
                return this.tasks.filter(task => task.completed);
            case 'high':
                return this.tasks.filter(task => task.priority === 'high');
            default:
                return this.tasks;
        }
    }

    renderTasks() {
        const filteredTasks = this.filterTasks();

        if (filteredTasks.length === 0) {
            this.tasksContainer.style.display = 'none';
            this.emptyState.classList.add('show');
            return;
        }

        this.tasksContainer.style.display = 'flex';
        this.emptyState.classList.remove('show');

        this.tasksContainer.innerHTML = filteredTasks.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <input 
                    type="checkbox" 
                    class="task-checkbox" 
                    ${task.completed ? 'checked' : ''}
                    onchange="taskManager.toggleTask(${task.id})"
                >
                <div class="task-content">
                    <div class="task-text">${this.escapeHtml(task.text)}</div>
                    <div class="task-meta">
                        <span class="task-priority ${task.priority}">${task.priority}</span>
                        <span class="task-time">
                            <i class="far fa-clock"></i>
                            ${this.formatDate(task.createdAt)}
                        </span>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="task-btn delete-btn" onclick="taskManager.deleteTask(${task.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const pending = total - completed;

        this.animateNumber(this.totalTasksEl, total);
        this.animateNumber(this.completedTasksEl, completed);
        this.animateNumber(this.pendingTasksEl, pending);
    }

    animateNumber(element, target) {
        const current = parseInt(element.textContent) || 0;

        // If already at target, just set it
        if (current === target) {
            element.textContent = target;
            return;
        }

        const increment = target > current ? 1 : -1;
        const duration = 300;
        const steps = Math.abs(target - current);

        if (steps === 0) {
            element.textContent = target;
            return;
        }

        const stepDuration = duration / steps;

        let currentValue = current;
        const timer = setInterval(() => {
            currentValue += increment;
            element.textContent = currentValue;

            // Check if we've reached the target
            if ((increment > 0 && currentValue >= target) || (increment < 0 && currentValue <= target)) {
                element.textContent = target;
                clearInterval(timer);
            }
        }, stepDuration);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    shakeInput() {
        this.taskInput.style.animation = 'none';
        setTimeout(() => {
            this.taskInput.style.animation = 'shake 0.5s';
        }, 10);
        setTimeout(() => {
            this.taskInput.style.animation = '';
        }, 500);
    }

    showNotification(message) {
        // Simple notification - you can enhance this
        console.log(message);
    }

    saveTasks() {
        localStorage.setItem('smartTasks', JSON.stringify(this.tasks));
    }

    loadTasks() {
        const tasks = localStorage.getItem('smartTasks');
        return tasks ? JSON.parse(tasks) : [];
    }
}

// Add shake animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);

// Initialize the Task Manager
const taskManager = new TaskManager();
