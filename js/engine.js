/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine is available globally via the Engine variable and it also makes
 * the canvas' context (ctx) object globally available to make writing app.js
 * a little simpler to work with.
 */

var ns = froggerGame || {}; // Creating an alias for the global namespace.

ns.Engine = (function (global) {


    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    ns.doc = global.document;
    ns.win = global.window;
    ns.canvas = ns.doc.createElement('canvas');
    ns.ctx = ns.canvas.getContext('2d');
    ns.COLPIXELCOUNT = 101;
    ns.ROWPIXELCOUNT = 83;
    var lastTime;
    var requestId = null;

    ns.canvas.width = 505;
    ns.canvas.height = 606;

    ns.characterUrl = null;
    ns.proceed = false;

    $('#canvas-placeholder').append(ns.canvas);

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        update(dt);
        render();

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */

        lastTime = now;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */

        if(ns.proceed) {
            requestId = ns.win.requestAnimationFrame(main);
        }
    }

    /* This function is called everytime a new game is started and does
     * some initial setup that should only occur once.
     */
    ns.init = function () {
        //$('#canvas-placeholder').append(ns.canvas);
        reset();
        render();
        ns.resetGameSummary();
    };

    /* This method calls the createInsiances() method evertyime the game is reset
     * to start a new game.
     */
    function reset() {
        ns.createInstances();
    }

    /* 'New Game' button's click event handler.
     * Calls the start() method which gets the game going...
     */
    $('#new-game').click(function() {
        ns.start();
    });

    /* This is the starting point in the game. The first call to the
     * main() method that gets the game loop started is made here.
     * The game control variable - 'proceed', is also set to true here.
     */
    ns.start = function () {
        if(requestId === null) {
            ns.proceed = true;
            lastTime = Date.now();
            main();
        }
    };

    /* 'Quit Game' button's click event handler.
     * Displays a confirmation box to check if the user really wants to quit.
     * The stopGame() method is called on confirmation and if the user clicks
     * 'No' the game continues.
     */
    $('#stop-game').click(function() {

        var quitGame = confirm("Are you sure you want to quit?");

        if(quitGame) {
            ns.stopGame();
        }
    });

    /* Resets the game control variable - 'proceed' to false so that the game
     * loop stops.
     */
    ns.stop = function() {
        if(requestId !== null) {
            //$('#canvas-placeholder').empty();
            ns.proceed = false;
            requestId = null;
        }
    };

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data.
     * Then calls the checkCollisions() method to check if the Player has
     * collided with rocks or enemies.
     */
    function update(dt) {
        updateEntities(dt);
        ns.checkCollisions();
    }

    /* This is called by the update function  and loops through all of the
     * objects within the allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for the
     * player object. These update methods focus purely on updating the
     * data/properties related to  the object.
     */
    function updateEntities(dt) {
        ns.allEnemies.forEach(function (enemy) {
            enemy.update(dt);
        });
        ns.player.update();
    }

    /* This function calls the renderGameSurface function an the
     * renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render() {

        renderGameSurface();
        renderEntities();
    }

    /* This function draws the "game level"
     */
    function renderGameSurface() {

        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */
        var rowImages = [
                'images/water-block.png',   // Top row is water
                'images/stone-block.png',   // Row 1 of 3 of stone
                'images/stone-block.png',   // Row 2 of 3 of stone
                'images/stone-block.png',   // Row 3 of 3 of stone
                'images/grass-block.png',   // Row 1 of 2 of grass
                'images/grass-block.png'    // Row 2 of 2 of grass
            ],
            numRows = 6,
            numCols = 5,
            row, col;

        /* Loop through the number of rows and columns we've defined above
         * and, using the rowImages array, draw the correct image for that
         * portion of the "grid"
         */
        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                /* The drawImage function of the canvas' context element
                 * requires 3 parameters: the image to draw, the x coordinate
                 * to start drawing and the y coordinate to start drawing.
                 * We're using our Resources helpers to refer to our images
                 * so that we get the benefits of caching these images, since
                 * we're using them over and over.
                 */
                ns.ctx.drawImage(ns.Resources.get(rowImages[row]), col * ns.COLPIXELCOUNT, row * ns.ROWPIXELCOUNT);
            }
        }

    }

    /* This function is called by the render function and is called on each game
     * tick. It's purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */
    function renderEntities() {
        /* Loop through all of the objects within the allEnemies array and call
         * the render function you have defined.
         */
        ns.allEnemies.forEach(function (enemy) {
            enemy.render();
        });

        ns.rock.render();
        ns.reward.render();
        ns.player.render();

    }

    /* Load all of the images that is going to need to draw our game level.
     * Then set init as the callback method, so that when all of these
     * images are properly loaded our game will start.
     */
    ns.Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/enemy-bug.png',
        'images/char-boy.png',
        'images/char-cat-girl.png',
        'images/rock.png',
        'images/gem-blue.png',
        'images/gem-green.png',
        'images/gem-orange.png',
        'images/star.png'
    ]);

    ns.Resources.onReady(ns.init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developer's can use it more easily
     * from within their app.js files.
     */
    global.ctx = ns.ctx;
})(this);
