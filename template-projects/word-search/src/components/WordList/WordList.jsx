export default function WordList({ words }) {
  return (
    <div className="word-list">
      {words.map(word => (
        <div key={word}>{word}</div>
      ))}
    </div>
  );
}