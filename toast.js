/**
 * Toast Notification System
 * Sistema de notificações elegantes para feedback de ações
 */

class ToastSystem {
  constructor() {
    this.container = null;
    this.toasts = [];
    this.init();
  }

  init() {
    // Create toast container if it doesn't exist
    if (!document.getElementById('toast-container')) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.setAttribute('aria-live', 'polite');
      this.container.setAttribute('aria-atomic', 'true');
      document.body.appendChild(this.container);
    } else {
      this.container = document.getElementById('toast-container');
    }
  }

  /**
   * Show a toast notification
   * @param {Object} options - Toast options
   * @param {string} options.message - Message to display
   * @param {string} options.type - Type: 'success', 'error', 'warning', 'info'
   * @param {number} options.duration - Duration in ms (default: 3000)
   * @param {boolean} options.dismissible - Whether toast can be dismissed (default: true)
   */
  show({ message, type = 'info', duration = 3000, dismissible = true }) {
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.setAttribute('role', 'status');

    const icons = {
      success: 'fa-check-circle',
      error: 'fa-exclamation-circle',
      warning: 'fa-exclamation-triangle',
      info: 'fa-info-circle'
    };

    toast.innerHTML = `
      <div class="toast__icon">
        <i class="fas ${icons[type]}"></i>
      </div>
      <div class="toast__content">
        <p class="toast__message">${this.escapeHtml(message)}</p>
      </div>
      ${dismissible ? `
        <button class="toast__close" aria-label="Fechar notificação">
          <i class="fas fa-times"></i>
        </button>
      ` : ''}
    `;

    // Add to container
    this.container.appendChild(toast);
    this.toasts.push(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('toast--visible');
    });

    // Add close button listener
    if (dismissible) {
      const closeBtn = toast.querySelector('.toast__close');
      closeBtn.addEventListener('click', () => this.dismiss(toast));
    }

    // Auto dismiss
    if (duration > 0) {
      setTimeout(() => this.dismiss(toast), duration);
    }

    return toast;
  }

  /**
   * Dismiss a specific toast
   */
  dismiss(toast) {
    if (!toast || toast.classList.contains('toast--hiding')) return;

    toast.classList.add('toast--hiding');
    toast.classList.remove('toast--visible');

    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
      const index = this.toasts.indexOf(toast);
      if (index > -1) {
        this.toasts.splice(index, 1);
      }
    }, 300);
  }

  /**
   * Dismiss all toasts
   */
  dismissAll() {
    [...this.toasts].forEach(toast => this.dismiss(toast));
  }

  /**
   * Helper methods for common toast types
   */
  success(message, options = {}) {
    return this.show({ message, type: 'success', ...options });
  }

  error(message, options = {}) {
    return this.show({ message, type: 'error', duration: 5000, ...options });
  }

  warning(message, options = {}) {
    return this.show({ message, type: 'warning', ...options });
  }

  info(message, options = {}) {
    return this.show({ message, type: 'info', ...options });
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Create global instance
const Toast = new ToastSystem();

// Export for module use
export { Toast, ToastSystem };

// Make available globally for non-module scripts
window.Toast = Toast;
