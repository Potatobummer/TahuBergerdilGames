export const CHAPTERS = [
  {
    age: 7, title: "The First Batch",
    dialogue: [
      "Rain drums on the awning while Grandma teaches you to mash potatoes and tofu together.",
      "Your first fritter is lopsided. She calls it perfect anyway."
    ],
    activities: [
      { label: "Practice the recipe", detail: "+2 Skill, +1 Bonds", effects: { skill: 2, bonds: 1 } },
      { label: "Play in the rain", detail: "+2 Joy", effects: { joy: 2 } }
    ],
    milestone: "At the school fair, the last fritter remains on your tray. What do you do?",
    choices: [
      { label: "Share it with the new student", result: "A shy smile becomes your first loyal customer.", effects: { bonds: 2 } },
      { label: "Taste-test it yourself", result: "You notice exactly what the batter needs.", effects: { skill: 2 } }
    ]
  },
  {
    age: 9, title: "A Sign in Marker",
    dialogue: ["You and Grandma open a Saturday stall beside the football field.", "You write TAHU BERGEDIL in your brightest marker and wait."],
    activities: [
      { label: "Design a better sign", detail: "+2 Joy, +1 Skill", effects: { joy: 2, skill: 1 } },
      { label: "Remember every regular", detail: "+2 Bonds", effects: { bonds: 2 } }
    ],
    milestone: "A sudden downpour empties the field. How will you save the day?",
    choices: [
      { label: "Deliver warm snacks to the teams", result: "The soaked players cheer when you arrive.", effects: { bonds: 2, joy: 1 } },
      { label: "Improve the recipe while you wait", result: "A pinch of pepper makes the next batch sing.", effects: { skill: 2 } }
    ]
  },
  {
    age: 11, title: "The Busy Table",
    dialogue: ["Word spreads, and the little stall grows noisy with orders.", "Grandma trusts you with the frying pan during the lunch rush."],
    activities: [
      { label: "Learn to work quickly", detail: "+2 Skill", effects: { skill: 2 } },
      { label: "Make a playlist for the stall", detail: "+2 Joy", effects: { joy: 2 } }
    ],
    milestone: "Your best friend asks for help just as a queue forms.",
    choices: [
      { label: "Ask them to join the team", result: "Together, you turn panic into a dance.", effects: { bonds: 2, skill: 1 } },
      { label: "Finish early and meet afterward", result: "You keep your promise, even if you arrive tired.", effects: { bonds: 1, skill: 2 } }
    ]
  },
  {
    age: 13, title: "New Flavours",
    dialogue: ["Customers ask for something new, but tradition feels precious.", "Grandma hands you the spice tin. ‘A recipe stays alive by changing,’ she says."],
    activities: [
      { label: "Invent a spicy filling", detail: "+3 Skill", effects: { skill: 3 } },
      { label: "Interview longtime customers", detail: "+2 Bonds, +1 Joy", effects: { bonds: 2, joy: 1 } }
    ],
    milestone: "Your experimental batch divides the neighbourhood.",
    choices: [
      { label: "Offer classic and new recipes", result: "Two trays make room for every taste.", effects: { bonds: 2, skill: 1 } },
      { label: "Stand proudly behind the experiment", result: "Your confidence wins over curious eaters.", effects: { joy: 2, skill: 1 } }
    ]
  },
  {
    age: 15, title: "The Competition",
    dialogue: ["A city food contest could put the stall on the map.", "For the first time, cooking feels like pressure instead of play."],
    activities: [
      { label: "Train every evening", detail: "+3 Skill, -1 Joy", effects: { skill: 3, joy: -1 } },
      { label: "Cook with friends", detail: "+2 Bonds, +1 Joy", effects: { bonds: 2, joy: 1 } }
    ],
    milestone: "A competitor drops their ingredients moments before judging.",
    choices: [
      { label: "Share your supplies", result: "You do not win first place, but earn the room's respect.", effects: { bonds: 3 } },
      { label: "Focus on your own plate", result: "Your careful technique earns a silver ribbon.", effects: { skill: 3 } }
    ]
  },
  {
    age: 18, title: "Two Roads",
    dialogue: ["An academy offers you a place in another city.", "The stall, your friends, and Grandma are here; the wider world is waiting there."],
    activities: [
      { label: "Study the business books", detail: "+2 Skill", effects: { skill: 2 } },
      { label: "Take Grandma on a day off", detail: "+2 Bonds, +2 Joy", effects: { bonds: 2, joy: 2 } }
    ],
    milestone: "The acceptance deadline arrives at midnight.",
    choices: [
      { label: "Go, and call home every week", result: "Distance stretches you without breaking your roots.", effects: { skill: 3, bonds: 1 } },
      { label: "Build your education at home", result: "Local mentors help you see your neighbourhood anew.", effects: { bonds: 2, joy: 2 } }
    ]
  },
  {
    age: 21, title: "Your Own Table",
    dialogue: ["On your twenty-first birthday, Grandma places the old wooden spoon in your hand.", "The next chapter is unwritten, but every choice has brought you to this table."],
    activities: [
      { label: "Perfect the signature plate", detail: "+3 Skill", effects: { skill: 3 } },
      { label: "Host a neighbourhood feast", detail: "+2 Bonds, +2 Joy", effects: { bonds: 2, joy: 2 } }
    ],
    milestone: "The doors open. What promise guides the future?",
    choices: [
      { label: "Make excellence your craft", result: "You promise never to stop learning.", effects: { skill: 2 } },
      { label: "Always leave room at the table", result: "You promise success will be shared.", effects: { bonds: 2, joy: 1 } }
    ]
  }
];

export const ENDINGS = {
  craft: { title: "The Master of the Golden Fritter", text: "Your skill carries the family recipe into kitchens far beyond home. Every perfect plate still begins with Grandma's wooden spoon." },
  community: { title: "The Longest Table", text: "Your shop becomes a neighbourhood landmark, where names are remembered and nobody eats alone." },
  joyful: { title: "A Life with Extra Spice", text: "You build a bright, surprising life. The stall changes shape many times, but cooking never stops feeling like play." }
};

export function getEnding(stats) {
  if (stats.bonds >= stats.skill && stats.bonds >= stats.joy) return ENDINGS.community;
  if (stats.skill >= stats.joy) return ENDINGS.craft;
  return ENDINGS.joyful;
}
