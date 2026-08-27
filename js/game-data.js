export const CHARACTERS = [
  {
    id: "silkenTofu",
    name: "Silken Tofu",
    origin: "Awakened from the silken tofu half of Grandma's unfinished festival recipe.",
    motivation: "Master heat without losing the gentle centre that makes her Silken.",
    personality: ["patient", "inventive", "tender-hearted"],
    startingAge: 7,
    role: "The gentle healer · Keeper of softness, broth, and balance",
    attributes: { joy: 2, skill: 1, bonds: 3 },
    growth: { joy: 2, skill: 1, bonds: 2 },
    startingAbility: "Gentle broth",
    arc: [
      "Silken wakes beside Grandma's unfinished recipe and worries that combining with Bergie would erase her delicate identity.",
      "She learns that hot oil can create a golden edge while protecting the soft centre within.",
      "A failed fusion teaches her that gentleness needs structure, timing, and honest limits.",
      "Silken stops treating cooperation as disappearance and begins designing a shared centre both friends can shape.",
      "At the final stove, she must choose between becoming Agedashi Silken or joining Bergie as something neither could become alone."
    ]
  },
  {
    id: "potatoHero",
    name: "Bergie the Potato Hero",
    origin: "Sprouted from the grated potato half of Grandma's unfinished festival recipe.",
    motivation: "Become strong enough to hold a dish together without hardening against everyone around him.",
    personality: ["brave", "boisterous", "loyal"],
    startingAge: 8,
    role: "The stalwart gardener · Keeper of crispness, structure, and courage",
    attributes: { joy: 3, skill: 2, bonds: 1 },
    growth: { joy: 1, skill: 2, bonds: 2 },
    startingAbility: "Starch guard",
    arc: [
      "Bergie wakes beside Grandma's unfinished recipe certain that strength means becoming the crispiest hero on his own.",
      "He learns that a good crust needs moisture, patience, and a centre worth protecting.",
      "A failed fusion teaches him that pressing harder cannot force two ingredients to bind.",
      "Bergie learns to support Silken's softness instead of armouring over it.",
      "At the final stove, he must choose between becoming Hashbrown Bergie or sharing his golden crust with a new fused form."
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
    id: "study", label: "Recipe lessons", icon: "🥄",
    detail: "Build Skill and experience. Ingredients cost 4 coins.",
    effects: gain({ skill: 2, joy: -1 }, -5, 2), resources: { coins: -4 }
  },
  {
    id: "stall", label: "Run a taste-test stall", icon: "🍽️",
    detail: "Earn 8 coins and reputation, but service is tiring.",
    effects: gain({ bonds: 1 }, -12, 2), resources: { coins: 8, reputation: 2 }
  },
  {
    id: "community", label: "Host a community tasting", icon: "🥣",
    detail: "Deepen Bonds and reputation. Ingredients cost 2 coins.",
    effects: gain({ bonds: 2 }, -8, 2), resources: { coins: -2, reputation: 4, relationship: 1 }
  },
  {
    id: "play", label: "Explore new flavours", icon: "🌦️",
    detail: "Restore Joy and discover surprising combinations.",
    effects: gain({ joy: 3 }, -3, 1), resources: { coins: -1 }
  },
  {
    id: "garden", label: "Harvest binding ingredients", icon: "🌱",
    detail: "Grow ingredients, Skill, and Bonds at a gentle pace.",
    effects: gain({ skill: 1, bonds: 1 }, -6, 2), resources: { coins: 3, reputation: 1 }
  },
  {
    id: "rest", label: "Rest at low heat", icon: "🌙",
    detail: "Recover vitality and Joy. No income this season.",
    effects: gain({ joy: 1 }, 24, 0), resources: { reputation: -1 }
  }
];

export const SEASON_EVENTS = [
  {
    id: "kitchen-duet", title: "Two rhythms, one chopping board",
    when: (state, plans) => plans.every((id) => id === "study"),
    text: "Silken listens for the broth's quiet simmer while Bergie counts every crisp edge. Grandma writes both timings into the same recipe.",
    effects: effects(gain({ skill: 1 }, 0, 1), gain({ skill: 1 }, 0, 1)), resources: { relationship: 3 }
  },
  {
    id: "market-rush", title: "Fans of two different dishes",
    when: (state, plans) => plans.every((id) => id === "stall"),
    text: "Customers form one queue for Silken's delicate bowls and another for Bergie's crunchy bites. Success makes their separate futures feel suddenly possible.",
    effects: effects(gain({ joy: 1 }, -5), gain({ joy: 1 }, -5)), resources: { coins: 6, reputation: 4 }
  },
  {
    id: "shared-table", title: "The missing binder",
    when: (state, plans) => plans.every((id) => id === "community"),
    text: "A neighbour adds scallions and soy to the test batter. It holds together longer than before: proof that a recipe can be shared without losing its makers.",
    effects: effects(gain({ bonds: 1 }, 4), gain({ bonds: 1 }, 4)), resources: { relationship: 4, reputation: 3 }
  },
  {
    id: "permission-to-rest", title: "Keeping the flame low",
    when: (state, plans) => plans.filter((id) => id === "rest").length === 1,
    text: "The working friend tends the stove quietly so the resting friend can recover. For once, progress means refusing to rush the recipe.",
    effects: {}, resources: { relationship: 2 }
  },
  {
    id: "grandmas-warning", title: "The batter begins to split",
    when: (state) => Object.values(state.characters).some(({ condition }) => condition.vitality <= 30),
    text: "Grandma stops the trial. An exhausted ingredient cannot bind cleanly; forcing the transformation now would ruin both dishes.",
    effects: effects(gain({}, 10), gain({}, 10)), resources: { reputation: -2, relationship: 1 }
  },
  {
    id: "neighbourhood-pantry", title: "Ingredients returned",
    when: (state) => state.resources.coins <= 5 && state.resources.reputation >= 8,
    text: "Former tasters leave soy, potatoes, dashi, and scallions at Grandma's door. A beloved recipe never belongs to only one kitchen.",
    effects: {}, resources: { coins: 8, relationship: 1 }
  },
  {
    id: "local-heroes", title: "The Hearth Festival invitation",
    when: (state) => state.resources.reputation >= 24,
    text: "The festival asks for one signature dish. Silken and Bergie must decide whether that means two plates—or one true Tofu Bergerdil.",
    effects: effects(gain({ bonds: 1 }), gain({ bonds: 1 })), resources: { coins: 4 }
  },
  {
    id: "unhurried-friendship", title: "Steam between two bowls",
    when: (state) => state.resources.relationship >= 18,
    text: "They taste each other's work without judging it. Silken understands Bergie's crunch; Bergie finally notices the strength inside Silken's softness.",
    effects: effects(gain({ joy: 2 }, 5), gain({ joy: 2 }, 5)), resources: {}
  }
];

export const CHAPTERS = [
  {
    ageOffset: 0, arcStage: 0, art: "chapter-awakening.webp", title: "The Recipe With Two Names",
    dialogue: [
      "On the night before Grandma closes her old stall, lightning strikes the kitchen and wakes two ingredients from her unfinished recipe: Silken Tofu and Bergie.",
      "The faded card names a dish no one has ever tasted—Tofu Bergerdil. Silken wonders whether it means becoming one dish together. Bergie thinks it may simply mean two heroes sharing a plate. Grandma gives them twenty seasons to discover the answer."
    ],
    milestone: "Their first test batter will only hold one flavour clearly. Whose identity should lead?",
    choices: [
      { label: "Let Silken set the gentle centre", hint: "Silken gains Bonds and the Soft centre ability; Bergie learns to support.", result: "The fritter is delicate and fragrant. Bergie discovers that protecting softness can be its own kind of strength.", effects: effects(gain({ bonds: 3 }, -4, 2, "Soft centre"), gain({ bonds: 1 }, 0, 1)) },
      { label: "Let Bergie build the golden crust", hint: "Bergie gains Skill and the Golden lattice ability; Silken learns to trust structure.", result: "The fritter crackles without breaking. Silken discovers that a firm edge does not have to erase what is tender inside.", effects: effects(gain({ bonds: 1 }, 0, 1), gain({ skill: 3 }, -4, 2, "Golden lattice")) }
    ]
  },
  {
    ageOffset: 2, arcStage: 1, art: "chapter-two-paths.webp", title: "Two Paths Through the Oil",
    dialogue: [
      "Years of practice reveal two obvious futures. Silken could become elegant agedashi tofu; Bergie could become a fearless hash brown with a perfect golden lattice.",
      "Their separate dishes delight the market, yet the unfinished Tofu Bergerdil card keeps appearing between them on Grandma's shelf."
    ],
    milestone: "A food critic offers to train only one signature dish at a time.",
    choices: [
      { label: "Alternate lessons and share every note", hint: "A balanced path: both gain Bonds, recovery, and shared techniques.", result: "Each lesson returns to the kitchen as a conversation. Their separate talents begin to fit together instead of competing.", effects: effects(gain({ bonds: 2 }, -5, 2, "Dashi timing"), gain({ bonds: 2 }, -5, 2, "Crisp-edge timing")) },
      { label: "Train separately and compare results", hint: "Faster Skill growth, but a larger vitality cost and no shared ability.", result: "Their individual dishes improve quickly. So does the distance between their cooking rhythms.", effects: effects(gain({ skill: 3 }, -12, 2), gain({ skill: 3 }, -12, 2)) }
    ]
  },
  {
    ageOffset: 4, arcStage: 2, art: "chapter-failed-batter.webp", title: "The Batter That Broke",
    dialogue: [
      "Silken and Bergie attempt the unfinished recipe for the first time. Bergie presses too hard, Silken adds broth too quickly, and the patty tears apart in the oil.",
      "Neither is ruined, but both are shaken. Grandma explains that fusion is not a shortcut to greatness; two complete selves must choose the same transformation at the same pace."
    ],
    milestone: "How will they study the failed batter?",
    choices: [
      { label: "Name what each of them needed", hint: "Stronger Bonds and deeper recovery for both.", result: "Silken admits she feared disappearing. Bergie admits he feared being unnecessary. The next batter begins with honesty instead of force.", effects: effects(gain({ bonds: 3 }, 14, 2), gain({ bonds: 3 }, 14, 2)) },
      { label: "Measure every technical mistake", hint: "Stronger Skill and solid recovery for both.", result: "They chart temperature, moisture, pressure, and timing. The failure becomes a recipe they can actually learn from.", effects: effects(gain({ skill: 3 }, 10, 2), gain({ skill: 3 }, 10, 2)) }
    ]
  },
  {
    ageOffset: 6, arcStage: 3, art: "chapter-shared-recipe.webp", title: "One Stall, Three Possibilities",
    dialogue: [
      "The Hearth Festival invites them to present a signature dish. Agedashi Silken would be graceful. Hashbrown Bergie would be mighty. A true Tofu Bergerdil could become the dish Grandma never managed to finish.",
      "The choice is no longer about which form is better. It is about whether they have built enough trust to choose transformation without losing themselves."
    ],
    milestone: "What will they promise before the final year of training?",
    choices: [
      { label: "Neither changes unless both are ready", hint: "Joy, Bonds, recovery, and the Shared consent ability for both.", result: "They write the promise across the top of Grandma's recipe card. Fusion becomes an invitation, never an obligation.", effects: effects(gain({ joy: 2, bonds: 2 }, 6, 2, "Shared consent"), gain({ joy: 2, bonds: 2 }, 6, 2, "Shared consent")) },
      { label: "Perfect both separate dishes first", hint: "More Skill for both, with a measured vitality cost.", result: "They master agedashi and hash brown techniques. If they fuse, it will be as accomplished dishes—not unfinished ingredients.", effects: effects(gain({ skill: 3 }, -6, 2), gain({ skill: 3 }, -6, 2)) }
    ]
  },
  {
    ageOffset: 9, arcStage: 4, art: "chapter-final-sizzle.webp", title: "The Final Sizzle",
    dialogue: [
      "The festival lanterns ignite. Silken prepares dashi, flowers, and a tender tofu centre. Bergie grates the harvest, folds a crisp lattice, and steadies the pan with his shield.",
      "Grandma places the blank final line of her recipe between them. Whatever enters the oil tonight will decide the form of their adult lives."
    ],
    milestone: "Which dish will step from the final pan?",
    choices: [
      { label: "Choose each other: become Tofu Bergerdil", hint: "True fusion requires 24 partnership, 18 reputation, 30 combined Skill, and 35% average vitality.", result: "They fold softness into strength and strength around softness. The batter holds—but only a life of shared choices can complete the transformation.", effects: effects(gain({ bonds: 3 }, 10, 3), gain({ bonds: 3 }, 10, 3)) },
      { label: "Choose two complete signature dishes", hint: "Silken becomes agedashi tofu and Bergie becomes a heroic hash brown.", result: "They choose neighbouring pans and cheer for each other's transformation. Two aromas rise together beneath the same festival lanterns.", effects: effects(gain({ joy: 3 }, 10, 3), gain({ joy: 3 }, 10, 3)) }
    ]
  }
];

export const FUSION_REQUIREMENTS = {
  relationship: 24,
  reputation: 18,
  combinedSkill: 30,
  averageVitality: 35
};

export function getEnding(state) {
  const silken = state.characters.silkenTofu;
  const bergie = state.characters.potatoHero;
  const averageVitality = (silken.condition.vitality + bergie.condition.vitality) / 2;
  const combinedSkill = silken.attributes.skill + bergie.attributes.skill;
  const attemptedFusion = state.milestone === 0;
  const readyToFuse = attemptedFusion &&
    state.resources.relationship >= FUSION_REQUIREMENTS.relationship &&
    state.resources.reputation >= FUSION_REQUIREMENTS.reputation &&
    combinedSkill >= FUSION_REQUIREMENTS.combinedSkill &&
    averageVitality >= FUSION_REQUIREMENTS.averageVitality;

  if (readyToFuse) {
    return {
      id: "fusion",
      eyebrow: "True ending · The completed recipe",
      title: "Tofu Bergerdil",
      art: "ending-fusion.webp",
      text: "Silken's tender centre and Bergie's golden lattice become one living fritter hero: crisp enough to stand, soft enough to heal, and still carrying both of their voices. Grandma finally writes the last line of her recipe—not 'mix until identical,' but 'choose one another, and leave room for both.'"
    };
  }

  const reason = attemptedFusion
    ? "Their final batter cannot yet hold every part of them, so they release it and choose forms that let both heroes remain whole."
    : "They choose to grow side by side, complete without needing to become the same dish.";
  return {
    id: "separate",
    eyebrow: attemptedFusion ? "Honest ending · Not ready to fuse" : "Signature ending · Two complete dishes",
    title: "Agedashi Silken & Hashbrown Bergie",
    art: "ending-separate.webp",
    text: `${reason} Silken becomes Agedashi Silken, wrapped in a light golden robe with a restorative dashi heart. Bergie becomes Hashbrown Bergie, a brave lattice of crisp potato protecting a warm centre. Their two plates are always served together.`
  };
}
