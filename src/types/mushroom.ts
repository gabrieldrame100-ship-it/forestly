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
  seasonFrom: number;
  seasonTo: number;
  cap: string;
  stem: string;
  hymenophore: string;
  funFacts: string[];
  similar: string[];
  warning?: string;
  image?: ImageSourcePropType;
};