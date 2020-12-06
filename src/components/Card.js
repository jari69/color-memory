import React, { Component } from "react";
import "../css/card.css";

export class Card extends Component {
  computeColor = () => {
      if(this.props.isFlipped) {
          if (this.props.isRemoved) {
            return "white";
          }
          return this.props.color;
      }
      else {
          return "black";
      }
  };

  render() {
    const { color } = this.props;

    return (
      <div
        className={`rectangle ${this.computeColor()}`}
        onClick={() => this.props.onClick(this.props.cardName)}
      />
    );
  }
}

export default Card;
