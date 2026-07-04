export type FontOption = {
  family: string;
  label: string;
  category: 'Популярные' | 'Гротески' | 'Антиквы' | 'Декоративные' | 'Системные';
};

export const fontOptions: FontOption[] = [
  { family: 'Montserrat, Arial, sans-serif', label: 'Montserrat', category: 'Популярные' },
  { family: 'Roboto, Arial, sans-serif', label: 'Roboto', category: 'Популярные' },
  { family: 'Open Sans, Arial, sans-serif', label: 'Open Sans', category: 'Популярные' },
  { family: 'Inter, Arial, sans-serif', label: 'Inter', category: 'Популярные' },
  { family: 'Manrope, Arial, sans-serif', label: 'Manrope', category: 'Популярные' },
  { family: 'Rubik, Arial, sans-serif', label: 'Rubik', category: 'Популярные' },
  { family: 'Nunito, Arial, sans-serif', label: 'Nunito', category: 'Популярные' },
  { family: 'PT Sans, Arial, sans-serif', label: 'PT Sans', category: 'Популярные' },
  { family: 'Noto Sans, Arial, sans-serif', label: 'Noto Sans', category: 'Популярные' },
  { family: 'Arial, Helvetica, sans-serif', label: 'Arial', category: 'Системные' },
  { family: 'Helvetica, Arial, sans-serif', label: 'Helvetica', category: 'Системные' },
  { family: 'Verdana, Geneva, sans-serif', label: 'Verdana', category: 'Системные' },
  { family: 'Tahoma, Geneva, sans-serif', label: 'Tahoma', category: 'Системные' },
  { family: 'Trebuchet MS, Arial, sans-serif', label: 'Trebuchet MS', category: 'Системные' },
  { family: 'Oswald, Arial, sans-serif', label: 'Oswald', category: 'Гротески' },
  { family: 'Ubuntu, Arial, sans-serif', label: 'Ubuntu', category: 'Гротески' },
  { family: 'Raleway, Arial, sans-serif', label: 'Raleway', category: 'Гротески' },
  { family: 'Mulish, Arial, sans-serif', label: 'Mulish', category: 'Гротески' },
  { family: 'Source Sans 3, Arial, sans-serif', label: 'Source Sans 3', category: 'Гротески' },
  { family: 'IBM Plex Sans, Arial, sans-serif', label: 'IBM Plex Sans', category: 'Гротески' },
  { family: 'Fira Sans, Arial, sans-serif', label: 'Fira Sans', category: 'Гротески' },
  { family: 'Exo 2, Arial, sans-serif', label: 'Exo 2', category: 'Гротески' },
  { family: 'Jura, Arial, sans-serif', label: 'Jura', category: 'Гротески' },
  { family: 'Cuprum, Arial, sans-serif', label: 'Cuprum', category: 'Гротески' },
  { family: 'Noto Serif, Georgia, serif', label: 'Noto Serif', category: 'Антиквы' },
  { family: 'PT Serif, Georgia, serif', label: 'PT Serif', category: 'Антиквы' },
  { family: 'Merriweather, Georgia, serif', label: 'Merriweather', category: 'Антиквы' },
  { family: 'Lora, Georgia, serif', label: 'Lora', category: 'Антиквы' },
  { family: 'Playfair Display, Georgia, serif', label: 'Playfair Display', category: 'Антиквы' },
  { family: 'IBM Plex Serif, Georgia, serif', label: 'IBM Plex Serif', category: 'Антиквы' },
  { family: 'Times New Roman, Times, serif', label: 'Times New Roman', category: 'Антиквы' },
  { family: 'Russo One, Arial, sans-serif', label: 'Russo One', category: 'Декоративные' },
  { family: 'Comfortaa, Arial, sans-serif', label: 'Comfortaa', category: 'Декоративные' },
  { family: 'Poiret One, Arial, sans-serif', label: 'Poiret One', category: 'Декоративные' },
  { family: 'Arial Black, Arial, sans-serif', label: 'Arial Black', category: 'Декоративные' },
  { family: 'Impact, Arial, sans-serif', label: 'Impact', category: 'Декоративные' },
];

export const fontCategories = ['Популярные', 'Гротески', 'Антиквы', 'Декоративные', 'Системные'] as const;
