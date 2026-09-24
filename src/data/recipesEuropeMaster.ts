import { RegionalDishData } from './recipesAfrica';

export const EUROPE_DISHES: Record<string, RegionalDishData[]> = {
  // SPAIN
  ES: [
    {
      title: 'Authentic Paella Valenciana',
      alternateName: 'Paella Tradicional de Valencia',
      type: 'rice',
      mealType: 'Lunch',
      prepTime: 25,
      cookTime: 45,
      servings: 6,
      difficulty: 'Medium',
      spiceLevel: 0,
      description: 'The authentic inland Valencian rice dish cooked over orange wood with rabbit, chicken, flat green beans (bajoqueta), lima beans (garrofó), rosemary, and golden saffron.',
      culturalBackground: 'The true original paella born in the countryside of Valencia, prized for the crispy caramelized rice crust on the pan bottom called socarrat.',
      ingredients: [
        { name: 'Bomba or Senia paella rice', amount: 400, unit: 'g' },
        { name: 'Bone-in chicken and rabbit pieces', amount: 800, unit: 'g' },
        { name: 'Garrofó large white lima beans & flat green beans', amount: 250, unit: 'g' },
        { name: 'Spanish saffron threads & sweet smoked pimentón', amount: 1, unit: 'tsp', notes: 'Each' },
        { name: 'Grated ripe tomatoes & extra virgin olive oil', amount: 0.5, unit: 'cup' },
        { name: 'Fresh rosemary sprig', amount: 1, unit: 'sprig' }
      ],
      steps: [
        { instruction: 'Brown chicken and rabbit in olive oil around the perimeter of the wide paella pan until deeply caramelized.', timerMinutes: 10 },
        { instruction: 'Sauté green beans and garrofó beans in the center, then add grated tomato and smoked pimentón.', timerMinutes: 5 },
        { instruction: 'Pour in water up to the pan rivets, infuse saffron, and simmer for 15 minutes to build an intensely flavorful broth.', timerMinutes: 15 },
        { instruction: 'Distribute Bomba rice evenly in a cross pattern; boil on high heat for 8 minutes without stirring.', timerMinutes: 8 },
        { instruction: 'Lower heat, lay rosemary sprig on top, and simmer for 10 mins until broth is absorbed; turn heat up for 2 mins to toast the socarrat crust on the bottom.', timerMinutes: 12 },
        { instruction: 'Rest 5 minutes covered with a clean kitchen towel before serving straight from the pan.' }
      ],
      substitutions: [{ ingredient: 'Rabbit', substitute: 'All chicken thighs or duck' }],
      tips: ['Never stir the rice after distributing it into the pan; disturbing it releases starches and prevents the crispy socarrat from forming.']
    },
    {
      title: 'Tortilla Española (Spanish Potato & Onion Omelette)',
      alternateName: 'Tortilla de Patatas',
      type: 'salad',
      mealType: 'Lunch',
      prepTime: 20,
      cookTime: 25,
      servings: 6,
      difficulty: 'Easy',
      spiceLevel: 0,
      description: 'Golden Spanish omelette made with tender Yukon Gold potato slices and sweet onions slow-poached in Spanish olive oil and bound in soft, creamy eggs.',
      culturalBackground: 'The quintessential tapa found in every tavern from Madrid to Seville, enjoyed warm, at room temperature, or stuffed inside a crusty bocadillo baguette.',
      ingredients: [
        { name: 'Yukon Gold or Kennebec potatoes (thinly sliced)', amount: 800, unit: 'g' },
        { name: 'Spanish yellow onion (thinly sliced)', amount: 1, unit: 'large' },
        { name: 'Large fresh eggs', amount: 6, unit: 'eggs' },
        { name: 'Extra virgin Spanish olive oil (for confiting)', amount: 1.5, unit: 'cups' },
        { name: 'Sea salt', amount: 1, unit: 'tsp' }
      ],
      steps: [
        { instruction: 'Slowly poach sliced potatoes and onions in olive oil over low heat for 20 minutes until tender without browning; drain oil well.', timerMinutes: 20 },
        { instruction: 'Beat eggs in a large bowl with sea salt, gently fold in warm potatoes and onions; let rest for 10 minutes so potatoes absorb eggs.', timerMinutes: 10 },
        { instruction: 'Heat 1 tbsp oil in a non-stick skillet; pour in egg mixture and cook on medium heat for 3 minutes while shaking pan to set bottom.', timerMinutes: 3 },
        { instruction: 'Place a flat plate over skillet, swiftly invert the tortilla onto the plate, and slide back into the pan to cook the second side for 2 minutes for a juicy center (jugosa).', timerMinutes: 3 },
        { instruction: 'Slide onto a platter and slice into wedges.' }
      ],
      substitutions: [{ ingredient: 'Yukon Gold potatoes', substitute: 'Russet or red potatoes' }],
      tips: ['Letting the warm poached potatoes soak in the beaten eggs for 10 minutes before cooking gives the tortilla a silky, velvety texture.']
    },
    {
      title: 'Gambas al Ajillo (Sizzling Garlic Chili Shrimp)',
      alternateName: 'Gambas al Ajillo Tradicional',
      type: 'seafood',
      mealType: 'Dinner',
      prepTime: 10,
      cookTime: 5,
      servings: 4,
      difficulty: 'Easy',
      spiceLevel: 2,
      description: 'Plump succulent wild shrimp sizzling in an earthenware cazuela with thinly sliced garlic, dried guindilla chillies, dry sherry, and fresh flat-leaf parsley.',
      culturalBackground: 'Spain’s most famous sizzling tapa, always accompanied by lots of crusty bread to mop up the fragrant garlic-infused oil.',
      ingredients: [
        { name: 'Fresh wild shrimp / prawns (peeled & deveined)', amount: 450, unit: 'g' },
        { name: 'Garlic cloves (thinly sliced)', amount: 8, unit: 'cloves' },
        { name: 'Dried red bird chillies or guindilla pepper', amount: 2, unit: 'peppers' },
        { name: 'Extra virgin olive oil', amount: 0.5, unit: 'cup' },
        { name: 'Dry Fino sherry or white wine', amount: 2, unit: 'tbsp' },
        { name: 'Fresh flat-leaf parsley (chopped)', amount: 3, unit: 'tbsp' }
      ],
      steps: [
        { instruction: 'Heat olive oil in an earthenware cazuela or heavy skillet over medium heat; add sliced garlic and dried chillies until garlic turns pale golden (2 mins).', timerMinutes: 2 },
        { instruction: 'Add shrimp in a single layer and turn heat to high; cook for 1.5 minutes until shrimp turn pink.', timerMinutes: 2 },
        { instruction: 'Splash with dry sherry, toss with chopped parsley and sea salt, and immediately remove from heat.', timerMinutes: 1 },
        { instruction: 'Serve piping hot and bubbling with thick slices of rustic bread.' }
      ],
      substitutions: [{ ingredient: 'Dry sherry', substitute: 'Dry white wine with a dash of lemon' }],
      tips: ['Do not let the garlic burn; turning the heat down to gently confit the garlic ensures sweet, nutty oil.']
    },
    {
      title: 'Gazpacho Andaluz (Chilled Tomato & Pepper Soup)',
      alternateName: 'Gazpacho Tradicional',
      type: 'soup',
      mealType: 'Lunch',
      prepTime: 15,
      cookTime: 0,
      servings: 4,
      difficulty: 'Easy',
      spiceLevel: 0,
      description: 'Chilled, silky smooth emulsion of vine-ripened tomatoes, sweet cucumbers, green bell peppers, garlic, sherry vinegar, and peppery extra virgin olive oil.',
      culturalBackground: 'The life-saving summer cooler of southern Andalusia, blended into an airy, frothy emulsion without cooking.',
      ingredients: [
        { name: 'Ripe red plum or vine tomatoes', amount: 1, unit: 'kg' },
        { name: 'Italian green pepper or bell pepper', amount: 1, unit: 'pepper' },
        { name: 'Persian or English cucumber', amount: 1, unit: 'cucumber' },
        { name: 'Garlic clove', amount: 1, unit: 'clove' },
        { name: 'Sherry vinegar (Vinagre de Jerez)', amount: 2, unit: 'tbsp' },
        { name: 'Extra virgin olive oil', amount: 0.5, unit: 'cup' },
        { name: 'Stale crusty white bread (crusts removed)', amount: 50, unit: 'g' }
      ],
      steps: [
        { instruction: 'Soak bread in a splash of water and sherry vinegar.', timerMinutes: 2 },
        { instruction: 'Roughly chop tomatoes, cucumber, pepper, and garlic; blend in a high-speed blender with soaked bread until pureed.', timerMinutes: 3 },
        { instruction: 'With the blender running on medium speed, slowly stream in extra virgin olive oil to emulsify into a pale, creamy orange soup.', timerMinutes: 2 },
        { instruction: 'Strain through a fine mesh sieve for silkiness; chill in the refrigerator for at least 2 hours.', timerMinutes: 5 },
        { instruction: 'Serve ice-cold in glasses or bowls garnished with finely diced cucumber, bell pepper, and a swirl of olive oil.' }
      ],
      substitutions: [{ ingredient: 'Sherry vinegar', substitute: 'Red wine vinegar' }],
      tips: ['Streaming the olive oil in slowly while blending creates a luxurious, creamy emulsion without any dairy.']
    },
    {
      title: 'Churros con Chocolate Caliente',
      alternateName: 'Madrid Churros & Thick Hot Chocolate',
      type: 'dessert',
      mealType: 'Breakfast',
      prepTime: 15,
      cookTime: 15,
      servings: 4,
      difficulty: 'Easy',
      spiceLevel: 0,
      description: 'Crispy, star-ridged fried dough batons dusted with sugar, dipped into an ultra-thick, rich Spanish dark drinking chocolate.',
      culturalBackground: 'The iconic breakfast and late-night tradition of Madrid’s historic chocolaterías, famously Chocolatería San Ginés.',
      ingredients: [
        { name: 'All-purpose flour', amount: 1.5, unit: 'cups' },
        { name: 'Boiling water & pinch of salt', amount: 1.5, unit: 'cups' },
        { name: 'Granulated sugar (for dusting)', amount: 0.5, unit: 'cup' },
        { name: 'Dark Spanish chocolate (70% cocoa)', amount: 200, unit: 'g' },
        { name: 'Whole milk & cornstarch (for thickening chocolate)', amount: 2, unit: 'cups' }
      ],
      steps: [
        { instruction: 'Pour boiling water and salt over flour; stir vigorously with a wooden spoon into a smooth, thick choux paste.', timerMinutes: 3 },
        { instruction: 'Fit a piping bag with a closed star tip and fill with dough.', timerMinutes: 2 },
        { instruction: 'Pipe 6-inch dough strips into hot oil at 190°C, snipping with scissors; fry for 3-4 minutes until golden and crunchy; drain and roll in sugar.', timerMinutes: 4 },
        { instruction: 'Melt dark chocolate into milk with dissolved cornstarch, simmering for 3 minutes until thick enough to coat a spoon.', timerMinutes: 3 },
        { instruction: 'Serve warm churros immediately with individual cups of steaming hot thick dipping chocolate.' }
      ],
      substitutions: [{ ingredient: 'Spanish dark chocolate', substitute: 'Bittersweet baking chocolate' }],
      tips: ['Using a star-shaped piping tip creates ridged grooves that trap more cinnamon-sugar and dipping chocolate.']
    }
  ],

  // FRANCE
  FR: [
    {
      title: 'Classic Julia Beef Bourguignon',
      alternateName: 'Bœuf à la Bourguignonne',
      type: 'beef',
      mealType: 'Dinner',
      prepTime: 30,
      cookTime: 150,
      servings: 6,
      difficulty: 'Medium',
      spiceLevel: 0,
      description: 'Tender beef chuck braised for hours in rich Burgundy Pinot Noir with crispy lardons, pearl onions, brown button mushrooms, and fresh bouquet garni herbs.',
      culturalBackground: 'The supreme pride of Burgundy rustic cooking, elevated to timeless haute cuisine by Auguste Escoffier and Julia Child.',
      ingredients: [
        { name: 'Beef chuck roast (cut into 2-inch cubes)', amount: 1.2, unit: 'kg' },
        { name: 'Dry red Burgundy wine (Pinot Noir)', amount: 1, unit: 'bottle (750ml)' },
        { name: 'Thick-cut bacon lardons (diced)', amount: 200, unit: 'g' },
        { name: 'Pearl onions & cremini mushrooms', amount: 300, unit: 'g', notes: 'Each' },
        { name: 'Rich beef stock and tomato paste', amount: 2, unit: 'cups' },
        { name: 'Bouquet garni (fresh thyme, rosemary, bay leaf, parsley)', amount: 1, unit: 'bundle' }
      ],
      steps: [
        { instruction: 'Crisp bacon lardons in a Dutch oven; remove with slotted spoon.', timerMinutes: 5 },
        { instruction: 'Pat beef cubes thoroughly dry with paper towels; sear in batches in hot bacon fat until deeply browned on all sides (10 mins).', timerMinutes: 10 },
        { instruction: 'Stir in tomato paste and flour; cook for 2 minutes, then pour in entire bottle of red Burgundy wine and beef stock.', timerMinutes: 5 },
        { instruction: 'Add bouquet garni, cover tightly, and braise in oven at 160°C (325°F) for 2.5 hours until beef is fork-tender.', timerMinutes: 150 },
        { instruction: 'In a separate skillet, butter-glaze pearl onions and brown mushrooms; fold into the stew for the final 15 minutes.', timerMinutes: 15 },
        { instruction: 'Serve over buttered egg noodles or mashed potatoes.' }
      ],
      substitutions: [{ ingredient: 'Burgundy wine', substitute: 'Dry Cabernet Sauvignon, Merlot, or Pinot Noir' }],
      tips: ['Drying the beef thoroughly with paper towels before searing ensures a deep caramelized crust that creates rich braising juices.']
    },
    {
      title: 'Coq au Vin (Classic French Braised Chicken in Red Wine)',
      alternateName: 'Coq au Vin Traditionnel',
      type: 'curry',
      mealType: 'Dinner',
      prepTime: 25,
      cookTime: 50,
      servings: 4,
      difficulty: 'Medium',
      spiceLevel: 0,
      description: 'Bone-in chicken braised with crispy smoked bacon lardons, pearl onions, mushrooms, cognac, and red wine reduction.',
      culturalBackground: 'Historic French farmhouse specialty traditionally prepared with a mature rooster slow-simmered in regional wine.',
      ingredients: [
        { name: 'Bone-in chicken thighs and drumsticks', amount: 1, unit: 'kg' },
        { name: 'Dry French red wine (Pinot Noir or Côtes du Rhône)', amount: 2.5, unit: 'cups' },
        { name: 'Smoked bacon lardons', amount: 150, unit: 'g' },
        { name: 'Pearl onions and quartered mushrooms', amount: 250, unit: 'g', notes: 'Each' },
        { name: 'Cognac or brandy (for flambé)', amount: 3, unit: 'tbsp' },
        { name: 'Beurre manié (equal parts softened butter and flour kneaded together)', amount: 2, unit: 'tbsp' }
      ],
      steps: [
        { instruction: 'Fry lardons until golden in a Dutch oven; remove lardons and brown chicken pieces in the fat until skin is crisp.', timerMinutes: 8 },
        { instruction: 'Pour in cognac and carefully ignite to flambé; let flames subside.', timerMinutes: 2 },
        { instruction: 'Add red wine, garlic, carrots, and bouquet garni; simmer covered on low heat for 35 minutes.', timerMinutes: 35 },
        { instruction: 'Sauté pearl onions and mushrooms in butter; stir into the chicken stew along with beurre manié to gloss and thicken sauce (8 mins).', timerMinutes: 8 },
        { instruction: 'Garnish with fresh parsley and serve with steamed buttered potatoes.' }
      ],
      substitutions: [{ ingredient: 'Cognac', substitute: 'French brandy or dry sherry' }],
      tips: ['Whisking in cold beurre manié at the end thickens the wine reduction into a silky, mirror-glossy glaze.']
    },
    {
      title: 'Authentic French Onion Soup (Soupe à l’Oignon Gratinée)',
      alternateName: 'Soupe à l’Oignon Gratinée',
      type: 'soup',
      mealType: 'Dinner',
      prepTime: 20,
      cookTime: 60,
      servings: 4,
      difficulty: 'Easy',
      spiceLevel: 0,
      description: 'Deeply caramelized sweet yellow onions simmered in beef broth with dry white wine, topped with toasted baguette slices and bubbling Gruyère cheese.',
      culturalBackground: 'Originally a Parisian market-hall worker breakfast at Les Halles, now celebrated worldwide as the ultimate French comfort soup.',
      ingredients: [
        { name: 'Yellow onions (thinly sliced)', amount: 1.2, unit: 'kg' },
        { name: 'Rich beef bone broth', amount: 6, unit: 'cups' },
        { name: 'Dry white wine & butter', amount: 0.5, unit: 'cup', notes: 'Each' },
        { name: 'Gruyère cheese (grated)', amount: 200, unit: 'g' },
        { name: 'Crusty French baguette slices (toasted)', amount: 8, unit: 'slices' }
      ],
      steps: [
        { instruction: 'Slowly melt onions in butter and olive oil over medium-low heat, stirring occasionally for 45 minutes until deeply caramelized and rich mahogany brown.', timerMinutes: 45 },
        { instruction: 'Deglaze pan with dry white wine, scraping all caramelized fond from bottom; boil 2 minutes.', timerMinutes: 2 },
        { instruction: 'Pour in beef broth and fresh thyme; simmer uncovered for 20 minutes.', timerMinutes: 20 },
        { instruction: 'Ladle soup into oven-safe porcelain bowls, float toasted baguette slices on top, and bury under mounds of grated Gruyère.', timerMinutes: 3 },
        { instruction: 'Broil in oven at 220°C for 4-5 minutes until cheese is blistered, bubbling, and golden brown.' }
      ],
      substitutions: [{ ingredient: 'Gruyère', substitute: 'Comté, Emmental, or Swiss cheese' }],
      tips: ['Patience is paramount: do not rush the onion caramelization; 45 slow minutes unlock pure natural onion sweetness without bitter char.']
    },
    {
      title: 'Ratatouille Provençale (Layered Vegetable Casserole)',
      alternateName: 'Ratatouille Niçoise',
      type: 'salad',
      mealType: 'Dinner',
      prepTime: 30,
      cookTime: 45,
      servings: 6,
      difficulty: 'Medium',
      spiceLevel: 0,
      description: 'Thinly sliced alternating rounds of zucchini, yellow squash, Japanese eggplant, and Roma tomatoes arranged over a rich bell pepper and garlic piperade base.',
      culturalBackground: 'From Nice and Provence, honoring the peak summer vegetable harvest of the Mediterranean coast.',
      ingredients: [
        { name: 'Zucchini, yellow squash, eggplant, and Roma tomatoes', amount: 2, unit: 'each', notes: 'Thinly sliced into uniform rounds' },
        { name: 'Piperade base (roasted red bell peppers, onions, crushed tomatoes, garlic)', amount: 1.5, unit: 'cups' },
        { name: 'Herbes de Provence (thyme, oregano, savory, rosemary)', amount: 1, unit: 'tbsp' },
        { name: 'Extra virgin olive oil', amount: 4, unit: 'tbsp' }
      ],
      steps: [
        { instruction: 'Spread piperade sauce evenly across the base of a round baking dish.', timerMinutes: 5 },
        { instruction: 'Arrange alternating sliced vegetable rounds in a tight, concentric spiral across the dish.', timerMinutes: 15 },
        { instruction: 'Drizzle with olive oil, sprinkle with sea salt, minced garlic, and Herbes de Provence.', timerMinutes: 3 },
        { instruction: 'Cover with parchment paper and bake at 180°C (350°F) for 40 minutes until vegetables are tender.', timerMinutes: 40 },
        { instruction: 'Uncover and bake 5 minutes more to caramelize edges; serve warm or at room temperature.' }
      ],
      substitutions: [{ ingredient: 'Herbes de Provence', substitute: 'Fresh thyme and oregano' }],
      tips: ['Using a mandoline slicer ensures all vegetable rounds are identical thickness for even cooking and gorgeous presentation.']
    },
    {
      title: 'Classic French Crème Brûlée',
      alternateName: 'Crème Brûlée à la Vanille',
      type: 'dessert',
      mealType: 'Dessert',
      prepTime: 20,
      cookTime: 40,
      servings: 6,
      difficulty: 'Medium',
      spiceLevel: 0,
      description: 'Silky, rich baked vanilla bean custard topped with a brittle, shatteringly crisp layer of caramelized toffee sugar.',
      culturalBackground: 'First recorded in François Massialot’s 1691 cookbook, representing the ultimate French bistro indulgence.',
      ingredients: [
        { name: 'Heavy cream', amount: 2, unit: 'cups' },
        { name: 'Fresh egg yolks', amount: 5, unit: 'yolks' },
        { name: 'Vanilla bean (split and seeds scraped)', amount: 1, unit: 'pod' },
        { name: 'Granulated sugar (for custard)', amount: 0.5, unit: 'cup' },
        { name: 'Turbinado or superfine sugar (for caramelized crust)', amount: 4, unit: 'tbsp' }
      ],
      steps: [
        { instruction: 'Heat heavy cream with split vanilla pod and scraped seeds until steaming; steep for 15 minutes.', timerMinutes: 15 },
        { instruction: 'Whisk egg yolks and sugar until pale; slowly temper in warm cream while whisking.', timerMinutes: 5 },
        { instruction: 'Strain custard through fine sieve; pour into 6 shallow ceramic ramekins placed in a roasting pan filled halfway with hot water (bain-marie).', timerMinutes: 5 },
        { instruction: 'Bake at 150°C (300°F) for 35-40 minutes until edges are set but centers gently wobble; chill for at least 4 hours.', timerMinutes: 40 },
        { instruction: 'Sprinkle an even layer of sugar on top and caramelize with a kitchen torch until amber and hard.' }
      ],
      substitutions: [{ ingredient: 'Vanilla pod', substitute: 'Pure vanilla bean paste' }],
      tips: ['Using shallow ramekins gives you the ideal ratio of crunchy caramelized sugar crust to velvety cool custard.']
    }
  ]
};
