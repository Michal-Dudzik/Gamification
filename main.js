const canvas = document.getElementById('game');
const arcadeMachine = document.getElementById('machine');
const background = document.getElementById('background');
const quiz = document.getElementById('quiz');

const button = document.getElementById('animate');
const back = document.getElementById('back');

button.addEventListener('click', moveCorridor);
back.addEventListener('click', walkBack);

function moveCorridor() {
	arcadeMachine.classList.add('move-out-machine');
	background.classList.add('move-out');

	setTimeout(() => {
		arcadeMachine.classList.remove('blur');
	}, 1200);

	setTimeout(() => {
		canvas.classList.remove('hide');
	}, 1850);
}

function walkBack() {
	arcadeMachine.classList.remove('move-out-machine');

	canvas.classList.add('hide');

	background.classList.remove('move-out');
	setTimeout(() => {
		arcadeMachine.classList.add('blur');
	}, 1300);
}
