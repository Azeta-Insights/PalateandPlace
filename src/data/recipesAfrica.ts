export interface RegionalDishData {
  title: string;
  alternateName?: string;
  type: 'rice' | 'curry' | 'soup' | 'seafood' | 'beef' | 'noodles' | 'pasta' | 'tacos' | 'salad' | 'dessert' | 'pastry' | 'grill';
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Dessert';
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  spiceLevel: 0 | 1 | 2 | 3 | 4 | 5;
  description: string;
  culturalBackground: string;
  ingredients: { name: string; amount: number; unit: string; notes?: string }[];
  steps: { instruction: string; tip?: string; timerMinutes?: number }[];
  substitutions: { ingredient: string; substitute: string }[];
  tips: string[];
}

export const AFRICA_DISHES: Record<string, RegionalDishData[]> = {
  NG: [
    {
      title: 'Afang Soup with Garri',
      alternateName: 'Obe Afang',
      type: 'soup',
      mealType: 'Dinner',
      prepTime: 20,
      cookTime: 40,
      servings: 5,
      difficulty: 'Medium',
      spiceLevel: 3,
      description: 'Luxurious leafy Efik soup made with finely shredded wild afang leaves, waterleaf, assorted meats, and dried stockfish in rich red palm oil.',
      culturalBackground: 'A royal ceremonial delicacy of the Efik and Ibibio people in southern Nigeria, famed for its deep earthy fragrance and nutrient richness.',
      ingredients: [
        { name: 'Afang leaves (Ukazi, finely pounded)', amount: 3, unit: 'cups' },
        { name: 'Waterleaf or spinach', amount: 4, unit: 'cups', notes: 'Washed and chopped' },
        { name: 'Assorted meats (beef, shaki, cow foot)', amount: 600, unit: 'g' },
        { name: 'Stockfish and dried catfish', amount: 200, unit: 'g', notes: 'Deboned' },
        { name: 'Ground crayfish', amount: 4, unit: 'tbsp' },
        { name: 'Red palm oil', amount: 0.75, unit: 'cup' },
        { name: 'Scotch bonnet peppers', amount: 2, unit: 'peppers', notes: 'Pounded' }
      ],
      steps: [
        { instruction: 'Season assorted meats and stockfish with onions and bouillon; boil with water until meltingly tender (30 mins).', timerMinutes: 30 },
        { instruction: 'Add red palm oil, pounded scotch bonnets, and ground crayfish to the rich meat broth; simmer for 5 minutes.', timerMinutes: 5 },
        { instruction: 'Add chopped waterleaf; cook uncovered for 3 minutes until softened and releases its natural moisture.', timerMinutes: 3 },
        { instruction: 'Stir in pounded afang leaves; lower the heat and allow to simmer gently for 5 minutes without overcooking the greens.', timerMinutes: 5 },
        { instruction: 'Serve steaming hot accompanied by soft yellow garri, fufu, or pounded yam.' }
      ],
      substitutions: [{ ingredient: 'Afang leaves', substitute: 'Dried wild okazi leaves soaked in warm water' }],
      tips: ['Pounding the afang leaves in a mortar before adding softens their tough fiber and releases their herbal aroma.']
    },
    {
      title: 'Banga Soup (Palm Fruit Extract Stew)',
      alternateName: 'Oghwo Amiedi',
      type: 'soup',
      mealType: 'Dinner',
      prepTime: 25,
      cookTime: 45,
      servings: 5,
      difficulty: 'Medium',
      spiceLevel: 3,
      description: 'Rich Delta-style soup made from fresh palm nut concentrate, flavored with beletete, oburunbebe stick, and fresh catfish.',
      culturalBackground: 'Traditional to the Urhobo and Itsekiri peoples of Delta State, typically served with yellow starch (Usi).',
      ingredients: [
        { name: 'Palm nut fruit extract concentrate', amount: 800, unit: 'g' },
        { name: 'Fresh Catfish steaks', amount: 700, unit: 'g' },
        { name: 'Banga spice mix (rohojie & oburunbebe)', amount: 2, unit: 'tbsp' },
        { name: 'Beletete leaves', amount: 1, unit: 'tbsp', notes: 'Crushed dried leaves' },
        { name: 'Dried crayfish', amount: 3, unit: 'tbsp' }
      ],
      steps: [
        { instruction: 'Boil palm nut concentrate in a clay pot with water until the rich oil begins to float to the surface (15 mins).', timerMinutes: 15 },
        { instruction: 'Add banga spice blend, crushed beletete leaves, and ground crayfish; simmer to thicken broth.', timerMinutes: 10 },
        { instruction: 'Carefully place catfish steaks into the soup; simmer gently on low heat for 15 minutes.', timerMinutes: 15 },
        { instruction: 'Serve hot in an earthenware native pot alongside warm yellow starch (usi).' }
      ],
      substitutions: [{ ingredient: 'Fresh palm nuts', substitute: 'Canned palm nut pulp (concentrate)' }],
      tips: ['Do not stir vigorously after adding catfish to keep the delicate fish steaks whole.']
    },
    {
      title: 'Asun (Spicy Peppered Goat Meat)',
      alternateName: 'Peppered Goat Bites',
      type: 'grill',
      mealType: 'Dinner',
      prepTime: 20,
      cookTime: 35,
      servings: 4,
      difficulty: 'Easy',
      spiceLevel: 5,
      description: 'Smoky, flame-roasted tender goat meat sautéed in roughly crushed habaneros, red bell peppers, and sweet onions.',
      culturalBackground: 'The king of Yoruba celebratory small chops, roasted over open embers before tossing in fiery aromatics.',
      ingredients: [
        { name: 'Bone-in goat meat (cubed)', amount: 800, unit: 'g' },
        { name: 'Coarsely blended scotch bonnets', amount: 4, unit: 'peppers' },
        { name: 'Red onions (thickly sliced)', amount: 2, unit: 'onions' },
        { name: 'Vegetable oil', amount: 3, unit: 'tbsp' },
        { name: 'Bouillon and sea salt', amount: 1, unit: 'tbsp' }
      ],
      steps: [
        { instruction: 'Season goat meat with garlic, ginger, and bouillon; roast or grill at 200°C for 25 minutes until lightly charred.', timerMinutes: 25 },
        { instruction: 'Heat oil in a wide pan; sauté sliced red onions and coarse crushed scotch bonnets for 3 minutes.', timerMinutes: 3 },
        { instruction: 'Toss roasted goat meat chunks in the sizzling spicy pepper mix until thoroughly coated and glossy (5 mins).', timerMinutes: 5 },
        { instruction: 'Serve hot with chilled drinks and sliced fresh onions.' }
      ],
      substitutions: [{ ingredient: 'Goat meat', substitute: 'Lamb shoulder or beef brisket' }],
      tips: ['Coarsely crushing peppers rather than smooth pureeing preserves the crunchy, fiery texture.']
    },
    {
      title: 'Efo Riro (Yoruba Rich Spinach Stew)',
      alternateName: 'Rich Vegetable Soup',
      type: 'soup',
      mealType: 'Dinner',
      prepTime: 20,
      cookTime: 30,
      servings: 4,
      difficulty: 'Medium',
      spiceLevel: 3,
      description: 'Lush green spinach stew simmered in a reduced bell pepper base with locust beans (iru), smoked catfish, and tender beef.',
      culturalBackground: 'A Yoruba classic whose name translates to "stirred leafy greens", always cooked with dry-rendered peppers so greens remain vibrant.',
      ingredients: [
        { name: 'Fresh spinach or shoko greens', amount: 500, unit: 'g', notes: 'Blanched and squeezed dry' },
        { name: 'Tatashe bell peppers & scotch bonnet', amount: 3, unit: 'peppers', notes: 'Coarsely blended & reduced' },
        { name: 'Fermented locust beans (Iru)', amount: 2, unit: 'tbsp' },
        { name: 'Red palm oil', amount: 0.5, unit: 'cup' },
        { name: 'Smoked dried fish and shredded beef', amount: 350, unit: 'g' }
      ],
      steps: [
        { instruction: 'Heat palm oil in a pot until clear; sauté sliced onions and locust beans until fragrant.', timerMinutes: 3 },
        { instruction: 'Add reduced pepper blend and simmer for 15 minutes until oil separates from the stew.', timerMinutes: 15 },
        { instruction: 'Add smoked fish, meat, and ground crayfish; stir together for 5 minutes.', timerMinutes: 5 },
        { instruction: 'Fold in squeezed blanched spinach greens, turn off the heat, and let the residual steam finish cooking the greens (2 mins).', timerMinutes: 2 },
        { instruction: 'Serve with hot amala, eba, or jasmine rice.' }
      ],
      substitutions: [{ ingredient: 'Shoko greens', substitute: 'Baby spinach or Swiss chard' }],
      tips: ['Squeezing excess water from blanched spinach prevents your efo riro from turning watery.']
    },
    {
      title: 'Ofada Rice with Ayamase Sauce',
      alternateName: 'Designer Stew',
      type: 'rice',
      mealType: 'Lunch',
      prepTime: 25,
      cookTime: 45,
      servings: 4,
      difficulty: 'Medium',
      spiceLevel: 4,
      description: 'Unpolished indigenous fermented rice served with dark green pepper sauce bleached in red palm oil with locust beans and boiled eggs.',
      culturalBackground: 'Named after the historic town of Ofada in Ogun State, famed for its pungent aroma and wrapping in broad Uma leaves.',
      ingredients: [
        { name: 'Unpolished Ofada rice', amount: 3, unit: 'cups', notes: 'Rinsed well' },
        { name: 'Green bell peppers & green scotch bonnets', amount: 6, unit: 'peppers', notes: 'Coarse blended & strained' },
        { name: 'Red palm oil (for bleaching)', amount: 1, unit: 'cup' },
        { name: 'Fermented locust beans (Iru)', amount: 3, unit: 'tbsp' },
        { name: 'Assorted boiled meats & hard-boiled eggs', amount: 400, unit: 'g' }
      ],
      steps: [
        { instruction: 'Boil rinsed ofada rice in salted water for 25 minutes until tender and nutty; drain and steam.', timerMinutes: 25 },
        { instruction: 'Carefully bleach palm oil in a covered pot on low heat until dark golden (10 mins); cool before opening lid.', timerMinutes: 10 },
        { instruction: 'Sauté chopped onions and iru in the oil, then add boiled green pepper puree; fry for 15 minutes.', timerMinutes: 15 },
        { instruction: 'Add assorted bite-sized meats and boiled eggs; simmer until oil floats on top (10 mins).', timerMinutes: 10 },
        { instruction: 'Ladle rich ayamase sauce over steaming hot aromatic ofada rice.' }
      ],
      substitutions: [{ ingredient: 'Ofada rice', substitute: 'Brown basmati rice' }],
      tips: ['Always keep the pot covered while bleaching palm oil to contain smoke until it cools.']
    }
  ],
  MA: [
    {
      title: 'Moroccan Lamb Couscous Royal',
      alternateName: 'Kseksou B’Sebaa Khoudar',
      type: 'curry',
      mealType: 'Dinner',
      prepTime: 30,
      cookTime: 60,
      servings: 6,
      difficulty: 'Medium',
      spiceLevel: 1,
      description: 'Fluffy semolina grains triple-steamed over a fragrant saffron and ginger broth loaded with seven seasonal vegetables and tender lamb.',
      culturalBackground: 'The traditional Friday gathering centerpiece across Morocco, prepared in a traditional two-tier couscoussier pot.',
      ingredients: [
        { name: 'Fine semolina couscous', amount: 500, unit: 'g' },
        { name: 'Lamb shoulder chunks', amount: 700, unit: 'g' },
        { name: 'Seven vegetables (carrots, pumpkin, zucchini, turnips, cabbage, chickpeas, tomatoes)', amount: 600, unit: 'g' },
        { name: 'Ras el Hanout & saffron threads', amount: 1, unit: 'tbsp' },
        { name: 'Smén (aged Moroccan clarified butter)', amount: 1, unit: 'tbsp' }
      ],
      steps: [
        { instruction: 'Brown lamb shoulder with onions, saffron, ginger, and ras el hanout in the bottom of a couscoussier.', timerMinutes: 10 },
        { instruction: 'Add chickpeas, water, and firm root vegetables; bring to a rolling aromatic boil.', timerMinutes: 15 },
        { instruction: 'Rub couscous with water and olive oil, place in the top steamer basket over the lamb stew to steam (20 mins).', timerMinutes: 20 },
        { instruction: 'Empty couscous into a large dish, aerate with smén and salted water, return to steam a second time with tender vegetables added to broth.', timerMinutes: 15 },
        { instruction: 'Mound fluffy couscous in a ceramic tagine, crown with lamb, radiate seven vegetables outward, and ladle over saffron broth.' }
      ],
      substitutions: [{ ingredient: 'Smén butter', substitute: 'Good quality ghee with a pinch of sea salt' }],
      tips: ['Rubbing couscous grains with your palms between steamings creates an impossibly light, cloud-like texture.']
    },
    {
      title: 'Zaalouk (Moroccan Spiced Eggplant Dip)',
      alternateName: 'Zaalouk de Tomates et Aubergines',
      type: 'salad',
      mealType: 'Lunch',
      prepTime: 15,
      cookTime: 25,
      servings: 4,
      difficulty: 'Easy',
      spiceLevel: 1,
      description: 'Charred roasted eggplants cooked down with sweet grated tomatoes, garlic, cumin, paprika, fresh coriander, and extra virgin olive oil.',
      culturalBackground: 'One of Morocco’s most iconic cooked salads, served warm or at room temperature with crusty khobz bread.',
      ingredients: [
        { name: 'Large globe eggplants', amount: 2, unit: 'eggplants', notes: 'Charred and peeled' },
        { name: 'Ripe tomatoes', amount: 3, unit: 'tomatoes', notes: 'Grated' },
        { name: 'Garlic cloves', amount: 4, unit: 'cloves', notes: 'Minced' },
        { name: 'Ground cumin & sweet paprika', amount: 1, unit: 'tbsp', notes: 'Each' },
        { name: 'Extra virgin olive oil', amount: 4, unit: 'tbsp' },
        { name: 'Fresh cilantro and lemon juice', amount: 2, unit: 'tbsp' }
      ],
      steps: [
        { instruction: 'Char whole eggplants over an open flame or under broiler until skin is blackened and flesh is tender (15 mins); peel and mash.', timerMinutes: 15 },
        { instruction: 'In a skillet, sauté grated tomatoes and garlic in olive oil with cumin, paprika, and salt for 10 minutes.', timerMinutes: 10 },
        { instruction: 'Add mashed smoky eggplant; cook while mashing with a wooden spoon until glossy and thick (10 mins).', timerMinutes: 10 },
        { instruction: 'Fold in chopped cilantro and a squeeze of fresh lemon; serve with warm crusty bread.' }
      ],
      substitutions: [{ ingredient: 'Charred eggplant', substitute: 'Diced boiled eggplant' }],
      tips: ['Direct flame roasting gives the eggplant a signature campfire smokiness that makes zaalouk unforgettable.']
    },
    {
      title: 'Harira (Traditional Moroccan Velvet Soup)',
      alternateName: 'Moroccan Lentil & Chickpea Soup',
      type: 'soup',
      mealType: 'Dinner',
      prepTime: 20,
      cookTime: 50,
      servings: 6,
      difficulty: 'Medium',
      spiceLevel: 1,
      description: 'Velvety, fragrant tomato and herb soup with tender lamb cubes, green lentils, chickpeas, vermicelli noodles, and a rich cinnamon-ginger undertone.',
      culturalBackground: 'The sacred soup used across Morocco to break the daily fast during Ramadan, paired with sweet medjool dates and honey chebakia.',
      ingredients: [
        { name: 'Diced lamb meat', amount: 300, unit: 'g' },
        { name: 'Cooked chickpeas', amount: 1.5, unit: 'cups' },
        { name: 'Brown lentils', amount: 0.5, unit: 'cup' },
        { name: 'Plum tomatoes', amount: 5, unit: 'tomatoes', notes: 'Pureed' },
        { name: 'Fresh celery, parsley, and cilantro', amount: 1.5, unit: 'cups', notes: 'Finely chopped' },
        { name: 'Cinnamon stick and ground ginger', amount: 1, unit: 'tsp', notes: 'Each' },
        { name: 'Fine vermicelli angel hair', amount: 0.5, unit: 'cup' }
      ],
      steps: [
        { instruction: 'Sauté lamb cubes with onions, celery, herbs, cinnamon, and turmeric in olive oil for 5 minutes.', timerMinutes: 5 },
        { instruction: 'Add pureed tomatoes, lentils, chickpeas, and 6 cups water; simmer for 35 minutes until lamb and lentils are tender.', timerMinutes: 35 },
        { instruction: 'Whisk 3 tbsp flour with 1 cup water (tedouira) and stir into boiling soup to create harira’s signature velvety silkiness.', timerMinutes: 5 },
        { instruction: 'Add broken vermicelli noodles; cook for final 5 minutes and finish with fresh lemon juice.', timerMinutes: 5 }
      ],
      substitutions: [{ ingredient: 'Lamb', substitute: 'Beef brisket or keep fully vegetarian' }],
      tips: ['The flour-water slurry (tedouira) should be added in a steady stream while stirring to avoid lumps.']
    },
    {
      title: 'Pastilla (Sweet & Savory Spiced Chicken Pie)',
      alternateName: 'Bstilla au Poulet',
      type: 'pastry',
      mealType: 'Dinner',
      prepTime: 35,
      cookTime: 40,
      servings: 6,
      difficulty: 'Advanced',
      spiceLevel: 1,
      description: 'Crispy golden warqa pastry stuffed with shredded saffron chicken, caramelized onion-egg curd, and toasted cinnamon-scented almonds.',
      culturalBackground: 'The pinnacle of Fez aristocratic cuisine, combining sweet powdered sugar and aromatic savory saffron poultry in one flaky pie.',
      ingredients: [
        { name: 'Phyllo or warqa pastry sheets', amount: 12, unit: 'sheets' },
        { name: 'Shredded poached chicken meat', amount: 500, unit: 'g' },
        { name: 'Caramelized onion-egg custard filling', amount: 2, unit: 'cups' },
        { name: 'Toasted ground almonds with orange blossom water & cinnamon', amount: 1.5, unit: 'cups' },
        { name: 'Melted butter (for brushing)', amount: 100, unit: 'g' },
        { name: 'Powdered sugar & cinnamon (for lattice decoration)', amount: 3, unit: 'tbsp' }
      ],
      steps: [
        { instruction: 'Layer overlapping melted-butter brushed pastry sheets in a round pie dish.', timerMinutes: 5 },
        { instruction: 'Spread shredded saffron chicken across base, followed by caramelized onion-egg layer and scented almond crunch.', timerMinutes: 5 },
        { instruction: 'Fold outer pastry leaves inwards, cap with buttered sheets, and tuck edges under neatly.', timerMinutes: 5 },
        { instruction: 'Bake at 190°C (375°F) for 25 minutes until deep golden and shatteringly crisp.', timerMinutes: 25 },
        { instruction: 'Dust top with powdered sugar and draw geometric diamonds with ground cinnamon.' }
      ],
      substitutions: [{ ingredient: 'Warqa pastry', substitute: 'High quality phyllo dough' }],
      tips: ['Let the chicken and egg filling cool completely before assembling to prevent pastry from becoming soggy.']
    },
    {
      title: 'Briouats with Honey & Toasted Almonds',
      alternateName: 'Moroccan Almond Pastry Triangles',
      type: 'dessert',
      mealType: 'Dessert',
      prepTime: 30,
      cookTime: 15,
      servings: 8,
      difficulty: 'Medium',
      spiceLevel: 0,
      description: 'Crispy fried phyllo pastry triangles filled with aromatic almond paste, dunked hot into warm orange blossom honey and sprinkled with sesame.',
      culturalBackground: 'A beloved festive dessert served alongside mint tea during weddings and celebration feasts.',
      ingredients: [
        { name: 'Phyllo pastry strips', amount: 16, unit: 'strips' },
        { name: 'Blanched almond paste with mastic and cinnamon', amount: 300, unit: 'g' },
        { name: 'Orange blossom water', amount: 2, unit: 'tbsp' },
        { name: 'Wildflower honey', amount: 1.5, unit: 'cups', notes: 'Warmed' },
        { name: 'Toasted sesame seeds', amount: 3, unit: 'tbsp' }
      ],
      steps: [
        { instruction: 'Roll almond paste into small oval balls scented with orange blossom water.', timerMinutes: 5 },
        { instruction: 'Place paste at bottom of phyllo strip and fold repeatedly into neat triangular packets; seal edges with egg wash.', timerMinutes: 10 },
        { instruction: 'Fry triangles in hot oil at 170°C for 4 minutes until golden, then immediately submerge in warm honey bath for 5 minutes.', timerMinutes: 10 },
        { instruction: 'Drain on rack, garnish corners with toasted sesame seeds, and serve crisp.' }
      ],
      substitutions: [{ ingredient: 'Orange blossom water', substitute: 'Rose water' }],
      tips: ['Dunking the pastries straight from the frying oil into warm honey ensures deep syrup penetration.']
    }
  ]
};
