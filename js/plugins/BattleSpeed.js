/*:
 * @plugindesc Persistent press-to-toggle Turbo Mode. 100% Yanfly Battle Engine Core Compatible.
 * @author AI Assistant
 * @help Press 'Page Up' (or Q on keyboard) during battle to toggle Turbo Mode.
 * Clicking the on-screen icon will also toggle it. 
 * State persists between battles.
 * 
 * PLACE THIS PLUGIN BELOW ALL YANFLY PLUGINS IN THE PLUGIN MANAGER.
 */

(function() {

    // 1. Setup global tracking inside Game_System for persistence
    var _Game_System_initialize = Game_System.prototype.initialize;
    Game_System.prototype.initialize = function() {
        _Game_System_initialize.call(this);
        this._isTurboActive = false; 
    };

    function isTurboOn() {
        return $gameSystem ? $gameSystem._isTurboActive : false;
    }

    // 2. Safely hook into Scene_Battle creation
    var _Scene_Battle_createWindowLayer = Scene_Battle.prototype.createWindowLayer;
    Scene_Battle.prototype.createWindowLayer = function() {
        _Scene_Battle_createWindowLayer.call(this);
        this.createTurboButton();
    };

    Scene_Battle.prototype.createTurboButton = function() {
        this._turboButton = new Sprite();
        this._turboButton.bitmap = new Bitmap(100, 36);
        
        // Position top right (Adjust values to avoid overlapping Yanfly HUDs)
        this._turboButton.x = Graphics.boxWidth - 120;
        this._turboButton.y = 20;
        
        this.addChild(this._turboButton);
        this.refreshTurboButton();
    };

    // 3. Render visual button state
    Scene_Battle.prototype.refreshTurboButton = function() {
        var bitmap = this._turboButton.bitmap;
        bitmap.clear();
        
        var active = isTurboOn();
        bitmap.fillRect(0, 0, 100, 36, active ? '#E53935' : '#424242'); // Red if active, Grey if off
        
        bitmap.fontSize = 18;
        bitmap.fontBold = true;
        bitmap.textColor = '#FFFFFF';
        bitmap.drawText(active ? 'TURBO ON' : 'TURBO OFF', 0, 0, 100, 36, 'center');
    };

    // 4. Handle input, mouse clicks, and apply the Yanfly-safe speed shift
    var _Scene_Battle_update = Scene_Battle.prototype.update;
    Scene_Battle.prototype.update = function() {
        // Toggle input triggers
        if (Input.isTriggered('pageup') || (TouchInput.isTriggered() && this.isTurboButtonClicked())) {
            this.toggleTurboMode();
        }

        // Apply dynamic speed changes to SceneManager to keep Yanfly components synchronized
        if (isTurboOn()) {
            // SceneManager._deltaTime calculation adjustment allows Yanfly animations to speed up cleanly
            SceneManager._deltaTime = 1 / 120; // Forces 2x processing internally
        } else {
            SceneManager._deltaTime = 1 / 60;  // Returns to standard 60 FPS processing
        }

        _Scene_Battle_update.call(this);
    };

    Scene_Battle.prototype.toggleTurboMode = function() {
        if ($gameSystem) {
            $gameSystem._isTurboActive = !$gameSystem._isTurboActive;
            SoundManager.playCursor(); 
            this.refreshTurboButton();
        }
    };

    Scene_Battle.prototype.isTurboButtonClicked = function() {
        if (!this._turboButton) return false;
        var tx = TouchInput.x;
        var ty = TouchInput.y;
        var bx = this._turboButton.x;
        var by = this._turboButton.y;
        return (tx >= bx && tx <= bx + 100 && ty >= by && ty <= by + 36);
    };

    // 5. Important: Reset engine time delta when exiting battle scene
    var _Scene_Battle_terminate = Scene_Battle.prototype.terminate;
    Scene_Battle.prototype.terminate = function() {
        SceneManager._deltaTime = 1 / 60; // Safeguard world map speed from breaking
        _Scene_Battle_terminate.call(this);
    };
})();
