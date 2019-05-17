import React, { Component } from 'react';
import firebase from './Firebase/Firebase';

class Scores extends Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }
  
  componentDidMount() {
    const scoresRef = firebase.database().ref('scores');
    scoresRef.on('value', (snapshot) => {
      this.updateScores(Object.values(snapshot.val()));
    });
    // base.syncState('/', {
    //   context: this,
    //   state: 'scores'
    // });
  }

  updateScores = (scores) => {
    this.setState({ scores: scores.sort((a, b) => (parseInt(a.score) > parseInt(b.score) ? -1 : 1)).slice(0, 20) });
  }

  render() {
    const { scores } = this.state;
    return (
      <div className="Scores">
        <p>Highscores : </p>
        {
          scores
          ? scores.map((score, index) => (
            <p key={`scoreId-${index + 1}`}>{score.name} : {score.score}</p>
          ))
          : null
        }
      </div>
    );
  }
}

export default Scores;
