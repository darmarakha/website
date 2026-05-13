(function () {
  "use strict";

  const TYPE_BLUEPRINTS = {
    town: {
      name: "Town encounter",
      zones: ["central plaza", "two or three large readable buildings", "main road cross", "one water/bridge or wall edge", "market cover clusters"],
      landmarks: ["fountain", "bridge", "gate", "merchant stalls", "watch post"],
      avoid: ["dozens of tiny roofs", "crowded miniature houses", "far zoom city map"]
    },
    forest: {
      name: "Forest encounter",
      zones: ["wide clearing", "tree-wall cover", "ruin or standing stones", "curved path", "ambush side lane"],
      landmarks: ["fallen log", "old shrine", "stone circle", "stream", "hunter camp"],
      avoid: ["random leaf noise", "unreadable dense trees", "tiny shrubs everywhere"]
    },
    dungeon: {
      name: "Dungeon encounter",
      zones: ["large entrance room", "two side rooms", "corridor chokepoints", "pillars or rubble cover", "stairs or locked door"],
      landmarks: ["altar", "statue", "portcullis", "pit", "storage crates"],
      avoid: ["maze too thin", "micro corridors", "blank stone floor only"]
    },
    river: {
      name: "River crossing",
      zones: ["wide river strip", "large bridge", "two banks", "rocks and carts as cover", "alternate crossing"],
      landmarks: ["stone bridge", "ford", "broken wagon", "dock", "watch fire"],
      avoid: ["river too narrow", "tiny bridge", "unclear walkable terrain"]
    },
    tavern: {
      name: "Tavern encounter",
      zones: ["large common room", "bar and hearth", "kitchen", "stairs", "side rooms and exits"],
      landmarks: ["bar counter", "fireplace", "stage", "cellar hatch", "balcony"],
      avoid: ["too many tiny chairs", "tight unusable rooms", "isometric view"]
    }
  };

  const STYLE_REFERENCE = {
    label: "reference battlemap style",
    observations: [
      "top-down portrait battlemap like printable DnD maps",
      "large readable architecture and roads instead of tiny unclear icons",
      "gridless base art; NO baked-in grid lines because the app draws a precise VTT grid overlay",
      "clear central landmark and a few secondary landmarks",
      "enough empty movement lanes for miniatures or tokens",
      "warm hand-drawn fantasy ink and watercolor texture"
    ]
  };

  function cleanText(value, fallback) {
    const text = String(value || "").replace(/\s+/g, " ").trim();
    return text || fallback || "";
  }

  function clampNumber(value, min, max, fallback) {
    const num = Number(value);
    if (!Number.isFinite(num)) return fallback;
    return Math.max(min, Math.min(max, num));
  }

  function tokensFrom(text) {
    return cleanText(text).toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  }

  function scoreProfile(input) {
    const type = input.type || "town";
    const detail = input.detail || "high";
    const size = clampNumber(input.size, 16, 48, 32);
    const words = new Set(tokensFrom([input.seed, input.notes, input.style?.prompt].join(" ")));
    const density = detail === "cinematic" ? 0.82 : detail === "high" ? 0.72 : detail === "balanced" ? 0.58 : 0.42;
    const gridNeed = size >= 36 ? 0.92 : size >= 30 ? 0.82 : 0.74;
    const clutterRisk = density + (words.has("market") || words.has("city") ? 0.1 : 0) + (words.has("crowd") ? 0.14 : 0);
    const readability = Math.round((1.15 - Math.min(1, clutterRisk)) * 42 + gridNeed * 35 + (type === "town" ? 8 : 5));
    return {
      readability: Math.max(62, Math.min(96, readability)),
      scale: size >= 36 ? "large-room scale" : size >= 28 ? "encounter scale" : "compact encounter scale",
      density,
      gridNeed,
      clutterRisk
    };
  }

  function blueprintFor(input) {
    const type = input.type || "town";
    const base = TYPE_BLUEPRINTS[type] || TYPE_BLUEPRINTS.town;
    const seed = cleanText(input.seed, "clear encounter landmark");
    const notes = cleanText(input.notes, "readable routes, cover, doors, chokepoints");
    const profile = scoreProfile(input);
    const styleText = cleanText(input.style?.prompt || input.style?.name, "hand-drawn parchment fantasy battlemap");
    return { type, base, seed, notes, profile, styleText };
  }

  function buildPrompt(input) {
    const size = clampNumber(input.size, 16, 48, 32);
    const aspect = cleanText(input.aspect, "3:4");
    const detail = cleanText(input.detail, "high");
    const plan = blueprintFor(input);
    const zones = plan.base.zones.join(", ");
    const landmarks = plan.base.landmarks.slice(0, 5).join(", ");
    const avoid = plan.base.avoid.join(", ");

    const layoutPass = [
      "Generate ONE image only: a top-down orthographic fantasy Dungeons & Dragons 2014 battle map",
      "camera is directly overhead, not isometric, not perspective, not a world map",
      `composition: ${plan.base.name}; ${zones}`,
      `use 3 to 5 big landmark zones: ${landmarks}`,
      `scene focus from GM: ${plan.seed}`,
      `GM notes: ${plan.notes}`
    ];

    const readabilityPass = [
      "make every room, road, bridge, building, and cover object large enough for tabletop tokens",
      "avoid tiny unreadable props; do not fill the image with miniature buildings or small clutter",
      "leave clear walkable lanes, obvious entrances, chokepoints, cover positions, and open encounter space",
      `make the environment compatible with an app-side VTT grid around ${size} by ${size} squares`,
      "GRID RULE: gridless image, NO grid lines, NO square marks, NO baked-in tactical grid; the HTML canvas/CSS overlay will draw the exact grid later",
      "COLLISION RULE: keep walls, rocks, trees, water, furniture blocks, and doors visually clear so the app collision layer can match them",
      `quality profile: ${plan.profile.scale}, readability score ${plan.profile.readability}/100, detail ${detail}`
    ];

    const stylePass = [
      plan.styleText,
      STYLE_REFERENCE.observations.join("; "),
      "warm ink and watercolor, parchment fantasy tone, printable battlemat clarity",
      "no labels, no text, no title, no watermark, no UI panels, no character tokens",
      `preferred aspect ratio: ${aspect}`,
      `negative layout: ${avoid}`
    ];

    return [
      "Battlemap Director prompt, trained from the provided reference style profile.",
      "LAYOUT PASS: " + layoutPass.join(". "),
      "READABILITY PASS: " + readabilityPass.join(". "),
      "STYLE PASS: " + stylePass.join(". "),
      "Final validation before output: if details look tiny or unclear, zoom in and simplify the layout."
    ].join("\n");
  }

  function preview(input) {
    const plan = blueprintFor(input);
    const chips = [
      plan.base.name,
      plan.profile.scale,
      "gridless base",
      "VTT grid UI",
      "collision-ready",
      "landmark besar",
      "anti clutter"
    ];
    const warning = plan.profile.clutterRisk > 0.85
      ? "Detail tinggi berisiko terlalu ramai; AI diarahkan memperbesar zona, mengurangi clutter kecil, dan tetap gridless."
      : "Prompt diarahkan agar map gridless, besar, jelas, dan siap diberi VTT grid presisi dari aplikasi.";
    return {
      score: plan.profile.readability,
      chips,
      warning,
      zones: plan.base.zones.slice(0, 4),
      landmarks: plan.base.landmarks.slice(0, 4)
    };
  }

  window.DND2014_MAP_AI = { buildPrompt, preview, scoreProfile };
})();
