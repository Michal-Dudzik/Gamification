// const canvas = document.getElementById('canvas');

// const ctx = canvas.getContext('2d');
// ctx.fillStyle = 'red';
// ctx.fillRect(0, 0, 800, 600);
////////////////////////////////////////////////////////////

const arcadeMachine = document.getElementById('machine');
const button = document.getElementById('animate');
const back = document.getElementById('back');
const background = document.getElementById('background');

button.addEventListener('click', moveCorridor);
back.addEventListener('click', walkBack);

function moveCorridor() {
	arcadeMachine.classList.add('move-out-machine');
	background.classList.add('move-out');

	setTimeout(() => {
		arcadeMachine.classList.remove('blur');
	}, 1200);
}

function walkBack() {
	arcadeMachine.classList.remove('move-out-machine');

	background.classList.remove('move-out');
	setTimeout(() => {
		arcadeMachine.classList.add('blur');
	}, 1300);
}
