// To-Do List Application with Local Storage
class TodoApp {
    constructor() {
        // DOM 요소들
        this.todoInput = document.getElementById('todoInput');
        this.addBtn = document.getElementById('addBtn');
        this.todoList = document.getElementById('todoList');
        this.emptyState = document.getElementById('emptyState');
        this.clearCompleted = document.getElementById('clearCompleted');
        this.deleteAll = document.getElementById('deleteAll');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.totalCount = document.getElementById('totalCount');
        this.completedCount = document.getElementById('completedCount');
        this.activeCount = document.getElementById('activeCount');

        // 상태
        this.todos = [];
        this.currentFilter = 'all';
        this.editingId = null;

        // Local Storage 키
        this.STORAGE_KEY = 'todolist_data';

        // 초기화
        this.init();
    }

    init() {
        // Local Storage에서 데이터 로드
        this.loadTodos();

        // 이벤트 리스너 등록
        this.addBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });
        this.clearCompleted.addEventListener('click', () => this.clearCompletedTodos());
        this.deleteAll.addEventListener('click', () => this.deleteAllTodos());

        // 필터 버튼
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });

        // 초기 렌더링
        this.render();
    }

    // Local Storage에서 데이터 로드
    loadTodos() {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        this.todos = saved ? JSON.parse(saved) : [];
    }

    // Local Storage에 데이터 저장
    saveTodos() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.todos));
    }

    // 할일 추가
    addTodo() {
        const text = this.todoInput.value.trim();

        if (text === '') {
            alert('할일을 입력해주세요!');
            this.todoInput.focus();
            return;
        }

        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toLocaleString('ko-KR')
        };

        this.todos.unshift(todo);
        this.saveTodos();
        this.todoInput.value = '';
        this.todoInput.focus();
        this.render();
    }

    // 할일 삭제
    deleteTodo(id) {
        if (confirm('정말 삭제하시겠습니까?')) {
            this.todos = this.todos.filter(todo => todo.id !== id);
            this.saveTodos();
            this.render();
        }
    }

    // 할일 완료 토글
    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
        }
    }

    // 완료된 할일 모두 삭제
    clearCompletedTodos() {
        const completed = this.todos.filter(t => t.completed);
        if (completed.length === 0) {
            alert('완료된 항목이 없습니다!');
            return;
        }

        if (confirm(`${completed.length}개의 완료된 항목을 삭제하시겠습니까?`)) {
            this.todos = this.todos.filter(t => !t.completed);
            this.saveTodos();
            this.render();
        }
    }

    // 모든 할일 삭제
    deleteAllTodos() {
        if (this.todos.length === 0) {
            alert('삭제할 항목이 없습니다!');
            return;
        }

        if (confirm('정말 모든 할일을 삭제하시겠습니까?')) {
            this.todos = [];
            this.saveTodos();
            this.render();
        }
    }

    // 필터 설정
    setFilter(filter) {
        this.currentFilter = filter;
        this.filterButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        this.render();
    }

    // 필터된 할일 가져오기
    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(t => !t.completed);
            case 'completed':
                return this.todos.filter(t => t.completed);
            default:
                return this.todos;
        }
    }

    // 편집 모드 시작
    startEdit(id) {
        this.editingId = id;
        this.render();
        const editInput = document.querySelector(`#edit-input-${id}`);
        if (editInput) {
            editInput.focus();
            editInput.select();
        }
    }

    // 편집 완료
    saveEdit(id) {
        const editInput = document.querySelector(`#edit-input-${id}`);
        const newText = editInput.value.trim();

        if (newText === '') {
            alert('할일 내용을 입력해주세요!');
            editInput.focus();
            return;
        }

        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.text = newText;
            this.saveTodos();
            this.editingId = null;
            this.render();
        }
    }

    // 편집 취소
    cancelEdit() {
        this.editingId = null;
        this.render();
    }

    // 통계 업데이트
    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;
        const active = total - completed;

        this.totalCount.textContent = total;
        this.completedCount.textContent = completed;
        this.activeCount.textContent = active;
    }

    // 렌더링
    render() {
        const filteredTodos = this.getFilteredTodos();

        // 빈 상태 표시
        if (this.todos.length === 0) {
            this.todoList.innerHTML = '';
            this.emptyState.style.display = 'block';
        } else if (filteredTodos.length === 0) {
            this.todoList.innerHTML = '<div class="empty-state"><p>🔍 할일이 없습니다.</p></div>';
            this.emptyState.style.display = 'none';
        } else {
            this.emptyState.style.display = 'none';
            this.todoList.innerHTML = filteredTodos.map(todo => this.createTodoElement(todo)).join('');
        }

        // 이벤트 리스너 다시 등록
        this.attachEventListeners();

        // 통계 업데이트
        this.updateStats();

        // 버튼 상태 업데이트
        this.clearCompleted.disabled = !this.todos.some(t => t.completed);
        this.deleteAll.disabled = this.todos.length === 0;
    }

    // 할일 요소 생성
    createTodoElement(todo) {
        if (this.editingId === todo.id) {
            return `
                <div class="todo-item editing">
                    <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} data-id="${todo.id}">
                    <div class="edit-mode">
                        <input type="text" id="edit-input-${todo.id}" class="edit-input" value="${this.escapeHtml(todo.text)}">
                        <button class="save-btn" data-id="${todo.id}">저장</button>
                        <button class="cancel-btn">취소</button>
                    </div>
                </div>
            `;
        }

        return `
            <div class="todo-item ${todo.completed ? 'completed' : ''}">
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} data-id="${todo.id}">
                <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                <div class="todo-actions">
                    <button class="todo-btn edit-btn" data-id="${todo.id}">수정</button>
                    <button class="todo-btn delete-btn" data-id="${todo.id}">삭제</button>
                </div>
            </div>
        `;
    }

    // HTML 이스케이프 (XSS 방지)
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 이벤트 리스너 등록
    attachEventListeners() {
        // 체크박스
        document.querySelectorAll('.todo-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.toggleTodo(parseInt(checkbox.dataset.id));
            });
        });

        // 삭제 버튼
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.deleteTodo(parseInt(btn.dataset.id));
            });
        });

        // 수정 버튼
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.startEdit(parseInt(btn.dataset.id));
            });
        });

        // 저장 버튼
        document.querySelectorAll('.save-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.saveEdit(parseInt(btn.dataset.id));
            });
        });

        // 취소 버튼
        document.querySelectorAll('.cancel-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.cancelEdit();
            });
        });

        // 편집 입력창에서 Enter/Escape
        document.querySelectorAll('.edit-input').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const id = parseInt(input.id.split('-')[2]);
                    this.saveEdit(id);
                }
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.cancelEdit();
                }
            });
        });
    }
}

// 앱 시작
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});