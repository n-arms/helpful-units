import './App.css';
import { Unit, UnknownUnitError } from './Unit.js';
import { useState, useMemo, useEffect } from 'react';

const UnitEntryField = ({
  setUnit,
  unit,
  clearSimilarUnits
}) => {
  return (
    <input
      type="text"
      onChange={(e) => {
        try {
          const newUnit = Unit.parse(e.target.value);
          if (!newUnit.isEqual(unit)) {
            setUnit(newUnit);
            clearSimilarUnits();
          }
        } catch (err) {
          if (!(err instanceof UnknownUnitError)) {
            throw err;
          }
        }
      }}
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
const SimilarUnitList = ({
  similarUnits
}) => {
    const unitList = similarUnits.map(unit => {
    return (
      <div
        className="similarUnitListItem"
        key={unit.toString()}
      >
        <h2>{unit.quantity}</h2>
        <p>{unit.toString()}</p>
      </div>      
    );
  });
  
  return (
    <div
      className="similarUnitList"
    >
      {unitList}
    </div>
  );
}

const App = () => {
  const [unit, setUnit] = useState(new Unit({}, 1));
  const unitFinderWorker = useMemo(
    () => new Worker(new URL("./FindSimilarUnit.js", import.meta.url)),
    []
  );
  const [similarUnits, setSimilarUnits] = useState([]);

  useEffect(() => {
    unitFinderWorker.postMessage(unit);
  }, [unitFinderWorker, unit]);

  useEffect(() => {
    unitFinderWorker.onmessage = ({data: {basedOn, generated}}) => {
      basedOn = new Unit(basedOn.parts, basedOn.quantity);
      generated = new Unit(generated.parts, generated.quantity);
      console.log("from worker: {");
      console.log(unit);
      console.log(basedOn);
      console.log("}")
      if (basedOn.isEqual(unit)) {
        setSimilarUnits(similarUnits.concat([generated]));
      }
    }
  }, [unitFinderWorker, unit, setSimilarUnits, similarUnits])

  return (
    <div className="App">
      <AppHeader />
      <div
        className="input-box"
      >
        <UnitEntryField 
          setUnit={setUnit}
          unit={unit}
          clearSimilarUnits={() => setSimilarUnits([])} />
      </div>
      <SimilarUnitList similarUnits={similarUnits} />
    </div>
  );
}

export default App;
