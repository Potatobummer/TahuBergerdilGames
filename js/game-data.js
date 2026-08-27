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

export const ENDINGS = {
  craft: { title: "The Regenerative Kitchen", text: "Silken and Bergie teach recipes that account for rest, consent, and renewal. Their craft feeds people without hiding its cost." },
  community: { title: "The Table That Gives Back", text: "Every shared portion begins a cycle of care. The neighbourhood tends soy, soil, memories, and one another." },
  joyful: { title: "The Ever-Growing Feast", text: "Their living starter and golden patch keep surprising everyone. Giving remains joyful because nobody is asked to disappear." }
};

export function getEnding(characters) {
  const totals = Object.values(characters).reduce((sum, character) => {
    for (const key of Object.keys(sum)) sum[key] += character.attributes[key];
    return sum;
  }, { joy: 0, skill: 0, bonds: 0 });
  if (totals.bonds >= totals.skill && totals.bonds >= totals.joy) return ENDINGS.community;
  if (totals.skill >= totals.joy) return ENDINGS.craft;
  return ENDINGS.joyful;
}
