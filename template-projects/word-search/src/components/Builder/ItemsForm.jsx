import "../../styles/grid.css"; 
export default function ItemsForm({
  items,
  setItems,
  handleItemImage,
  handleAddCard
}) {
  return (
    <div className="section">

  {/* TITLE */}
  <h3 className="section-title">🧩 Items</h3>

  <div className="cards-container">

    {items.map((item, index) => (
      <div key={index} className="card">

        {/* HEADER */}
        <div className="card-header">
          <span>Item {index + 1}</span>

          <button
            className="delete-btn"
            onClick={() => {
              setItems(items.filter((_, i) => i !== index));
            }}
          >
            ✖
          </button>
        </div>

        {/* WORD */}
        <input
          className="word-input"
          value={item.word}
          onChange={(e) => {
            const newItems = [...items];
            newItems[index].word = e.target.value.toUpperCase();
            setItems(newItems);
          }}
          placeholder="Enter word"
        />

        {/* DROP ZONE */}
        <div
          className="drop-zone item-upload"
          onClick={() => document.getElementById(`file-${index}`).click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (!file) return;
            handleItemImage(file, index);
          }}
        >
          {item.image ? (
            <img src={item.image} alt="preview" />
          ) : (
            <p>Drop image or click</p>
          )}
        </div>

        {/* HIDDEN INPUT */}
        <input
          id={`file-${index}`}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files[0];
            if (!file) return;
            handleItemImage(file, index);
          }}
        />

      </div>
    ))}

    {/* ADD BUTTON */}
    <button className="add-card-btn" onClick={handleAddCard}>
      + Add Item
    </button>

  </div>
</div>
  );
}