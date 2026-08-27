export const CHARACTERS = [
  {
    id: "silkenTofu",
    name: "Silken Tofu",
    origin: "Pressed from moon-soaked soybeans in Grandma's kitchen.",
    motivation: "Make gentle food that leaves lonely people feeling held.",
    personality: ["patient", "inventive", "tender-hearted"],
    startingAge: 7,
    role: "The soothing heart and custodian of Grandma's recipe",
    attributes: { joy: 2, skill: 1, bonds: 3 },
    growth: { joy: 2, skill: 1, bonds: 2 },
    startingAbility: "Cooling touch",
    arc: [
      "Silken first offers a spoonful of their soft centre to a hungry classmate and discovers that shared food carries comfort.",
      "As the stall grows, every serving thins Silken's body and blurs one treasured kitchen memory.",
      "Grandma teaches Silken to rest overnight in fresh soy milk; care, sleep, and remembered stories restore substance and memory.",
      "Silken learns that generosity needs consent and limits, sharing measured portions instead of disappearing for applause.",
      "At the feast, Silken creates a living starter: nourishment freely given returns through a community that cooks and cares in turn."
    ]
  },
  {
    id: "potatoHero",
    name: "Bergie the Potato Hero",
    origin: "Sprouted beneath the football field from a golden potato Grandma planted.",
    motivation: "Give people enough strength to stand up, work together, and come home.",
    personality: ["brave", "boisterous", "loyal"],
    startingAge: 8,
    role: "The hearty protector and fearless field cook",
    attributes: { joy: 3, skill: 2, bonds: 1 },
    growth: { joy: 1, skill: 2, bonds: 2 },
    startingAbility: "Starch shield",
    arc: [
      "Bergie tears off a small golden piece to feed an exhausted player and realizes courage can be passed from body to body.",
      "Repeated gifts leave dents in Bergie's armour, heavy fatigue, and roots too weak to hold the soil.",
      "Bergie recovers by rooting in Grandma's compost beds through a full rain cycle; shared meals and unhurried seasons regrow each piece.",
      "Bergie stops treating pain as proof of heroism and asks friends to guard the garden while recovery takes its proper time.",
      "At the feast, Bergie's returned peelings seed a cooperative patch, making sacrifice renewable rather than solitary."
    ]
  }
];

const effects = (silkenTofu, potatoHero) => ({ silkenTofu, potatoHero });
const gain = (attributes, vitality = 0, experience = 1, ability) => ({
  attributes, condition: { vitality }, progression: { experience }, ...(ability ? { learn: ability } : {})
});

export const SEASONS = ["Early Rain", "High Sun", "Harvest Wind", "Long Night"];

export const ACTIVITIES = [
  {
    id: "study", label: "Kitchen lessons", icon: "🥄",
    detail: "Build Skill and experience. Tuition costs 4 coins.",
    effects: gain({ skill: 2, joy: -1 }, -5, 2), resources: { coins: -4 }
  },
  {
    id: "stall", label: "Run the food stall", icon: "🍜",
    detail: "Earn 8 coins and reputation, but serving is tiring.",
    effects: gain({ bonds: 1 }, -12, 2), resources: { coins: 8, reputation: 2 }
  },
  {
    id: "community", label: "Community kitchen", icon: "🫂",
    detail: "Deepen Bonds and reputation. Ingredients cost 2 coins.",
    effects: gain({ bonds: 2 }, -8, 2), resources: { coins: -2, reputation: 4, relationship: 1 }
  },
  {
    id: "play", label: "Play and explore", icon: "🌦️",
    detail: "Restore Joy and discover the neighbourhood.",
    effects: gain({ joy: 3 }, -3, 1), resources: { coins: -1 }
  },
  {
    id: "garden", label: "Tend the garden", icon: "🌱",
    detail: "Grow ingredients, Skill, and Bonds at a gentle pace.",
    effects: gain({ skill: 1, bonds: 1 }, -6, 2), resources: { coins: 3, reputation: 1 }
  },
  {
    id: "rest", label: "Rest with Grandma", icon: "🌙",
    detail: "Recover vitality and Joy. No income this season.",
    effects: gain({ joy: 1 }, 24, 0), resources: { reputation: -1 }
  }
];

export const SEASON_EVENTS = [
  {
    id: "kitchen-duet", title: "A recipe in two voices",
    when: (state, plans) => plans.every((id) => id === "study"),
    text: "Grandma notices that Silken seasons by listening while Bergie measures by instinct. Together they invent a fritter neither could make alone.",
    effects: effects(gain({ skill: 1 }, 0, 1), gain({ skill: 1 }, 0, 1)), resources: { relationship: 3 }
  },
  {
    id: "market-rush", title: "The queue around the field",
    when: (state, plans) => plans.every((id) => id === "stall"),
    text: "The stall sells out before sunset. The applause feels wonderful, but both friends return home with trembling hands.",
    effects: effects(gain({ joy: 1 }, -5), gain({ joy: 1 }, -5)), resources: { coins: 6, reputation: 4 }
  },
  {
    id: "shared-table", title: "Everyone brings a bowl",
    when: (state, plans) => plans.every((id) => id === "community"),
    text: "Neighbours arrive with vegetables, stories, and an insistence on washing the dishes. Care begins to travel in both directions.",
    effects: effects(gain({ bonds: 1 }, 4), gain({ bonds: 1 }, 4)), resources: { relationship: 4, reputation: 3 }
  },
  {
    id: "permission-to-rest", title: "Keeping watch",
    when: (state, plans) => plans.filter((id) => id === "rest").length === 1,
    text: "The working friend returns early with supper. Rest stops feeling like abandonment and starts becoming something they protect for one another.",
    effects: {}, resources: { relationship: 2 }
  },
  {
    id: "grandmas-warning", title: "Grandma closes the shutters",
    when: (state) => Object.values(state.characters).some(({ condition }) => condition.vitality <= 30),
    text: "Grandma sees the signs of depletion and closes the stall for an evening, regardless of the waiting customers.",
    effects: effects(gain({}, 10), gain({}, 10)), resources: { reputation: -2, relationship: 1 }
  },
  {
    id: "neighbourhood-pantry", title: "The pantry that answers back",
    when: (state) => state.resources.coins <= 5 && state.resources.reputation >= 8,
    text: "People who remember being fed quietly leave rice, soybeans, and potatoes by the kitchen door.",
    effects: {}, resources: { coins: 8, relationship: 1 }
  },
  {
    id: "local-heroes", title: "A name on every noticeboard",
    when: (state) => state.resources.reputation >= 24,
    text: "The neighbourhood now knows them by name. New invitations arrive, along with expectations they will have to learn to manage.",
    effects: effects(gain({ bonds: 1 }), gain({ bonds: 1 })), resources: { coins: 4 }
  },
  {
    id: "unhurried-friendship", title: "An evening with nowhere to be",
    when: (state) => state.resources.relationship >= 18,
    text: "They sit beneath the awning without fixing anything. The silence itself becomes proof that their friendship is more than shared work.",
    effects: effects(gain({ joy: 2 }, 5), gain({ joy: 2 }, 5)), resources: {}
  }
];

export const CHAPTERS = [
  {
    ageOffset: 0, arcStage: 0, title: "The First Sharing",
    dialogue: ["Rain drums on Grandma's awning as Silken Tofu and Bergie shape their first fritter together.", "A hungry classmate arrives. Both friends wonder whether food can carry a piece of the giver's care."],
    activities: [
      { label: "Practise side by side", detail: "Both gain Skill; Silken builds Bonds", effects: effects(gain({ skill: 2, bonds: 1 }), gain({ skill: 2, joy: 1 })) },
      { label: "Play in the rain", detail: "Both gain Joy and recover", effects: effects(gain({ joy: 2 }, 4), gain({ joy: 2 }, 4)) }
    ],
    milestone: "Who offers the first nourishing portion?",
    choices: [
      { label: "Silken shares a tender spoonful", result: "The classmate feels understood; Silken feels the strange cost of becoming a little less solid.", effects: effects(gain({ bonds: 3 }, -12, 2, "Comforting portion"), gain({ bonds: 1 }, 0, 1)) },
      { label: "Bergie shares a golden piece", result: "Strength returns to the classmate; a dent remains in Bergie's brave armour.", effects: effects(gain({ bonds: 1 }, 0, 1), gain({ bonds: 3 }, -12, 2, "Courage portion")) }
    ]
  },
  {
    ageOffset: 2, arcStage: 1, title: "A Stall for Two",
    dialogue: ["The Saturday stall draws a queue beside the football field.", "Every nourishing serving helps a neighbour, yet Silken grows translucent and Bergie's roots begin to ache."],
    activities: [
      { label: "Remember every regular", detail: "Both deepen their Bonds", effects: effects(gain({ bonds: 2 }), gain({ bonds: 2 })) },
      { label: "Share the cooking work", detail: "Both gain Skill with a smaller cost", effects: effects(gain({ skill: 2 }, -3), gain({ skill: 2 }, -3)) }
    ], milestone: "A soaked team needs more food than either friend can safely give.",
    choices: [
      { label: "Set a portion limit", result: "They feed everyone by asking the neighbourhood to contribute ingredients too.", effects: effects(gain({ bonds: 2 }, -5, 2, "Gentle boundary"), gain({ bonds: 2 }, -5, 2, "Garden muster")) },
      { label: "Give until the trays are full", result: "Everyone eats, but their friends must carry the exhausted pair home.", effects: effects(gain({ bonds: 3 }, -15, 2), gain({ bonds: 3 }, -15, 2)) }
    ]
  },
  {
    ageOffset: 4, arcStage: 2, title: "The Recovery Recipe",
    dialogue: ["Grandma refuses to let sacrifice become a performance.", "She prepares soy milk for Silken and compost beds for Bergie, explaining that regeneration requires rest and care freely returned."],
    activities: [
      { label: "Rest through the rain cycle", detail: "Bergie recovers deeply; Silken keeps watch", effects: effects(gain({ bonds: 2 }, 8), gain({ joy: 1 }, 22, 2, "Rain-root renewal")) },
      { label: "Trade stories over soy milk", detail: "Silken recovers deeply; Bergie keeps watch", effects: effects(gain({ joy: 1 }, 22, 2, "Soy-milk renewal"), gain({ bonds: 2 }, 8)) }
    ], milestone: "The lunch bell rings before recovery is complete.",
    choices: [
      { label: "Trust friends to serve today", result: "The stall survives without consuming its heroes, and both learn that receiving care is part of giving it.", effects: effects(gain({ bonds: 3 }, 12, 2), gain({ bonds: 3 }, 12, 2)) },
      { label: "Teach the recovery recipe", result: "Customers become caretakers and prepare the beds and milk for tomorrow.", effects: effects(gain({ skill: 2 }, 10, 2), gain({ skill: 2 }, 10, 2)) }
    ]
  },
  {
    ageOffset: 6, arcStage: 3, title: "Consent at the Table",
    dialogue: ["A city contest praises endless giving, but the old ache returns.", "Silken names the memories at risk; Bergie admits that even heroes fear failing to regrow."],
    activities: [
      { label: "Design nourishing substitutes", detail: "Both grow in Skill", effects: effects(gain({ skill: 3 }), gain({ skill: 3 })) },
      { label: "Write a rest rota", detail: "Both recover and strengthen Bonds", effects: effects(gain({ bonds: 2 }, 10), gain({ bonds: 2 }, 10)) }
    ], milestone: "Judges demand a dramatic sacrifice for the final plate.",
    choices: [
      { label: "Say no and explain the cost", result: "Their boundary changes the contest rules: no meal may require an unwilling giver.", effects: effects(gain({ joy: 2, bonds: 2 }, 5, 2, "Clear consent"), gain({ joy: 2, bonds: 2 }, 5, 2, "Clear consent")) },
      { label: "Offer one measured portion each", result: "They choose the gift together, then schedule the recovery it demands.", effects: effects(gain({ skill: 2 }, -7, 2), gain({ skill: 2 }, -7, 2)) }
    ]
  },
  {
    ageOffset: 9, arcStage: 4, title: "The Regenerating Feast",
    dialogue: ["Years of returned care have filled a garden and a vat with living starters.", "Silken and Bergie can finally nourish the neighbourhood without carrying the whole cost alone."],
    activities: [
      { label: "Plant the cooperative patch", detail: "Bergie leads; Silken gathers neighbours", effects: effects(gain({ bonds: 3 }), gain({ skill: 3 }, 5, 2, "Seed-the-future")) },
      { label: "Culture the living starter", detail: "Silken leads; Bergie protects the kitchen", effects: effects(gain({ skill: 3 }, 5, 2, "Living starter"), gain({ bonds: 3 })) }
    ], milestone: "What promise will guide every future feast?",
    choices: [
      { label: "Care must return to its givers", result: "Every guest tends the sources that fed them; recovery becomes a shared ritual.", effects: effects(gain({ bonds: 3 }, 15, 3), gain({ bonds: 3 }, 15, 3)) },
      { label: "No one nourishes alone", result: "Many small, willing gifts make a table where neither friend has to vanish.", effects: effects(gain({ joy: 3 }, 15, 3), gain({ joy: 3 }, 15, 3)) }
    ]
  }
];

const VOCATIONS = {
  silkenTofu: {
    joy: "a storyteller whose playful dishes recover forgotten memories",
    skill: "a master of living starters and restorative recipes",
    bonds: "a patient teacher who makes every kitchen feel like home"
  },
  potatoHero: {
    joy: "a travelling field cook who turns every match into a feast",
    skill: "a fearless grower who makes exhausted soil abundant again",
    bonds: "an organiser who can rally a whole neighbourhood before breakfast"
  }
};

function strongestAttribute(character) {
  return Object.entries(character.attributes).sort(([, left], [, right]) => right - left)[0][0];
}

export function getEnding(state) {
  const silken = VOCATIONS.silkenTofu[strongestAttribute(state.characters.silkenTofu)];
  const bergie = VOCATIONS.potatoHero[strongestAttribute(state.characters.potatoHero)];
  const averageVitality = Object.values(state.characters).reduce((sum, character) => sum + character.condition.vitality, 0) / 2;
  let title = "The Two Roads Home";
  let shared = "They follow different callings, meeting often enough to remember why the first fritter mattered.";
  if (averageVitality <= 30) {
    title = "The Kitchen That Finally Closed";
    shared = "Their generosity outran their recovery. The neighbourhood closes the stall for a season and, at last, learns to feed its exhausted cooks.";
  } else if (state.resources.relationship >= 28 && state.resources.reputation >= 35) {
    title = "The Table That Gives Back";
    shared = "Their partnership becomes a cooperative where every guest returns care to its source.";
  } else if (state.resources.relationship >= 28) {
    title = "The Unhurried Partnership";
    shared = "They choose a smaller table and protect the time required to remain friends as well as heroes.";
  } else if (state.resources.reputation >= 35) {
    title = "The Neighbourhood's Kitchen";
    shared = "Their work belongs to the whole neighbourhood now, supported by many hands instead of two disappearing bodies.";
  }
  return { title, text: `${shared} Silken becomes ${silken}. Bergie becomes ${bergie}.` };
}
