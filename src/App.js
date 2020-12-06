import React, { Component } from 'react';
import Card from './components/Card';
import { randomNumberGenerator, findNextColor } from './helpers';
import { colors } from './constants';

export class App extends Component {
  constructor() {
    super();
    //colors are red,blue,green,orange,black,purple,yellow,pink
    this.state = {
      cardData: []
    }
  }

  async componentDidMount() {
    const colorsPicked = [0,0,0,0,0,0,0,0];

    for (let i = 0; i < 16; i++) {
      let pickedColor = randomNumberGenerator();
      if(pickedColor && colorsPicked[pickedColor] < 2) {
        await this.setState({ cardData: [...this.state.cardData, { [`card_${i}`]: { color: colors[pickedColor].color } }] })
        colorsPicked[pickedColor] = colorsPicked[pickedColor] + 1;
      } else {
        let newFoundColor = findNextColor(colorsPicked);
        colorsPicked[newFoundColor] = colorsPicked[newFoundColor] + 1;
        await this.setState({ cardData: [...this.state.cardData, { [`card_${i}`]: { color: colors[newFoundColor].color } }] })
      }
      
    }

    console.log('colorsPicked output:', colorsPicked);
  }

  render() {
    return (
      <div>
        <h1>Color Memory</h1>
        <Card />
      </div>
    )
  }
}

export default App
