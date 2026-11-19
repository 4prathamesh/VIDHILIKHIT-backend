// Assumption: Structured Parashari knowledge base covering all 24 Rahu and Ketu Bhava placements (Houses 1-12) without universalized predictions or Lal Kitab mixing.

const METHODOLOGY = 'Parashari';
const DEFAULT_DISCLAIMER =
  'A house placement alone never determines a complete life prediction. Results depend on sign dispositor strength, Nakshatra lord, conjunctions, Parashari aspects, divisional charts, and running Dasha/Antardasha.';

const RAHU_BHAVA_INTERPRETATIONS = {
  1: {
    planet: 'Rahu',
    houseNumber: 1,
    bhavaName: 'Tanu Bhava',
    methodology: METHODOLOGY,
    traditionalMeaning:
      'Rahu in the 1st Bhava amplifies individuality, unconventional self-expression, strong worldly ambition, and an intense drive to shape one’s personal identity.',
    generalLifeThemes: ['Identity', 'Personality', 'Ambition', 'Self-image', 'Approach to life', 'Personal desires'],
    positivePossibilities: [
      'Charismatic, pioneering presence that stands out from conventional norms',
      'Strong adaptability in multicultural or rapidly changing environments',
      'Resourceful self-reinvention and bold leadership initiatives',
    ],
    potentialChallenges: [
      'Restlessness regarding self-image or over-identification with external validation',
      'Impulsive decisions when chasing rapid personal advancement',
      'Periodic confusion about personal direction if the Ascendant lord is weak',
    ],
    psychologicalBehaviouralThemes:
      'Heightened curiosity toward the unfamiliar, desire to break established moulds, and strong focus on self-actualization.',
    relationshipWithBhavaLord:
      'Strongly mirrors the condition of the Lagna (1st house) lord; a well-placed Lagna lord channels Rahu’s drive constructively.',
    relevantRashiInfluence:
      'Earth and Air signs often express ambition pragmatically or intellectually, while Fire and Water signs heighten intensity or emotional urgency.',
    nakshatraAndLordInfluence:
      'The Nakshatra deity and lord refine how the native projects personality and whether desires incline toward innovation, authority, or sensory pursuits.',
    dispositorCondition:
      'Rahu acts predominantly as an agent of its sign dispositor (Lagna lord); exaltation or Kendra/Trikona placement of the dispositor stabilizes outcomes.',
    aspectsAndConjunctions:
      'Benefic aspects (Jupiter, unafflicted Venus) moderate extremes and add wisdom; malefic conjunctions intensify urgency and require disciplined grounding.',
    dashaAndAntardashaConditions:
      'Themes become prominently active during Rahu Mahadasha, Rahu Antardasha, or periods ruled by the 1st house lord.',
    transitConditions:
      'Nodal return (~18.6-year cycles) and nodal half-returns trigger major milestones in personal identity and life trajectory.',
    supportingAndContradictoryFactors:
      'A strong Sun and Moon support inner clarity; an afflicted Lagna lord or Moon may increase self-doubt despite outward boldness.',
    strengthModifiers: {
      strongerWhen: 'Placed in Taurus, Gemini, Virgo, or Aquarius with a dignified Lagna lord and Jupiter’s drishti.',
      weakerOrStrainedWhen: 'Dispositor is debilitated, combust, or placed in dusthana (6th/8th/12th) without benefic relief.',
    },
    sourceReferences: [
      'Brihat Parashara Hora Shastra (BPHS) — Ch. 24 (Effects of House Lords & Nodes)',
      'Phaladeepika — Ch. 8 (Planetary Effects in Bhavas)',
    ],
    confidenceLevel: 'Classical-Consensus',
  },
  2: {
    planet: 'Rahu',
    houseNumber: 2,
    bhavaName: 'Dhana Bhava',
    methodology: METHODOLOGY,
    traditionalMeaning:
      'Rahu in the 2nd Bhava directs intense focus toward accumulated resources, persuasive or unconventional speech, family dynamics, and evolving personal values.',
    generalLifeThemes: ['Speech', 'Family environment', 'Accumulated wealth', 'Food habits', 'Values', 'Financial behaviour'],
    positivePossibilities: [
      'Ability to build wealth through modern, foreign, or non-traditional streams',
      'Compelling, articulate, or multilingual communication style',
      'Strong motivation to elevate family material standing',
    ],
    potentialChallenges: [
      'Fluctuations in savings if financial discipline is neglected',
      'Blunt or misunderstood speech during stressful transits',
      'Irregular dietary habits or unconventional family expectations',
    ],
    psychologicalBehaviouralThemes:
      'Deep preoccupation with material security and self-worth measured through tangible assets or vocal influence.',
    relationshipWithBhavaLord:
      'Financial stability hinges on the 2nd house lord; a dignified 2nd lord turns Rahu’s hunger into sustained accumulation.',
    relevantRashiInfluence:
      'Benefic signs (Taurus, Libra, Gemini, Virgo) favor diplomacy and trade; fiery signs can sharpen speech.',
    nakshatraAndLordInfluence:
      'Nakshatra placement nuances vocal expression, dietary preferences, and the specific channels of wealth creation.',
    dispositorCondition:
      'When the 2nd lord is in a Kendra, Trikona, or 11th house, material growth is significantly supported.',
    aspectsAndConjunctions:
      'Jupiter’s aspect refines speech and ethics; conjunction with 2nd or 11th lord accentuates financial ambition.',
    dashaAndAntardashaConditions:
      'Major financial shifts, family restructuring, or changes in income streams often coincide with Rahu or 2nd-lord Dashas.',
    transitConditions:
      'Transits of Saturn or Rahu across the 2nd/8th axis test budgeting and family communication.',
    supportingAndContradictoryFactors:
      'Strong 11th house and Jupiter support savings; afflictions to Mercury or the 2nd lord call for careful contractual review.',
    strengthModifiers: {
      strongerWhen: '2nd lord is strong and unafflicted, with benefic aspect on the 2nd house.',
      weakerOrStrainedWhen: '2nd lord is debilitated or hemmed between malefics.',
    },
    sourceReferences: [
      'Brihat Parashara Hora Shastra (BPHS) — Dhana Bhava Principles',
      'Phaladeepika — Ch. 8 (Rahu in 2nd House)',
    ],
    confidenceLevel: 'Classical-Consensus',
  },
  3: {
    planet: 'Rahu',
    houseNumber: 3,
    bhavaName: 'Sahaja Bhava',
    methodology: METHODOLOGY,
    traditionalMeaning:
      'Traditionally considered an Upachaya (growth) house where Rahu strengthens courage, initiative, strategic communication, and self-made effort over time.',
    generalLifeThemes: ['Courage', 'Communication', 'Siblings', 'Initiative', 'Skills', 'Efforts', 'Self-expression'],
    positivePossibilities: [
      'High enterprise, fearlessness in calculated risk-taking, and strong determination',
      'Proficiency in media, technology, writing, marketing, or technical skills',
      'Steady improvement of results through persistent personal effort (Upachaya nature)',
    ],
    potentialChallenges: [
      'Occasional distance, rivalry, or unconventional dynamics with younger siblings',
      'Restless mind seeking constant stimulation or short-distance travel',
      'Overcommitting energy across too many parallel initiatives',
    ],
    psychologicalBehaviouralThemes:
      'Action-oriented mindset, inventive problem-solving, and eagerness to master modern tools of expression.',
    relationshipWithBhavaLord:
      'A well-placed 3rd lord channels boldness into concrete achievements and constructive sibling relations.',
    relevantRashiInfluence:
      'Air and Fire signs energize communication and entrepreneurship; Earth signs promote methodical skill mastery.',
    nakshatraAndLordInfluence:
      'Nakshatra lord indicates whether courage manifests through intellectual persuasion, artistic craft, or physical endurance.',
    dispositorCondition:
      'Strong dispositor converts restlessness into sustained professional and creative momentum.',
    aspectsAndConjunctions:
      'Conjunction with Mercury or Mars boosts technical acumen; Jupiter’s aspect adds strategic foresight.',
    dashaAndAntardashaConditions:
      'Rahu periods frequently initiate bold career pivots, publishing, travel, or independent ventures.',
    transitConditions:
      'Favorable Jupiter or Saturn transits over the 3rd house consolidate long-term skill recognition.',
    supportingAndContradictoryFactors:
      'Strong Mars and Mercury amplify execution; weak 3rd lord can scatter focus.',
    strengthModifiers: {
      strongerWhen: 'Positioned in an Upachaya house (3rd) with strong 3rd lord and Mars support.',
      weakerOrStrainedWhen: 'Afflicted by debilitated dispositor or severe malefic conjunctions without benefic aspect.',
    },
    sourceReferences: [
      'Brihat Parashara Hora Shastra (BPHS) — Upachaya Placement Principles',
      'Saravali — Effects of Malefics in 3rd Bhava',
    ],
    confidenceLevel: 'Classical-Consensus',
  },
  4: {
    planet: 'Rahu',
    houseNumber: 4,
    bhavaName: 'Sukha Bhava',
    methodology: METHODOLOGY,
    traditionalMeaning:
      'Rahu in the 4th Bhava creates strong desires around home, property, vehicles, formal learning, and emotional foundations, often involving residence away from one’s birthplace.',
    generalLifeThemes: ['Mother', 'Home', 'Property', 'Emotional security', 'Education', 'Domestic environment'],
    positivePossibilities: [
      'Acquisition of modern real estate, vehicles, or property in foreign/cosmopolitan regions',
      'Unconventional or specialized academic pursuits (technology, research, psychology)',
      'Drive to build an impressive domestic base',
    ],
    potentialChallenges: [
      'Inner restlessness or difficulty feeling completely settled in one place',
      'Complex emotional expectations within the home or maternal environment',
      'Need for thorough due diligence in property transactions',
    ],
    psychologicalBehaviouralThemes:
      'Search for deep emotional peace paired with an outward desire for material comfort and domestic expansion.',
    relationshipWithBhavaLord:
      'The 4th lord and Moon govern emotional equilibrium; when strong, they provide steady domestic contentment.',
    relevantRashiInfluence:
      'Fixed signs stabilize property ownership; movable signs increase relocation or foreign residence.',
    nakshatraAndLordInfluence:
      'Nakshatra qualities color the emotional tone of childhood memory and domestic aspirations.',
    dispositorCondition:
      'A dignified 4th lord protects maternal well-being, real estate gains, and educational completion.',
    aspectsAndConjunctions:
      'Jupiter’s aspect brings warmth and protection to home life; Saturn conjunction may slow property milestones while teaching patience.',
    dashaAndAntardashaConditions:
      'Relocations, home renovations, property purchases, or shifts in family routine often arise in Rahu Dashas.',
    transitConditions:
      'Transits across the 4th/10th Kendra axis balance domestic responsibilities with career ambition.',
    supportingAndContradictoryFactors:
      'Bright, unafflicted Moon eases emotional restlessness; weak Moon/4th lord calls for grounding routines.',
    strengthModifiers: {
      strongerWhen: '4th lord and Moon are strong, and benefics aspect the 4th house.',
      weakerOrStrainedWhen: 'Both 4th lord and Moon are severely afflicted.',
    },
    sourceReferences: [
      'Brihat Parashara Hora Shastra (BPHS) — Sukha Bhava Effects',
      'Phaladeepika — Ch. 8 (Rahu in 4th House)',
    ],
    confidenceLevel: 'Classical-Consensus',
  },
  5: {
    planet: 'Rahu',
    houseNumber: 5,
    bhavaName: 'Putra Bhava',
    methodology: METHODOLOGY,
    traditionalMeaning:
      'Rahu in the 5th Bhava stimulates sharp, inventive intellect, unconventional creativity, strong romantic intensity, and attraction to speculative or strategic pursuits.',
    generalLifeThemes: ['Intelligence', 'Education', 'Creativity', 'Children', 'Romance', 'Speculation', 'Intellectual pursuits'],
    positivePossibilities: [
      'Out-of-the-box analytical thinking, innovation, and artistic or strategic brilliance',
      'Magnetic creative expression in media, tech, design, or advisory fields',
      'Deep curiosity for specialized or modern disciplines of study',
    ],
    potentialChallenges: [
      'Over-analysis, speculative risk-taking, or impulsive romantic attachments',
      'Anxieties or delays around children/education if the 5th lord and Jupiter are strained',
      'Difficulty quieting an intensely active intellect',
    ],
    psychologicalBehaviouralThemes:
      'Desire for intellectual distinction, creative recognition, and dramatic or deeply engaging personal expression.',
    relationshipWithBhavaLord:
      'The 5th lord acts as the primary anchor for wisdom and sound judgment; its strength decides whether brilliance yields lasting merit.',
    relevantRashiInfluence:
      'Water signs (like Cancer) blend intuition with creative imagination; Air/Earth signs enhance technical and strategic precision.',
    nakshatraAndLordInfluence:
      'Nakshatra lord indicates whether creative intelligence leans toward research, performance, strategy, or spiritual inquiry.',
    dispositorCondition:
      'A strong 5th dispositor channels Rahu’s inventiveness into tangible academic, artistic, or advisory success.',
    aspectsAndConjunctions:
      'Conjunction with Mercury or Sun intensifies intellect (requiring watchfulness against ego or nervous strain); Jupiter’s aspect stabilizes judgment and protects progeny matters.',
    dashaAndAntardashaConditions:
      'Rahu periods often bring breakthroughs in education, creative projects, romance, or major shifts in mentorship/children’s milestones.',
    transitConditions:
      'Jupiter transiting over the 5th house or 9th house brings constructive clarity to creative and educational goals.',
    supportingAndContradictoryFactors:
      'Strong Jupiter (Putrakaraka) and 5th lord mitigate speculative errors; afflicted 5th lord advises caution in high-risk speculation.',
    strengthModifiers: {
      strongerWhen: '5th lord is well-placed in a Kendra/Trikona and Jupiter supports the 5th house or its lord.',
      weakerOrStrainedWhen: '5th lord is debilitated or combust without benefic aspect, increasing speculative volatility.',
    },
    sourceReferences: [
      'Brihat Parashara Hora Shastra (BPHS) — Putra Bhava Principles',
      'Phaladeepika — Ch. 8 (Rahu in 5th House)',
    ],
    confidenceLevel: 'Classical-Consensus',
  },
  6: {
    planet: 'Rahu',
    houseNumber: 6,
    bhavaName: 'Ari Bhava',
    methodology: METHODOLOGY,
    traditionalMeaning:
      'Classically praised as one of Rahu’s strongest Upachaya placements, granting resilience against competitors, strategic mastery over obstacles, and capacity to resolve complex disputes.',
    generalLifeThemes: ['Competition', 'Enemies', 'Debts', 'Disputes', 'Service', 'Health-related tendencies', 'Obstacles'],
    positivePossibilities: [
      'Strong competitive edge in law, medicine, analytics, troubleshooting, or corporate rivalry',
      'Ability to outmaneuver opposition and overcome structural hurdles over time',
      'Resourceful management of service operations and large teams',
    ],
    potentialChallenges: [
      'Tendency toward stress-related or difficult-to-diagnose lifestyle ailments if health routines lapse',
      'Occasional legal, workplace, or debt-management friction requiring ethical vigilance',
      'Overworking in competitive environments',
    ],
    psychologicalBehaviouralThemes:
      'Pragmatic fighter spirit, strategic alertness, and satisfaction derived from conquering difficult problems.',
    relationshipWithBhavaLord:
      'When the 6th lord is well-handled, Rahu neutralizes adversaries without creating unnecessary enmity.',
    relevantRashiInfluence:
      'Earth and Air signs sharpen analytical problem-solving; Fire signs heighten competitive drive.',
    nakshatraAndLordInfluence:
      'Nakshatra placement specifies the domain of service, health sensitivities, and conflict-resolution style.',
    dispositorCondition:
      'Dispositor placement determines whether obstacles yield material reward or require prolonged effort.',
    aspectsAndConjunctions:
      'Benefic aspects promote healing and fair conflict resolution; malefic conjunctions increase fighting stamina.',
    dashaAndAntardashaConditions:
      'Rahu periods often mark victory in competitive exams, career advancement through tough roles, or debt clearance.',
    transitConditions:
      'Saturn and Jupiter transits regulate workload balance and preventive health care.',
    supportingAndContradictoryFactors:
      'Strong Lagna lord ensures physical vitality; weak Lagna lord calls for disciplined preventive health habits.',
    strengthModifiers: {
      strongerWhen: 'Upachaya strength supported by a resilient Ascendant lord and disciplined routine.',
      weakerOrStrainedWhen: 'Lagna lord is weak and 6th house carries multiple severe afflictions.',
    },
    sourceReferences: [
      'Brihat Parashara Hora Shastra (BPHS) — Upachaya Malefic Rules',
      'Saravali — Rahu in 6th Bhava',
    ],
    confidenceLevel: 'Classical-Consensus',
  },
  7: {
    planet: 'Rahu',
    houseNumber: 7,
    bhavaName: 'Yuvati Bhava',
    methodology: METHODOLOGY,
    traditionalMeaning:
      'Rahu in the 7th Bhava intensifies focus on marriage, business partnerships, public dealings, and attraction toward unconventional, cross-cultural, or highly ambitious partners.',
    generalLifeThemes: ['Marriage', 'Spouse', 'Partnerships', 'Business relationships', 'Agreements', 'Public interactions'],
    positivePossibilities: [
      'Dynamic business alliances, international partnerships, or public-facing success',
      'Strong drive to learn and evolve through relationships',
      'Attraction to charismatic, independent, or culturally diverse partners',
    ],
    potentialChallenges: [
      'Unrealistic expectations or power dynamics in close partnerships if transparency is lacking',
      'Periodic friction when balancing personal independence with mutual compromise',
      'Need for clear written terms in business agreements',
    ],
    psychologicalBehaviouralThemes:
      'Experiencing personal growth through mirrors provided by partners and public feedback.',
    relationshipWithBhavaLord:
      'The 7th lord and Venus/Jupiter (marriage significators) decisively determine relationship stability and harmony.',
    relevantRashiInfluence:
      'Air signs emphasize intellectual rapport; Earth signs prioritize practical partnership foundations.',
    nakshatraAndLordInfluence:
      'Nakshatra lord reflects partner qualities and core themes around trust and mutual commitment.',
    dispositorCondition:
      'A dignified 7th dispositor fosters enduring, mutually enriching alliances.',
    aspectsAndConjunctions:
      'Jupiter’s aspect is highly protective for marital harmony; afflicted Venus or 7th lord calls for mindful communication.',
    dashaAndAntardashaConditions:
      'Major partnership formations, marriage milestones, or business ventures frequently surface in Rahu or 7th-lord Dashas.',
    transitConditions:
      'Nodal transits across the 1st/7th axis redefine personal boundaries and partnership agreements.',
    supportingAndContradictoryFactors:
      'Check D9 (Navamsha) 7th house and Venus/Jupiter before drawing conclusions on marital longevity.',
    strengthModifiers: {
      strongerWhen: '7th lord and Venus are dignified, supported by Jupiter’s aspect and a harmonious D9 chart.',
      weakerOrStrainedWhen: '7th lord is debilitated or heavily afflicted in both D1 and D9.',
    },
    sourceReferences: [
      'Brihat Parashara Hora Shastra (BPHS) — Yuvati Bhava Principles',
      'Phaladeepika — Ch. 8 (Rahu in 7th House)',
    ],
    confidenceLevel: 'Classical-Consensus',
  },
  8: {
    planet: 'Rahu',
    houseNumber: 8,
    bhavaName: 'Randhra Bhava',
    methodology: METHODOLOGY,
    traditionalMeaning:
      'Rahu in the 8th Bhava draws awareness toward deep transformation, research, hidden systems, joint finances, inheritance themes, and sudden turning points in life.',
    generalLifeThemes: ['Transformation', 'Longevity-related traditional themes', 'Inheritance', 'Research', 'Hidden matters', 'Sudden changes'],
    positivePossibilities: [
      'Penetrating insight into research, investigation, finance, data science, or occult studies',
      'Capacity for profound psychological resilience and reinvention after crises',
      'Potential gains through joint resources, insurance, or specialized behind-the-scenes work',
    ],
    potentialChallenges: [
      'Sudden, unpredictable shifts in shared finances or external circumstances',
      'Tendency toward secrecy, worry, or excessive suspicion if ungrounded',
      'Need for conservative risk management in taxes, loans, and inheritances',
    ],
    psychologicalBehaviouralThemes:
      'Fascination with what lies beneath the surface, intense curiosity about mysteries, and deep transformative drives.',
    relationshipWithBhavaLord:
      'A strong 8th lord and Lagna lord stabilize transformations and support traditional longevity factors.',
    relevantRashiInfluence:
      'Water signs heighten intuitive research; Earth signs focus on financial restructuring and asset management.',
    nakshatraAndLordInfluence:
      'Nakshatra lord guides whether 8th-house energy channels into scientific investigation, healing, or esoteric study.',
    dispositorCondition:
      'Well-placed dispositor turns sudden events into long-term strategic advantages.',
    aspectsAndConjunctions:
      'Jupiter’s aspect protects against abrupt disruptions and elevates research into genuine wisdom.',
    dashaAndAntardashaConditions:
      'Rahu periods often coincide with deep personal transitions, research breakthroughs, or restructuring of shared assets.',
    transitConditions:
      'Saturn and nodal transits over the 8th house reward patience, compliance, and preventive care.',
    supportingAndContradictoryFactors:
      'Strong Ascendant lord and Saturn uphold endurance; never make alarmist longevity claims from a single placement.',
    strengthModifiers: {
      strongerWhen: 'Lagna lord is strong, 8th lord is well-placed, and Jupiter aspects the 8th house.',
      weakerOrStrainedWhen: '8th lord and Lagna lord are weak with multiple malefic afflictions.',
    },
    sourceReferences: [
      'Brihat Parashara Hora Shastra (BPHS) — Randhra Bhava Analysis',
      'Phaladeepika — Ch. 8 (Rahu in 8th House)',
    ],
    confidenceLevel: 'Classical-Consensus',
  },
  9: {
    planet: 'Rahu',
    houseNumber: 9,
    bhavaName: 'Dharma Bhava',
    methodology: METHODOLOGY,
    traditionalMeaning:
      'Rahu in the 9th Bhava sparks independent questioning of traditional beliefs, strong attraction to foreign cultures or higher studies, and unconventional paths toward wisdom and fortune.',
    generalLifeThemes: ['Dharma', 'Higher education', 'Teachers', 'Father', 'Fortune', 'Beliefs', 'Philosophy', 'Long-distance journeys'],
    positivePossibilities: [
      'Success in international education, global travel, publishing, or cross-cultural advisory work',
      'Original philosophical perspective that bridges modern inquiry with timeless principles',
      'Breakthroughs in fortune through foreign or non-traditional mentors',
    ],
    potentialChallenges: [
      'Ideological friction with conventional orthodoxy, authority figures, or paternal expectations',
      'Restlessness in choosing a single mentor or philosophical discipline',
      'Need to distinguish authentic wisdom from superficial novelty',
    ],
    psychologicalBehaviouralThemes:
      'Quest for meaning outside inherited dogma, paired with broad-horizon curiosity.',
    relationshipWithBhavaLord:
      'The 9th lord and Jupiter govern dharma and fortune; their dignity keeps inquiry constructive and ethical.',
    relevantRashiInfluence:
      'Fire and Air signs energize higher study and global outreach; Water signs deepen devotional or contemplative curiosity.',
    nakshatraAndLordInfluence:
      'Nakshatra lord clarifies attitudes toward mentorship, ethics, and long-distance endeavors.',
    dispositorCondition:
      'A strong 9th dispositor yields notable academic, international, and reputational fortune.',
    aspectsAndConjunctions:
      'Jupiter conjunction requires ethical grounding (traditional Guru-Chandal evaluation); benefic aspects harmonize father/mentor ties.',
    dashaAndAntardashaConditions:
      'Rahu Dashas frequently bring overseas travel, higher degrees, or major shifts in worldview.',
    transitConditions:
      'Jupiter’s transit through the 9th or 1st house clarifies long-term purpose and mentorship.',
    supportingAndContradictoryFactors:
      'Check Sun (father significator) and Jupiter alongside the 9th house lord.',
    strengthModifiers: {
      strongerWhen: '9th lord and Jupiter are strong and well-connected to Kendra houses.',
      weakerOrStrainedWhen: '9th lord is debilitated or heavily afflicted without benefic support.',
    },
    sourceReferences: [
      'Brihat Parashara Hora Shastra (BPHS) — Dharma Bhava Effects',
      'Phaladeepika — Ch. 8 (Rahu in 9th House)',
    ],
    confidenceLevel: 'Classical-Consensus',
  },
  10: {
    planet: 'Rahu',
    houseNumber: 10,
    bhavaName: 'Karma Bhava',
    methodology: METHODOLOGY,
    traditionalMeaning:
      'A powerful Upachaya and Kendra placement where Rahu fuels towering professional ambition, public visibility, strategic ascent, and leadership in modern or unconventional industries.',
    generalLifeThemes: ['Career', 'Profession', 'Authority', 'Reputation', 'Ambition', 'Public image', 'Professional achievements'],
    positivePossibilities: [
      'Rapid career rise in technology, media, global commerce, politics, or innovative leadership',
      'Strong instinct for public trends, branding, and institutional influence',
      'Relentless drive to build visible professional accomplishments',
    ],
    potentialChallenges: [
      'Work-life imbalance or preoccupation with public image and status',
      'Office politics or sudden reputational tests if shortcuts are taken',
      'Restlessness with routine roles lacking growth scope',
    ],
    psychologicalBehaviouralThemes:
      'Strong orientation toward legacy, visibility, mastery over worldly arenas, and breaking glass ceilings.',
    relationshipWithBhavaLord:
      'A dignified 10th lord stabilizes authority and converts ambition into durable respect.',
    relevantRashiInfluence:
      'Earth and Air signs excel in corporate, technical, and executive governance; Fire signs amplify pioneering leadership.',
    nakshatraAndLordInfluence:
      'Nakshatra lord points closely to the specialized professional niche and public style.',
    dispositorCondition:
      'Strong 10th dispositor in Kendra/Trikona/11th supports lasting prominence and career stability.',
    aspectsAndConjunctions:
      'Conjunction with 10th or 9th lord creates strong career momentum; Jupiter’s aspect safeguards ethics and reputation.',
    dashaAndAntardashaConditions:
      'Rahu periods commonly deliver major promotions, public recognition, industry shifts, or entrepreneurial launches.',
    transitConditions:
      'Saturn and Jupiter transits over the 10th house test and reward long-term professional accountability.',
    supportingAndContradictoryFactors:
      'Examine D10 (Dashamsha) chart and Saturn/Sun strength for a complete career picture.',
    strengthModifiers: {
      strongerWhen: '10th lord is strong in D1 and D10, with Rahu in Taurus, Gemini, Virgo, or Aquarius.',
      weakerOrStrainedWhen: '10th lord is weak or afflicted in dusthana houses without benefic backing.',
    },
    sourceReferences: [
      'Brihat Parashara Hora Shastra (BPHS) — Karma Bhava & Upachaya Rules',
      'Saravali — Rahu in 10th Bhava',
    ],
    confidenceLevel: 'Classical-Consensus',
  },
  11: {
    planet: 'Rahu',
    houseNumber: 11,
    bhavaName: 'Labha Bhava',
    methodology: METHODOLOGY,
    traditionalMeaning:
      'Widely acclaimed in classical Parashari texts as one of the most materially productive Upachaya placements for Rahu, expanding networks, income avenues, and long-range aspirations.',
    generalLifeThemes: ['Income', 'Gains', 'Ambitions', 'Networks', 'Elder siblings', 'Friendships', 'Fulfilment of desires'],
    positivePossibilities: [
      'Substantial financial gains through broad networks, technology, or foreign channels',
      'Influential, diverse social circles and strategic alliances',
      'Strong capacity to materialize ambitious multi-year goals',
    ],
    potentialChallenges: [
      'Selective discernment needed in friendships to avoid opportunistic associations',
      'Ever-expanding desires making contentment elusive even after big wins',
      'Unconventional dynamics with elder siblings or group hierarchies',
    ],
    psychologicalBehaviouralThemes:
      'Future-focused optimism, large-scale networking instinct, and strong appetite for collective impact and rewards.',
    relationshipWithBhavaLord:
      'A well-placed 11th lord locks in consistent cash flow and trustworthy allies.',
    relevantRashiInfluence:
      'Air signs expand mass networking; Earth signs ground gains into durable wealth.',
    nakshatraAndLordInfluence:
      'Nakshatra placement specifies the industries and social communities driving gains.',
    dispositorCondition:
      'Dignified 11th dispositor multiplies returns during favorable Dashas.',
    aspectsAndConjunctions:
      'Jupiter’s aspect adds ethical prosperity and loyal patronage; conjunction with Dhana lords boosts income capacity.',
    dashaAndAntardashaConditions:
      'Rahu Mahadasha or Antardasha frequently brings peak earning phases, network expansion, and milestone achievements.',
    transitConditions:
      'Benefic transits over the 11th house open new revenue channels and social recognition.',
    supportingAndContradictoryFactors:
      'Verify 2nd house (retention of wealth) alongside 11th house (generation of income).',
    strengthModifiers: {
      strongerWhen: '11th lord is strong and 2nd/9th houses support wealth retention.',
      weakerOrStrainedWhen: '11th lord is debilitated in the 12th/6th/8th house without cancellation.',
    },
    sourceReferences: [
      'Brihat Parashara Hora Shastra (BPHS) — Labha Bhava Principles',
      'Phaladeepika — Ch. 8 (Rahu in 11th House)',
    ],
    confidenceLevel: 'Classical-Consensus',
  },
  12: {
    planet: 'Rahu',
    houseNumber: 12,
    bhavaName: 'Vyaya Bhava',
    methodology: METHODOLOGY,
    traditionalMeaning:
      'Rahu in the 12th Bhava turns ambition toward distant lands, behind-the-scenes enterprises, vivid subconscious realms, global affairs, and eventual spiritual exploration.',
    generalLifeThemes: ['Expenses', 'Foreign connections', 'Isolation', 'Sleep', 'Spirituality', 'Subconscious themes', 'Liberation-related subjects'],
    positivePossibilities: [
      'Prosperity through foreign residence, multinational companies, export-import, or remote work',
      'Rich imagination, creative visualization, and deep psychological or mystical insight',
      'Strong inclination toward charitable, institutional, or retreat-based endeavors',
    ],
    potentialChallenges: [
      'Unplanned or high expenditures if financial budgets are not tracked',
      'Restless sleep patterns, overactive dreams, or periodic feelings of isolation',
      'Hidden anxieties requiring grounded daily wellness practices',
    ],
    psychologicalBehaviouralThemes:
      'Pull between hidden worldly desires and the longing to dissolve boundaries through travel, imagination, or solitude.',
    relationshipWithBhavaLord:
      'The 12th lord decides whether expenditures channel into investments/foreign growth or avoidable leakage.',
    relevantRashiInfluence:
      'Water signs deepen intuition and foreign resonance; Earth signs help manage international finances practically.',
    nakshatraAndLordInfluence:
      'Nakshatra qualities influence sleep hygiene, subconscious symbolism, and overseas opportunities.',
    dispositorCondition:
      'A dignified 12th dispositor facilitates smooth foreign settlement and disciplined charitable spending.',
    aspectsAndConjunctions:
      'Jupiter’s aspect transforms 12th-house themes into peaceful spiritual growth and protected travels.',
    dashaAndAntardashaConditions:
      'Rahu periods often coincide with international relocation, foreign career ties, major investments, or spiritual retreats.',
    transitConditions:
      'Saturn and nodal transits across the 6th/12th axis highlight rest, health hygiene, and financial discipline.',
    supportingAndContradictoryFactors:
      'Strong 2nd and 11th houses balance out 12th-house expenses.',
    strengthModifiers: {
      strongerWhen: '12th lord is well-dignified and Jupiter supports the 12th house or Ascendant.',
      weakerOrStrainedWhen: '12th lord is severely afflicted alongside a weak Moon.',
    },
    sourceReferences: [
      'Brihat Parashara Hora Shastra (BPHS) — Vyaya Bhava Analysis',
      'Phaladeepika — Ch. 8 (Rahu in 12th House)',
    ],
    confidenceLevel: 'Classical-Consensus',
  },
};

const KETU_BHAVA_INTERPRETATIONS = {
  1: {
    planet: 'Ketu',
    houseNumber: 1,
    bhavaName: 'Tanu Bhava',
    methodology: METHODOLOGY,
    traditionalMeaning:
      'Ketu in the 1st Bhava fosters deep introspection, intuitive self-awareness, spiritual independence, and subtle detachment from superficial ego-display.',
    generalLifeThemes: ['Self-perception', 'Detachment', 'Individuality', 'Identity', 'Introspection', 'Spiritual inclination'],
    positivePossibilities: [
      'Authentic, perceptive personality unswayed by crowd approval',
      'Natural inclination toward meditation, research, healing, or contemplative insight',
      'Sharp intuitive discernment and understated composure',
    ],
    potentialChallenges: [
      'Periodic uncertainty about worldly self-presentation or feeling misunderstood',
      'Tendency to withdraw prematurely instead of asserting legitimate needs',
      'Need for steady physical grounding and nutrition routines',
    ],
    psychologicalBehaviouralThemes:
      'Inward-looking orientation, quiet self-reliance, and preference for substance over outward show.',
    relationshipWithBhavaLord:
      'A strong Lagna lord grounds Ketu’s intuition into confident, healthy worldly participation.',
    relevantRashiInfluence:
      'Jupiterian and Martian signs (Sagittarius, Pisces, Scorpio) often express Ketu’s insight constructively; Air signs sharpen analytical detachment.',
    nakshatraAndLordInfluence:
      'Nakshatra lord guides how intuitive insight translates into personal purpose and daily habits.',
    dispositorCondition:
      'Ketu strongly channels its dispositor (Lagna lord); strong dispositor brings poise and clarity.',
    aspectsAndConjunctions:
      'Jupiter’s aspect elevates Ketu into refined wisdom; afflicted Moon or Lagna lord may heighten sensitivity.',
    dashaAndAntardashaConditions:
      'Ketu periods trigger self-examination, lifestyle simplification, and spiritual or intellectual recalibration.',
    transitConditions:
      'Nodal transits across the 1st/7th axis prompt reassessment of self-identity versus relational obligations.',
    supportingAndContradictoryFactors:
      'Strong Sun and Ascendant lord balance detachment with purposeful engagement.',
    strengthModifiers: {
      strongerWhen: 'Placed in Scorpio, Sagittarius, or Pisces with a strong Lagna lord and Jupiter’s aspect.',
      weakerOrStrainedWhen: 'Lagna lord is debilitated or combust without benefic support.',
    },
    sourceReferences: [
      'Brihat Parashara Hora Shastra (BPHS) — Nodes in Lagna',
      'Phaladeepika — Ch. 8 (Ketu in 1st House)',
    ],
    confidenceLevel: 'Classical-Consensus',
  },
  2: {
    planet: 'Ketu',
    houseNumber: 2,
    bhavaName: 'Dhana Bhava',
    methodology: METHODOLOGY,
    traditionalMeaning:
      'Ketu in the 2nd Bhava brings minimalist or non-attached attitudes toward material accumulation, incisive or sparse speech, and an independent stance toward inherited family norms.',
    generalLifeThemes: ['Speech', 'Family relationships', 'Values', 'Accumulated wealth', 'Food habits', 'Detachment from material security'],
    positivePossibilities: [
      'Direct, insightful, and spiritually grounded communication',
      'Freedom from excessive greed; ability to live simply and deliberately',
      'Interest in traditional wisdom, linguistics, or disciplined dietary practices',
    ],
    potentialChallenges: [
      'Occasional bluntness in speech or feeling emotionally distant from extended family',
      'Inconsistent attention to personal savings if financial planning is neglected',
      'Selective or minimal eating habits requiring nutritional balance',
    ],
    psychologicalBehaviouralThemes:
      'Questioning purely materialistic definitions of self-worth and valuing inner integrity over display.',
    relationshipWithBhavaLord:
      'A strong 2nd lord secures reliable wealth and family warmth alongside Ketu’s simplicity.',
    relevantRashiInfluence:
      'Benefic signs soften speech and ease family rapport; fiery signs make speech crisp and uncompromising.',
    nakshatraAndLordInfluence:
      'Nakshatra lord colors vocal tone, culinary preferences, and value priorities.',
    dispositorCondition:
      'Well-placed 2nd dispositor ensures material comfort despite non-attachment.',
    aspectsAndConjunctions:
      'Jupiter or Venus aspect sweetens speech and supports steady financial reserves.',
    dashaAndAntardashaConditions:
      'Ketu periods may prompt simplifying expenses, revising family boundaries, or redefining core values.',
    transitConditions:
      'Transits on the 2nd/8th axis encourage prudent asset organization.',
    supportingAndContradictoryFactors:
      'Evaluate 11th house and Jupiter to judge overall financial prosperity.',
    strengthModifiers: {
      strongerWhen: '2nd lord is strong and benefics aspect the 2nd house.',
      weakerOrStrainedWhen: '2nd lord is weak/afflicted in dusthana houses.',
    },
    sourceReferences: [
      'Brihat Parashara Hora Shastra (BPHS) — Dhana Bhava Principles',
      'Phaladeepika — Ch. 8 (Ketu in 2nd House)',
    ],
    confidenceLevel: 'Classical-Consensus',
  },
  3: {
    planet: 'Ketu',
    houseNumber: 3,
    bhavaName: 'Sahaja Bhava',
    methodology: METHODOLOGY,
    traditionalMeaning:
      'Classically favorable Upachaya placement where Ketu bestows quiet courage, focused independent effort, sharp technical or intuitive skill, and original communication.',
    generalLifeThemes: ['Courage', 'Communication', 'Siblings', 'Independent effort', 'Skills', 'Unconventional expression'],
    positivePossibilities: [
      'Calm bravery under pressure and ability to work effectively without external applause',
      'Precision in writing, coding, craftsmanship, spiritual texts, or analytical communication',
      'Strong self-reliance and steady mastery over specialized skills',
    ],
    potentialChallenges: [
      'Reserved or detached bond with younger siblings or immediate neighbors',
      'Reluctance to self-promote even when highly skilled',
      'Selective communication style that can appear overly private',
    ],
    psychologicalBehaviouralThemes:
      'Intrinsic motivation, quiet determination, and preference for meaningful skill mastery over noisy competition.',
    relationshipWithBhavaLord:
      'Strong 3rd lord turns quiet effort into visible achievement and supportive sibling relations.',
    relevantRashiInfluence:
      'Earth and Air signs favor precision crafts and analysis; Fire signs strengthen decisive action.',
    nakshatraAndLordInfluence:
      'Nakshatra lord indicates specific creative, technical, or communicative aptitudes.',
    dispositorCondition:
      'Well-placed 3rd dispositor ensures initiatives bear concrete, recognized fruit.',
    aspectsAndConjunctions:
      'Mars or Jupiter support amplifies courage and ethical initiative.',
    dashaAndAntardashaConditions:
      'Ketu periods often yield breakthroughs in independent projects, writing, or niche skill recognition.',
    transitConditions:
      'Benefic transits over the 3rd house expand audience and appreciation for the native’s skills.',
    supportingAndContradictoryFactors:
      'Check Mars (brother/courage significator) and Mercury (communication) for full context.',
    strengthModifiers: {
      strongerWhen: 'Upachaya placement reinforced by strong 3rd lord and Mars.',
      weakerOrStrainedWhen: '3rd lord is severely debilitated or afflicted.',
    },
    sourceReferences: [
      'Brihat Parashara Hora Shastra (BPHS) — Upachaya Placement Rules',
      'Saravali — Ketu in 3rd Bhava',
    ],
    confidenceLevel: 'Classical-Consensus',
  },
  4: {
    planet: 'Ketu',
    houseNumber: 4,
    bhavaName: 'Sukha Bhava',
    methodology: METHODOLOGY,
    traditionalMeaning:
      'Ketu in the 4th Bhava directs the search for peace inward rather than purely through possessions, often fostering a contemplative home life or periods of living away from one’s ancestral base.',
    generalLifeThemes: ['Home', 'Mother', 'Emotional security', 'Property', 'Education', 'Inner peace'],
    positivePossibilities: [
      'Deep capacity for inner stillness, meditation, and intuitive emotional wisdom',
      'Preference for uncluttered, peaceful, or spiritually resonant living spaces',
      'Natural aptitude for contemplative, historical, or foundational learning',
    ],
    potentialChallenges: [
      'Feeling emotionally detached from conventional domestic routines or hometown roots',
      'Need to maintain warm, attentive communication with mother and household members',
      'Occasional delays or indifference in managing real estate paperwork',
    ],
    psychologicalBehaviouralThemes:
      'Seeking lasting sanctuary inside the mind rather than deriving identity solely from external property.',
    relationshipWithBhavaLord:
      'A dignified 4th lord and Moon ensure warm maternal bonds, property stability, and emotional comfort.',
    relevantRashiInfluence:
      'Water signs heighten spiritual sensitivity; Earth signs help ground domestic responsibilities.',
    nakshatraAndLordInfluence:
      'Nakshatra qualities shape the native’s inner emotional atmosphere and educational focus.',
    dispositorCondition:
      'Strong 4th dispositor brings comfortable residences and solid academic completion.',
    aspectsAndConjunctions:
      'Jupiter’s aspect brings deep contentment and domestic harmony; Saturn aspect rewards patience in property matters.',
    dashaAndAntardashaConditions:
      'Ketu periods can coincide with moving house, simplifying living arrangements, or deepening spiritual study.',
    transitConditions:
      'Transits across the 4th/10th axis balance inward serenity with public career obligations.',
    supportingAndContradictoryFactors:
      'Evaluate Moon strength carefully alongside the 4th house.',
    strengthModifiers: {
      strongerWhen: '4th lord and Moon are well-dignified with benefic aspect on the 4th house.',
      weakerOrStrainedWhen: 'Both 4th lord and Moon are weak or afflicted.',
    },
    sourceReferences: [
      'Brihat Parashara Hora Shastra (BPHS) — Sukha Bhava Principles',
      'Phaladeepika — Ch. 8 (Ketu in 4th House)',
    ],
    confidenceLevel: 'Classical-Consensus',
  },
  5: {
    planet: 'Ketu',
    houseNumber: 5,
    bhavaName: 'Putra Bhava',
    methodology: METHODOLOGY,
    traditionalMeaning:
      'Ketu in the 5th Bhava deepens intuitive intelligence, affinity for mantra, mathematics, or classical wisdom, and brings a reflective, non-clinging approach to creativity and romance.',
    generalLifeThemes: ['Intelligence', 'Education', 'Creativity', 'Children', 'Intuition', 'Mantra', 'Spiritual learning'],
    positivePossibilities: [
      'Penetrating intuitive grasp of complex subjects, coding, philosophy, or contemplative sciences',
      'Authentic creativity free from mere trend-chasing',
      'Strong resonance with mantra, spiritual study, and disciplined scholarship',
    ],
    potentialChallenges: [
      'Emotional reserve in romance or high idealism that makes casual relationships unsatisfying',
      'Need for thoughtful support in education or progeny matters if 5th lord/Jupiter are strained',
      'Avoidance of speculative gambling is generally advised',
    ],
    psychologicalBehaviouralThemes:
      'Subtle, incisive intellect drawn toward underlying truths rather than superficial entertainment.',
    relationshipWithBhavaLord:
      'Strong 5th lord and Jupiter ensure joyful creative expression, academic distinction, and fulfillment regarding children.',
    relevantRashiInfluence:
      'Sagittarius/Pisces/Scorpio heighten contemplative depth; Mercury signs sharpen analytical synthesis.',
    nakshatraAndLordInfluence:
      'Nakshatra lord illuminates specific scholarly, artistic, or spiritual inclinations.',
    dispositorCondition:
      'Well-placed 5th dispositor turns intuition into recognized intellectual and creative mastery.',
    aspectsAndConjunctions:
      'Jupiter’s aspect is exceptionally auspicious for wisdom, mantra siddhi, and family blessings.',
    dashaAndAntardashaConditions:
      'Ketu periods favor deep research, contemplative practices, specialized study, or creative refinement.',
    transitConditions:
      'Jupiter transits to the 5th or 9th house bring recognition for intellectual merit.',
    supportingAndContradictoryFactors:
      'Check Jupiter and D7 (Saptamsha) before drawing conclusions about children.',
    strengthModifiers: {
      strongerWhen: '5th lord and Jupiter are strong and well-aspecting the 5th house.',
      weakerOrStrainedWhen: '5th lord is debilitated or heavily afflicted without benefic support.',
    },
    sourceReferences: [
      'Brihat Parashara Hora Shastra (BPHS) — Putra Bhava & Purva Punya Themes',
      'Phaladeepika — Ch. 8 (Ketu in 5th House)',
    ],
    confidenceLevel: 'Classical-Consensus',
  },
  6: {
    planet: 'Ketu',
    houseNumber: 6,
    bhavaName: 'Ari Bhava',
    methodology: METHODOLOGY,
    traditionalMeaning:
      'Traditionally regarded as an effective Upachaya placement where Ketu grants calm detachment over opposition, penetrating diagnostic or problem-solving ability, and quiet service.',
    generalLifeThemes: ['Competition', 'Service', 'Debts', 'Disputes', 'Health-related traditional interpretations', 'Problem-solving'],
    positivePossibilities: [
      'Sharp diagnostic instinct in medicine, debugging, auditing, law, or crisis resolution',
      'Ability to dissolve conflicts without escalating hostility',
      'Disciplined, selfless service mindset and gradual victory over hurdles',
    ],
    potentialChallenges: [
      'Subtle or hard-to-trace health sensitivities requiring mindful preventive care',
      'Occasional indifference toward workplace politics that can delay overdue credit',
      'Need to keep administrative and debt records cleanly organized',
    ],
    psychologicalBehaviouralThemes:
      'Calm analytical precision under pressure and preference for quietly fixing root causes.',
    relationshipWithBhavaLord:
      'A well-placed 6th lord supports smooth resolution of disputes and stable daily health.',
    relevantRashiInfluence:
      'Earth signs enhance methodical healing and auditing; Fire signs reinforce decisive overcoming of hurdles.',
    nakshatraAndLordInfluence:
      'Nakshatra lord clarifies health tendencies and preferred forms of service.',
    dispositorCondition:
      'Strong dispositor channels Ketu’s surgical focus into respected professional mastery.',
    aspectsAndConjunctions:
      'Benefic aspects promote rapid recovery and harmonious workplace dynamics.',
    dashaAndAntardashaConditions:
      'Ketu periods often resolve protracted disputes, streamline routines, or spotlight specialized service skills.',
    transitConditions:
      'Saturn and Jupiter transits regulate stamina and career advancement through service.',
    supportingAndContradictoryFactors:
      'Always evaluate the Lagna lord for overall vitality and resilience.',
    strengthModifiers: {
      strongerWhen: 'Upachaya house backed by a resilient Lagna lord and disciplined health habits.',
      weakerOrStrainedWhen: 'Lagna lord is weak and 6th house carries multiple severe afflictions.',
    },
    sourceReferences: [
      'Brihat Parashara Hora Shastra (BPHS) — Upachaya Rules for Malefics',
      'Saravali — Ketu in 6th Bhava',
    ],
    confidenceLevel: 'Classical-Consensus',
  },
  7: {
    planet: 'Ketu',
    houseNumber: 7,
    bhavaName: 'Yuvati Bhava',
    methodology: METHODOLOGY,
    traditionalMeaning:
      'Ketu in the 7th Bhava introduces spiritual idealism, selective expectations, and a need for personal space within marriage and business partnerships.',
    generalLifeThemes: ['Marriage', 'Partnerships', 'Spouse', 'Relationship expectations', 'Detachment', 'Cooperation'],
    positivePossibilities: [
      'Deep, soulful, or intellectually independent partnership built on mutual respect for autonomy',
      'Attraction to spiritually inclined, perceptive, or unconventional partners',
      'Freedom from superficial codependency when emotional maturity is cultivated',
    ],
    potentialChallenges: [
      'Periodic feelings of emotional distance or overly critical expectations in close relationships',
      'Tendency to withdraw during conflict rather than engaging in open dialogue',
      'Need for explicit clarity of responsibilities in business partnerships',
    ],
    psychologicalBehaviouralThemes:
      'Balancing deep longing for authentic union with a strong need for personal freedom and inner solitude.',
    relationshipWithBhavaLord:
      'The 7th lord, Venus/Jupiter, and D9 chart decisively govern marital warmth and longevity.',
    relevantRashiInfluence:
      'Benefic signs nurture mutual empathy; fiery or rigid signs heighten independence.',
    nakshatraAndLordInfluence:
      'Nakshatra lord reflects shared values and communication rhythms with partners.',
    dispositorCondition:
      'A dignified 7th dispositor fosters loyal, balanced, and deeply meaningful partnerships.',
    aspectsAndConjunctions:
      'Jupiter’s aspect brings grace, understanding, and enduring commitment to partnerships.',
    dashaAndAntardashaConditions:
      'Ketu periods can refine relationship expectations, prompt honest renegotiation, or deepen spiritual bonds.',
    transitConditions:
      'Nodal transits across the 1st/7th axis bring turning points in partnership clarity.',
    supportingAndContradictoryFactors:
      'Never judge marriage solely from Ketu in the 7th; always assess 7th lord, Venus, Jupiter, and Navamsha (D9).',
    strengthModifiers: {
      strongerWhen: '7th lord and Venus are strong, supported by Jupiter’s drishti and a balanced D9.',
      weakerOrStrainedWhen: '7th lord is debilitated or heavily afflicted in both D1 and D9.',
    },
    sourceReferences: [
      'Brihat Parashara Hora Shastra (BPHS) — Yuvati Bhava Analysis',
      'Phaladeepika — Ch. 8 (Ketu in 7th House)',
    ],
    confidenceLevel: 'Classical-Consensus',
  },
  8: {
    planet: 'Ketu',
    houseNumber: 8,
    bhavaName: 'Randhra Bhava',
    methodology: METHODOLOGY,
    traditionalMeaning:
      'Ketu in the 8th Bhava resonates naturally with deep research, spiritual inquiry, occult sciences, psychological insight, and calm navigation of life’s hidden transitions.',
    generalLifeThemes: ['Occult knowledge', 'Research', 'Transformation', 'Hidden matters', 'Inheritance', 'Spiritual investigation'],
    positivePossibilities: [
      'Extraordinary depth in research, Jyotish, psychology, forensics, or contemplative traditions',
      'Quiet inner equanimity during sudden transitions or life restructuring',
      'Intuitive capacity to uncover hidden root causes and subtle patterns',
    ],
    potentialChallenges: [
      'Unexpected shifts in joint finances, inheritances, or behind-the-scenes arrangements',
      'Occasional private anxieties or tendency to keep struggles overly concealed',
      'Need for steady preventive care and transparent joint-financial documentation',
    ],
    psychologicalBehaviouralThemes:
      'Fearless curiosity about existential questions, impermanence, and deep inner transformation.',
    relationshipWithBhavaLord:
      'A well-placed 8th lord and Lagna lord channel 8th-house depth into constructive breakthroughs.',
    relevantRashiInfluence:
      'Water signs amplify mystical and psychological perception; Earth signs assist practical asset stewardship.',
    nakshatraAndLordInfluence:
      'Nakshatra lord distinguishes scientific investigation from spiritual or esoteric pursuits.',
    dispositorCondition:
      'Strong 8th dispositor stabilizes shared finances and protects against abrupt disruptions.',
    aspectsAndConjunctions:
      'Jupiter’s aspect provides strong protection and turns 8th-house inquiry into mature wisdom.',
    dashaAndAntardashaConditions:
      'Ketu periods often catalyze profound personal insights, research milestones, or spiritual awakenings.',
    transitConditions:
      'Saturn and Jupiter transits across the 2nd/8th axis support disciplined long-term planning.',
    supportingAndContradictoryFactors:
      'Always evaluate the Ascendant lord and Saturn; avoid sensational or fear-based interpretations.',
    strengthModifiers: {
      strongerWhen: 'Lagna lord and 8th lord are well-dignified with Jupiter’s aspect.',
      weakerOrStrainedWhen: 'Lagna lord and 8th lord are severely weakened without benefic relief.',
    },
    sourceReferences: [
      'Brihat Parashara Hora Shastra (BPHS) — Randhra Bhava & Moksha Trikona Themes',
      'Phaladeepika — Ch. 8 (Ketu in 8th House)',
    ],
    confidenceLevel: 'Classical-Consensus',
  },
  9: {
    planet: 'Ketu',
    houseNumber: 9,
    bhavaName: 'Dharma Bhava',
    methodology: METHODOLOGY,
    traditionalMeaning:
      'Ketu in the 9th Bhava fosters deep spiritual independence, affinity for authentic ancient wisdom or pilgrimage, and a direct personal relationship with dharma beyond external ritualism.',
    generalLifeThemes: ['Dharma', 'Teachers', 'Father', 'Higher education', 'Philosophy', 'Beliefs', 'Spiritual independence'],
    positivePossibilities: [
      'Sincere philosophical depth, inner ethical compass, and attraction to authentic spiritual lineages',
      'Independent mastery in higher studies, law, philosophy, or research',
      'Meaningful pilgrimages and transformative long-distance journeys',
    ],
    potentialChallenges: [
      'Skepticism toward institutional dogma or periodic distance in relationship with father/mentors',
      'Feeling dissatisfied with purely credential-driven education unless it holds deeper meaning',
      'Need to balance spiritual idealism with practical worldly responsibility',
    ],
    psychologicalBehaviouralThemes:
      'Seeker temperament valuing direct inner realization over inherited status or conformity.',
    relationshipWithBhavaLord:
      'A dignified 9th lord and Jupiter ensure strong fortune, wise mentorship, and supportive paternal ties.',
    relevantRashiInfluence:
      'Jupiterian signs (Sagittarius, Pisces) strongly harmonize with Ketu’s philosophical bent.',
    nakshatraAndLordInfluence:
      'Nakshatra lord reveals the specific philosophical school, mentor archetype, or higher-study field.',
    dispositorCondition:
      'Strong 9th dispositor anchors fortune and brings guidance at pivotal moments.',
    aspectsAndConjunctions:
      'Jupiter’s aspect or association elevates spiritual clarity and fortune.',
    dashaAndAntardashaConditions:
      'Ketu periods often inspire higher learning, pilgrimages, mentorship shifts, or deep philosophical maturity.',
    transitConditions:
      'Jupiter transits across the 9th house amplify grace, travel, and scholarly success.',
    supportingAndContradictoryFactors:
      'Review Sun (father) and Jupiter (guru/dharma) alongside the 9th lord.',
    strengthModifiers: {
      strongerWhen: '9th lord and Jupiter are strong and well-connected to Kendra/Trikona houses.',
      weakerOrStrainedWhen: '9th lord is debilitated or heavily afflicted.',
    },
    sourceReferences: [
      'Brihat Parashara Hora Shastra (BPHS) — Dharma Bhava Effects',
      'Phaladeepika — Ch. 8 (Ketu in 9th House)',
    ],
    confidenceLevel: 'Classical-Consensus',
  },
  10: {
    planet: 'Ketu',
    houseNumber: 10,
    bhavaName: 'Karma Bhava',
    methodology: METHODOLOGY,
    traditionalMeaning:
      'Ketu in the 10th Bhava brings a desire for meaningful, skill-driven, or purpose-aligned work rather than mere status-chasing, often leading to specialized expertise or periodic career pivots.',
    generalLifeThemes: ['Career', 'Profession', 'Authority', 'Reputation', 'Work satisfaction', 'Detachment from recognition'],
    positivePossibilities: [
      'Deep mastery in specialized, technical, research, healing, advisory, or spiritual professions',
      'Integrity in work driven by craft and purpose rather than ego-politics',
      'Ability to step into independent consulting or niche leadership roles',
    ],
    potentialChallenges: [
      'Periodic restlessness or feeling unfulfilled by purely corporate status ladders',
      'Reluctance to claim public credit, which can slow external recognition unless balanced',
      'Occasional abrupt shifts in career direction when a role loses deeper meaning',
    ],
    psychologicalBehaviouralThemes:
      'Seeking vocation that aligns with inner truth and mastery rather than external applause.',
    relationshipWithBhavaLord:
      'A strong 10th lord stabilizes career continuity, authority, and public esteem.',
    relevantRashiInfluence:
      'Earth signs support steady craft and consulting; Fire/Water signs align with teaching, healing, or leadership.',
    nakshatraAndLordInfluence:
      'Nakshatra lord refines the exact professional domain and working style.',
    dispositorCondition:
      'Dignified 10th dispositor in D1 and D10 ensures enduring professional respect.',
    aspectsAndConjunctions:
      'Jupiter’s aspect lends ethical authority and stability; Saturn connection supports methodical long-term craft.',
    dashaAndAntardashaConditions:
      'Ketu periods frequently bring career realignments toward more authentic, specialized, or autonomous work.',
    transitConditions:
      'Saturn and Jupiter transits over the 10th house consolidate professional recognition.',
    supportingAndContradictoryFactors:
      'Always cross-verify with D10 (Dashamsha) and the 10th lord before forecasting career changes.',
    strengthModifiers: {
      strongerWhen: '10th lord is well-placed in D1 and D10 with benefic aspect on the 10th house.',
      weakerOrStrainedWhen: '10th lord is debilitated or heavily afflicted without cancellation.',
    },
    sourceReferences: [
      'Brihat Parashara Hora Shastra (BPHS) — Karma Bhava Analysis',
      'Phaladeepika — Ch. 8 (Ketu in 10th House)',
    ],
    confidenceLevel: 'Classical-Consensus',
  },
  11: {
    planet: 'Ketu',
    houseNumber: 11,
    bhavaName: 'Labha Bhava',
    methodology: METHODOLOGY,
    traditionalMeaning:
      'A constructive Upachaya placement where Ketu brings selective, meaningful friendships, quiet and steady financial gains from specialized expertise, and refined discernment over worldly desires.',
    generalLifeThemes: ['Income', 'Gains', 'Ambitions', 'Networks', 'Friendships', 'Social connections', 'Fulfilment of desires'],
    positivePossibilities: [
      'Gains through niche expertise, technology, research, advisory work, or unconventional sources',
      'Deep, loyal bonds with a small circle of thoughtful, spiritually or intellectually aligned friends',
      'Healthy perspective on ambitions that prevents burnout from endless chasing',
    ],
    potentialChallenges: [
      'Selective interest in large social gatherings or superficial networking',
      'Periodic reassessment of long-term goals once previous milestones are met',
      'Subtle emotional distance from elder siblings or large group politics',
    ],
    psychologicalBehaviouralThemes:
      'Valuing quality of associations over quantity, and measuring fulfillment through purpose alongside prosperity.',
    relationshipWithBhavaLord:
      'A strong 11th lord (e.g., Saturn for Capricorn 11th house) ensures durable, disciplined wealth accumulation.',
    relevantRashiInfluence:
      'Earth signs (such as Capricorn) ground gains through steady structure and perseverance; Jupiterian signs expand ethical prosperity.',
    nakshatraAndLordInfluence:
      'Nakshatra lord illuminates specific revenue streams and the nature of supportive allies.',
    dispositorCondition:
      'When the 11th dispositor is well-placed, gains arrive reliably even without aggressive self-promotion.',
    aspectsAndConjunctions:
      'Benefic aspects (especially Jupiter or Venus) multiply gains and warm social ties; Rahu’s opposite 5th-house axis links gains directly to intellectual/creative merit.',
    dashaAndAntardashaConditions:
      'Ketu periods can unlock unexpected gains from past effort, streamline social circles, and clarify true aspirations.',
    transitConditions:
      'Jupiter transits over the 11th house enhance income and fulfillment of key projects.',
    supportingAndContradictoryFactors:
      'Examine the 2nd house, 11th lord, and D1/D9 balance to evaluate total material prosperity.',
    strengthModifiers: {
      strongerWhen: 'Upachaya strength backed by a dignified 11th lord and benefic aspect.',
      weakerOrStrainedWhen: '11th lord is debilitated or heavily afflicted in dusthana houses.',
    },
    sourceReferences: [
      'Brihat Parashara Hora Shastra (BPHS) — Labha Bhava & Upachaya Principles',
      'Saravali — Ketu in 11th Bhava',
    ],
    confidenceLevel: 'Classical-Consensus',
  },
  12: {
    planet: 'Ketu',
    houseNumber: 12,
    bhavaName: 'Vyaya Bhava',
    methodology: METHODOLOGY,
    traditionalMeaning:
      'Traditionally revered as the natural Moksha-karaka placement of Ketu, deeply supporting meditation, spiritual liberation, quiet philanthropy, intuitive dream states, and peaceful solitude.',
    generalLifeThemes: ['Moksha', 'Meditation', 'Isolation', 'Foreign environments', 'Expenses', 'Sleep', 'Spiritual withdrawal'],
    positivePossibilities: [
      'Profound aptitude for meditation, contemplation, self-inquiry, and spiritual liberation themes',
      'Compassionate detachment, charitable instincts, and comfort in quiet retreats or foreign lands',
      'Vivid intuitive perception and freedom from excessive worldly entanglement',
    ],
    potentialChallenges: [
      'Need to stay grounded in daily financial tracking so expenses do not drift unnoticed',
      'Tendency toward excessive withdrawal or irregular sleep if daily rhythms are neglected',
      'Balancing spiritual detachment with practical family/career commitments',
    ],
    psychologicalBehaviouralThemes:
      'Deep contemplative quietude, longing for inner freedom, and natural comfort with solitude.',
    relationshipWithBhavaLord:
      'A well-placed 12th lord harmonizes spiritual pursuits with sound financial and international stability.',
    relevantRashiInfluence:
      'Water and Jupiterian signs (Pisces, Sagittarius, Scorpio) accentuate meditative depth; Earth signs maintain practical balance.',
    nakshatraAndLordInfluence:
      'Nakshatra lord guides preferred spiritual practices, charitable expressions, and foreign connections.',
    dispositorCondition:
      'Dignified 12th dispositor protects sleep, peace of mind, and overseas endeavors.',
    aspectsAndConjunctions:
      'Jupiter’s aspect is classically considered highly auspicious for genuine spiritual maturity and grace.',
    dashaAndAntardashaConditions:
      'Ketu periods strongly favor retreats, spiritual milestones, charitable work, or foreign residence.',
    transitConditions:
      'Benefic transits across the 12th house bring inner peace and resolution of old karmic chapters.',
    supportingAndContradictoryFactors:
      'Evaluate 1st, 4th, and 9th houses alongside the 12th for overall spiritual and emotional balance.',
    strengthModifiers: {
      strongerWhen: 'Placed in Pisces, Sagittarius, or Scorpio with a dignified 12th lord and Jupiter’s support.',
      weakerOrStrainedWhen: '12th lord and Moon are severely afflicted without benefic aspect.',
    },
    sourceReferences: [
      'Brihat Parashara Hora Shastra (BPHS) — Vyaya Bhava & Moksha Karaka Rules',
      'Phaladeepika — Ch. 8 (Ketu in 12th House)',
    ],
    confidenceLevel: 'Classical-Consensus',
  },
};

module.exports = {
  METHODOLOGY,
  DEFAULT_DISCLAIMER,
  RAHU_BHAVA_INTERPRETATIONS,
  KETU_BHAVA_INTERPRETATIONS,
};
