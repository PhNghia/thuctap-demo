import { Play, Pause, BookOpen, Volume2, VolumeX } from "lucide-react";

type Props = {
  isPlaying: boolean;
  isMuted: boolean;
  onPlayPause: () => void;
  onRestart: () => void;
  onOpenGuide: () => void;
  onToggleMute: () => void;
};

export default function GameControls({
  isPlaying,
  isMuted,
  onPlayPause,
  onOpenGuide,
  onToggleMute
}: Props) {
  return (
    <div className="controls">
      <button className="game-btn btn-play" onClick={onPlayPause}>
        {isPlaying ? <Pause /> : <Play />}
      </button>

      {/* <button className="game-btn btn-restart" onClick={onRestart}>
        <RotateCcw />
      </button> */}

      {/* Mute / Unmute */}
      <button className={`game-btn btn-mute ${isMuted ? 'active' : ''}`} onClick={onToggleMute}>
        {isMuted ? <VolumeX /> : <Volume2 />}
      </button>

      <button className="game-btn btn-guide" onClick={onOpenGuide}>
        <BookOpen />
      </button>
    </div>
  );
}