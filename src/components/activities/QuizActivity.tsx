import { useState, useMemo, useCallback } from 'react';
import { CheckCircle2, XCircle, Trophy, RotateCcw, ChevronRight, Target } from 'lucide-react';

interface QuizActivityProps {
  onComplete: (score: number, passed: boolean) => void;
  onCancel: () => void;
  subject: string;
  moduleTitle: string;
  difficulty: number;
}

interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;
}

const PASS_THRESHOLD = 85;

function generateQuestions(subject: string, moduleTitle: string, difficulty: number): QuizQuestion[] {
  const base = QUIZ_BANK[subject] ?? QUIZ_BANK['Mathematics'];
  const pool = [...base].sort(() => Math.random() - 0.5);
  const count = 5;
  return pool.slice(0, count);
}

const QUIZ_BANK: Record<string, QuizQuestion[]> = {
  Mathematics: [
    { question: 'What is 7 × 8?', options: ['54', '56', '58', '64'], answer: 1 },
    { question: 'What is 144 ÷ 12?', options: ['11', '12', '13', '14'], answer: 1 },
    { question: 'What is 3/4 as a decimal?', options: ['0.25', '0.50', '0.75', '0.80'], answer: 2 },
    { question: 'What is 25% of 200?', options: ['25', '40', '50', '75'], answer: 2 },
    { question: 'Solve: x + 7 = 15. What is x?', options: ['6', '7', '8', '9'], answer: 2 },
    { question: 'What is the area of a rectangle 6cm by 4cm?', options: ['10cm²', '20cm²', '24cm²', '48cm²'], answer: 2 },
    { question: 'What is (-5) + 3?', options: ['-8', '-2', '2', '8'], answer: 1 },
    { question: 'What is 0.5 as a fraction?', options: ['1/4', '1/3', '1/2', '2/3'], answer: 2 },
    { question: 'Round 3.476 to 2 decimal places.', options: ['3.45', '3.47', '3.48', '3.50'], answer: 2 },
    { question: 'What is 9² ?', options: ['18', '72', '81', '99'], answer: 2 },
  ],
  'Language Arts': [
    { question: 'Which word is a noun?', options: ['quickly', 'beautiful', 'garden', 'running'], answer: 2 },
    { question: 'What is the past tense of "write"?', options: ['writed', 'wrote', 'written', 'writing'], answer: 1 },
    { question: 'Which sentence uses correct punctuation?', options: ['What a lovely day.', 'What a lovely day?', 'What a lovely day!', 'What a lovely day;'], answer: 2 },
    { question: 'What is a synonym for "happy"?', options: ['sad', 'joyful', 'tired', 'angry'], answer: 1 },
    { question: 'Which word is an adjective?', options: ['ran', 'tall', 'quickly', 'happiness'], answer: 1 },
    { question: 'What is the main idea of a paragraph?', options: ['The first sentence', 'What the paragraph is mostly about', 'The last sentence', 'The title'], answer: 1 },
    { question: 'Which is a complete sentence?', options: ['Running fast.', 'The boy ran fast.', 'Because he was late.', 'Very quickly indeed.'], answer: 1 },
    { question: 'What does "infer" mean?', options: ['To guess randomly', 'To conclude from evidence', 'To copy exactly', 'To read aloud'], answer: 1 },
    { question: 'Which is a compound word?', options: ['table', 'rainbow', 'happy', 'orange'], answer: 1 },
    { question: 'What type of word connects sentences or clauses?', options: ['noun', 'verb', 'conjunction', 'adverb'], answer: 2 },
  ],
  Science: [
    { question: 'What do plants need to make food?', options: ['Soil only', 'Sunlight, water and CO₂', 'Meat', 'Salt'], answer: 1 },
    { question: 'What is the basic unit of life?', options: ['Atom', 'Cell', 'Tissue', 'Organ'], answer: 1 },
    { question: 'Which gas do humans breathe in?', options: ['Carbon dioxide', 'Nitrogen', 'Oxygen', 'Hydrogen'], answer: 2 },
    { question: 'What causes day and night?', options: ['The Moon moving', 'Earth rotating', 'The Sun moving', 'Clouds'], answer: 1 },
    { question: 'What is the water cycle process where water turns to vapour?', options: ['Condensation', 'Evaporation', 'Precipitation', 'Collection'], answer: 1 },
    { question: 'Which is a mammal?', options: ['Shark', 'Eagle', 'Whale', 'Lizard'], answer: 2 },
    { question: 'What force pulls objects toward Earth?', options: ['Magnetism', 'Friction', 'Gravity', 'Tension'], answer: 2 },
    { question: 'What are the three states of matter?', options: ['Hot, warm, cold', 'Solid, liquid, gas', 'Big, medium, small', 'Heavy, light, empty'], answer: 1 },
    { question: 'Which organ pumps blood?', options: ['Lungs', 'Brain', 'Heart', 'Liver'], answer: 2 },
    { question: 'What is photosynthesis?', options: ['Animals eating plants', 'Plants making food from sunlight', 'Water boiling', 'Rocks breaking down'], answer: 1 },
  ],
  'Social Studies': [
    { question: 'What is the capital of Trinidad & Tobago?', options: ['San Fernando', 'Port of Spain', 'Scarborough', 'Arima'], answer: 1 },
    { question: 'When did Trinidad & Tobago gain independence?', options: ['1956', '1962', '1976', '1981'], answer: 1 },
    { question: 'What are the two main islands of Trinidad & Tobago?', options: ['Trinidad and Tobago', 'Trinidad and Grenada', 'Tobago and Barbados', 'Trinidad and Barbuda'], answer: 0 },
    { question: 'Who was the first Prime Minister of T&T?', options: ['Eric Williams', 'Kamla Persad-Bissessar', 'Patrick Manning', 'A.N.R. Robinson'], answer: 0 },
    { question: 'What does CARICOM stand for?', options: ['Caribbean Common Market', 'Caribbean Community and Common Market', 'Caribbean Regional Council', 'Caribbean International Commerce'], answer: 1 },
    { question: 'Which ocean borders Trinidad & Tobago to the east?', options: ['Pacific', 'Indian', 'Atlantic', 'Arctic'], answer: 2 },
    { question: 'What is the national flower of Trinidad & Tobago?', options: ['Hibiscus', 'Chaconia', 'Orchid', 'Bougainvillea'], answer: 1 },
    { question: 'What are the national colours of T&T?', options: ['Red, white and black', 'Blue, white and gold', 'Green, yellow and red', 'Black, red and gold'], answer: 0 },
    { question: 'Which sea lies between Trinidad and Venezuela?', options: ['Caribbean Sea', 'Gulf of Paria', 'Atlantic Ocean', 'Columbus Channel'], answer: 1 },
    { question: 'What is the primary economic activity in Tobago?', options: ['Oil drilling', 'Tourism and agriculture', 'Banking', 'Manufacturing'], answer: 1 },
  ],
  'English Language & Literature': [
    { question: 'What is a metaphor?', options: ['A comparison using "like"', 'A direct comparison saying one thing IS another', 'A type of rhyme', 'A punctuation mark'], answer: 1 },
    { question: 'In drama, what is "dialogue"?', options: ['Stage directions', 'The words spoken by characters', 'The setting description', "The narrator's voice"], answer: 1 },
    { question: 'What is the theme of a literary work?', options: ["The time period it's set in", "The main character's name", 'The central idea or message', 'The number of chapters'], answer: 2 },
    { question: 'Which is an example of personification?', options: ['The wind whispered through the trees', 'The wind was loud', 'The wind blew hard', 'The wind stopped'], answer: 0 },
    { question: 'What does a thesis statement do?', options: ['Ends an essay', 'States the main argument of an essay', 'Lists the characters', 'Describes the setting'], answer: 1 },
    { question: 'In "To Kill a Mockingbird", what does the mockingbird symbolise?', options: ['Violence', 'Innocence', 'Power', 'Wealth'], answer: 1 },
    { question: 'What is a sonnet?', options: ['A 14-line poem', 'A type of novel', 'A short story', 'A drama script'], answer: 0 },
    { question: 'Which word best describes the tone of an argumentative essay?', options: ['Emotional', 'Persuasive and formal', 'Humorous', 'Casual'], answer: 1 },
    { question: 'What is dramatic irony?', options: ["When the audience knows what characters don't", 'When actors make mistakes', 'When the plot is funny', 'When nothing happens'], answer: 0 },
    { question: 'What is the purpose of a topic sentence?', options: ['To end a paragraph', 'To introduce the main idea of a paragraph', 'To list vocabulary', 'To provide a conclusion'], answer: 1 },
  ],
  'General Science': [
    { question: 'What is the atomic number of an element?', options: ['The number of neutrons', 'The number of protons', 'The number of molecules', 'The number of isotopes'], answer: 1 },
    { question: "What is Newton's first law?", options: ['F = ma', 'Objects in motion stay in motion unless acted upon', 'Energy is conserved', 'Every action has an equal reaction'], answer: 1 },
    { question: 'What is the pH of a neutral substance?', options: ['0', '7', '14', '1'], answer: 1 },
    { question: 'Which type of bond involves sharing electrons?', options: ['Ionic', 'Covalent', 'Metallic', 'Hydrogen'], answer: 1 },
    { question: 'What is the formula for speed?', options: ['Force × distance', 'Distance ÷ time', 'Mass × acceleration', 'Time ÷ distance'], answer: 1 },
    { question: 'Which organ removes waste from the blood?', options: ['Heart', 'Lungs', 'Kidneys', 'Liver'], answer: 2 },
    { question: 'What is the chemical symbol for water?', options: ['H₂', 'O₂', 'H₂O', 'CO₂'], answer: 2 },
    { question: 'What type of energy is stored in a stretched spring?', options: ['Kinetic', 'Potential', 'Thermal', 'Electrical'], answer: 1 },
    { question: 'What happens to an acid when it reacts with a base?', options: ['It becomes more acidic', 'It is neutralised', 'It evaporates', 'It freezes'], answer: 1 },
    { question: 'What unit is used to measure electric current?', options: ['Volts', 'Watts', 'Amperes', 'Ohms'], answer: 2 },
  ],
  'Food & Nutrition': [
    { question: "Which nutrient is the body's main source of energy?", options: ['Protein', 'Carbohydrates', 'Vitamins', 'Water'], answer: 1 },
    { question: 'How many food groups are in the Caribbean Food Guide?', options: ['3', '4', '5', '6'], answer: 3 },
    { question: 'What is the safe internal temperature for cooked chicken?', options: ['55°C', '65°C', '75°C', '100°C'], answer: 2 },
    { question: 'Which vitamin helps prevent scurvy?', options: ['Vitamin A', 'Vitamin B', 'Vitamin C', 'Vitamin D'], answer: 2 },
    { question: 'What is the process of preserving food using salt or sugar called?', options: ['Fermentation', 'Osmosis', 'Canning', 'Freezing'], answer: 1 },
    { question: 'Which cooking method uses steam to cook food?', options: ['Frying', 'Grilling', 'Steaming', 'Baking'], answer: 2 },
    { question: 'What is a common dietary disease in the Caribbean?', options: ['Scurvy', 'Diabetes', 'Rickets', 'Goitre'], answer: 1 },
    { question: 'Which local Trinidad dish reflects Indian cultural influence?', options: ['Pelau', 'Roti', 'Bake and Shark', 'Callaloo'], answer: 1 },
    { question: 'What does "cross-contamination" mean in the kitchen?', options: ['Mixing two recipes', 'Transferring bacteria from one food to another', 'Using the wrong pan', 'Overcooking food'], answer: 1 },
    { question: 'Which mineral is important for strong bones?', options: ['Iron', 'Calcium', 'Sodium', 'Potassium'], answer: 1 },
  ],
  'Physical Education': [
    { question: 'What does FITT stand for in fitness training?', options: ['Frequency, Intensity, Time, Type', 'Fast, Intense, Tough, Tiring', 'Flexibility, Injury, Training, Therapy', 'Frequency, Incline, Time, Tone'], answer: 0 },
    { question: 'Which is a cardiorespiratory endurance activity?', options: ['Weight lifting', 'Long-distance running', 'Stretching', 'Yoga'], answer: 1 },
    { question: 'How many players are on a cricket team during play?', options: ['9', '10', '11', '12'], answer: 2 },
    { question: 'What is the primary muscle used in a push-up?', options: ['Quadriceps', 'Biceps', 'Pectorals', 'Calves'], answer: 2 },
    { question: 'In football (soccer), what is a "hat-trick"?', options: ['Three saves by a goalkeeper', 'Three goals by one player in a match', 'Three yellow cards', 'Three substitutions'], answer: 1 },
    { question: 'What is the resting heart rate of a healthy adult?', options: ['40-50 bpm', '60-100 bpm', '100-120 bpm', '120-150 bpm'], answer: 1 },
    { question: 'Which sport uses a net, rim, and backboard?', options: ['Cricket', 'Netball/Basketball', 'Swimming', 'Track'], answer: 1 },
    { question: 'What does "aerobic" exercise primarily improve?', options: ['Strength', 'Flexibility', 'Heart and lung efficiency', 'Balance'], answer: 2 },
    { question: 'In swimming, which stroke is fastest for most people?', options: ['Breaststroke', 'Backstroke', 'Freestyle (front crawl)', 'Butterfly'], answer: 2 },
    { question: 'What is sportsmanship?', options: ['Winning at all costs', 'Fair play and respect for opponents', 'Arguing with referees', 'Showing off after scoring'], answer: 1 },
  ],
  'Visual Arts': [
    { question: 'Which is NOT one of the elements of art?', options: ['Line', 'Colour', 'Rhythm', 'Shape'], answer: 2 },
    { question: 'What are the three primary colours?', options: ['Red, yellow, blue', 'Red, green, blue', 'Orange, purple, green', 'Black, white, grey'], answer: 0 },
    { question: 'What is "value" in art?', options: ['The cost of the artwork', 'The lightness or darkness of a colour', 'The size of the canvas', 'The subject matter'], answer: 1 },
    { question: 'Which technique creates the illusion of depth on a flat surface?', options: ['Perspective', 'Calligraphy', 'Origami', 'Stencilling'], answer: 0 },
    { question: 'What colours are made by mixing two primary colours?', options: ['Tertiary', 'Secondary', 'Complementary', 'Analogous'], answer: 1 },
    { question: 'Who is a famous Trinidad & Tobago painter?', options: ['Michele Pearson Clarke', 'LeRoy Clarke', 'V.S. Naipaul', 'Nicki Minaj'], answer: 1 },
    { question: 'What is a "composition" in visual arts?', options: ['A type of paint', 'The arrangement of elements in an artwork', 'A musical score', 'A sculpture material'], answer: 1 },
    { question: 'Which principle of design refers to visual equality?', options: ['Contrast', 'Balance', 'Emphasis', 'Pattern'], answer: 1 },
    { question: 'What is "texture" in art?', options: ['The colour scheme', 'How a surface feels or looks like it feels', 'The frame of the painting', 'The type of brush used'], answer: 1 },
    { question: 'Which medium uses pigments suspended in water-soluble binder?', options: ['Oil paint', 'Watercolour', 'Charcoal', 'Clay'], answer: 1 },
  ],
  'English A': [
    { question: 'In a CSEC summary, what should you do?', options: ['Add your own opinions', 'Use only the main points from the passage', 'Copy the passage word for word', 'Write more than the original passage'], answer: 1 },
    { question: 'What is the purpose of an expository essay?', options: ['To entertain', 'To explain or inform', 'To argue against something', 'To tell a story'], answer: 1 },
    { question: 'Which sentence is grammatically correct?', options: ['Me and him went to the store.', 'He and I went to the store.', 'Him and me went to the store.', 'I and him went to the store.'], answer: 1 },
    { question: 'What is a topic sentence?', options: ['The last sentence of a paragraph', 'The sentence that states the main idea', 'A sentence with a question', 'A sentence about the weather'], answer: 1 },
    { question: 'In persuasive writing, what is a "call to action"?', options: ['A summary of facts', 'A statement urging the reader to do something', 'A description of the topic', 'A counter-argument'], answer: 1 },
    { question: 'Which is a characteristic of formal writing?', options: ['Use of contractions', 'Use of slang', 'Use of complete sentences', 'Use of abbreviations like "u"'], answer: 2 },
    { question: 'What does "coherence" mean in writing?', options: ['Using big words', 'Logical flow and connection of ideas', 'Having no errors', 'Writing quickly'], answer: 1 },
    { question: 'Which transition word shows contrast?', options: ['Furthermore', 'However', 'Therefore', 'Moreover'], answer: 1 },
    { question: 'What is the difference between "its" and "it\'s"?', options: ['They mean the same thing', '"Its" is possessive; "it\'s" means "it is"', 'Both are possessive', '"Its" means "it is"'], answer: 1 },
    { question: 'In comprehension, what does "infer" mean?', options: ['To read aloud', 'To work out meaning from clues in the text', 'To copy the exact words', 'To guess randomly'], answer: 1 },
  ],
  'English B': [
    { question: 'What is the setting of a literary work?', options: ['The author\'s name', 'The time and place of the story', 'The number of pages', 'The publisher'], answer: 1 },
    { question: 'In poetry, what is a "stanza"?', options: ['The title of the poem', 'A group of lines forming a unit', 'The rhyme scheme', 'The poet\'s name'], answer: 1 },
    { question: 'What is "dramatic irony"?', options: ["When the audience knows what characters don't", 'When something is funny on stage', 'When the actors are dramatic', 'When the play is long'], answer: 0 },
    { question: 'What does "characterisation" refer to?', options: ['How characters are developed and presented', 'The number of characters', 'The actors playing roles', 'The costumes worn'], answer: 0 },
    { question: 'A "protagonist" is...', options: ['The villain', 'The main character', 'The narrator', 'The author'], answer: 1 },
    { question: 'What is a "soliloquy" in drama?', options: ['A fight scene', 'A speech where a character reveals their thoughts alone on stage', 'A song', 'A dialogue between two characters'], answer: 1 },
    { question: 'In "A Midsummer Night\'s Dream", who are the lovers?', options: ['Hamlet and Ophelia', 'Hermia, Lysander, Helena, Demetrius', 'Romeo and Juliet', 'Othello and Desdemona'], answer: 1 },
    { question: 'What is a "simile"?', options: ['A comparison using "like" or "as"', 'A direct comparison', 'A type of rhyme', 'A type of character'], answer: 0 },
    { question: 'What does the "theme" of a literary work refer to?', options: ['The physical setting', 'The central message or underlying idea', 'The plot events', 'The character names'], answer: 1 },
    { question: 'In the CSEC text "To Kill a Mockingbird", what does the mockingbird symbolise?', options: ['Violence', 'Innocence and goodness', 'Racism', 'Wealth'], answer: 1 },
  ],
  'Biology': [
    { question: 'What organelle is the "powerhouse" of the cell?', options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Golgi body'], answer: 1 },
    { question: 'What is the product of photosynthesis?', options: ['Carbon dioxide', 'Glucose and oxygen', 'Water only', 'Nitrogen'], answer: 1 },
    { question: 'Which blood vessels carry blood away from the heart?', options: ['Veins', 'Arteries', 'Capillaries', 'Valves'], answer: 1 },
    { question: 'What is the basic unit of heredity?', options: ['Protein', 'Gene', 'Enzyme', 'Hormone'], answer: 1 },
    { question: 'In Mendelian genetics, what is a "heterozygous" genotype?', options: ['Two identical alleles', 'Two different alleles', 'Only one allele', 'No alleles'], answer: 1 },
    { question: 'Which process divides a cell into two identical daughter cells?', options: ['Meiosis', 'Mitosis', 'Fertilisation', 'Mutation'], answer: 1 },
    { question: 'What is the primary function of the kidneys?', options: ['To pump blood', 'To filter waste from blood and produce urine', 'To digest food', 'To produce hormones'], answer: 1 },
    { question: 'In a food chain, organisms that make their own food are called?', options: ['Consumers', 'Producers', 'Decomposers', 'Predators'], answer: 1 },
    { question: 'What gas is released during respiration?', options: ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Hydrogen'], answer: 1 },
    { question: 'Which type of reproduction involves only one parent?', options: ['Sexual reproduction', 'Asexual reproduction', 'Fertilisation', 'Pollination'], answer: 1 },
  ],
  'Chemistry': [
    { question: 'What is the atomic number of carbon?', options: ['4', '6', '8', '12'], answer: 1 },
    { question: 'Which type of bond is formed by sharing electrons?', options: ['Ionic', 'Covalent', 'Metallic', 'Hydrogen'], answer: 1 },
    { question: 'What is the mole concept used for?', options: ['Measuring temperature', 'Counting particles by mass', 'Measuring volume', 'Measuring density'], answer: 1 },
    { question: 'What is the pH of a 0.1M HCl solution?', options: ['1', '7', '13', '14'], answer: 0 },
    { question: 'Which gas is produced when a metal reacts with an acid?', options: ['Oxygen', 'Hydrogen', 'Carbon dioxide', 'Nitrogen'], answer: 1 },
    { question: 'What is the general formula for alkanes?', options: ['CnH2n', 'CnH2n+2', 'CnH2n-2', 'CnHn'], answer: 1 },
    { question: 'In a titration, what is the equivalence point?', options: ['When the colour changes permanently', 'When moles of acid equal moles of base', 'When the solution boils', 'When the indicator is added'], answer: 1 },
    { question: 'Which separation technique is used for a solid dissolved in a liquid?', options: ['Filtration', 'Evaporation', 'Distillation', 'Chromatography'], answer: 1 },
    { question: 'What is the charge on a neutron?', options: ['+1', '-1', '0 (neutral)', '+2'], answer: 2 },
    { question: 'Which is a property of metals?', options: ['Brittle', 'Good conductor of electricity', 'Low melting point', 'Transparent'], answer: 1 },
  ],
  'Physics': [
    { question: 'What is the SI unit of force?', options: ['Joule', 'Newton', 'Watt', 'Pascal'], answer: 1 },
    { question: 'According to Hooke\'s Law, force is proportional to...', options: ['Mass', 'Extension', 'Time', 'Velocity'], answer: 1 },
    { question: 'What is the speed of light in a vacuum?', options: ['3 × 10⁶ m/s', '3 × 10⁸ m/s', '3 × 10¹⁰ m/s', '3 × 10⁴ m/s'], answer: 1 },
    { question: 'In Ohm\'s Law, V = IR. What does R represent?', options: ['Voltage', 'Current', 'Resistance', 'Power'], answer: 2 },
    { question: 'Which type of wave requires a medium to travel?', options: ['Electromagnetic wave', 'Mechanical wave', 'Light wave', 'Radio wave'], answer: 1 },
    { question: 'What happens to light when it passes from air into glass?', options: ['It speeds up', 'It bends towards the normal', 'It bends away from the normal', 'It stops'], answer: 1 },
    { question: 'What is the unit of electrical power?', options: ['Volt', 'Ampere', 'Watt', 'Ohm'], answer: 2 },
    { question: 'Newton\'s second law states that F = ?', options: ['mv', 'ma', 'mg', 'mgh'], answer: 1 },
    { question: 'What is the refractive index formula?', options: ['sin i / sin r', 'sin r / sin i', 'cos i / cos r', 'tan i / tan r'], answer: 0 },
    { question: 'Which quantity is a vector?', options: ['Speed', 'Mass', 'Velocity', 'Temperature'], answer: 2 },
  ],
  'Principles of Business': [
    { question: 'What is a sole trader?', options: ['A business owned by shareholders', 'A business owned and run by one person', 'A partnership of two people', 'A government entity'], answer: 1 },
    { question: 'What are the "4 Ps" of the marketing mix?', options: ['Product, Price, Place, Promotion', 'People, Process, Planning, Profit', 'Product, Profit, People, Place', 'Price, Planning, Production, Promotion'], answer: 0 },
    { question: 'What is "working capital"?', options: ['Money invested in fixed assets', 'Current assets minus current liabilities', 'Total revenue', 'Total profit'], answer: 1 },
    { question: 'Which economic system allows private ownership of businesses?', options: ['Command economy', 'Market/Capitalist economy', 'Mixed economy only', 'Traditional economy'], answer: 1 },
    { question: 'What does CARICOM stand for?', options: ['Caribbean Common Market', 'Caribbean Community and Common Market', 'Caribbean Regional Council', 'Caribbean International Commerce'], answer: 1 },
    { question: 'What is "limited liability" in a company?', options: ['Owners can only lose what they invested', 'Owners have unlimited debt', 'No one is responsible', 'The company cannot borrow'], answer: 0 },
    { question: 'Which is a source of business finance?', options: ['Bank loans', 'Retained profits', 'Share capital', 'All of the above'], answer: 3 },
    { question: 'What is the role of a consumer protection agency?', options: ['To protect businesses from consumers', 'To protect consumers from unfair practices', 'To collect taxes', 'To set prices'], answer: 1 },
    { question: 'In production, what are "factors of production"?', options: ['Land, labour, capital, entrepreneurship', 'Money, machines, materials, marketing', 'People, products, prices, places', 'Raw materials, transport, sales, profit'], answer: 0 },
    { question: 'What is a "balance sheet"?', options: ['A statement of profit and loss', 'A snapshot of assets, liabilities and capital', 'A sales record', 'A marketing plan'], answer: 1 },
  ],
  'Information Technology': [
    { question: 'What does CPU stand for?', options: ['Central Processing Unit', 'Computer Personal Unit', 'Central Process Utility', 'Computer Processing Unit'], answer: 0 },
    { question: 'Which is system software?', options: ['Microsoft Word', 'Windows Operating System', 'Google Chrome', 'WhatsApp'], answer: 1 },
    { question: 'In a spreadsheet, what does =SUM(A1:A10) do?', options: ['Counts cells A1 to A10', 'Adds values in cells A1 through A10', 'Averages values A1 to A10', 'Finds the maximum value'], answer: 1 },
    { question: 'What does HTML stand for?', options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlink Text Management Language'], answer: 0 },
    { question: 'Which is an example of an input device?', options: ['Monitor', 'Keyboard', 'Printer', 'Speaker'], answer: 1 },
    { question: 'What is a database primary key?', options: ['A type of query', 'A unique identifier for each record', 'A password', 'A backup method'], answer: 1 },
    { question: 'In Pascal, what does "BEGIN ... END" define?', options: ['A comment', 'A block of statements', 'A variable', 'A loop condition'], answer: 1 },
    { question: 'What does a flowchart diamond shape represent?', options: ['Start/End', 'Process', 'Decision', 'Input/Output'], answer: 2 },
    { question: 'Which network connects computers within a small geographic area?', options: ['WAN', 'LAN', 'MAN', 'PAN'], answer: 1 },
    { question: 'What is phishing?', options: ['A type of computer virus', 'A cyberattack that tricks users into revealing personal information', 'A network protocol', 'A type of software'], answer: 1 },
  ],
  'Industrial Technology': [
    { question: 'Which is a softwood commonly used in construction?', options: ['Mahogany', 'Pine', 'Teak', 'Oak'], answer: 1 },
    { question: 'What does an orthographic projection show?', options: ['A 3D view of an object', 'Multiple 2D views of an object (top, front, side)', 'A coloured rendering', 'A perspective drawing'], answer: 1 },
    { question: 'Which tool is used for cutting metal?', options: ['Tenon saw', 'Hacksaw', 'Cop saw', 'Rip saw'], answer: 1 },
    { question: 'What is the purpose of a datum line in technical drawing?', options: ['To add colour', 'To provide a reference point for measurements', 'To draw borders', 'To label parts'], answer: 1 },
    { question: 'Which joining method uses heat to melt a filler metal?', options: ['Bolting', 'Soldering/brazing', 'Nailing', 'Screwing'], answer: 1 },
    { question: 'What is isometric drawing?', options: ['A 2D flat drawing', 'A 3D representation with 30-degree angles', 'A blueprint', 'A photograph'], answer: 1 },
    { question: 'Which safety device protects against electrical overload?', options: ['Insulation tape', 'Fuse or circuit breaker', 'Wire nut', 'Ground rod'], answer: 1 },
    { question: 'What is "tolerance" in manufacturing?', options: ['The colour of a material', 'The acceptable range of variation in a dimension', 'The weight of a component', 'The cost of production'], answer: 1 },
    { question: 'Which power source is renewable?', options: ['Diesel generator', 'Solar panel', 'Coal plant', 'Natural gas turbine'], answer: 1 },
    { question: 'In building construction, what is a "load-bearing wall"?', options: ['A decorative wall', 'A wall that supports the weight of the structure above it', 'A temporary wall', 'A partition wall'], answer: 1 },
  ],
};

type Phase = 'quiz' | 'result';

export function QuizActivity({ onComplete, onCancel, subject, moduleTitle, difficulty }: QuizActivityProps) {
  const questions = useMemo(
    () => generateQuestions(subject, moduleTitle, difficulty),
    [subject, moduleTitle, difficulty]
  );
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [phase, setPhase] = useState<Phase>('quiz');

  const question = questions[currentQ];
  const isLastQuestion = currentQ === questions.length - 1;

  const handleSelect = useCallback((idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
  }, [selected]);

  function handleNext() {
    if (selected === null) return;
    const newAnswers = [...answers, selected];
    setAnswers(newAnswers);

    if (isLastQuestion) {
      setPhase('result');
    } else {
      setCurrentQ((q) => q + 1);
      setSelected(null);
    }
  }

  function handleRetry() {
    setCurrentQ(0);
    setSelected(null);
    setAnswers([]);
    setPhase('quiz');
  }

  if (phase === 'result') {
    const correctCount = answers.filter((a, i) => a === questions[i].answer).length;
    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= PASS_THRESHOLD;

    return (
      <div className="flex flex-col items-center gap-5 py-4">
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-lg ${
            passed
              ? 'bg-gradient-to-br from-brand-400 to-brand-600 shadow-brand-500/30'
              : 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-500/30'
          } animate-pop`}
        >
          {passed ? (
            <Trophy className="w-10 h-10 text-white" />
          ) : (
            <Target className="w-10 h-10 text-white" />
          )}
        </div>

        <div className="text-center">
          <h3 className={`text-2xl font-bold font-display ${passed ? 'text-brand-700' : 'text-amber-700'}`}>
            {passed ? 'Quiz Passed!' : 'Almost There!'}
          </h3>
          <p className="text-slate-500 mt-1">
            You scored <strong className="text-slate-700">{correctCount}/{questions.length}</strong> ({score}%)
          </p>
          <p className="text-xs text-slate-400 mt-2">
            {passed
              ? `Great work! You've unlocked the next topic.`
              : `You need ${PASS_THRESHOLD}% to unlock the next topic. Try again!`}
          </p>
        </div>

        <div className="w-full space-y-2 mt-2">
          {questions.map((q, i) => {
            const userAnswer = answers[i];
            const isCorrect = userAnswer === q.answer;
            return (
              <div
                key={i}
                className={`flex items-start gap-3 p-3 rounded-xl text-sm ${
                  isCorrect ? 'bg-brand-50' : 'bg-red-50'
                }`}
              >
                {isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                )}
                <div className="min-w-0">
                  <p className="text-slate-700 font-medium">{q.question}</p>
                  {!isCorrect && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      Correct answer: {q.options[q.answer]}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 w-full pt-2">
          <button
            onClick={handleRetry}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition-colors text-sm"
          >
            <RotateCcw className="w-4 h-4" /> Retry
          </button>
          {passed ? (
            <button
              onClick={() => onComplete(score, true)}
              className="flex-[2] flex items-center justify-center gap-2 px-4 py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition-colors shadow-md shadow-brand-600/20 text-sm"
            >
              Complete & Unlock Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition-colors text-sm"
            >
              Back to Dashboard
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Progress bar */}
      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
        <span className="font-semibold text-slate-500">{subject} Quiz</span>
        <span>Question {currentQ + 1} of {questions.length}</span>
      </div>
      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-500 rounded-full transition-all duration-300"
          style={{ width: `${((currentQ + (selected !== null ? 0.5 : 0)) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="bg-slate-50 rounded-2xl p-5 text-center">
        <p className="text-lg font-semibold text-slate-800 leading-snug">{question.question}</p>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 gap-3">
        {question.options.map((opt, idx) => {
          const isSelected = idx === selected;
          const showResult = selected !== null;
          const isAnswer = idx === question.answer;

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={showResult}
              className={`flex items-center gap-3 px-5 py-4 rounded-xl border-2 text-left font-medium transition-all ${
                showResult
                  ? isAnswer
                    ? 'border-brand-400 bg-brand-50 text-brand-700'
                    : isSelected
                      ? 'border-red-300 bg-red-50 text-red-600'
                      : 'border-slate-100 bg-white text-slate-400'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50/40 hover:shadow-sm active:scale-[0.98]'
              }`}
            >
              <span
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                  showResult
                    ? isAnswer
                      ? 'bg-brand-500 text-white'
                      : isSelected
                        ? 'bg-red-400 text-white'
                        : 'bg-slate-200 text-slate-400'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="flex-1">{opt}</span>
              {showResult && isAnswer && <CheckCircle2 className="w-5 h-5 text-brand-500" />}
              {showResult && isSelected && !isAnswer && <XCircle className="w-5 h-5 text-red-400" />}
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition-colors text-sm"
        >
          Exit
        </button>
        <button
          onClick={handleNext}
          disabled={selected === null}
          className="flex-[2] flex items-center justify-center gap-2 px-4 py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLastQuestion ? 'See Results' : 'Next Question'}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <p className="text-center text-xs text-slate-400">
        Score 85% or higher to unlock the next topic
      </p>
    </div>
  );
}
