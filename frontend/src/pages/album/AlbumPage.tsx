import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMusicStore } from "@/stores/useMusicStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Clock, Pause, Play } from "lucide-react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

export const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const AlbumPage = () => {
  const { currentAlbum, fetchAlbumById, isLoading } = useMusicStore();
  const { albumId } = useParams();
  const { currentSong, isPlaying, playAlbum, togglePlay } = usePlayerStore();

  useEffect(() => {
    if (albumId) fetchAlbumById(albumId);
  }, [fetchAlbumById, albumId]);

  if (isLoading) return null;

  const handlePlayAlbum = () => {
    if (!currentAlbum) return;
    const isCurrentAlbumPlaying = currentAlbum.songs.some(
      (song) => song._id === currentSong?._id,
    );

    if (isCurrentAlbumPlaying) togglePlay();
    else playAlbum(currentAlbum.songs, 0);
  };

  const handlePlaySong = (index: number) => {
    if (!currentAlbum) return;
    playAlbum(currentAlbum.songs, index);
  };

  return (
    <div className="h-full overflow-hidden rounded-md">
      <ScrollArea className="h-full">
        <div className="relative min-h-full">
          <div
            className="absolute inset-0 bg-linear-to-b from-[#5038a0]/80 via-zinc-900/80 to-zinc-900 pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row p-4 sm:p-6 gap-4 sm:gap-6 pb-6 sm:pb-8">
              <img
                src={currentAlbum?.imageUrl}
                alt={currentAlbum?.title}
                className="w-40 h-40 sm:w-52 sm:h-52 lg:w-60 lg:h-60 shadow-xl rounded object-cover self-center sm:self-auto shrink-0"
              />

              <div className="flex min-w-0 flex-col justify-end text-center sm:text-left">
                <p className="text-xs sm:text-sm font-medium">Album</p>
                <h1 className="text-3xl sm:text-4xl lg:text-6xl xl:text-7xl font-bold my-2 sm:my-4 break-words">
                  {currentAlbum?.title}
                </h1>
                <div className="flex flex-wrap justify-center sm:justify-start items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-zinc-100">
                  <span className="font-medium text-white">
                    {currentAlbum?.artist}
                  </span>
                  <span>• {currentAlbum?.songs.length} songs</span>
                  <span>• {currentAlbum?.releaseYear}</span>
                </div>
              </div>
            </div>

            <div className="px-4 sm:px-6 pb-4 flex items-center gap-6">
              <Button
                onClick={handlePlayAlbum}
                size="icon"
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-green-500 hover:bg-green-400 hover:scale-105 transition-all"
              >
                {isPlaying &&
                currentAlbum?.songs.some(
                  (song) => song._id === currentSong?._id,
                ) ? (
                  <Pause className="h-6 w-6 sm:h-7 sm:w-7 text-black" />
                ) : (
                  <Play className="h-6 w-6 sm:h-7 sm:w-7 text-black" />
                )}
              </Button>
            </div>

            <div className="bg-black/20 backdrop-blur-sm">
              <div className="grid grid-cols-[24px_minmax(0,1fr)_72px] md:grid-cols-[24px_minmax(0,4fr)_2fr_72px] gap-3 sm:gap-4 px-4 sm:px-10 py-2 text-xs sm:text-sm text-zinc-400 border-b border-white/5">
                <div>#</div>
                <div>Title</div>
                <div className="hidden md:block">Released Date</div>
                <div className="flex justify-end md:justify-start">
                  <Clock className="h-4 w-4" />
                </div>
              </div>

              <div className="px-2 sm:px-6">
                <div className="space-y-1 py-3 sm:py-4">
                  {currentAlbum?.songs.map((song, index) => {
                    const isCurrentSong = currentSong?._id === song._id;

                    return (
                      <div
                        key={song._id}
                        onClick={() => handlePlaySong(index)}
                        className="grid grid-cols-[24px_minmax(0,1fr)_72px] md:grid-cols-[24px_minmax(0,4fr)_2fr_72px] gap-3 sm:gap-4 px-2 sm:px-4 py-2 text-xs sm:text-sm text-zinc-400 hover:bg-white/5 rounded-md group cursor-pointer"
                      >
                        <div className="flex items-center justify-center">
                          {isCurrentSong && isPlaying ? (
                            <div className="size-4 text-green-500">♬</div>
                          ) : (
                            <span className="group-hover:hidden">
                              {index + 1}
                            </span>
                          )}
                          {!isCurrentSong && (
                            <Play className="h-4 w-4 hidden group-hover:block" />
                          )}
                        </div>

                        <div className="flex min-w-0 items-center gap-3">
                          <img
                            src={song.imageUrl}
                            alt={song.title}
                            className="size-10 rounded object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-medium text-white truncate">
                              {song.title}
                            </div>
                            <div className="truncate">{song.artist}</div>
                          </div>
                        </div>

                        <div className="hidden md:flex items-center">
                          {song.createdAt.split("T")[0]}
                        </div>

                        <div className="flex items-center justify-end md:justify-start">
                          {formatDuration(song.duration)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default AlbumPage;
