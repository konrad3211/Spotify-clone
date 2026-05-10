import { Song } from "../models/song.model.js";
import { Album } from "../models/album.model.js";
import cloudinary from "../lib/cloudinary.js";


const uploadToCloudinary = async (file) => {
  try {
    const res = await cloudinary.uploader.upload(file.tempFilePath, {
      resource_type: "auto",
    });
    
    return {
      url: res.secure_url,
      publicId: res.public_id,
    };
  } catch (error) {
    console.log("Error in uploadToCloudinary", error);
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

export const createSong = async (req, res, next) => {
  try {
    
    if (!req.files || !req.files.audioFile || !req.files.imageFile) {
      return res.status(400).json({ message: "Please upload all files" });
    }
    const { title, artist, albumId, duration } = req.body;
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
  } catch (error) {
    console.log("Error in creating song", error);
    next(error);
  }
};

export const deleteSong = async (req, res, next) => {
  try {
    const { id } = req.params;
    const song = await Song.findyById(id);

  await cloudinary.uploader.destroy(song.imagePublicId);
  await cloudinary.uploader.destroy(song.audioPublicId, {
    resource_type: "video",
  });
    
  if (song.albumId) {
    await Album.findByIdAndUpdate(song.albumId, {
      $pull: { songs: song._id },
    });
  }

    await Song.findByIdAndDelete(id);

    res.status(200).json({ message: "Song deleted successfully" });
  } catch (error) {
    console.log("Error in deleteSong", error);
    next(error);
  }
};

export const createAlbum = async (req, res, next) => {
  try {
    const { title, artist, releaseYear } = req.body;
    const { imageFile } = req.files;

    const imageUrl = await uploadToCloudinary(imageFile);

    const album = await Album.create({
      title,
      artist,
      imageUrl,
      releaseYear,
    });
    res.status(201).json(album);
  } catch (error) {
    console.log("error in createAlbum", error);
    next(error);
  }
};

export const deleteAlbum = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Song.deleteMany({ albumId: id });
    await Album.findByIdAndDelete(id);
    res.status(200).json({ message: "Album deleted successfully" });
  } catch (error) {
    console.log("Error in deleteAlbum", error);
    next(error);
  }
};

export const checkAdmin = async (req, res, next) => {
  res.status(200).json({ admin: true });
};
