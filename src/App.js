import React, { Component } from "react";
import Card from "./components/Card";
import { randomNumberGenerator, findNextColor } from "./helpers";
import { colors } from "./constants";
import { Col, Row, Container, Button, Modal} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import firebase from './firebase.js';

export class App extends Component {
  constructor() {
    super();
    this.state = {
      cardData: [],
      flipCount: 0,
      score: 0,
      firstPick: {},
      secondPick: {},
      show: false,
      highscores: []
    };
  }

  async componentDidMount() {
    const colorsPicked = [0, 0, 0, 0, 0, 0, 0, 0];

    for (let i = 0; i < 16; i++) {
      let pickedColor = randomNumberGenerator();
      if (pickedColor && colorsPicked[pickedColor] < 2) {
        await this.setState({
          cardData: [
            ...this.state.cardData,
            {
              [`card_${i}`]: {
                color: colors[pickedColor].color,
                isFlipped: false,
                isRemoved: false,
              },
            },
          ],
        });
        colorsPicked[pickedColor] = colorsPicked[pickedColor] + 1;
      } else {
        let newFoundColor = findNextColor(colorsPicked);
        colorsPicked[newFoundColor] = colorsPicked[newFoundColor] + 1;
        await this.setState({
          cardData: [
            ...this.state.cardData,
            {
              [`card_${i}`]: {
                color: colors[newFoundColor].color,
                isFlipped: false,
                isRemoved: false,
              },
            },
          ],
        });
      }
    }

    const leaderBoardRef = firebase.database().ref('leaderboard');
    leaderBoardRef.on('value', (snapshot) => {
      let leaders = snapshot.val();
      let newState = [];
      for (let leader in leaders) {
        newState.push({
          id: leader,
          score: leaders[leader].score,
          playerName: leaders[leader].playerName
        });
      }
      this.setState({
        highscores: [...newState]
      });
    });
  }

  resetCards = () => {
    const duplicate = this.state.cardData;

    duplicate[this.state.firstPick.key][
      `card_${this.state.firstPick.key}`
    ].isFlipped = false;
    duplicate[this.state.secondPick.key][
      `card_${this.state.secondPick.key}`
    ].isFlipped = false;

    this.setState({ cardData: duplicate });
  };

  removeCards = () => {
    const duplicate = this.state.cardData;

    duplicate[this.state.firstPick.key][
      `card_${this.state.firstPick.key}`
    ].isRemoved = true;
    duplicate[this.state.secondPick.key][
      `card_${this.state.secondPick.key}`
    ].isRemoved = true;

    this.setState({ cardData: duplicate });
  };

  // check if all are removed
  isAllRemoved = () => {
    const {cardData} = this.state;
    for(let i = 0; i < cardData.length; i ++ ) {
      // console.log(cardData[i][`card_${i}`].isRemoved);
      if(cardData[i][`card_${i}`].isRemoved === false) {
        return false;
      }
    }
    return true;
  }

  handleClick = async (key) => {
    const duplicate = this.state.cardData;
    duplicate[key][`card_${key}`].isFlipped = true;
    var playerName = '';
    //get cards that are flipped recently and compare
    await this.setState({
      cardData: [...duplicate],
      flipCount: this.state.flipCount + 1,
    });

    if (this.state.flipCount == 1) {
      await this.setState({
        firstPick: { color: duplicate[key][`card_${key}`].color, key },
      });
    } else if (this.state.flipCount == 2) {
      await this.setState({
        secondPick: { color: duplicate[key][`card_${key}`].color, key },
        flipCount: 0
      });

      if (this.state.firstPick.color === this.state.secondPick.color) {
        await this.setState({ score: this.state.score + 5 });
        
        this.removeCards();
        if(this.isAllRemoved()) {
          playerName = prompt("Enter Your Name");
          const leaderboardRef = firebase.database().ref('leaderboard');
          const leader = {
            playerName: playerName,
            score: this.state.score
          }
          leaderboardRef.push(leader);
        }
        // console.log(gamerName);
      } else {
        setTimeout(()=>{
          this.resetCards();
        }, 1000);
        this.setState({ score: this.state.score - 1 });
      }
    }

    await this.setState({ cardData: [...duplicate] });
  };

  toggleShow = () => {
    this.setState({ show: !this.state.show});
  }
  render() {
    const { cardData, show } = this.state;

    // console.log(cardData);
    return (
      <div>
        <h1>Color Memory</h1>
        <Button variant="primary" style={{float: 'right'}} onClick={this.toggleShow}>
          Highscores
        </Button>

        <Modal show={show} onHide={this.toggleShow}>
          <Modal.Header closeButton>
            <Modal.Title>HighScores</Modal.Title>
          </Modal.Header>
          <Modal.Body>

          {this.state.highscores.map((highscore) => {
            return (
              <li key={highscore.id}>
                <h3>{highscore.score}</h3>
                <p>brought by: {highscore.playerName}</p>
              </li>
            )
          })}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.toggleShow}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        <Container>
          <Row>
            {cardData
              ? cardData.map((card, key) => {
                  return (
                    //this is too long, fix me
                    <Col xs={3} lg={3} xl={3}>
                      <Card
                        color={
                          typeof card[`card_${key}`] !== "undefined"
                            ? card[`card_${key}`].color
                            : "black"
                        }
                        status={card.status}
                        onClick={this.handleClick}
                        cardName={key}
                        isFlipped={
                          typeof card[`card_${key}`] !== "undefined"
                            ? card[`card_${key}`].isFlipped
                            : false
                        }
                        isRemoved={card[`card_${key}`].isRemoved}
                      />
                    </Col>
                  );
                })
              : null}
          </Row>
        </Container>
      </div>
    );
  }
}

export default App;
