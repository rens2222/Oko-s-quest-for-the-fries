/*:
 * @plugindesc Preserves HP/MP percentages and prints a single summary after closing the item menu.
 * @author AI Assistant
 */

(function() {
    // 1. Maintain HP & MP Percentages across any Level Up
    var _Game_Actor_levelUp = Game_Actor.prototype.levelUp;
    Game_Actor.prototype.levelUp = function() {
        var hpRate = this.hp / Math.max(1, this.mhp);
        var mpRate = this.mp / Math.max(1, this.mmp);

        _Game_Actor_levelUp.call(this);

        this._hp = Math.max(1, Math.round(this.mhp * hpRate));
        this._mp = Math.round(this.mmp * mpRate);
        this.refresh();
    };

    // 2. Compeletely disable native individual text windows during inventory spam
    Game_Actor.prototype.displayLevelUp = function(newSkills) {
        return; 
    };

    // 3. Take a snapshot of the party's status when entering the Item Scene
    var _Scene_Item_start = Scene_Item.prototype.start;
    Scene_Item.prototype.start = function() {
        _Scene_Item_start.call(this);
        
        $gameParty.members().forEach(function(actor) {
            actor._menuStartLevel = actor.level;
            actor._menuStartSkills = actor._skills.clone();
        });
    };

    // 4. Compare stats and display a single unified summary box when exiting the Item Scene
    var _Scene_Item_terminate = Scene_Item.prototype.terminate;
    Scene_Item.prototype.terminate = function() {
        $gameParty.members().forEach(function(actor) {
            // Check if the character's level increased while the menu was open
            if (actor._menuStartLevel && actor.level > actor._menuStartLevel) {
                
                // Track all newly learned skills during the entire menu session
                var newSkills = [];
                actor._skills.forEach(function(skillId) {
                    if (actor._menuStartSkills && !actor._menuStartSkills.contains(skillId)) {
                        newSkills.push($dataSkills[skillId]);
                    }
                });

                // Generate exactly ONE native dialogue text box
                var text = TextManager.levelUp.format(actor.name(), TextManager.level, actor.level);
                $gameMessage.newPage();
                $gameMessage.add(text);

                // Append all learned skills as bullet points in that same box
                newSkills.forEach(function(skill) {
                    $gameMessage.add(TextManager.obtainSkill.format(skill.name));
                });
            }

            // Memory cleanup
            delete actor._menuStartLevel;
            delete actor._menuStartSkills;
        });

        _Scene_Item_terminate.call(this);
    };
})();