/**
 * @author Luuxis
 * Luuxis License v1.0 (voir fichier LICENSE pour les détails en FR/EN)
 */

import { database, appdata } from '../utils.js'
const { ipcRenderer } = require('electron');
const os = require('os');

class Settings {
    static id = "settings";
    async init(config) {
        this.config = config;
        this.db = new database();
        await this.ram()
        await this.resolution()
        this.openDirectory()
        this.bindActions()
    }

    markDirty() {
        document.querySelector('.settings-save-btn').classList.remove('disabled')
    }

    closeSettings() {
        document.querySelector('.panel.settings').classList.remove('settings-open')
    }

    async ram() {
        let configClient = await this.db.readData('configClient');
        let totalMem = Math.trunc(os.totalmem() / 1073741824 * 10) / 10;

        let maxRam = Math.trunc((80 * totalMem) / 100 * 2) / 2;
        let recommended = Math.min(Math.round(totalMem / 2 * 2) / 2, maxRam);

        let ramSlider = document.querySelector('.ram-slider');
        let ramValueLabel = document.querySelector('.ram-value');

        document.querySelector('.ram-total').textContent = totalMem;
        document.querySelector('.ram-recommended').textContent = recommended;

        ramSlider.min = 0.5;
        ramSlider.max = maxRam;
        ramSlider.step = 0.5;

        let currentRam = configClient?.java_config?.java_memory?.max || Math.min(2, maxRam);
        if (currentRam > maxRam) currentRam = maxRam;

        ramSlider.value = currentRam;
        ramValueLabel.textContent = `${parseFloat(currentRam).toFixed(1)}GB`;

        ramSlider.oninput = () => {
            ramValueLabel.textContent = `${parseFloat(ramSlider.value).toFixed(1)}GB`;
            this.markDirty();
        };
    }

    async resolution() {
        let configClient = await this.db.readData('configClient');
        let resolution = configClient?.game_config?.screen_size || { width: 854, height: 480 };

        let width = document.querySelector('.width-size');
        let height = document.querySelector('.height-size');
        let resolutionReset = document.querySelector('.resolution-reset-mini');

        width.value = resolution.width;
        height.value = resolution.height;

        width.oninput = () => this.markDirty();
        height.oninput = () => this.markDirty();

        resolutionReset.onclick = () => {
            width.value = 854;
            height.value = 480;
            this.markDirty();
        };
    }

    openDirectory() {
        document.querySelector('.open-dir-btn').addEventListener('click', async () => {
            let javaDir = `${await appdata()}/${process.platform == 'darwin' ? this.config.dataDirectory : `.${this.config.dataDirectory}`}/runtime`;
            ipcRenderer.invoke('open-folder', javaDir);
        });
    }

    bindActions() {
        let saveBtn = document.querySelector('.settings-save-btn');
        let cancelBtn = document.querySelector('.settings-cancel-btn');
        let closeBtn = document.querySelector('.settings-close');

        saveBtn.addEventListener('click', async () => {
            if (saveBtn.classList.contains('disabled')) return;

            let configClient = await this.db.readData('configClient');
            let ramValue = parseFloat(document.querySelector('.ram-slider').value);
            configClient.java_config.java_memory = { min: ramValue, max: ramValue };
            configClient.game_config.screen_size.width = document.querySelector('.width-size').value;
            configClient.game_config.screen_size.height = document.querySelector('.height-size').value;

            await this.db.updateData('configClient', configClient);
            saveBtn.classList.add('disabled');
            this.closeSettings();
        });

        cancelBtn.addEventListener('click', () => {
            this.closeSettings();
            this.ram();
            this.resolution();
        });

        closeBtn.addEventListener('click', () => {
            this.closeSettings();
            this.ram();
            this.resolution();
        });
    }
}
export default Settings;