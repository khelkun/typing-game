import React, { Component } from 'react';
import Monster from './Monster';
import Player from './Player';
import Projectile from './Projectile';
import arrow from './assets/Archer/Arrow.png';

function importAll(r) {
  return r.keys().map(r);
}

const archerStand = importAll(require.context('./assets/Archer/Stand/', false, /\.(png)$/));
const zombie1 = importAll(require.context('./assets/Zombie1/animation/', false, /\.(png)$/));
const zombie2 = importAll(require.context('./assets/Zombie2/animation/', false, /\.(png)$/));
const zombie3 = importAll(require.context('./assets/Zombie3/animation/', false, /\.(png)$/));
const troll1 = importAll(require.context('./assets/Troll1/animation/', false, /\.(png)$/));
const troll2 = importAll(require.context('./assets/Troll2/animation/', false, /\.(png)$/));
const troll3 = importAll(require.context('./assets/Troll3/animation/', false, /\.(png)$/));

class GameLoop extends Component {
  constructor(props) {
    super(props);
    this.minWordLength = 3;
    this.maxWordLength = this.minWordLength + 4;
    this.players = [];
    const player = new Player();
    this.players.push(player);
    this.wordTyped = '';
    this.images = {
      'archerStand': archerStand,
      'zombie1': zombie1,
      'zombie2': zombie2,
      'zombie3': zombie3,
      'troll1': troll1,
      'troll2': troll2,
      'troll3': troll3,
    };
    this.monstersGenerationTime = Date.now();
    this.monstersGenerationSpeed = 3000;
    this.monsters = [];
    this.projectiles = [];
    this.state = {
      monsters: [],
      players: this.players,
      projectiles: [],
      word: '',
    }
  }

  componentDidMount() {
    this.gameRunning = setInterval(() =>
      this.gameLoop(), 40);
  }

  // componentWillReceiveProps(prevProps, prevState) {
  //   // const { wordTyped } = this.props;
  //   // this.monsters.find((monster, i) =>{
  //   //   if (monster.text === wordTyped){
  //   //     return this.monsters[i] = "";
  //   //   }
  //   //   return false;
  //   // })
  // }

  // killMonster = (index) => {
  //   this.monsters[index] = "";
  //   this.monstersKilled += 1;
  //   // const { updateScore } = this.props;
  //   // updateScore(1);
  // }

  gameLoop() {
    const now = Date.now();
    this.killMonster();
    // Monster generation call
    if (now - this.monstersGenerationTime > this.monstersGenerationSpeed) {
      this.monstersGenerationTime = Date.now();
      this.generateMonster();
      this.increaseDifficulty();
    }
    // Monsters move
    for (let i = 0; i < this.monsters.length; i += 1) {
      if (this.monsters[i] !== "") {
        this.monsters[i].move();
        if ((this.monsters[i].left > this.players[0].posX - 2 && this.monsters[i].left < this.players[0].posX + 2)
          && (this.monsters[i].top > this.players[0].posY - 2 && this.monsters[i].top < this.players[0].posY + 2)) {
          const { handleGameOver } = this.props;
          clearInterval(this.gameRunning);
          handleGameOver();
        }
      }
    }
    // Players actions
    for (let i = 0; i < this.players.length; i += 1) {
      this.players[i].action();
    }
    // Projectiles move
    for (let i = 0; i < this.projectiles.length; i += 1) {
      this.projectiles[i].move();
    }
    this.setState({
      monsters: this.monsters,
      players: this.players,
      projectiles: this.projectiles,
    })
  }

  killMonster() {
    const { updateScore } = this.props;
    const { word } = this.state;
    if (word !== '') {
      let score = 0;
      this.monsters.find((monster, i) => {
        for (let j = 0; j < monster.text.length; j += 1) {
          if (monster.text[j].toLowerCase() === word.toLowerCase()) {
            this.setState({ word: "" });
            score += 1;
            let projectile = new Projectile('arrow', monster.left, monster.top);
            this.projectiles.push(projectile);
            monster.text.splice(j, 1);
            if (monster.text.length === 0) {
              this.monsters[i].updateStatus('dying');
              return this.monsters[i].alive = false;
            } else {
              return this.monsters[i].updateStatus('hurt');
            }
          }
        }
        return false;
      });
      updateScore(score);
    }
  }

  increaseDifficulty() {
    this.monstersGenerationSpeed -= 10;
  }

  generateMonster() {
    let rdmType = Math.ceil(Math.random() * 100);
    if (rdmType < 80) {
      rdmType = "zombie";
    } else {
      rdmType = "troll";
    }
    let text = [];
    if (rdmType === "zombie") {
      text = [this.getWord()];
    }
    if (rdmType === "troll") {
      text = [this.getWord(), this.getWord(), this.getWord()];
    }
    if (text) {
      let monster = new Monster(text, rdmType);
      this.monsters.push(monster);
    }
  }

  getWord() {
    const { words } = this.props;
    const rdmLength = Math.floor(Math.random() * this.maxWordLength) + this.minWordLength;
    return words[rdmLength][Math.floor(Math.random() * words[rdmLength].length)];
  }

  handleChange = (event) => {
    this.setState({ word: event.target.value });
  }

  handleSubmit = (event) => {
    event.preventDefault();
    this.setState({ word: "" });
  }

  render() {
    return (
      <div>
        {
          this.players.map((player, i) => (
            <div
              key={`player-${i + 1}`}
              className='PlayerContainer'
              style={{
                top: `${player.posY - 4}%`,
                left: `${player.posX - 4}%`,
              }}>
              <img
                className='PlayerImg'
                alt='Player'
                src={this.images[player.img][player.animation]}
                style={{
                }}
              />
            </div>
          ))
        }
        {
          this.monsters.map((monster, i) => (
            <div
              key={`monsterImg-${i + 1}`}
              className='MonsterContainer'
              style={{
                left: `${monster.left}%`,
                top: `${monster.top}%`,
              }}>
              <img
                alt="Monster"
                key={`monsterImg-${i + 1}`}
                className='Monster'
                src={this.images[monster.img][monster.animation]}
                style={{
                  maxWidth: `${monster.sizeX}vw`,
                  maxHeight: `${monster.sizeY}vw`,
                  transform: `scaleX(${monster.direction})`,
                }}
              />
              {
                monster.alive
                  ? <p className='MonsterName'>
                    {
                      monster.text.map((word, i) => (
                        <span key={`wordIndex-${i + 1}`}>
                          {word}
                          {' '}
                        </span>
                      ))
                    }
                  </p>
                  : null
              }
            </div>
          ))
        }
        {
          this.projectiles.map((projectile, i) => (
            <div
              key={`projectile-${i + 1}`}
              className='ProjectileContainer'
              style={{
                top: `${projectile.top}%`,
                left: `${projectile.left}%`,
              }}>
              <img
                className='ProjectileImg'
                alt='Projectile'
                src={arrow}
                style={{
                  maxWidth: '2vw',
                  maxHeight: '2vw',
                }}
              />
            </div>
          ))
        }
        <div className="Type">
          <form onSubmit={this.handleSubmit}>
            <input className="TypeTextBox" type="text" autoFocus={true} value={this.state.word} onChange={this.handleChange} />
            <input type="submit" value="Submit" style={{ display: "none" }} />
          </form>
        </div>
      </div >
    );
  }
}

export default GameLoop;