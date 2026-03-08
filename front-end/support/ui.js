/**
 * 🎨 ui.js — Composants UI partagés
 * Alert et Confirm personnalisés au style Sauge & Or
 * 
 * À inclure dans chaque HTML AVANT les scripts de page :
 *   <script src="/front-end/support/ui.js"></script>
 */

/**
 * Alert personnalisé
 * @param {string} message - Le message à afficher
 * @param {string} type    - 'success' | 'warning' | 'danger' | 'info'
 * @param {string} [title] - Titre du modal (optionnel, sinon titre par défaut)
 * @returns {Promise<void>}
 */
function customAlert(message, type = 'info', title = null) {
    return new Promise((resolve) => {
        const icons = {
            success: '✅',
            warning: '⚠️',
            danger:  '❌',
            info:    'ℹ️',
        };

        const defaultTitles = {
            success: 'Succès',
            warning: 'Attention',
            danger:  'Erreur',
            info:    'Information',
        };

        const overlay = document.createElement('div');
        overlay.className = 'custom-modal-overlay';

        overlay.innerHTML = `
            <div class="custom-modal-dialog">
                <div class="custom-modal-icon ${type}">
                    ${icons[type] ?? icons.info}
                </div>
                <h2 class="custom-modal-title">${title ?? defaultTitles[type]}</h2>
                <p class="custom-modal-message">${message}</p>
                <div class="custom-modal-actions">
                    <button class="custom-modal-btn custom-modal-btn-primary" id="custom-alert-ok">
                        OK
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const close = () => {
            overlay.classList.add('closing');
            setTimeout(() => {
                document.body.removeChild(overlay);
                resolve();
            }, 200);
        };

        overlay.querySelector('#custom-alert-ok').addEventListener('click', close);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) close();
        });

        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                document.removeEventListener('keydown', handleEsc);
                close();
            }
        };
        document.addEventListener('keydown', handleEsc);
    });
}

/**
 * Confirm personnalisé
 * @param {string} message           - Le message à afficher
 * @param {Object} [options]
 * @param {string} [options.title]        - Titre (défaut : 'Confirmation')
 * @param {string} [options.confirmText]  - Texte du bouton OK (défaut : 'Confirmer')
 * @param {string} [options.cancelText]   - Texte du bouton Annuler (défaut : 'Annuler')
 * @param {string} [options.type]         - 'success' | 'warning' | 'danger' | 'question' | 'info'
 * @returns {Promise<boolean>}
 */
function customConfirm(message, options = {}) {
    return new Promise((resolve) => {
        const {
            title       = 'Confirmation',
            confirmText = 'Confirmer',
            cancelText  = 'Annuler',
            type        = 'question',
        } = options;

        const icons = {
            success:  '✅',
            warning:  '⚠️',
            danger:   '❌',
            question: '❓',
            info:     'ℹ️',
        };

        const overlay = document.createElement('div');
        overlay.className = 'custom-modal-overlay';

        overlay.innerHTML = `
            <div class="custom-modal-dialog">
                <div class="custom-modal-icon ${type}">
                    ${icons[type] ?? icons.question}
                </div>
                <h2 class="custom-modal-title">${title}</h2>
                <p class="custom-modal-message">${message}</p>
                <div class="custom-modal-actions">
                    <button class="custom-modal-btn custom-modal-btn-secondary" id="custom-confirm-cancel">
                        ${cancelText}
                    </button>
                    <button class="custom-modal-btn custom-modal-btn-primary" id="custom-confirm-ok">
                        ${confirmText}
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const close = (result) => {
            overlay.classList.add('closing');
            setTimeout(() => {
                document.body.removeChild(overlay);
                resolve(result);
            }, 200);
        };

        overlay.querySelector('#custom-confirm-ok').addEventListener('click',     () => close(true));
        overlay.querySelector('#custom-confirm-cancel').addEventListener('click',  () => close(false));

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) close(false);
        });

        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                document.removeEventListener('keydown', handleEsc);
                close(false);
            }
        };
        document.addEventListener('keydown', handleEsc);
    });
}

/**
 * Raccourci — Confirm avec icône succès
 * @param {string} message
 * @param {Object} [options]
 * @returns {Promise<boolean>}
 */
function customSuccessConfirm(message, options = {}) {
    return customConfirm(message, { ...options, type: 'success' });
}

/**
 * Raccourci — Confirm avec icône danger
 * @param {string} message
 * @param {Object} [options]
 * @returns {Promise<boolean>}
 */
function customDangerConfirm(message, options = {}) {
    return customConfirm(message, { ...options, type: 'danger' });
}