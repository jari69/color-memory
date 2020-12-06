import React, { Component } from 'react'
import '../css/card.css';

export class Card extends Component {
    render() {
        const {color} = this.props;

        return (
            <div className={`rectangle ${this.props.isFlipped ? color : "black"}`} onClick={() => this.props.onClick(this.props.cardName)} />
        )
    }
}

export default Card
