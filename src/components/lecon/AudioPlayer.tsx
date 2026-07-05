interface AudioPlayerProps {
  src: string;
}

export function AudioPlayer({ src }: AudioPlayerProps) {
  return (
    <audio controls preload="metadata" className="w-full">
      <source src={src} />
      Ton navigateur ne supporte pas la lecture audio.
    </audio>
  );
}
