export default function ImageHints({ items, foundWords }) {
  return (
    <div className="image-hints">
      {items.map((item) => (
        <div
          key={item.word}
          className={`hint ${foundWords?.includes(item.word) ? "found-hint" : ""}`}
        >
          <img src={item.image} alt={item.word} />
          <p className={foundWords?.includes(item.word) ? "" : "hidden-word"}>
            {item.word}
          </p>
        </div>
      ))}
    </div>
  );
}
