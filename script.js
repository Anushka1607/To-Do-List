
document.addEventListener('DOMContentLoaded', function () {
    // ✅ Get all elements (with null checks)
    const taskInput = document.getElementById('taskInput');
    const addBtn = document.getElementById('addBtn');
    const taskList = document.getElementById('taskList');
    const taskCount = document.getElementById('taskCount');
    const completedCount = document.getElementById('completedCount');
    const allBtn = document.getElementById('allBtn');
    const activeBtn = document.getElementById('activeBtn');
    const completedBtn = document.getElementById('completedBtn');
    const clearCompletedBtn = document.getElementById('clearCompletedBtn');
    const clearAllBtn = document.getElementById('clearAll'); // ✅ Must match HTML id="clearAll"
    const prioritySelect = document.getElementById('prioritySelect');

    // 🔁 Recovery: If any element is missing, show error in console
    if (!taskInput || !addBtn || !taskList || !clearCompletedBtn || !clearAllBtn) {
        console.error('Some elements not found. Check your HTML IDs.');
        alert('App failed to load. Check console for errors.');
        return;
    }

    // 📦 Load tasks safely
    let tasks = [];
    try {
        const saved = localStorage.getItem('tasks');
        if (saved) tasks = JSON.parse(saved);
    } catch (e) {
        console.error('Failed to parse tasks from localStorage', e);
        tasks = [];
    }

    let currentFilter = 'all';

    // 🖼️ Render tasks
    function renderTasks() {
        taskList.innerHTML = '';

        const filteredTasks = tasks.filter(task => {
            if (currentFilter === 'active') return !task.completed;
            if (currentFilter === 'completed') return task.completed;
            return true; // 'all'
        });

        if (filteredTasks.length === 0) {
            const emptyMsg = document.createElement('li');
            emptyMsg.textContent = 
                currentFilter === 'all' ? 'No tasks yet! Add one above.' :
                currentFilter === 'active' ? 'No active tasks' : 'No completed tasks';
            emptyMsg.className = 'text-center py-4 text-gray-500';
            taskList.appendChild(emptyMsg);
        } else {
            filteredTasks.forEach(task => {
                const index = tasks.indexOf(task); // Real index in full array
                const li = document.createElement('li');
                li.className = `task bg-white p-4 rounded-lg shadow flex items-center justify-between priority-${task.priority}`;

                li.innerHTML = `
                    <div class="flex items-center flex-1">
                        <input type="checkbox" class="h-5 w-5 mr-3 cursor-pointer" ${task.completed ? 'checked' : ''}>
                        <span class="truncate ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}">${task.text}</span>
                    </div>
                    <button class="text-gray-400 hover:text-red-500 ml-2">
                        <i class="fas fa-trash"></i>
                    </button>
                `;

                // ✅ Reattach events
                li.querySelector('input').addEventListener('change', () => toggleTask(index));
                li.querySelector('button').addEventListener('click', () => deleteTask(index));

                taskList.appendChild(li);
            });
        }

        updateCount();
    }

    // 🔢 Update task count
    function updateCount() {
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        taskCount.textContent = `${total - completed} active of ${total} tasks`;
        completedCount.textContent = `${completed} completed`;
    }

    // ➕ Add new task
    function addTask() {
        const text = taskInput.value.trim();
        if (!text) return;

        const priority = prioritySelect.value;
        tasks.push({ text, completed: false, priority });
        saveAndRender();
        taskInput.value = '';
        taskInput.focus();
    }

    // ✅ Toggle task completion
    function toggleTask(index) {
        if (index < 0 || index >= tasks.length) return;
        tasks[index].completed = !tasks[index].completed;
        saveAndRender();

        // 🎉 Confetti only when completing
        if (tasks[index].completed) createConfetti();
    }

    // 🗑️ Delete task
    function deleteTask(index) {
        tasks.splice(index, 1);
        saveAndRender();
    }

    // 🧹 Clear completed tasks
    function clearCompleted() {
        tasks = tasks.filter(t => !t.completed);
        saveAndRender();
    }

    // 🪣 Clear all tasks
    function clearAll() {
        if (tasks.length === 0) return;
        const confirmed = confirm('Delete all tasks?');
        if (confirmed) {
            tasks = [];
            saveAndRender();
        }
    }

    // 💾 Save to localStorage and re-render
    function saveAndRender() {
        try {
            localStorage.setItem('tasks', JSON.stringify(tasks));
            renderTasks();
        } catch (e) {
            console.error('Failed to save tasks', e);
        }
    }

    // ✨ Confetti!
    function createConfetti() {
        const container = document.body;
        const colors = ['#f87171', '#fbbf24', '#4ade80', '#60a5fa', '#c084fc'];
        for (let i = 0; i < 25; i++) {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = Math.random() * 6 + 6 + 'px';
            confetti.style.cssText = `
                position: fixed;
                width: ${size}; height: ${size};
                background: ${color};
                border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
                opacity: 0.9;
                pointer-events: none;
                z-index: 9999;
                left: ${Math.random() * 100}vw;
                top: 10vh;
            `;
            container.appendChild(confetti);
            const angle = Math.random() * 2 - 1;
            const animation = confetti.animate([
                { transform: 'translateY(0) rotate(0)', opacity: 0.9 },
                { transform: `translateY(100vh) translateX(${angle * 150}vw) rotate(720deg)`, opacity: 0 }
            ], {
                duration: 3000 + Math.random() * 2000,
                easing: 'cubic-bezier(0.2, 0.8, 0.8, 1)'
            });
            animation.onfinish = () => confetti.remove();
        }
    }

    // 🎯 Event Listeners
    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', e => e.key === 'Enter' && addTask());

    allBtn.addEventListener('click', () => {
        currentFilter = 'all';
        renderTasks();
        updateButtonStyles();
    });
    activeBtn.addEventListener('click', () => {
        currentFilter = 'active';
        renderTasks();
        updateButtonStyles();
    });
    completedBtn.addEventListener('click', () => {
        currentFilter = 'completed';
        renderTasks();
        updateButtonStyles();
    });

    clearCompletedBtn.addEventListener('click', clearCompleted);
    clearAllBtn.addEventListener('click', clearAll);

    // 🎨 Update filter button styles
    function updateButtonStyles() {
        [allBtn, activeBtn, completedBtn].forEach(btn => {
            btn.classList.remove('bg-indigo-600', 'text-white');
            btn.classList.add('bg-white', 'text-gray-700');
        });
        const btn = { all: allBtn, active: activeBtn, completed: completedBtn }[currentFilter];
        btn.classList.remove('bg-white', 'text-gray-700');
        btn.classList.add('bg-indigo-600', 'text-white');
    }

    // 🚀 Initial render
    renderTasks();
    updateButtonStyles();
});
