document.querySelectorAll('span[data-placeholder]').forEach(span => {
    // Show placeholder text initially if empty
    if (!span.textContent.trim()) {
        span.textContent = span.dataset.placeholder;
        span.classList.add('placeholder');
    }

    // Handle focus/click
    span.addEventListener('focus', function () {
        if (this.classList.contains('placeholder')) {
            this.textContent = '';
            this.classList.remove('placeholder');
        }
    });

    // Handle blur/unfocus
    span.addEventListener('blur', function () {
        if (!this.textContent.trim()) {
            this.textContent = this.dataset.placeholder;
            this.classList.add('placeholder');
        }
    });
});