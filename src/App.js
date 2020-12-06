import React, { Component } from "react";
import Card from "./components/Card";
import { randomNumberGenerator, findNextColor } from "./helpers";
import { colors } from "./constants";
import { Col, Row, Container } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

export class App extends Component {
  constructor() {
    super();
    this.state = {
      cardData: [],
      flipCount: 0,
      score: 0,
      firstPick: {},
      secondPick: {},
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

  handleClick = async (key) => {
    const duplicate = this.state.cardData;
    duplicate[key][`card_${key}`].isFlipped = true;

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
        this.setState({ score: this.state.score + 5 });

        //a function for setting isRemoved to true
        this.removeCards();
      } else {
        setTimeout(()=>{
          this.resetCards();
        }, 1000);
        this.setState({ score: this.state.score - 1 });
      }
    }

    await this.setState({ cardData: [...duplicate] });
  };

  render() {
    const { cardData } = this.state;

    // console.log(cardData);
    return (
      <div>
        <h1>Color Memory</h1>
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
