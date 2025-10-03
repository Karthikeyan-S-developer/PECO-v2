import { FileText, Download, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";

interface FilePreviewProps {
  url: string;
  fileName: string;
  fileType: string;
  isOwn: boolean;
}

const FilePreview = ({ url, fileName, fileType, isOwn }: FilePreviewProps) => {
  const isImage = fileType.startsWith('image/');
  const isVideo = fileType.startsWith('video/');
  const isAudio = fileType.startsWith('audio/');
  const isPDF = fileType === 'application/pdf';

  const handleDownload = () => {
    window.open(url, '_blank');
  };

  // Shared audio player state (declared at top-level so hooks order stays consistent)
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (!isAudio) return;
    const el = audioRef.current;
    if (!el) return;

    const onLoaded = () => setDuration(el.duration || 0);
    const onTime = () => setCurrentTime(el.currentTime || 0);

    el.addEventListener('loadedmetadata', onLoaded);
    el.addEventListener('timeupdate', onTime);

    return () => {
      el.removeEventListener('loadedmetadata', onLoaded);
      el.removeEventListener('timeupdate', onTime);
    };
  }, [url, isAudio]);

  if (isImage) {
    return (
      <div className="space-y-2 w-full">
        <img
          src={url}
          alt={fileName}
          className="w-full max-w-full max-h-64 rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => window.open(url, '_blank')}
        />
        <p className={`text-xs truncate ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
          {fileName}
        </p>
      </div>
    );
  }

  if (isVideo) {
    return (
      <div className="space-y-2 w-full">
        <video
          src={url}
          controls
          className="w-full max-w-full max-h-64 rounded-lg"
          preload="metadata"
        >
          Your browser does not support video playback.
        </video>
        <p className={`text-xs truncate ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
          {fileName}
        </p>
      </div>
    );
  }

  if (isAudio) {
    const togglePlay = () => {
      const el = audioRef.current;
      if (!el) return;
      if (el.paused) {
        el.play().catch(() => {});
        setIsPlaying(true);
      } else {
        el.pause();
        setIsPlaying(false);
      }
    };

    const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
      const el = audioRef.current;
      if (!el) return;
      const pct = Number(e.target.value);
      const time = (pct / 100) * duration || 0;
      el.currentTime = time;
      setCurrentTime(time);
    };

    const progress = duration ? (currentTime / duration) * 100 : 0;

    const fmt = (t: number) => {
      if (!t || isNaN(t)) return '0:00';
      const m = Math.floor(t / 60);
      const s = Math.floor(t % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
    };

    return (
      <div className="w-full max-w-xs">
        <div className={`flex items-center gap-3 p-2 rounded-lg border ${isOwn ? 'bg-primary-foreground/5 border-primary-foreground/10' : 'bg-muted/50 border-border/50'}`}>
          <audio ref={audioRef} src={url} preload="metadata" className="hidden" />

          <Button
            size="sm"
            variant="ghost"
            onClick={togglePlay}
            className={isOwn ? 'text-primary-foreground' : ''}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>

          <div className="flex-1 min-w-0">
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(progress)}
              onChange={seek}
              className="w-full h-1 appearance-none bg-border/40 rounded-full accent-primary cursor-pointer"
            />
            <div className="flex items-center justify-between text-xs mt-1">
              <p className={`truncate ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'} mr-2`}>{fileName}</p>
              <p className="text-muted-foreground">{fmt(currentTime)} / {fmt(duration)}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isPDF) {
    return (
      <div
        className={`flex items-center gap-3 p-3 rounded-lg border ${
          isOwn ? 'bg-primary-foreground/10 border-primary-foreground/20' : 'bg-muted/50 border-border/50'
        }`}
      >
        <FileText className="w-8 h-8 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${isOwn ? 'text-primary-foreground' : 'text-foreground'}`}>
            {fileName}
          </p>
          <p className={`text-xs ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
            PDF Document
          </p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleDownload}
          className={isOwn ? 'text-primary-foreground hover:bg-primary-foreground/10' : ''}
        >
          <Download className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  // Generic file preview
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border ${
        isOwn ? 'bg-primary-foreground/10 border-primary-foreground/20' : 'bg-muted/50 border-border/50'
      }`}
    >
      <FileText className="w-8 h-8 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isOwn ? 'text-primary-foreground' : 'text-foreground'}`}>
          {fileName}
        </p>
        <p className={`text-xs ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
          {fileType.split('/')[1]?.toUpperCase() || 'File'}
        </p>
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleDownload}
        className={isOwn ? 'text-primary-foreground hover:bg-primary-foreground/10' : ''}
      >
        <Download className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default FilePreview;
