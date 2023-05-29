let player, ball, violetBricks, yellowBricks, redBricks, cursors;
let openingText, gameOverText, playerWonText;
let gameStarted = false;
let lives = 3;

const config = {
	type: Phaser.AUTO,
	parent: 'game',
	width: 800,
	heigth: 640,
	scale: {
		mode: Phaser.Scale.RESIZE,
		autoCenter: Phaser.Scale.CENTER_BOTH,
	},
	scene: {
		preload,
		create,
		update,
	},
	physics: {
		default: 'arcade',
		arcade: {
			gravity: false,
		},
	},
};

const game = new Phaser.Game(config);

function preload() {
	this.load.image('ball', 'assets/images/ball_32_32.png');
	this.load.image('paddle', 'assets/images/paddle_128_32.png');
	this.load.image('brick1', 'assets/images/brick1_64_32.png');
	this.load.image('brick2', 'assets/images/brick2_64_32.png');
	this.load.image('brick3', 'assets/images/brick3_64_32.png');
}

function create() {
	player = this.physics.add.sprite(
		400, // x position
		600, // y position
		'paddle' // key of image for the sprite
	);

	ball = this.physics.add.sprite(
		400, // x position
		565, // y position
		'ball' // key of image for the sprite
	);

	violetBricks = this.physics.add.group({
		key: 'brick1',
		repeat: 5,
		immovable: true,
		setXY: {
			x: 220,
			y: 100,
			stepX: 70,
		},
	});

	yellowBricks = this.physics.add.group({
		key: 'brick2',
		repeat: 7,
		immovable: true,
		setXY: {
			x: 150,
			y: 70,
			stepX: 70,
		},
	});

	redBricks = this.physics.add.group({
		key: 'brick3',
		repeat: 9,
		immovable: true,
		setXY: {
			x: 80,
			y: 40,
			stepX: 70,
		},
	});

	cursors = this.input.keyboard.createCursorKeys();
	player.setInteractive();
	this.input.on('pointermove', movePaddle, this);

	function movePaddle(pointer) {
		// Move the paddle horizontally with the mouse pointer
		player.x = Phaser.Math.Clamp(
			pointer.x,
			player.width / 2,
			game.config.width - player.width / 2
		);
	}

	player.setCollideWorldBounds(true);
	ball.setCollideWorldBounds(true);
	ball.setBounce(1, 1);
	this.physics.world.checkCollision.down = false;
	this.physics.add.collider(ball, violetBricks, hitBrick, null, this);
	this.physics.add.collider(ball, yellowBricks, hitBrick, null, this);
	this.physics.add.collider(ball, redBricks, hitBrick, null, this);
	player.setImmovable(true);
	this.physics.add.collider(ball, player, hitPlayer, null, this);

	openingText = this.add.text(
		this.physics.world.bounds.width / 2,
		this.physics.world.bounds.height / 2,
		'Press SPACE to Start',
		{
			fontFamily: 'Monaco, Courier, monospace',
			fontSize: '50px',
			fill: '#fff',
		}
	);
	openingText.setOrigin(0.5);

	// Create game over text
	gameOverText = this.add.text(
		this.physics.world.bounds.width / 2,
		this.physics.world.bounds.height / 2,
		'Game Over',
		{
			fontFamily: 'Monaco, Courier, monospace',
			fontSize: '50px',
			fill: '#fff',
		}
	);
	gameOverText.setOrigin(0.5);
	// Make it invisible until the player loses
	gameOverText.setVisible(false);

	// Create the game won text
	playerWonText = this.add.text(
		this.physics.world.bounds.width / 2,
		this.physics.world.bounds.height / 2,
		'You won!',
		{
			fontFamily: 'Monaco, Courier, monospace',
			fontSize: '50px',
			fill: '#fff',
		}
	);
	playerWonText.setOrigin(0.5);
	// Make it invisible until the player wins
	playerWonText.setVisible(false);
}

function update() {
	// Check if the ball left the scene i.e. game over
	if (isGameOver(this.physics.world)) {
		ball.disableBody(true, true);

		// Reduce a life and reset the ball position if there are remaining lives
		if (lives > 0) {
			lives--;
			player.disableBody(true, true); // Disable the player temporarily
			player.x = 400; // Reset player position
			ball.setPosition(400, 565); // Reset ball position
			gameStarted = false; // Reset gameStarted flag
			this.time.delayedCall(1000, enablePlayer, [], this); // Enable player after a delay
		}

		// If no lives left, end the game
		if (lives === 0) {
			gameOverText.setVisible(true);
		}

		function enablePlayer() {
			player.enableBody(true, player.x, player.y, true, true);
		}
	} else if (isWon()) {
		playerWonText.setVisible(true);
		ball.disableBody(true, true);
		if (cursors.space.isDown) {
			restartGame();
		}
	} else {
		// Put this in so that the player stays still if no key is being pressed
		player.body.setVelocityX(0);

		if (gameStarted) {
			player.x = Phaser.Math.Clamp(
				this.input.activePointer.x,
				player.width / 2,
				game.config.width - player.width / 2
			);
		}

		if (!gameStarted) {
			ball.setX(player.x);

			if (cursors.space.isDown) {
				gameStarted = true;
				ball.setVelocityY(-200);
				openingText.setVisible(false);
			}
		}
	}
}

function isGameOver(world) {
	return ball.body.y > world.bounds.height;
}

function isWon() {
	return (
		violetBricks.countActive() +
			yellowBricks.countActive() +
			redBricks.countActive() ==
		0
	);
}

function restartGame() {
	// Reset the game state
	gameStarted = false;
	openingText.setVisible(true);
	gameOverText.setVisible(false);
	playerWonText.setVisible(false);

	// Reset the paddle and ball positions
	player.setX(400);
	ball.setX(400);
	ball.setY(565);

	// Enable the ball's body
	ball.enableBody(true, ball.x, ball.y, true, true);
}

function hitBrick(ball, brick) {
	brick.disableBody(true, true);

	if (ball.body.velocity.x == 0) {
		randNum = Math.random();
		if (randNum >= 0.5) {
			ball.body.setVelocityX(150);
		} else {
			ball.body.setVelocityX(-150);
		}
	}
}

function hitPlayer(ball, player) {
	// Increase the velocity of the ball after it bounces
	ball.setVelocityY(ball.body.velocity.y - 5);

	let newXVelocity = Math.abs(ball.body.velocity.x) + 5;
	// If the ball is to the left of the player, ensure the X Velocity is negative
	if (ball.x < player.x) {
		ball.setVelocityX(-newXVelocity);
	} else {
		ball.setVelocityX(newXVelocity);
	}
}
