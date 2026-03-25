export default function ImageHints({ items, foundWords }) {
  const isImagePath = (str) => {
    return str && (str.includes("/") || /\.(jpg|jpeg|png|gif|webp)$/i.test(str));
  };

  return (
    <div className="image-hints">
      {items.map((item) => (
        <div
          key={item.word}
          className={`hint ${foundWords?.includes(item.word) ? "found-hint" : ""}`}
        >
          {isImagePath(item.image) ? (
            <img src={item.image} alt={item.word} />
          ) : (
            <div
              style={{
                fontSize: "60px",
                height: "60px",
                width: "60px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {item.image}
            </div>
          )}
          <p className={foundWords?.includes(item.word) ? "" : "hidden-word"}>
            {item.word}
          </p>
        </div>
      ))}
    </div>
  );
}
