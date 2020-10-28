// New name for the state
var playState = {
    // Removed the preload function
    create: function() {
        // Removed background color and physics system
        menuState.theme.stop();
        this.musica = game.add.audio('musica');
        this.musica.play('', 0, 0.3, true);
        this.cursor = game.input.keyboard.createCursorKeys();

        this.player = game.add.sprite(game.world.centerX, game.world.centerY,
                'player');
        this.player.anchor.setTo(0.5, 0.5);
        game.physics.arcade.enable(this.player);
        this.player.body.gravity.y = 500;

        this.enemies = game.add.group();
        this.enemies.enableBody = true;
        this.enemies.createMultiple(10, 'enemy');

        this.coin = game.add.sprite(60, 140, 'coin');
        game.physics.arcade.enable(this.coin);
        this.coin.anchor.setTo(0.5, 0.5);

        this.scoreLabel = game.add.text(30, 30, 'score: 0',
                {font: '18px Arial', fill: '#ffffff'});
        // New score variable
        game.global.score = 0;
        this.createWorld();
        //game.time.events.loop(2200, this.addEnemy, this);
        // Contains the time of the next enemy creation
        this.nextEnemy = 0;

        this.jumpSound = game.add.audio('jump');
        this.coinSound = game.add.audio('coin');
        this.deadSound = game.add.audio('dead');
       this.enemydie = game.add.audio('enemydie');
        // this.musica = game.add.audio('musica');

        //musica principal
        //  music = game.add.audio('loop', 0.5, true);
        //music.loop = true;
        // this.musica.play();
        // this.musica.loop = true;
        // Create the 'right' animation by looping the frames 1 and 2
        this.player.animations.add('right', [1, 2], 8, true);
        // Create the 'left' animation by looping the frames 3 and 4
        this.player.animations.add('left', [3, 4], 8, true);

        // Create the emitter with 15 particles. We don't need to set the x and y
        // Since we don't know where to do the explosion yet
        this.emitter = game.add.emitter(0, 0, 15);
        // Set the 'pixel' image for the particles
        this.emitter.makeParticles('pixel');
        // Set the y speed of the particles between -150 and 150
        // The speed will be randomly picked between -150 and 150 for each particle
        this.emitter.setYSpeed(-150, 150);
        // Do the same for the x speed
        this.emitter.setXSpeed(-150, 150);
        // Use no gravity for the particles
        this.emitter.gravity = 0;

        game.input.keyboard.addKeyCapture([Phaser.Keyboard.UP,
            Phaser.Keyboard.DOWN, Phaser.Keyboard.LEFT, Phaser.Keyboard.RIGHT]);

        this.wasd = {
            up: game.input.keyboard.addKey(Phaser.Keyboard.W),
            left: game.input.keyboard.addKey(Phaser.Keyboard.A),
            right: game.input.keyboard.addKey(Phaser.Keyboard.D)
        };


// If the game is running on a mobile device
        if (!game.device.desktop) {
// Display the mobile inputs
            this.addMobileInputs();
        }
    },
    update: function() {
        menuState.theme.stop();
        game.physics.arcade.collide(this.player, this.layer);
        // game.physics.arcade.collide(this.enemy, this.layer);
        game.physics.arcade.collide(this.coin, this.layer);
        game.physics.arcade.overlap(this.player, this.coin, this.takeCoin, null, this);

        this.movePlayer();

        if (this.player.inWorld === false)
            this.playerDie();


        //Make the enemies and walls collide
        game.physics.arcade.collide(this.enemies, this.layer);
        // Call the 'playerDie' function when the player and an enemy overlap
        //game.physics.arcade.collide(this.player, this.enemies, this.killEnemy);
        game.physics.arcade.collide(this.player, this.enemies, this.killEnemy,
                null, this);
        // If the 'nextEnemy' time has passed
        if (this.nextEnemy < game.time.now) {
            // Define our variables
            var start = 4000, end = 1000, score = 100;
            // Formula to decrease the delay between enemies over time
            // At first it's 4000ms, then slowly goes to 1000ms
            var delay = Math.max(start - (start - end) * game.global.score / score, end);
            // Create a new enemy, and update the 'nextEnemy' time
            this.addEnemy();
            this.nextEnemy = game.time.now + delay;
        }
        //this.enemies.forEachAlive(this.checkPosition, this);
    },
    /*  // And then we add the new function:
     checkPosition: function(enemy) {
     if (enemy.y > this.player.y) {
     enemy.kill();
     }
     },
     jump: function() {
     
     },*/
    takeCoin: function(player, coin) {
        // New score variable
        game.global.score += 5;
        this.scoreLabel.text = 'score: ' + game.global.score;
        this.updateCoinPosition();
        // Put this in the 'takeCoin' function
        this.coinSound.play();

        // Scale the coin to 0 to make it invisible
        this.coin.scale.setTo(0, 0);
// Grow the coin back to its original scale in 300ms
        game.add.tween(this.coin.scale).to({x: 1, y: 1}, 1000).start();
//player
        game.add.tween(this.player.scale).to({x: 1.3, y: 1.3}, 50).to({x: 1, y: 1}, 400)
                .start();

    },
    restartGame: function() {
        game.state.start('main');
    },
    movePlayer: function() {
// Player moving left
        if (this.cursor.left.isDown || this.wasd.left.isDown || this.moveLeft) {
            this.player.body.velocity.x = -200;
            this.player.animations.play('left');
        }
// Player moving right
        else if (this.cursor.right.isDown || this.wasd.right.isDown ||
                this.moveRight) {
            this.player.body.velocity.x = 200;
            this.player.animations.play('right');
        }
// If nothing is pressed
        else {
            this.player.body.velocity.x = 0;
            this.player.animations.stop();
            this.player.frame = 0;
        }
// If the up arrow or the W key is pressed
        /*    if ((this.cursor.up.isDown || this.wasd.up.isDown)
         && this.player.body.onFloor()) {
         this.jumpSound.play();
         this.player.body.velocity.y = -300;
         }
         */
        if (this.cursor.up.isDown || this.wasd.up.isDown) {
            this.jumpPlayer();
        }
    },
    createWorld: function() {
        // Create the tilemap
        this.map = game.add.tilemap('map');
        // Add the tileset to the map
        this.map.addTilesetImage('tileset');
        // Create the layer, by specifying the name of the Tiled layer
        this.layer = this.map.createLayer('Camada de Tiles 1');
        // Set the world size to match the size of the layer
        this.layer.resizeWorld();
        // Enable collisions for the first element of our tileset (the blue wall)
        this.map.setCollision(1);
    },
    killEnemy: function(player, enemy)
    {
        if (enemy.body.touching.up)
        {
            //Call a jump function or something here...
            player.body.velocity.y = -200;
            //Maybe put the enemy into a different group so it doesn't collide with the player anymore...
            enemy.kill();
           this.enemydie.play();
        }
        else
        {
            //You would probably want something a little more than this...
            //player.kill();
            this.playerDie();
        }
    },
    playerDie: function() {


        if (!this.player.alive) {
            // If the player is already dead, do nothing

            return;
        } else {

            // Kill the player
            this.player.kill();
            // The part that will be executed only once
            this.deadSound.play();
            this.emitter.x = this.player.x;
            this.emitter.y = this.player.y;
            this.emitter.start(true, 600, null, 15);
            game.time.events.add(1000, this.startMenu, this);

        }

    },
    startMenu: function() {
        game.state.start('menu');
        this.musica.stop();
    },
    updateCoinPosition: function() {
// Store all the possible coin positions in an array
        var coinPosition = [
            {x: 140, y: 60}, {x: 360, y: 60}, // Top row
            {x: 60, y: 140}, {x: 440, y: 140}, // Middle row
            {x: 130, y: 300}, {x: 370, y: 300} // Bottom row
        ];
// Remove the current coin position from the array
// Otherwise the coin could appear at the same spot twice in a row
        for (var i = 0; i < coinPosition.length; i++) {
            if (coinPosition[i].x === this.coin.x) {
                coinPosition.splice(i, 1);
            }
        }
// Randomly select a position from the array
        var newPosition = coinPosition[
                game.rnd.integerInRange(0, coinPosition.length - 1)];
// Set the new position of the coin
        this.coin.reset(newPosition.x, newPosition.y);
    },
    addEnemy: function() {
        // Get the first dead enemy of the group
        enemy = this.enemies.getFirstDead();
        // If there isn't any dead enemy, do nothing
        if (!enemy) {
            return;
        }
        // Initialise the enemy
        enemy.anchor.setTo(0.5, 1);
        enemy.reset(game.world.centerX, 0);
        enemy.body.gravity.y = 500;
        enemy.body.velocity.x = 100 * Phaser.Math.randomSign();
        enemy.body.bounce.x = 1;
        enemy.checkWorldBounds = true;
        enemy.outOfBoundsKill = true;
    },
    addMobileInputs: function() {
// Add the jump button
        this.jumpButton = game.add.sprite(350, 247, 'jumpButton');
        this.jumpButton.inputEnabled = true;
        this.jumpButton.events.onInputDown.add(this.jumpPlayer, this);
        this.jumpButton.alpha = 0.5;
// Movement variables
        this.moveLeft = false;
        this.moveRight = false;
// Add the move left button
        this.leftButton = game.add.sprite(50, 247, 'leftButton');
        this.leftButton.inputEnabled = true;
        this.leftButton.events.onInputOver.add(function() {
            this.moveLeft = true;
        }, this);
        this.leftButton.events.onInputOut.add(function() {
            this.moveLeft = false;
        }, this);
        this.leftButton.events.onInputDown.add(function() {
            this.moveLeft = true;
        }, this);
        this.leftButton.events.onInputUp.add(function() {
            this.moveLeft = false;
        }, this);
        this.leftButton.alpha = 0.5;
// Add the move right button
        this.rightButton = game.add.sprite(130, 247, 'rightButton');
        this.rightButton.inputEnabled = true;
        this.rightButton.events.onInputOver.add(function() {
            this.moveRight = true;
        },
                this);
        this.rightButton.events.onInputOut.add(function() {
            this.moveRight = false;
        },
                this);
        this.rightButton.events.onInputDown.add(function() {
            this.moveRight = true;
        },
                this);
        this.rightButton.events.onInputUp.add(function() {
            this.moveRight = false;
        },
                this);
        this.rightButton.alpha = 0.5;
    },
    jumpPlayer: function() {
// If the player is touching the ground
        if (this.player.body.onFloor()) {
// Jump with sound
            this.player.body.velocity.y = -320;
            this.jumpSound.play();
        }
    },
};
// Removed Phaser and states initialisation