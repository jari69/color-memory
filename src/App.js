import React, { Component } from 'react';
import Card from './components/Card';
import { randomNumberGenerator, findNextColor } from './helpers';
import { colors } from './constants';
import { Col, Row, Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

export class App extends Component {
  constructor() {
    super();
    //colors are red,blue,green,orange,black,purple,yellow,pink
    this.state = {
      cardData: []
    }

  }

  async componentDidMount() {
    const colorsPicked = [0, 0, 0, 0, 0, 0, 0, 0];

    for (let i = 0; i < 16; i++) {
      let pickedColor = randomNumberGenerator();
      if (pickedColor && colorsPicked[pickedColor] < 2) {
        await this.setState({ cardData: [...this.state.cardData, { [`card_${i}`]: { color: colors[pickedColor].color, isFlipped: false } }] })
        colorsPicked[pickedColor] = colorsPicked[pickedColor] + 1;
      } else {
        let newFoundColor = findNextColor(colorsPicked);
        colorsPicked[newFoundColor] = colorsPicked[newFoundColor] + 1;
        await this.setState({ cardData: [...this.state.cardData, { [`card_${i}`]: { color: colors[newFoundColor].color, isFlipped: false } }] })
      }

    }

  }

  handleClick = (key) => {
    const duplicate = this.state.cardData;
    duplicate[key][`card_${key}`].isFlipped = true;
    this.setState({ cardData: [...duplicate ]});
  }

  render() {
    const { cardData } = this.state;

    // console.log(cardData);
    return (
      <div>
        <h1>Color Memory</h1>
        <Container>
          <Row>
            {
              cardData ? cardData.map((card, key) => {
                return (
                  <Col xs={3} lg={3} xl={3}><Card color={typeof card[`card_${key}`] !== 'undefined' ? card[`card_${key}`].color : "black"} status={card.status} onClick={this.handleClick} cardName={key} isFlipped={typeof card[`card_${key}`] !== 'undefined' ? card[`card_${key}`].isFlipped : false}/></Col>
                )
              }) : null
            }
          </Row>
        </Container>

      </div>
    )
  }
}

export default App
