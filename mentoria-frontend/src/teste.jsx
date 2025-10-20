// src/Teste.jsx
import React, { useState } from 'react';

export default function Teste() {
  const [count, setCount] = useState(0);
  return (
    <div style={{ padding: 40 }}>
      <h1>Count: {count}</h1>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}
