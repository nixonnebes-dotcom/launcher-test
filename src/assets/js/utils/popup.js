/**
 * @author Luuxis
 * Luuxis License v1.0 (voir fichier LICENSE pour les détails en FR/EN)
 */

const { ipcRenderer } = require('electron');

export default class popup {
    constructor() {
        this.popup = document.querySelector('.popup');
        this.popupTab = document.querySelector('.popup-tab');
        this.popupTitle = document.querySelector('.popup-title');
        this.popupSpinner = document.querySelector('.popup-spinner');
        this.popupContent = document.querySelector('.popup-content');
        this.popupOptions = document.querySelector('.popup-options');
        this.popupButton = document.querySelector('.popup-button');
    }

    openPopup(info) {
        this.popup.style.display = 'flex';
        if (info.background == false) {
            this.popup.style.background = 'none';
            this.popup.style.backdropFilter = 'none';
        } else {
            this.popup.style.background = '';
            this.popup.style.backdropFilter = '';
        }
        this.popupTitle.innerHTML = info.title;

        let isLoading = !info.options;
        this.popupSpinner.style.display = isLoading ? 'flex' : 'none';
        this.popupTab.style.display = isLoading ? 'none' : 'block';

        this.popupContent.style.color = info.color ? info.color : '#e21212';
        this.popupContent.innerHTML = info.content;

        if (info.options) this.popupOptions.style.display = 'flex';

        if (this.popupOptions.style.display !== 'none') {
            this.popupButton.addEventListener('click', () => {
                if (info.exit) return ipcRenderer.send('main-window-close');
                this.closePopup();
            })
        }
    }

    closePopup() {
        this.popup.style.display = 'none';
        this.popupTab.style.display = 'block';
        this.popupTitle.innerHTML = '';
        this.popupContent.innerHTML = '';
        this.popupOptions.style.display = 'none';
        this.popupSpinner.style.display = 'none';
    }
}