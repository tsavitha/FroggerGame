(function () {

    var ns = froggerGame||{}; // Creating an alias for the global namespace.

    var NSTONEROWS = 3;
    var HOMEPOINTS = 200;
    var NOFLIVES = 3;

    var getRandomNumberBetween = function (min, max) {

        return Math.round(min + Math.random() * (max - min));
    };

    ns.resetGameSummary = function() {

        updateLifeGameSummary(NOFLIVES);
        updatePointsGameSummary(0);

    };

    var updatePointsGameSummary = function(updateStr) {

        $('#points').text(updateStr);

    };

    var updateLifeGameSummary = function(updateStr) {

        $('#life').text(updateStr);

    };

    var getRecentGameSummary = function() {
        var gemSelector;

        for(var i=0; i<ns.player.gemCollection.length; i++) {
            gemSelector = "#" + ns.player.gemCollection[i].gem;
            $(gemSelector).text(ns.player.gemCollection[i].noCollected);
        }
        $('#total').text(ns.player.points);
    };

    var resetGame = function() {
        ns.createInstances();
        ns.start();

    };

    ns.stopGame = function() {

        getRecentGameSummary();
        $('#game-summary-modal').modal({
            keyboard: false
        });
        ns.stop();
        ns.init();

    }

    var resetPlay = function() {
        if(ns.player.life > 0) {
            ns.player.vx = 2;
            ns.player.vy = 5;
            ns.rock = new Rock();
            ns.reward = new Reward();
        }
        else {
            var newGame = confirm("Do you want to play another game?");
            if(newGame) {
                resetGame();
            }
            else {
                ns.stopGame();
            }
            ns.resetGameSummary();
        }
    };

    var reachedHome = function() {
        if(ns.player.vy === 0) {
            ns.player.points += HOMEPOINTS;
            updatePointsGameSummary(ns.player.points);
            resetPlay();
        }
    };

    var enemyCollision = function() {

        if(ns.player.vx > 0 && ns.player.vy < 4) {
            ns.allEnemies.forEach(function (enemy) {
                if((enemy.x >= ns.player.x && enemy.x <= (ns.player.x+ns.COLPIXELCOUNT)) && (enemy.y+20 === ns.player.y)) {
                    ns.player.life -= 1;
                    updateLifeGameSummary(ns.player.life);
                    resetPlay();
                }
            });
        }
    };


    var rockCollision = function() {

        if(ns.player.vx > 0 && ns.player.vy < 4) {
            if((ns.rock.x === ns.player.x) && (ns.rock.y+20 === ns.player.y)) {
                ns.player.life -= 1;
                updateLifeGameSummary(ns.player.life);
                resetPlay();
            }
        }
    };

    var redeemReward = function() {
        if(!ns.reward.redeemed && ns.player.vx > 0 && ns.player.vy < 4) {
            if((ns.reward.x-15) === ns.player.x && (ns.reward.y-10) === ns.player.y) {
                ns.player.points += rewardsArr[ns.reward.randomSel].points;
                updatePointsGameSummary(ns.player.points);
                ns.player.gemCollection[ns.reward.randomSel].noCollected += 1;
                ns.reward = new Reward();
            }
        }
    };

    ns.checkCollisions = function() {
        enemyCollision();
        rockCollision();
        redeemReward();
    };

// Enemies our player must avoid
    var Enemy = function () {
        // Variables applied to each of our instances go here,
        // we've provided one for you to get started

        // The image/sprite for our enemies, this uses
        // a helper we've provided to easily load images
        this.sprite = 'images/enemy-bug.png';
        this.x = 0;
        this.y = (getRandomNumberBetween(1, 3) * ns.ROWPIXELCOUNT) - 20;
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
            this.y = (getRandomNumberBetween(1, 3) * ns.ROWPIXELCOUNT) - 20;
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

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
    var Player = function () {
        this.sprite = 'images/char-boy.png';
        this.vx = 2;
        this.vy = 5;
        this.x = this.vx * ns.COLPIXELCOUNT;
        this.y = this.vy * ns.ROWPIXELCOUNT;
        this.life = 3;
        this.points = 0;
        this.gemCollection = [
            {'gem' : 'orange', 'noCollected' : 0},
            {'gem' : 'blue', 'noCollected' : 0},
            {'gem' : 'green', 'noCollected' : 0},
            {'gem' : 'star', 'noCollected' : 0},
        ];
    };

    Player.prototype.update = function (dt) {

        this.x = this.vx * ns.COLPIXELCOUNT;
        this.y = this.vy * ns.ROWPIXELCOUNT;
        reachedHome();
    };

    Player.prototype.render = function () {
        ns.ctx.drawImage(ns.Resources.get(this.sprite), this.x, this.y);
    };

    Player.prototype.handleInput = function (keyCode, event) {
        switch (keyCode) {
            case 'left' :
                if (this.vx > 0) {
                    this.vx -= 1;
                }
                stopDefaultAction();
                break;
            case 'up' :
                if (this.vy > 0) {
                    this.vy -= 1;
                }
                stopDefaultAction();
                break;
            case 'right' :
                if (this.vx < 4) {
                    this.vx += 1;
                }
                stopDefaultAction();
                break;
            case 'down' :
                if (this.vy < 5) {
                    this.vy += 1;
                }
                stopDefaultAction();
                break;
        }
    };

    function stopDefaultAction() {
        event.preventDefault();
        event.stopPropagation();
    }

    var Rock = function() {
        this.sprite = 'images/rock.png';
        this.x = (getRandomNumberBetween(1, 3) * ns.COLPIXELCOUNT);
        this.y = (getRandomNumberBetween(1, 3) * ns.ROWPIXELCOUNT) - 20;
    };

    Rock.prototype.render = function() {
        ns.ctx.drawImage(ns.Resources.get(this.sprite), this.x, this.y);
    };

    var rewardsArr = [
        {'url' : 'images/gem-orange.png', 'points' : 5},
        {'url' : 'images/gem-blue.png', 'points' : 15},
        {'url' : 'images/gem-green.png', 'points' : 25},
        {'url' : 'images/star.png', 'points' : 50}
    ];

    var getRewardPosition = function() {
        point = {};

        do {
            point.x = (getRandomNumberBetween(1, 3) * ns.COLPIXELCOUNT);
            point.y = (getRandomNumberBetween(1, 3) * ns.ROWPIXELCOUNT);
        } while(point.x === ns.rock.x && point.y === ns.rock.y+20);

        return point;
    };

    var Reward = function() {
        this.randomSel = getRandomNumberBetween(0, 3);
        this.sprite = rewardsArr[this.randomSel].url;
        point = getRewardPosition();
        this.x = point.x + 15;
        this.y = point.y + 10;
        this.redeemed = false;
    };

    Reward.prototype.render = function() {
        ns.ctx.drawImage(ns.Resources.get(this.sprite), this.x, this.y);
    };


    ns.createInstances = function() {

        // Now instantiate your objects.
        // Place all enemy objects in an array called allEnemies
        // Place the player object in a variable called player

        var i;
        ns.allEnemies = [];

        for (i = 0; i < NSTONEROWS; i++) {
            ns.allEnemies.push(new Enemy());
        }

        ns.rock = new Rock();

        ns.reward = new Reward();

        ns.player = new Player();

    };

    // This listens for key presses and sends the keys to your
    // Player.handleInput() method. You don't need to modify this.

    document.addEventListener('keydown', function (e) {
        var allowedKeys = {
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down'
        };

        ns.player.handleInput(allowedKeys[e.keyCode], e);

    });
})();

