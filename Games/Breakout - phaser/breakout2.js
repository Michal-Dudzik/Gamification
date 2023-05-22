class Breakout extends Phaser.Scene {
	constructor() {
		super({ key: 'breakout' });

		this.bricks;
		this.paddle;
		this.balls;
		this.lives = 3;
		this.gameOver = false;
		this.ballSpeedBoostActive = false;
		this.multiBallActive = false;
		this.startText;
		this.gameOverText;
		this.pressToRestartText;
		this.score = 0;
		this.scoreText;
		this.startTime = 0;
	}

	preload() {
		this.load.image('ball', 'assets/images/ball1.png');
		this.load.image('paddle', 'assets/images/paddle1.png');
		this.load.image('blue', 'assets/images/blue1.png');
		this.load.image('red', 'assets/images/red1.png');
		this.load.image('green', 'assets/images/green1.png');
		this.load.image('yellow', 'assets/images/yellow1.png');
		this.load.image('silver', 'assets/images/silver1.png');
		this.load.image('purple', 'assets/images/purple1.png');
		this.load.image('heart', 'assets/images/heart.png');
	}

	create() {
		//  Enable world bounds, but disable the floor
		this.physics.world.setBoundsCollision(true, true, true, false);

		//  Create the bricks in a 10x6 grid
		this.bricks = this.physics.add.staticGroup();

		const brickFrames = ['blue', 'red', 'green', 'yellow', 'silver', 'purple'];

		for (let i = 0; i < 10; i++) {
			for (let j = 0; j < 6; j++) {
				const x = 112 + i * 64;
				const y = 50 + j * 32;

				const brickFrame = brickFrames[j % brickFrames.length];

				const brick = this.bricks.create(x, y, brickFrame);

				brick.setOrigin(0, 0);
				brick.refreshBody();
			}
		}

		this.scoreText = this.add.text(20, 20, 'Score: 0', {
			fontSize: '24px',
			fill: '#fff',
		});

		this.hearts = this.add.group();
		const heartSpacing = 50; // Spacing between hearts
		const heartX = 30; // X position of the first heart
		const heartY = this.sys.game.config.height - 40; // Y position of the hearts

		for (let i = 0; i < 3; i++) {
			const heart = this.add.image(heartX + i * heartSpacing, heartY, 'heart');
			heart.setScale(0.1);
			this.hearts.add(heart);
		}

		this.ball = this.physics.add
			.image(400, 500, 'ball')
			.setCollideWorldBounds(true)
			.setBounce(1);
		this.ball.setData('onPaddle', true);

		// this.balls = this.physics.add.group({
		// 	key: 'ball',
		// 	repeat: 0,
		// 	setXY: { x: 400, y: 500, stepX: 0, stepY: 0 },
		// 	bounceX: 1,
		// 	bounceY: 1,
		// 	collideWorldBounds: true,
		// });

		// this.balls.children.iterate((ball) => {
		// 	ball.setData('onPaddle', true);
		// });

		this.paddle = this.physics.add.image(400, 550, 'paddle').setImmovable();

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
					this.startText.destroy();
					this.startTime = this.time.now;
				}
			},
			this
		);

		// Create the start text
		this.startText = this.add.text(
			this.game.config.width / 2,
			this.game.config.height / 2,
			'Press left mouse button to start',
			{
				font: '32px Arial',
				fill: '#ffffff',
				align: 'center',
			}
		);
		this.startText.setOrigin(0.5);
	}

	hitBrick(ball, brick) {
		brick.disableBody(true, true);

		if (this.bricks.countActive() === 0 && this.lives > 0) {
			this.showWinMessage();
		} else if (this.bricks.countActive() === 0) {
			this.resetLevel();
		}

		this.score += 10;
		this.scoreText.setText('Score: ' + this.score);
	}

	resetBall() {
		this.ball.setVelocity(0);
		this.ball.setPosition(this.paddle.x, 500);
		this.ball.setData('onPaddle', true);
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
		if (this.ball.y > 600 && this.lives > 0 && !this.gameOver) {
			this.loseLife();
		}
	}

	loseLife() {
		this.lives--;

		// Show or hide hearts based on the remaining lives
		this.hearts.getChildren().forEach((heart, index) => {
			heart.visible = index < this.lives;
		});

		if (this.lives === 0) {
			this.gameOverFunction();
		} else {
			this.resetBall();
		}
	}

	gameOverFunction() {
		const finalScore = this.calculateScore();
		// Show the "Game Over" text or perform other game over actions
		this.gameOverText = this.add.text(
			this.sys.game.config.width / 2,
			this.sys.game.config.height / 2,
			'Game Over',
			{
				fontSize: '48px',
				fill: '#fff',
				align: 'center',
			}
		);
		this.gameOverText.setOrigin(0.5);

		const scoreText = this.add.text(
			this.sys.game.config.width / 2,
			this.sys.game.config.height / 2 + 50,
			'Score: ' + finalScore,
			{
				fontSize: '32px',
				fill: '#fff',
			}
		);
		scoreText.setOrigin(0.5);

		this.pressToRestartText = this.add.text(
			this.sys.game.config.width / 2,
			this.sys.game.config.height / 2 + 75,
			'Press left mouse button to restart',
			{
				fontSize: '24px',
				fill: '#fff',
				align: 'center',
			}
		);

		this.pressToRestartText.setOrigin(0.5);

		// Enable input to restart the game
		this.input.on(
			'pointerdown',
			function (pointer) {
				this.resetGame();
			},
			this
		);
	}

	showWinMessage() {
		const finalScore = this.calculateScore();
		this.gameOverText = this.add.text(
			this.game.config.width / 2,
			this.game.config.height / 2,
			'You Win!',
			{
				fontSize: '48px',
				fill: '#fff',
			}
		);
		this.gameOverText.setOrigin(0.5);

		const scoreText = this.add.text(
			this.sys.game.config.width / 2,
			this.sys.game.config.height / 2 + 50,
			'Score: ' + finalScore,
			{
				fontSize: '32px',
				fill: '#fff',
			}
		);
		scoreText.setOrigin(0.5);

		this.pressToRestartText = this.add.text(
			this.sys.game.config.width / 2,
			this.sys.game.config.height / 2 + 75,
			'Press left mouse button to restart',
			{
				fontSize: '24px',
				fill: '#fff',
				align: 'center',
			}
		);

		this.pressToRestartText.setOrigin(0.5);

		this.input.once('pointerup', this.resetGame, this);
	}

	resetGame() {
		this.scene.restart();
		this.lives = 3;
		this.gameOver = false;
		this.score = 0;
		this.startTime = this.time.now;
	}

	calculateScore() {
		const currentTime = this.time.now;
		const elapsedTime = currentTime - this.startTime;
		const timeBonus = Math.floor(100000 / elapsedTime); // Adjust the bonus formula as needed
		const bonusMultiplier = this.ballSpeedBoostActive ? 2 : 1; // Increase the multiplier if the ball speed boost is active

		return (this.score + timeBonus + this.lives * 10) * bonusMultiplier;
	}

	activateMultiBall() {
		if (!this.multiBallActive) {
			this.multiBallActive = true;

			// Create additional balls
			const numBalls = 2; // Adjust the number of additional balls as desired
			for (let i = 0; i < numBalls; i++) {
				const ball = this.balls
					.create(400, 500, 'ball')
					.setCollideWorldBounds(true)
					.setBounce(1);
				ball.setData('onPaddle', true);
			}

			// Add a time delay to the multi-ball bonus
			this.bonusTimer = this.time.delayedCall(
				10000,
				this.deactivateMultiBall,
				[],
				this
			);
		}
	}

	deactivateMultiBall() {
		this.multiBallActive = false;
		this.balls.children.each((ball) => {
			if (ball.getData('onPaddle')) {
				ball.setVelocityY(-300); // Adjust the initial ball speed as desired
				ball.setData('onPaddle', false);
			}
		});
	}

	activateBallSpeedBoost() {
		if (!this.ballSpeedBoostActive) {
			this.ballSpeedBoostActive = true;

			// Increase the velocity of all balls
			this.balls.children.each((ball) => {
				if (!ball.getData('onPaddle')) {
					ball.setVelocity(
						ball.body.velocity.x * 1.5,
						ball.body.velocity.y * 1.5
					); // Adjust the speed boost factor as desired
				}
			});

			// Add a time delay to the ball speed boost bonus
			this.bonusTimer = this.time.delayedCall(
				10000,
				this.deactivateBallSpeedBoost,
				[],
				this
			);
		}
	}

	deactivateBallSpeedBoost() {
		this.ballSpeedBoostActive = false;
		this.balls.children.each((ball) => {
			if (!ball.getData('onPaddle')) {
				ball.setVelocity(
					ball.body.velocity.x / 1.5,
					ball.body.velocity.y / 1.5
				);
			}
		});
	}
}

const config = {
	type: Phaser.WEBGL,
	width: 800,
	height: 600,
	parent: 'phaser-example',
	scene: [Breakout],
	physics: {
		default: 'arcade',
	},
};

const game = new Phaser.Game(config);

/////////////////////// for testing //////////////////////////
const winButton = document.getElementById('winButton');
const loseButton = document.getElementById('loseButton');
const bonus1Button = document.getElementById('bonus1Button');
const bonus2Button = document.getElementById('bonus2Button');

winButton.addEventListener('click', handleWin);
loseButton.addEventListener('click', handleLose);
bonus1Button.addEventListener('click', handleBonus1);
bonus2Button.addEventListener('click', handleBonus2);

function handleWin() {
	game.scene.scenes[0].startText.destroy();
	game.scene.scenes[0].showWinMessage();
}

function handleLose() {
	game.scene.scenes[0].startText.destroy();
	game.scene.scenes[0].gameOverFunction();
}

function handleBonus1() {
	activateBallSpeedBoost();
}

function handleBonus2() {
	activateMultiBall();
}
///////////////////////////////////////////////////////////////
