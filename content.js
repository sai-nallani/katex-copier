// Content script for KaTeX Copier
// Adds click-to-copy functionality directly on KaTeX elements

(function () {
    'use strict';

    // Track if we've already initialized
    if (window.__katexCopierInitialized) return;
    window.__katexCopierInitialized = true;

    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.className = 'katex-copier-tooltip';
    tooltip.textContent = 'Click to copy LaTeX';
    document.body.appendChild(tooltip);

    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'katex-copier-notification';
    document.body.appendChild(notification);

    // Function to show notification
    function showNotification(message, isSuccess = true) {
        notification.textContent = message;
        notification.className = 'katex-copier-notification ' + (isSuccess ? 'success' : 'error');
        notification.classList.add('show');

        setTimeout(() => {
            notification.classList.remove('show');
        }, 2000);
    }

    // Function to get LaTeX from a KaTeX element
    function getLatexFromElement(el) {
        // First, check for data-math attribute on parent .math-block or .math-inline
        const mathParent = el.closest('.math-block, .math-inline, [data-math]');
        if (mathParent && mathParent.dataset.math) {
            return mathParent.dataset.math;
        }

        // Check the element itself for data-math
        if (el.dataset.math) {
            return el.dataset.math;
        }

        // Try to find the annotation element (standard KaTeX)
        const annotation = el.querySelector('annotation[encoding="application/x-tex"]');
        if (annotation) {
            return annotation.textContent.trim();
        }

        // If no annotation, try to get it from data-latex attribute
        if (el.dataset.latex) {
            return el.dataset.latex;
        }

        return null;
    }

    // Function to copy text to clipboard
    async function copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            // Fallback for older browsers
            try {
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                textArea.remove();
                return true;
            } catch (e) {
                console.error('Failed to copy:', e);
                return false;
            }
        }
    }

    // Add event listeners to all KaTeX elements
    function initializeKaTeXElements() {
        const katexElements = document.querySelectorAll('.katex');

        katexElements.forEach((el) => {
            // Skip if already initialized
            if (el.dataset.katexCopierInit) return;
            el.dataset.katexCopierInit = 'true';

            // Add hover class
            el.classList.add('katex-copier-enabled');

            // Mouse enter - show tooltip
            el.addEventListener('mouseenter', (e) => {
                const latex = getLatexFromElement(el);
                if (latex) {
                    tooltip.classList.add('show');
                    positionTooltip(e);
                }
            });

            // Mouse move - update tooltip position
            el.addEventListener('mousemove', (e) => {
                positionTooltip(e);
            });

            // Mouse leave - hide tooltip
            el.addEventListener('mouseleave', () => {
                tooltip.classList.remove('show');
            });

            // Click - copy to clipboard
            el.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();

                const latex = getLatexFromElement(el);
                if (latex) {
                    const success = await copyToClipboard(latex);
                    if (success) {
                        showNotification('✓ LaTeX copied!', true);

                        // Visual feedback on the element
                        el.classList.add('katex-copier-copied');
                        setTimeout(() => {
                            el.classList.remove('katex-copier-copied');
                        }, 500);
                    } else {
                        showNotification('✗ Failed to copy', false);
                    }
                } else {
                    showNotification('✗ No LaTeX source found', false);
                }

                tooltip.classList.remove('show');
            });
        });
    }

    // Position tooltip near cursor
    function positionTooltip(e) {
        const x = e.clientX + 15;
        const y = e.clientY + 15;

        // Keep tooltip within viewport
        const rect = tooltip.getBoundingClientRect();
        const maxX = window.innerWidth - rect.width - 10;
        const maxY = window.innerHeight - rect.height - 10;

        tooltip.style.left = Math.min(x, maxX) + 'px';
        tooltip.style.top = Math.min(y, maxY) + 'px';
    }

    // Initialize on page load
    initializeKaTeXElements();

    // Use MutationObserver to handle dynamically added KaTeX elements
    const observer = new MutationObserver((mutations) => {
        let hasNewKatex = false;

        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node.classList && node.classList.contains('katex')) {
                        hasNewKatex = true;
                    } else if (node.querySelector && node.querySelector('.katex')) {
                        hasNewKatex = true;
                    }
                }
            });
        });

        if (hasNewKatex) {
            initializeKaTeXElements();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

})();
