(function() {
    
    // Helper function to check if the next tile is region 251
    function isHittingBlocker(character, d) {
        if (!character.isEvent()) return false;
        
        var x2 = $gameMap.roundXWithDirection(character.x, d);
        var y2 = $gameMap.roundYWithDirection(character.y, d);
        
        return $gameMap.regionId(x2, y2) === 251;
    }

    // Intercept straight movement
    var _Game_CharacterBase_moveStraight = Game_CharacterBase.prototype.moveStraight;
    Game_CharacterBase.prototype.moveStraight = function(d) {
        if (isHittingBlocker(this, d)) {
            this.setMovementSuccess(false); // Force movement failure
            return;
        }
        _Game_CharacterBase_moveStraight.call(this, d);
    };

    // Intercept diagonal movement
    var _Game_CharacterBase_moveDiagonally = Game_CharacterBase.prototype.moveDiagonally;
    Game_CharacterBase.prototype.moveDiagonally = function(horz, vert) {
        if (isHittingBlocker(this, horz) || isHittingBlocker(this, vert)) {
            this.setMovementSuccess(false); // Force movement failure
            return;
        }
        _Game_CharacterBase_moveDiagonally.call(this, horz, vert);
    };

})();