// Get DOM elements
const statusEl = document.getElementById('status');
const statusTextEl = document.getElementById('status-text');
const formulaCountEl = document.getElementById('formula-count');
const formulasListEl = document.getElementById('formulas-list');
const scanBtn = document.getElementById('scan-btn');
const copyAllBtn = document.getElementById('copy-all-btn');

let currentFormulas = [];

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  scanPage();
});

// Scan button click handler
scanBtn.addEventListener('click', () => {
  scanPage();
});

// Copy all button click handler
copyAllBtn.addEventListener('click', async () => {
  if (currentFormulas.length === 0) return;

  const allLatex = currentFormulas.join('\n\n');
  await copyToClipboard(allLatex);

  // Show success feedback
  copyAllBtn.innerHTML = '<span class="btn-icon">✓</span> Copied!';
  setTimeout(() => {
    copyAllBtn.innerHTML = '<span class="btn-icon">📋</span> Copy All';
  }, 2000);
});

// Scan the current page for KaTeX formulas
async function scanPage() {
  updateStatus('Scanning page...', '🔍');

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Inject and execute the content script to find formulas
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: findKaTeXFormulas
    });

    if (results && results[0] && results[0].result) {
      currentFormulas = results[0].result;
      displayFormulas(currentFormulas);

      if (currentFormulas.length > 0) {
        updateStatus(`Found ${currentFormulas.length} formula${currentFormulas.length > 1 ? 's' : ''}!`, '✅', 'success');
      } else {
        updateStatus('No KaTeX formulas found on this page', '❌', 'error');
      }
    } else {
      currentFormulas = [];
      displayFormulas([]);
      updateStatus('No KaTeX formulas found', '❌', 'error');
    }
  } catch (error) {
    console.error('Error scanning page:', error);
    updateStatus('Error scanning page', '❌', 'error');
  }
}

// Function that runs in the page context to find KaTeX formulas
function findKaTeXFormulas() {
  const formulas = [];

  // Helper to add unique formulas
  const addFormula = (latex) => {
    if (latex && !formulas.includes(latex)) {
      formulas.push(latex);
    }
  };

  // Find all elements with data-math attribute (.math-block, .math-inline, etc.)
  const mathDataElements = document.querySelectorAll('[data-math]');
  mathDataElements.forEach((el) => {
    addFormula(el.dataset.math);
  });

  // Find all KaTeX elements
  const katexElements = document.querySelectorAll('.katex');
  katexElements.forEach((el) => {
    // First check for data-math on parent
    const mathParent = el.closest('[data-math]');
    if (mathParent && mathParent.dataset.math) {
      addFormula(mathParent.dataset.math);
      return;
    }

    // Try to get the LaTeX source from the annotation element
    const annotation = el.querySelector('annotation[encoding="application/x-tex"]');
    if (annotation) {
      addFormula(annotation.textContent.trim());
    }
  });

  // Also check for MathJax elements that might use similar structure
  const mathElements = document.querySelectorAll('.MathJax');
  mathElements.forEach((el) => {
    const script = el.previousElementSibling;
    if (script && script.tagName === 'SCRIPT' && script.type === 'math/tex') {
      addFormula(script.textContent.trim());
    }
  });

  return formulas;
}

// Update the status display
function updateStatus(text, icon, className = '') {
  statusTextEl.textContent = text;
  statusEl.querySelector('.status-icon').textContent = icon;
  statusEl.className = 'status ' + className;
}

// Display formulas in the list
function displayFormulas(formulas) {
  formulaCountEl.textContent = formulas.length;
  formulasListEl.innerHTML = '';

  copyAllBtn.disabled = formulas.length === 0;

  formulas.forEach((formula, index) => {
    const item = document.createElement('div');
    item.className = 'formula-item';
    item.innerHTML = `
      <span class="formula-preview">${escapeHtml(formula)}</span>
      <span class="copy-indicator">Click to copy</span>
    `;

    item.addEventListener('click', async () => {
      await copyToClipboard(formula);

      // Visual feedback
      item.classList.add('copied');
      item.querySelector('.copy-indicator').textContent = 'Copied!';

      setTimeout(() => {
        item.classList.remove('copied');
        item.querySelector('.copy-indicator').textContent = 'Click to copy';
      }, 2000);
    });

    formulasListEl.appendChild(item);
  });
}

// Copy text to clipboard
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    return false;
  }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
