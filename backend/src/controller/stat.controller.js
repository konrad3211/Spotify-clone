import { Song } from "../models/song.model.js";
import { Album } from "../models/album.model.js";
import { User } from "../models/user.model.js";
export const getStats = async (req, res, next) => {
  try {
    //!to jest to samo co nizej, tylko to nizej jest szybsze i lepsze i piekniejsze
    // const totalSongs = await Song.countDocuments();
    // const totalUsers = await User.countDocuments();
    // const totalAlbums = await Album.countDocuments();

    const [totalSongs, totalAlbums, totalUsers, uniqueArtists] =
      await Promise.all([
        Song.countDocuments(),
        User.countDocuments(),
        Album.countDocuments(),

        //!bierzemy wszystkie piosenki, dodajemy do nich wszystkie albumy (pipeline[] znaczy, zeby wziac te albumy jak sa, zeby nic z tego nie usuwac) patrzymy na ich pole artists, jezeli sa duplikaty to je usuwamy i liczymy. Czyli jak bedzie pusty album to go policzy jako artist.
        //*Wynik tego to nie bedzie liczba tylko tablica, która trzeba bedzie obliczyc na dole.
        Song.aggregate([
          {
            $unionWith: {
              coll: "albums",
              pipeline: [],
            },
          },
          {
            $group: {
              _id: "$artist",
            },
          },
          {
            $count: "count",
          },
        ]),
      ]);

    res.status(200).json({
      totalAlbums,
      totalSongs,
      totalUsers,
      //? I w taki sposób to mozemy elegancko policzyc
      totalArtists: uniqueArtists[0]?.count || 0,
    });
  } catch (error) {
    next(error);
  }
};
