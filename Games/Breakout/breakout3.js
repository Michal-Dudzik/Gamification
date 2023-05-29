class Breakout extends Phaser.Scene {
	constructor() {
		super({ key: 'breakout' });

		this.bricks;
		this.paddle;
		this.ball;
		this.brickRowCount = 1; // Number of rows of bricks
		this.brickWidth = 64;
		this.brickHeight = 32;
		this.brickSpacing = 10;
		this.brickColors = ['blue', 'red', 'green', 'yellow', 'silver', 'purple'];
		this.brickTimer;
		this.lifes = 3;
		this.score = 0;
		this.startTime = 0;
		this.gameStarted = false;
		this.gameOver = false;
		this.scoreText;
		this.lifesText;
		this.startScreenText;
		this.gameOverText;
		this.restartText;
	}

	preload() {
		this.load.image('ball', '/../Games/Breakout/assets/images/ball.png');
		this.load.image('paddle', '/../Games/Breakout/assets/images/paddle.png');
		this.load.image('blue', '/../Games/Breakout/assets/images/blue.png');
		this.load.image('red', '/../Games/Breakout/assets/images/red.png');
		this.load.image('green', '/../Games/Breakout/assets/images/green.png');
		this.load.image('yellow', '/../Games/Breakout/assets/images/yellow.png');
		this.load.image('silver', '/../Games/Breakout/assets/images/silver.png');
		this.load.image('purple', '/../Games/Breakout/assets/images/purple.png');
		this.load.image('heart', '/../Games/Breakout/assets/images/heart.png');
	}

	create() {
		this.input.once('pointerdown', this.startGame, this);

		// Start screen
		this.startScreenText = this.add
			.text(
				this.sys.game.config.width / 2,
				this.sys.game.config.height / 2,
				'Press the left mouse button to start',
				{
					fontSize: '32px',
					fill: '#fff',
				}
			)
			.setOrigin(0.5);

		// Game over screen
		this.gameOverText = this.add
			.text(
				this.sys.game.config.width / 2,
				this.sys.game.config.height / 2,
				'',
				{
					fontSize: '32px',
					fill: '#fff',
				}
			)
			.setOrigin(0.5);
		this.restartText = this.add
			.text(
				this.sys.game.config.width / 2,
				this.sys.game.config.height / 2 + 40,
				'',
				{
					fontSize: '24px',
					fill: '#fff',
				}
			)
			.setOrigin(0.5);

		//  Enable world bounds, but disable the floor
		this.physics.world.setBoundsCollision(true, true, true, false);

		this.ball = this.physics.add
			.image(400, 500, 'ball')
			.setCollideWorldBounds(true)
			.setBounce(1);
		this.ball.setData('onPaddle', true);

		this.paddle = this.physics.add.image(400, 550, 'paddle').setImmovable();

		// Score and Lifes display
		this.scoreText = this.add.text(16, 16, 'Score: 0', {
			fontSize: '24px',
			fill: '#fff',
		});
		this.lifesText = this.add
			.text(this.sys.game.config.width - 16, 16, `Lifes: ${this.lifes}`, {
				fontSize: '24px',
				fill: '#fff',
			})
			.setOrigin(1, 0);

		// colliders
		this.physics.add.collider(
			this.ball,
			this.bricks,
			this.hitBrick,
			null,
			this
		);
		this.physics.add.collider(
			this.ball,
			this.paddle,
			this.hitPaddle,
			null,
			this
		);

		//  Input events
		this.input.on(
			'pointermove',
			function (pointer) {
				//  Keep the paddle within the game
				this.paddle.x = Phaser.Math.Clamp(pointer.x, 52, 748);

				if (this.ball.getData('onPaddle')) {
					this.ball.x = this.paddle.x;
				}
			},
			this
		);

		this.input.on(
			'pointerup',
			function (pointer) {
				if (this.ball.getData('onPaddle')) {
					this.ball.setVelocity(-75, -300);
					this.ball.setData('onPaddle', false);
				}
			},
			this
		);

		this.generateBricksRow();
	}

	startGame() {
		this.startScreenText.visible = false;
		this.startTime = this.time.now;
	}

	generateBricksRow() {
		// Create the bricks in a row at the top of the screen
		if (!this.bricks) {
			this.bricks = this.physics.add.group();
		}

		const xStartPosition =
			(this.sys.game.config.width -
				(this.brickWidth + this.brickSpacing) * 10) /
			2;
		const brickCount = Phaser.Math.Between(1, 8); // Random number of bricks in each row

		const brickPositions = Phaser.Utils.Array.NumberArray(0, 9); // Array of positions for bricks

		for (let i = 0; i < brickCount; i++) {
			const randomIndex = Phaser.Math.RND.integerInRange(
				0,
				brickPositions.length - 1
			);
			const positionIndex = brickPositions.splice(randomIndex, 1)[0];

			const x =
				xStartPosition + positionIndex * (this.brickWidth + this.brickSpacing);
			const y = this.brickHeight / 2;
			const brickColor = Phaser.Utils.Array.GetRandom(this.brickColors);

			const brick = this.bricks.create(x, y, brickColor).setOrigin(0.5, 0.5);
			brick.setDisplaySize(this.brickWidth, this.brickHeight);
			brick.setImmovable(true);
		}

		// Move the previous rows down
		this.bricks.children.iterate((brick) => {
			brick.y += this.brickHeight + this.brickSpacing;
		});

		// Check game end conditions
		if (this.bricks.children.entries.length > 0) {
			const bricksArray = this.bricks.getChildren();
			const lowestBrick = bricksArray[bricksArray.length - 1];

			if (lowestBrick.y >= this.sys.game.config.height - this.brickHeight) {
				this.gameOver = true;
			}
		} else {
			this.gameOver = true;
		}

		// Schedule the next row generation
		if (!this.gameOver) {
			this.brickTimer = this.time.addEvent({
				delay: 5000,
				callback: this.generateBricksRow,
				callbackScope: this,
				loop: false,
			});
		}
	}

	hitBrick(ball, brick) {
		brick.disableBody(true, true);
		this.score += 10;
		this.scoreText.setText('Score: ' + this.score);

		if (this.bricks.countActive() === 0) {
			this.resetLevel();
		}
	}

	resetBall() {
		this.ball.setVelocity(0);
		this.ball.setPosition(this.paddle.x, 500);
		this.ball.setData('onPaddle', true);
		this.lifes--;

		if (this.lifes === 0) {
			this.gameOver = true;
		} else {
			this.lifesText.setText(`Lifes: ${this.lifes}`);
		}
	}

	resetLevel() {
		this.resetBall();

		this.bricks.children.each((brick) => {
			brick.enableBody(false, 0, 0, true, true);
		});
	}

	hitPaddle(ball, paddle) {
		let diff = 0;

		if (ball.x < paddle.x) {
			//  Ball is on the left-hand side of the paddle
			diff = paddle.x - ball.x;
			ball.setVelocityX(-10 * diff);
		} else if (ball.x > paddle.x) {
			//  Ball is on the right-hand side of the paddle
			diff = ball.x - paddle.x;
			ball.setVelocityX(10 * diff);
		} else {
			//  Ball is perfectly in the middle
			//  Add a little random X to stop it bouncing straight up!
			ball.setVelocityX(2 + Math.random() * 8);
		}
	}

	update() {
		if (this.gameOver) {
			this.showGameOverScreen();
			return;
		}

		if (this.ball.y > 600) {
			this.resetBall();
		}

		if (
			// this.bricks.countActive() > 0 &&
			this.bricks.children.entries[0].y >= this.sys.game.config.height
		) {
			this.gameOver = true;
			this.showGameOverScreen();
			return;
		}
	}

	showGameOverScreen() {
		this.ball.setVelocity(0);
		this.ball.visible = false;
		this.time.removeAllEvents();
		// this.startScreenText.visible = false;
		this.gameOverText.setText(
			'Game Over\n\nScore: ' +
				this.score +
				'\nBricks Destroyed: ' +
				(60 - this.bricks.countActive()) +
				'\nTime: ' +
				Math.floor((this.time.now - this.startTime) / 1000) +
				's'
		);
		this.restartText.setText('Press the left mouse button to restart');
		this.restartText.visible = true;
		this.input.once('pointerdown', this.restartGame, this);
	}

	restartGame() {
		this.scene.restart();
	}
}

const config = {
	type: Phaser.WEBGL,
	width: 800,
	height: 600,
	parent: 'game',
	scene: [Breakout],
	physics: {
		default: 'arcade',
	},
};

const game = new Phaser.Game(config);
