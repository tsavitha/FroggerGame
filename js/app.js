(function () {

    var ns = MYRESUMEAPP; // Creating an alias for the global namespace.

    var NSTONEROWS = 3;

    var getInitialPosition = function (min, max) {

        return Math.round(min + Math.random() * (max - min));
    };

    var resetPlayerPosition = function() {
        ns.player.vx = 2;
        ns.player.vy = 5;
    };

    var reachedHome = function() {
        if(ns.player.vy === 0) {
            console.log("you win!!");
            resetPlayerPosition();
        }
    };

    var enemyCollision = function() {
        var posX = ns.player.x;
        var posY = ns.player.y;

        if(ns.player.vx > 0 && ns.player.vy < 4) {
            ns.allEnemies.forEach(function (enemy) {
                if((enemy.x >= posX && enemy.x <= posX+ns.COLPIXELCOUNT) && (enemy.y+20 === posY)) {
                    console.log("enemy collision - you loose :-(");
                    resetPlayerPosition();
                }
            });
        }
    };

    var rockCollision = function() {

        var posX = ns.player.x;
        var posY = ns.player.y;

        if(ns.player.vx > 0 && ns.player.vy < 4) {
            ns.rocks.forEach(function (rock) {
                if((rock.x === posX) && (rock.y+20 === posY)) {
                    console.log("rock collision - you loose :-(");
                    resetPlayerPosition();
                }
            });
        }
    };

    ns.checkCollisions = function() {
        enemyCollision();
        rockCollision();
    };

// Enemies our player must avoid
    var Enemy = function () {
        // Variables applied to each of our instances go here,
        // we've provided one for you to get started

        // The image/sprite for our enemies, this uses
        // a helper we've provided to easily load images
        this.sprite = 'images/enemy-bug.png';
        this.x = 0;
        this.y = (getInitialPosition(1, 3) * ns.ROWPIXELCOUNT) - 20;
        this.incrementer = Math.round(Math.random() * 7 + 1);
    };

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
    Enemy.prototype.update = function (dt) {
        // You should multiply any movement by the dt parameter
        // which will ensure the game runs at the same speed for
        // all computers.

        if (this.x > 505) {
            this.x = 0;
            this.y = (getInitialPosition(1, 3) * ns.ROWPIXELCOUNT) - 20;
            this.incrementer = Math.round(Math.random() * 7 + 1);
        }
        else {
            this.x += this.incrementer;
        }
    };

// Draw the enemy on the screen, required method for game
    Enemy.prototype.render = function () {
        ns.ctx.drawImage(ns.Resources.get(this.sprite), this.x, this.y);

    };

    var Rock = function() {
        this.sprite = 'images/rock.png';
        this.x = (getInitialPosition(1, 3) * ns.COLPIXELCOUNT);
        this.y = (getInitialPosition(1, 3) * ns.ROWPIXELCOUNT) - 20;
    };

    Rock.prototype.render = function() {
        ns.ctx.drawImage(ns.Resources.get(this.sprite), this.x, this.y);
    };

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
    var Player = function () {
        this.sprite = 'images/char-boy.png';
        this.vx = 2;
        this.vy = 5;
        this.x = this.vx * ns.COLPIXELCOUNT;
        this.y = this.vy * ns.ROWPIXELCOUNT;
    };

    Player.prototype.update = function (dt) {

        this.x = this.vx * ns.COLPIXELCOUNT;
        this.y = this.vy * ns.ROWPIXELCOUNT;
        reachedHome();
    };

    Player.prototype.render = function () {
        ns.ctx.drawImage(ns.Resources.get(this.sprite), this.x, this.y);
    };

    Player.prototype.handleInput = function (keyCode) {
        switch (keyCode) {
            case 'left' :
                if (this.vx > 0) {
                    this.vx -= 1;
                }
                break;
            case 'up' :
                if (this.vy > 0) {
                    this.vy -= 1;
                }
                break;
            case 'right' :
                if (this.vx < 4) {
                    this.vx += 1;
                }
                break;
            case 'down' :
                if (this.vy < 5) {
                    this.vy += 1;
                }
        }
    };

    ns.createInstances = function() {

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

        var i;
        ns.allEnemies = [];
        ns.rocks = [];

        for (i = 0; i < NSTONEROWS; i++) {
            ns.allEnemies.push(new Enemy());
        }

        ns.player = new Player();

        for(i=0; i<(NSTONEROWS-1); i++) {
            ns.rocks.push(new Rock());
        }
    };

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
    document.addEventListener('keyup', function (e) {
        var allowedKeys = {
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down'
        };

        ns.player.handleInput(allowedKeys[e.keyCode]);
    });
})();

