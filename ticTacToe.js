"use strict"

const NOBODY = 0;
const PLAYER_X = 1;
const PLAYER_O = 2;
const WidthScreen = 388;
const HeightScreen = 388;

var game;

window.onload = () => {
  var config  = {
    type: Phaser.AUTO,
    width: WidthScreen,
    height: HeightScreen,
    backgroundColor: 0xffffff,
    scene: [BootScene, PlayGameScene],
  };

  var game = new Phaser.Game(config);
}

class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }
  
  preload() {
    this.load.image('blankSquare', './assets/blankSquare.png');
    this.load.spritesheet('thePlayers', './assets/ox.png', {frameWidth: 61, frameHeight: 45})
    this.load.image('theConfety', './assets/confety.jpg');
    this.load.image('theButton', './assets/button.png');
  }
  
  create() {
    this.scene.start('PlayGameScene');
  }
}

class PlayGameScene extends Phaser.Scene {
	constructor() {
		super('PlayGameScene');
  }
  
	create() {
    let self = this;
    self.gameOver = false;
    self.whoseTurn = PLAYER_X;

    self.boardArray = [];

    let blankSquareSize = 0;     
    let halfBlankSquareSize = 40;

    let nKey = 0;
    for (let row = 0; row < 5; row++) {
        let y = halfBlankSquareSize + (blankSquareSize * row) + (row * 77);

        for (let col = 0; col < 5; col++) {
            let x = halfBlankSquareSize + (blankSquareSize * col) + (col * 77);

            let blankSquare = self.add.image(x,y, 'blankSquare' ).setScale(3);
  
            blankSquare.myKey = nKey++;

            blankSquare.setInteractive();
            blankSquare.on('pointerdown', self.handleClick);

            self.boardArray.push({
              occupiedBy: NOBODY,
              playerSprite: null,
            });
        }
      }

      self.whoseTurnIsIt();
    }
   
  handleClick(event) {
    let offset = this.myKey;
    let owner = this.scene;

    if (owner.gameOver) {
      return true;
    }

    let occupiedBy = owner.boardArray[offset].occupiedBy;

    let playerSprite;
    if (occupiedBy == NOBODY) {
      if(owner.whoseTurn == PLAYER_X) {
        playerSprite = owner.add.sprite(this.x, this.y, 'thePlayers', 1)
        
        occupiedBy = PLAYER_X;
      } else {
        playerSprite = owner.add.sprite(this.x, this.y, 'thePlayers', 0)
        
        occupiedBy = PLAYER_O;
      }

      owner.boardArray[offset].occupiedBy = occupiedBy;

      owner.boardArray[offset].playerSprite = playerSprite;
      owner.checkForWinner(owner.whoseTurn)

      if (owner.whoseTurn == PLAYER_X) {
        owner.whoseTurn = PLAYER_O;
      } else {
        owner.whoseTurn = PLAYER_X
      }
    }

		owner.whoseTurnIsIt();
  }

  whoseTurnIsIt(){
    let x = this.game.config.width / 2;
    let y = this.game.config.height / 2;
    let t;

    if (this.whoseTurn == PLAYER_X) {
			t = "Вы";
		} else {
			t = "ИИ";
		}
		
		let label = this.add.text(x, y, t, { fontSize: '60px Arial', fill: 'green' });
		label.setOrigin(0.5, 0.5);

		this.tweens.add({
			targets: label, 
			alpha: 0,
			ease: 'Power1',
			duration: 1000, 
		});
  }

  checkForWinner(playerID) {
    let possibleWins = [
      [0,1,2,3,4],
      [5,6,7,8,9],
      [10,11,12,13,14],
      [15,16,17,18,19],
      [20,21,22,23,24],
      [0,6,12,18,24],
      [1,6,11,16,21],
      [2,7,12,17,22],
      [3,8,13,18,23],
      [4,9,14,19,24],
      [4,8,12,16,20]
    ];

    for (let line = 0; line < possibleWins.length; line++) {
      let wineLine = possibleWins[line];

      if ((this.boardArray[wineLine[0]].occupiedBy == playerID) &&
          (this.boardArray[wineLine[1]].occupiedBy == playerID) && 
          (this.boardArray[wineLine[2]].occupiedBy == playerID) &&
          (this.boardArray[wineLine[3]].occupiedBy == playerID) &&
          (this.boardArray[wineLine[4]].occupiedBy == playerID)) {
            this.broadcastWinner(playerID, wineLine);
            return true;
      }
    }


    let movesLeft = false;
    for (let n = 0; n < this.boardArray.length; n++) {
			if (this.boardArray[n].occupiedBy == NOBODY) {
        movesLeft = true;
			}
    }
    
    if(!movesLeft) {
      this.broadcastWinner(NOBODY)
    }

    return false
  }

  broadcastWinner(playerID, winLine) {
		this.gameOver = true;
		this.tweens.killAll();

		let x = this.game.config.width / 2;
		let y = this.game.config.height / 2;
    let t;

		if (playerID == PLAYER_X) {
			t = "Победа ИИ!";
		} else if (playerID == PLAYER_O) {
			t = "ПОБЕДА!!";
		} else {
			t = "НИЧЬЯ!";
		}

		let label = this.add.image(x, y, "theConfety");
    label.setOrigin(0.5, 0.5);
    
    let button = this.add.image(194, 288, 'theButton');
    button.setOrigin(0.5, 0.5)

		button.setInteractive();

		button.on('pointerdown', function() {
			this.scene.start('PlayGameScene');
		}, this);

		label = this.add.text(x, y, t, { fontSize: '78px Arial', fill: '#0F0' });
		label.setOrigin(0.5, 0.5);

		this.tweens.add({
			targets: label,
			alpha: 0,
			ease: 'Power1',
			duration: 1000,
			yoyo: true,
			repeat: -1
		});

		if (playerID != NOBODY) {
			for (let n = 0; n < winLine.length; n++) {
        let sprite = this.boardArray[winLine[n]].playerSprite;
       
				this.tweens.add({
					targets: sprite,
					angle: 360,
					ease: 'None',
					duration: 1000,
					repeat: -1
				});
			}
		}
  }
}

