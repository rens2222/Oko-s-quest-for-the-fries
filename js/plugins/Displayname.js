/*:
 * @plugindesc Fixes the Map Name window to render large titles, normal subtitles, and apostrophes safely.
 * @author AI Help
 * @help Type \n directly inside your Map's Display Name field to separate lines.
 */

// 1. Set the exact vertical height needed for a large line + normal line safely
Window_MapName.prototype.windowHeight = function() {
    return (this.lineHeight() * 2.8) + (this.standardPadding() * 2);
};

// 2. Control sliding position behavior smoothly
Window_MapName.prototype.updatePosition = function() {
    if (this._showCount > 0) {
        this.y = Math.min(this.y + 8, this.standardPadding());
    } else {
        this.y = Math.max(this.y - 8, -this.windowHeight());
    }
};

// 3. Split the lines inside Javascript first to completely avoid text code bugs
Window_MapName.prototype.refresh = function() {
    this.contents.clear();
    var displayName = $gameMap.displayName();
    
    if (displayName) {
        // Split the typed string exactly at the "\n" text marker
        var lines = displayName.split('\\n');
        
        // Line 1: Draw the large text safely
        if (lines[0]) {
            this.contents.fontSize = this.standardFontSize(); 
            // Injects the size increase text code cleanly into just the first line string
            this.drawTextEx('\\{' + lines[0], this.standardPadding(), 8);
        }
        
        // Line 2: Draw the normal text safely on a lower canvas position
        if (lines[1]) {
            this.contents.fontSize = this.standardFontSize();
            // Pushes this line down by 36 pixels so it sits directly underneath
            this.drawTextEx(lines[1], this.standardPadding(), 52);
        }
    }
};
