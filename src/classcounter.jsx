import React, { Component } from "react";

class ClassCounter extends Component {
  state = { count: 0 };

  increment = () => this.setState({ count: this.state.count + 1 });
  decrement = () => this.setState({ count: this.state.count - 1 });
  reset = () => this.setState({ count: 0 });

  render() {
    return (
      <div className="card">
        <h2>Class Component</h2>
        <p className="count">Count: {this.state.count}</p>

        <div className="buttons">
          <button className="btn plus" onClick={this.increment}>+</button>
          <button className="btn minus" onClick={this.decrement}>-</button>
          <button className="btn reset" onClick={this.reset}>Reset</button>
        </div>
      </div>
    );
  }
}

export default ClassCounter;
