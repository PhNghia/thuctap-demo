import "../../styles/grid.css"; 
export default function BackgroundUpload({ background, onUpload }) {
  return (
    <div className="section">
      <h3 className="section-title">🎨 Background</h3>

      <div
        className="drop-zone bg-upload"
        onClick={() => document.getElementById("bg-input").click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (file) onUpload(file);
        }}
      >
        {background ? (
          <img src={background} alt="bg" />
        ) : (
          <p>Drop background</p>
        )}
      </div>

      <input
        id="bg-input"
        type="file"
        hidden
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) onUpload(file);
        }}
      />
    </div>
  );
}