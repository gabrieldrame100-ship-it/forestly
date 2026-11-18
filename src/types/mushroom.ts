import { ImageSourcePropType } from 'react-native';

export type Category = 'edible' | 'inedible' | 'poisonous';

export type Habitat = 'coniferous' | 'deciduous' | 'mixed' | 'meadow' | 'deadwood';

export type Mushroom = {
  id: string;
  polishName: string;
  latinName: string;
  category: Category;
  description: string;
  habitats: Habitat[];
  seasonFrom: number; // month 1-12
  seasonTo: number; // month 1-12
  cap: string;
  stem: string;
  hymenophore: string;
  funFacts: string[];
  similar: string[]; // ids of similar-looking species
  warning?: string;
  image?: ImageSourcePropType;
};