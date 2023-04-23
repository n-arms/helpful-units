import logo from './logo.svg';
import './App.css';
import { Unit } from './Unit.js';
import { useState } from 'react';

const UnitEntryField = ({
  setUnit
}) => {
  return (
    <input
      type="text"
      onChange={(e) => setUnit(e.target.value)}
    >
    </input>
  );
}

const UnitEntryButton = ({
  onClick
}) => {
  return (
    <button
      onClick={onClick}
    >
    Convert
    </button>
  );
}

const AppHeader = () => {
  return (
      <header>
        <h1
          className="title"
        >
        Helpful Units
        </h1>
        <p
          className="description"
        >
        for all your obscure unit needs
        </p>
      </header>
  );
}

function App() {
  const [unitText, setUnitText] = useState("");
  return (
    <div className="App">
      <AppHeader />
      <div
        className="input-box"
      >
        <UnitEntryField setUnit={setUnitText} />
        <UnitEntryButton onClick={() => alert(Unit.parse(unitText))} />
      </div>
    </div>
  );
}

export default App;
