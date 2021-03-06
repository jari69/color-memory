import React, { Component } from "react";
import Card from "./components/Card";
import { randomNumberGenerator, findNextColor } from "./helpers";
import { colors } from "./constants";
import { Col, Row, Container, Button, Modal, Table} from "react-bootstrap";
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
    const leaderBoardRef = firebase.database().ref('leaderboard');

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

      const descending = newState.sort((a, b) => Number(b.score) - Number(a.score));
      this.setState({
        highscores: [...descending]
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
      if(cardData[i][`card_${i}`].isRemoved === false) {
        return false;
      }
    }
    return true;
  }

  handleClick = async (key) => {
    const duplicate = this.state.cardData;
    duplicate[key][`card_${key}`].isFlipped = true;
    const leaderboardRef = firebase.database().ref('leaderboard');
    var playerName = '';
    //get cards that are flipped recently and compare
    await this.setState({
      cardData: [...duplicate],
      flipCount: this.state.flipCount + 1,
    });

    if (this.state.flipCount === 1) {
      await this.setState({
        firstPick: { color: duplicate[key][`card_${key}`].color, key },
      });
    } else if (this.state.flipCount === 2) {
      await this.setState({
        secondPick: { color: duplicate[key][`card_${key}`].color, key },
        flipCount: 0
      });

      if (this.state.firstPick.color === this.state.secondPick.color) {
        await this.setState({ score: this.state.score + 5 });
        
        this.removeCards();
        if(this.isAllRemoved()) {
          //validation is checking for duplicate names and making sure value should not be null
          while(1){
            playerName = prompt("Enter your name");
            if(playerName){
              break;
            }
          }
          const leader = {
            playerName: playerName.toLowerCase(),
            score: this.state.score
          }
          leaderboardRef.push(leader);
        }
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
    const { cardData, show, score } = this.state;

    return (
      <div>
        <Container>
          <Row className="justify-content-between mt-3">
            <h1>Color Memory</h1>
            <h2>
              Current Score:{score}
            </h2>
            <Button variant="primary" style={{float: 'right'}} onClick={this.toggleShow}>
              Highscores
            </Button>
          </Row>
        </Container>

        <Modal show={show} onHide={this.toggleShow}>
          <Modal.Header closeButton>
            <Modal.Title>Highscores</Modal.Title>
          </Modal.Header>
          <Modal.Body>

          <Table responsive>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {this.state.highscores.map((highscore, index) => {
                return ( index > 7 ? null:
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{highscore.playerName}</td>
                    <td>{highscore.score}</td>
                  </tr>
                )
              })}
            </tbody>
          </Table>

          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.toggleShow}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
        <br/>
        <br/>

        <Container>
          <Row>
            {cardData
              ? cardData.map((card, key) => {
                  return (
                    <Col xs={3} lg={3} xl={3} key={key} >
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
