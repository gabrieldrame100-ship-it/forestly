export type TripPhoto = { id: number; fileName: string };

export type Trip = {
  id: number;
  title: string;
  tripDate: string;
  description: string;
  speciesIds: string[];
  photos: TripPhoto[];
};

export type TripSummary = {
  id: number;
  title: string;
  tripDate: string;
  description: string;
  speciesCount: number;
  photoCount: number;
  coverPhoto: string | null;
};

export type TripInput = {
  title: string;
  tripDate: string;
  description: string;
  speciesIds: string[];
  photoFileNames: string[];
};