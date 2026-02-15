import { useState, useEffect } from "react";

function FunctionalCounter() {
  const [count, setCount] = useState(0);

  useEffect(() => {}, [count]);

  return (
    <div className="card">
      <h2>Functional Component</h2>
      <p className="count">Count: {count}</p>

      <div className="buttons">
        <button className="btn plus" onClick={() => setCount(count + 1)}>+</button>
        <button className="btn minus" onClick={() => setCount(count - 1)}>-</button>
        <button className="btn reset" onClick={() => setCount(0)}>Reset</button>
      </div>
    </div>
  );
}

export default FunctionalCounter;
