/*:
 * @plugindesc Preserves HP and MP percentages whenever any actor levels up.
 * @author AI Assistant
 * @help This plugin overrides the default levelUp function to scale current HP/MP.
 */

(function() {
    var _Game_Actor_levelUp = Game_Actor.prototype.levelUp;
    Game_Actor.prototype.levelUp = function() {
        // 1. Store original percentage ratios
        var hpRate = this.hp / Math.max(1, this.mhp);
        var mpRate = this.mp / Math.max(1, this.mmp);

        // 2. Call original level up function to increase stats/skills
        _Game_Actor_levelUp.call(this);

        // 3. Reapply original ratios to the new maximum pools
        this._hp = Math.max(1, Math.round(this.mhp * hpRate));
        this._mp = Math.round(this.mmp * mpRate);
        this.refresh();
    };
})();
