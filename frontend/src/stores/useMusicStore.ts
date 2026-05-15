import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";
import type { Album, Song, Stats } from "@/types";
import axios from "axios";
import toast from "react-hot-toast";

const getErrorMessage = (error: unknown): string => {
  return axios.isAxiosError(error)
    ? error.response?.data?.message || "Something went wrong"
    : "Something went wrong";
};

interface MusicStore {
  songs: Song[];
  albums: Album[];
  isLoading: boolean;
  error: string | null;
  currentAlbum: Album | null;
  featuredSongs: Song[];
  madeForYouSongs: Song[];
  trendingSongs: Song[];
  stats: Stats;

  fetchAlbums: () => Promise<void>;
  fetchAlbumById: (id: string) => Promise<void>;
  fetchFeaturedSongs: () => Promise<void>;
  fetchMadeForYouSongs: () => Promise<void>;
  fetchTrendingSongs: () => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchSongs: () => Promise<void>;
  deleteAlbum: (id: string) => Promise<void>;
  deleteSong: (id: string) => Promise<void>;
  addSong: (formData: FormData) => Promise<void>;
  addAlbum: (formData: FormData) => Promise<void>;
}

export const useMusicStore = create<MusicStore>((set) => ({
  albums: [],
  currentAlbum: null,
  songs: [],
  isLoading: false,
  error: null,
  featuredSongs: [],
  madeForYouSongs: [],
  trendingSongs: [],
  stats: {
    totalSongs: 0,
    totalAlbums: 0,
    totalUsers: 0,
    totalArtists: 0,
  },
  addAlbum: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.post("/admin/albums", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      set((state) => ({
        albums: [res.data, ...state.albums],
      }));
    } catch (error) {
      set({ error: getErrorMessage(error) });
    } finally {
      set({ isLoading: false });
    }
  },

  addSong: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.post("/admin/songs", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      set((state) => ({
        //to doda nowa piosenke na poczatek tablicy, jezeli byloby na poczatku ... to nowa piosenka bylaby na koncu
        songs: [res.data, ...state.songs],
      }));
    } catch (error) {
      set({ error: getErrorMessage(error) });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteAlbum: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await axiosInstance.delete(`/admin/albums/${id}`);
      //!to state to jest cały aktualny store
      set((state) => ({
        albums: state.albums.filter((album) => album._id !== id),
        songs: state.songs.filter((song) => song.albumId !== id),
      }));
      toast.success("You've deleted album successfully");
    } catch (error) {
      set({ error: getErrorMessage(error) });
    } finally {
      set({ isLoading: false });
    }
  },
  deleteSong: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await axiosInstance.delete(`/admin/songs/${id}`);
      set((state) => ({
        songs: state.songs.filter((song) => song._id !== id),
      }));
      toast.success("You've deleted song successfully");
    } catch (error) {
      set({ error: getErrorMessage(error) });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get("/stats");
      //!backend zwraca to samo co stats wiec mozemy tak od razu zrobic
      set({ stats: res.data });
    } catch (error) {
      set({ error: getErrorMessage(error) });
    } finally {
      set({ isLoading: false });
    }
  },
  fetchSongs: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get("/songs");
      set({ songs: res.data });
    } catch (error) {
      set({ error: getErrorMessage(error) });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAlbums: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get("/albums");
      set({ albums: res.data });
    } catch (error) {
      set({ error: getErrorMessage(error) });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAlbumById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get(`/albums/${id}`);
      set({ currentAlbum: res.data });
    } catch (error) {
      set({ error: getErrorMessage(error) });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchFeaturedSongs: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get("/songs/featured");
      set({ featuredSongs: res.data });
    } catch (error) {
      set({ error: getErrorMessage(error) });
    } finally {
      set({ isLoading: false });
    }
  },
  fetchMadeForYouSongs: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get("/songs/made-for-you");
      set({ madeForYouSongs: res.data });
    } catch (error) {
      set({ error: getErrorMessage(error) });
    } finally {
      set({ isLoading: false });
    }
  },
  fetchTrendingSongs: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get("/songs/trending");
      set({ trendingSongs: res.data });
    } catch (error) {
      set({ error: getErrorMessage(error) });
    } finally {
      set({ isLoading: false });
    }
  },
}));
