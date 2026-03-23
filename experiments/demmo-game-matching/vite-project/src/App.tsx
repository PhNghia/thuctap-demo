import "./App.css";
import MatchingGameDemo from "./components/MatchingGameDemo";
import { sampleCards } from "./data";

function App() {
  return (
    <div className="App">
      <MatchingGameDemo cardsData={sampleCards} />
    </div>
  );
}

export default App;
