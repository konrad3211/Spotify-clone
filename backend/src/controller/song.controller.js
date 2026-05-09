import { Song } from "../models/song.model.js";

export const getAllSongs = async (req, res, next) => {
  try {
    //-1 newest to oldest
    const songs = await Song.find().sort({ createdAt: -1 });
    res.status(200).json(songs);
  } catch (error) {
    next(err);
  }
};

export const getFeaturedSongs = async (req, res, next) => {
  try {
    //!fetch 6 random songs from the database
    const songs = await Song.aggregate([
      {
        $sample: { size: 6 },
      },
      {
        // 1 oznacza chce to chce 0 ze nie chce.
        $project: {
          _id: 1,
          title: 1,
          artist: 1,
          imageUrl: 1,
          audioUrl: 1,
        },
      },
    ]);
    res.status(200).json(songs);
  } catch (error) {
    next(error);
  }
};

export const getMadeForYouSongs = async (req, res, next) => {
  try {
    //!fetch 4 random songs from the database
    const songs = await Song.aggregate([
      {
        $sample: { size: 4 },
      },
      {
        // 1 oznacza chce to chce 0 ze nie chce.
        $project: {
          _id: 1,
          title: 1,
          artist: 1,
          imageUrl: 1,
          audioUrl: 1,
        },
      },
    ]);
    res.status(200).json(songs);
  } catch (error) {
    next(error);
  }
};

export const getTrendingSongs = async (req, res, next) => {
  try {
    //!fetch 6 random songs from the database
    const songs = await Song.aggregate([
      {
        $sample: { size: 4 },
      },
      {
        // 1 oznacza chce to chce 0 ze nie chce.
        $project: {
          _id: 1,
          title: 1,
          artist: 1,
          imageUrl: 1,
          audioUrl: 1,
        },
      },
    ]);
    res.status(200).json(songs);
  } catch (error) {
    next(error);
  }
};
