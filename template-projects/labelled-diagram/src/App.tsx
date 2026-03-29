import "./App.css";
import DiagramGame from "./components/DiagramGame";
import { DIAGRAM_DATA } from "./data";

function App() {
  return <DiagramGame data={DIAGRAM_DATA} />;
}

export default App;