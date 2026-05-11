import { Song } from "../models/song.model.js";
import { Album } from "../models/album.model.js";
import cloudinary from "../lib/cloudinary.js";
import { asyncHandler } from "../lib/utils.js";

const uploadToCloudinary = async (file) => {
  try {
    //! temp tempFilePath -> to jest ściezka do pliku. jezeli dalbym samo file to bedzie error, bo file to jest caly obiekt
    const res = await cloudinary.uploader.upload(file.tempFilePath, {
      resource_type: "auto",
    });
    //github
    return {
      url: res.secure_url,
      publicId: res.public_id,
    };
  } catch (error) {
    console.log("Error in uploadToCloudinary", error);
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

export const createSong = asyncHandler(async (req, res) => {
  //jezeli nie wysaleno plikow to blad
  if (!req.files || !req.files.audioFile || !req.files.imageFile) {
    return res.status(400).json({ message: "Please upload all files" });
  }

  const { title, artist, albumId, duration } = req.body;

  //github
  if (!title || !artist) {
    return res.status(400).json({ message: "Missing fields" });
  }

  //? to jest od express-fileupload dzieki temu mamy dostep do plikow z fronta. Bez tego nie moglibysmy zrobic req.files i req.files.audioFile. Chyba, ze bysmy we froncie zapisali to jako dataURL i wzieli to z req.body. Czyli ten zapis zwraca obiekt naszego przeslanego pliku, ktory we froncie nazywa sie audioFile lub imageFile i zapisujemy go do zmiennej. Pozniej sciezka do tego pliku, ktory jest plikiem na dysku tymczasowym jest pod audiofile.tempFilePath lub imageFile.tempFilePath.
  const audioFile = req.files.audioFile;
  const imageFile = req.files.imageFile;

  const audioUrl = await uploadToCloudinary(audioFile);
  const imageUrl = await uploadToCloudinary(imageFile);

  const song = await Song.create({
    title,
    artist,
    audioUrl: audioUrl.url,
    audioPublicId: audioUrl.publicId,
    imageUrl: imageUrl.url,
    imagePublicId: imageUrl.publicId,
    duration,
    albumId: albumId || null,
  });

  if (albumId) {
    await Album.findByIdAndUpdate(albumId, {
      $push: { songs: song._id },
    });
  }
  res.status(201).json(song);
});

export const deleteSong = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const song = await Song.findById(id);
  if (!song) {
    return res.status(404).json({ message: "Song not found" });
  }

  //cloudinary
  await cloudinary.uploader.destroy(song.imagePublicId);
  //!video bo cloudinary tak to klasyfikuje
  await cloudinary.uploader.destroy(song.audioPublicId, {
    resource_type: "video",
  });
  //git
  if (song.albumId) {
    await Album.findByIdAndUpdate(song.albumId, {
      $pull: { songs: song._id },
    });
  }

  await Song.findByIdAndDelete(id);
  res.status(200).json({ message: "Song deleted successfully" });
});

export const createAlbum = asyncHandler(async (req, res) => {
  if (!req.files || !req.files.imageFile) {
    return res.status(400).json({ message: "Please upload all files" });
  }
  const imageFile = req.files.imageFile;

  const { title, artist, releaseYear } = req.body;
  if (!title || !artist || !releaseYear) {
    return res.status(404).json({ message: "All fields are required" });
  }
  const imageUrl = await uploadToCloudinary(imageFile);

  const album = await Album.create({
    artist,
    title,
    imageUrl: imageUrl.url,
    imagePublicId: imageUrl.publicId,
    releaseYear,
  });
  res.status(201).json(album);
});

export const deleteAlbum = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const album = await Album.findById(id);
  if (!album) {
    return res.status(404).json({ message: "Album not found" });
  }
  //usuniecie piosenek
  const songs = await Song.find({ albumId: album._id });
  const imageIds = songs.map((s) => s.imagePublicId);
  const audioIds = songs.map((s) => s.audioPublicId);

  const tasks = [];

  if (imageIds.length > 0) {
    tasks.push(cloudinary.api.delete_resources(imageIds));
  }

  if (audioIds.length > 0) {
    tasks.push(
      cloudinary.api.delete_resources(audioIds, {
        resource_type: "video",
      }),
    );
  }

  await Promise.all(tasks);

  await Song.deleteMany({ albumId: album._id });

  await cloudinary.uploader.destroy(album.imagePublicId);
  await Album.findByIdAndDelete(id);
  res.status(200).json("Album deleted Successfully");
});

export const checkAdmin = asyncHandler(async (req, res) => {
  res.status(200).json({ admin: true });
});
