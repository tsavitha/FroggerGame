(function () {

    var ns = froggerGame || {}; // Creating an alias for the global namespace.

    var NSTONEROWS = 3;         // Nunmber of stone rows in the game surface
    var HOMEPOINTS = 200;       // Points gained when the Player reaches Home
    var NOFLIVES = 3;           // Number of lives the Player gets for every new game

    // Generates a random number between a minimum and maximum number that is provided,
    // both inclusive.
    var getRandomNumberBetween = function (min, max) {

        return Math.round(min + Math.random() * (max - min));
    };

    // Called when a new game is started to reset the Life and Points display.
    ns.resetGameSummary = function () {

        updateLifeGameSummary(NOFLIVES);
        updatePointsGameSummary(0);

    };

    // Updates the Points display everytime the Player scores.
    var updatePointsGameSummary = function (updateStr) {

        $('#points').text(updateStr);

    };

    // Updates the Life display everytime the Player loses a life.
    var updateLifeGameSummary = function (updateStr) {

        $('#life').text(updateStr);

    };

    // resetGame() is called when the game is reset and calls 2 other methods that aid in the process.
    var resetGame = function () {
        ns.createInstances();
        ns.start();

    };

    // Gets the most recent game's summary that includes the the different gems collected and
    // the total number of points.
    var getRecentGameSummary = function () {
        var gemSelector;

        for (var i = 0; i < ns.player.gemCollection.length; i++) {
            gemSelector = "#" + ns.player.gemCollection[i].gem;
            $(gemSelector).text(ns.player.gemCollection[i].noCollected);
        }
        $('#total').text(ns.player.points);
    };

    // This method is called when the user is no longer interested in continuing with the game.
    // The current game execution is stopped, the game surface is set to start a new play and  a
    // modal dialog with the most recent game's summary is displayed
    ns.stopGame = function () {
        getRecentGameSummary();
        $('#game-summary-modal').modal({
            keyboard: false
        });
        ns.stop();
        ns.init();

    };

    // This method is called to reset the Player position for a new play.
    var startNewPlay = function () {
        ns.player.vx = 2;
        ns.player.vy = 5;
        ns.rock = new Rock();
        ns.reward = new Reward();
    };

    // This method is called when the Player collides with either the enemy or a rock
    // In both the cases, a check is done to see if the Player has enough life to continue
    // the game and calls the startNewPlay() method to reset values and continue the game.
    // When the Player has lost all his lives, a confirmation is displayed if the user wants
    // to play another game and branches accordingly.
    var resetPlay = function () {
        if (ns.player.life > 0) {
            startNewPlay();
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

    // reachedHome() checks if the player has reached his destination in which case adds 'HOMEPOINTS' - 200
    // and resets play.
    var reachedHome = function () {
        if (ns.player.vy === 0) {
            ns.player.points += HOMEPOINTS;
            updatePointsGameSummary(ns.player.points);
            startNewPlay();
        }
    };

    // enemyCollision() checks if the player has collided with any of the enemies moving across the stone rows.
    // If yes, the player's life is decrased by 1, life summary is updated,
    // and play is reset so the player has to start again.
    // If no, the play continues.
    var enemyCollision = function () {

        if (ns.player.vx > 0 && ns.player.vy < 4) {
            ns.allEnemies.forEach(function (enemy) {
                if ((enemy.x >= ns.player.x && enemy.x <= (ns.player.x + ns.COLPIXELCOUNT)) && (enemy.y + 20 === ns.player.y)) {
                    ns.player.life -= 1;
                    updateLifeGameSummary(ns.player.life);
                    resetPlay();
                }
            });
        }
    };

    // rockCollision() checks to see if the player has collided with a rock.
    // If yes, the player's life is decrased by 1, life summary is updated,
    // and play is reset so the player has to start again.
    // If no, the play continues.
    var rockCollision = function () {

        if (ns.player.vx > 0 && ns.player.vy < 4) {
            if ((ns.rock.x === ns.player.x) && (ns.rock.y + 20 === ns.player.y)) {
                ns.player.life -= 1;
                updateLifeGameSummary(ns.player.life);
                resetPlay();
            }
        }
    };

    // redeemReward() checks if the player has occupied the same position as a reward.
    // If yes, then the corresponding points are added to the player's points, game summary
    // is updated and a new reward instance is created.
    // If no, play continues.
    var redeemReward = function () {
        if (!ns.reward.redeemed && ns.player.vx > 0 && ns.player.vy < 4) {
            if ((ns.reward.x - 15) === ns.player.x && (ns.reward.y - 10) === ns.player.y) {
                ns.player.points += rewardsArr[ns.reward.randomSel].points;
                updatePointsGameSummary(ns.player.points);
                ns.player.gemCollection[ns.reward.randomSel].noCollected += 1;
                ns.reward = new Reward();
            }
        }
    };

    // This method is called after the player and the enemy positions have been updated.
    ns.checkCollisions = function () {
        enemyCollision();
        rockCollision();
        redeemReward();
    };

    // Enemy class - player must avoid enemy to not loose his life
    var Enemy = function () {
        // The image/sprite for our enemies, this uses
        // a helper to easily load images
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

    // Player class
    // This class has an update(), render() and a handleInput() method.
    var Player = function () {
        // The image/sprite for the player, this uses
        // a helper to easily load images
        this.sprite = 'images/char-boy.png';
        this.vx = 2;
        this.vy = 5;
        this.x = this.vx * ns.COLPIXELCOUNT;
        this.y = this.vy * ns.ROWPIXELCOUNT;
        this.life = 3;
        this.points = 0;
        this.gemCollection = [
            {'gem': 'orange', 'noCollected': 0},
            {'gem': 'blue', 'noCollected': 0},
            {'gem': 'green', 'noCollected': 0},
            {'gem': 'star', 'noCollected': 0}
        ];
    };

    // update() method called each time the game surface is redrawn to update player position.
    // Also checks if the player has reached the destination, which in this case is the water.
    Player.prototype.update = function (dt) {

        this.x = this.vx * ns.COLPIXELCOUNT;
        this.y = this.vy * ns.ROWPIXELCOUNT;
        reachedHome();
    };

    Player.prototype.render = function () {
        ns.ctx.drawImage(ns.Resources.get(this.sprite), this.x, this.y);
    };

    // The handleInput() method takes the keycode for the up, right, down and left keys
    // as parameter moves the player accordingly. This method also makes sure that the
    // player does not go out of bounds.
    Player.prototype.handleInput = function (keyCode) {
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

    // Rock class
    // This class uses a Random Number Generator method to get the placement position
    // for the rock and is rendered onto the game surface by the render() method.
    var Rock = function () {
        // The image/sprite for the rock, this uses
        // a helper to easily load images
        this.sprite = 'images/rock.png';
        this.x = (getRandomNumberBetween(1, 3) * ns.COLPIXELCOUNT);
        this.y = (getRandomNumberBetween(1, 3) * ns.ROWPIXELCOUNT) - 20;
    };

    Rock.prototype.render = function () {
        ns.ctx.drawImage(ns.Resources.get(this.sprite), this.x, this.y);
    };

    // An array of objects containing the url to the gem images and the corresponding points.
    var rewardsArr = [
        {'url': 'images/gem-orange.png', 'points': 5},
        {'url': 'images/gem-blue.png', 'points': 15},
        {'url': 'images/gem-green.png', 'points': 25},
        {'url': 'images/star.png', 'points': 50}
    ];

    // Reward class
    // Each time a random gem is selected and placed in a random position.
    var Reward = function () {
        // The image/sprite for the reward, this uses
        // a helper to easily load images
        this.randomSel = getRandomNumberBetween(0, 3);
        this.sprite = rewardsArr[this.randomSel].url;
        point = getRewardPosition();
        this.x = point.x + 15;
        this.y = point.y + 10;
        this.redeemed = false;
    };

    Reward.prototype.render = function () {
        ns.ctx.drawImage(ns.Resources.get(this.sprite), this.x, this.y);
    };

    // This method returns a point object containing x and y co-ordinates
    // that is randomly generated.
    var getRewardPosition = function () {
        point = {};

        do {
            point.x = (getRandomNumberBetween(1, 3) * ns.COLPIXELCOUNT);
            point.y = (getRandomNumberBetween(1, 3) * ns.ROWPIXELCOUNT);
        } while (point.x === ns.rock.x && point.y === ns.rock.y + 20);

        return point;
    };

    // Object instantiation.
    // Place all enemy objects in an array called allEnemies
    // Place the player object in a variable called player,
    // rock object in a variable called rock and
    // reward onject in a variable caled reward.

    ns.createInstances = function () {

        var i;
        ns.allEnemies = [];

        for (i = 0; i < NSTONEROWS; i++) {
            ns.allEnemies.push(new Enemy());
        }

        ns.player = new Player();

        ns.rock = new Rock();

        ns.reward = new Reward();

    };

    // This listens for key presses and sends the keys to the
    // Player.handleInput() method.

    document.addEventListener('keydown', function (e) {
        var allowedKeys = {
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down'
        };

        ns.player.handleInput(allowedKeys[e.keyCode]);

    });
})();

