
/**
 * Interview Questions App - Frontend JavaScript
 * Handles category navigation and question expand/collapse functionality
 */

let questionsData = null;
let currentCategory = 'all';

// Initialize the app when page loads
document.addEventListener('DOMContentLoaded', init);

async function init() {
    await loadQuestions();
    renderCategories();
    renderQuestions();
}

// Fetch questions from JSON file
async function loadQuestions() {
    try {
        const response = await fetch('questions.json');
        questionsData = await response.json();
    } catch (error) {
        console.error('Failed to load questions:', error);
        questionsData = { categories: [] };
    }
}

// Render category buttons in the sidebar
function renderCategories() {
    const categoryList = document.getElementById('category-list');

    // Add "All Questions" button
    const allItem = document.createElement('li');
    allItem.innerHTML = `
        <button class="category-btn active" data-category="all">
            <span class="category-icon">📚</span>
            All Questions
        </button>
    `;
    categoryList.appendChild(allItem);

    // Add category buttons
    questionsData.categories.forEach(category => {
        const li = document.createElement('li');
        li.innerHTML = `
            <button class="category-btn" data-category="${category.name}">
                <span class="category-icon">${category.icon || '📁'}</span>
                ${category.name}
            </button>
        `;
        categoryList.appendChild(li);
    });

    // Add click handlers
    categoryList.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => selectCategory(btn.dataset.category));
    });
}

// Handle category selection
function selectCategory(category) {
    currentCategory = category;

    // Update active button
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === category);
    });

    // Update header
    document.getElementById('current-category').textContent =
        category === 'all' ? 'All Questions' : category;

    renderQuestions();
}

// Render question cards
function renderQuestions() {
    const container = document.getElementById('questions-container');
    container.innerHTML = '';

    let questions = [];

    if (currentCategory === 'all') {
        // Get all questions from all categories
        questionsData.categories.forEach(cat => {
            cat.questions.forEach(q => {
                questions.push({ ...q, category: cat.name });
            });
        });
    } else {
        // Get questions from selected category
        const category = questionsData.categories.find(c => c.name === currentCategory);
        if (category) {
            questions = category.questions.map(q => ({ ...q, category: category.name }));
        }
    }

    // Update question count
    document.getElementById('question-count').textContent =
        `${questions.length} question${questions.length !== 1 ? 's' : ''}`;

    // Render each question
    questions.forEach((q, index) => {
        const card = createQuestionCard(q, index);
        container.appendChild(card);
    });
}

// Create a question card element
function createQuestionCard(question, index) {
    const card = document.createElement('div');
    card.className = 'question-card';

    // Convert markdown-style formatting in answer to HTML
    const formattedAnswer = formatAnswer(question.answer);

    card.innerHTML = `
        <div class="question-header">
            <span class="question-text">${question.question}</span>
            <span class="expand-icon">▼</span>
        </div>
        <div class="answer-container">
            <div class="answer-content">
                ${formattedAnswer}
            </div>
        </div>
    `;

    // Add click handler for expand/collapse
    card.querySelector('.question-header').addEventListener('click', () => {
        card.classList.toggle('expanded');
    });

    return card;
}

// Simple markdown-like formatting for answers
function formatAnswer(text) {
    if (!text) return '';

    return text
        // Convert **bold** to <strong>
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Convert `code` to <code>
        .replace(/`(.*?)`/g, '<code>$1</code>')
        // Convert newlines to paragraphs
        .split('\n\n')
        .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
        .join('');
}
