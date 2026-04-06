# Concept
see CONCEPT.md

## Overall Assessment

The vision is coherent and the scale naming adds genuine flavor — calling a Plot a "Settlement" immediately makes the game world feel inhabited rather than abstract. The bonfire mechanic for Plot-Settlement is the strongest concrete idea here: it's a **survival sustainability puzzle** which is fundamentally different from a pure optimization puzzle, and that's a good thing.

Let me go scale by scale.

---

## Plot-Settlement: Strong Foundation, Needs One Clarification

The bonfire mechanic is elegant because it imposes **two simultaneous constraints** that must both be positive at the same time:

```
Bonfire ──consumes──→ Brushwood/tick
Population ──consumes──→ Food/tick

Win condition: Food production > consumption
               AND Brushwood production > consumption
               sustained for N ticks
```

This is genuinely interesting because players can't just rush one resource — they need balanced expansion. The "several ticks" sustain requirement prevents lucky one-tick spikes from counting.

**What needs clarifying:**

The relationship between **turns** and **ticks** is ambiguous right now. You have two time systems:

- Turns: the limited count of tile openings
- Ticks: the passage of time that measures production sustainability

These need to be explicitly separated. My suggestion:

```
Turns = how many tiles you can open (your action budget)
Ticks = real-time heartbeat (1 per second) measuring production balance

You spend turns to open tiles.
Ticks measure whether your current open tiles sustain the win condition.
You can stop opening tiles and just wait for ticks to accumulate.
```

This creates a beautiful late-session tension: you've spent most of your turns, production is barely positive — do you spend your last 2 turns to reinforce it, or trust that the next 5 ticks will hold?

**Grid size randomness:** Good instinct. Suggest tying it to the District slot it will fill — some District slots demand larger Settlements (harder puzzle, better card grade), some accept small ones (easier, weaker output). The slot requirement is known before the session starts, so the player makes an informed commitment.

**What Plot-Settlement should produce for District:**

You mention resources OR population. I'd make both always present but in different ratios depending on tile composition:

```
Every Settlement produces:
- Population (based on how well-fed they were — food surplus × ticks sustained)
- Primary resource (dominant tile type opened)
- Settlement grade (D→S, based on efficiency)
```

Population is the universal currency that flows upward. Resources are the specific currency. This gives District two things to work with.

---

## District: The Weakest Definition Right Now

Your current District definition is almost entirely structural ("place 3 cards, get a tile-card") with no gameplay identity of its own. The opening mechanic mirrors the original game, but what makes District *feel* like a town or village?

**The core District identity should be: Population Management.**

Plot-Settlements feed population upward. District's job is to *employ* that population productively. This creates the District's unique mechanic:

```
Population arrives from placed Settlement cards.
Population must be assigned to District buildings.
Unassigned population is idle (small passive gold).
Assigned population runs buildings at efficiency.
```

**District tile types** (what you open on the District grid) should be **building slots**, not resource nodes:

| District Tile | Population cost | Produces |
|---|---|---|
| Market | 5 pop | Commerce (new District resource) |
| Granary | 3 pop | Food storage (increases Settlement card value) |
| Barracks | 8 pop | Defense (needed for Region requirements) |
| Workshop | 6 pop | Craft goods (needed for Region opening costs) |
| Town Hall | 10 pop | Governance (unlocks District card formation) |

The District session win condition / completion requirement:
- Minimum 3 Settlement cards placed
- Town Hall tile opened (requires reaching it via adjacency — it's always near center or at a specific location)
- Population balance positive (more arriving from Settlements than leaving via building upkeep)
- Sustain for N ticks

**District card output for Region:**
- Population (aggregated from Settlements)
- Commerce
- A Specialization tag determined by which buildings dominated (most Workshop = Craftsman District, most Market = Trade District, etc.)

---

## Region: The Infinite Layer

Region is where the original game's infinite map lives. The key design challenge: what makes Region feel like a *country* rather than just a bigger District?

**The Region identity should be: Territory and Specialization.**

Region tiles are **Districts placed spatially**, not opened through sessions. The Region *map* is what you navigate with the original camera. Tiles on the Region map are either:

- Empty (fog of war, opened with Commerce or Governance resources)
- Occupied by a placed District card
- Special Region-only tiles (Rivers, Roads, Natural Wonders, Borders)

**Region-unique mechanics:**

*Borders matter:* When you place two District cards adjacent to each other, their edge values interact. A Trade District adjacent to a Craftsman District creates a Trade Route automatically — generates bonus Commerce passively. This makes the spatial arrangement of District cards a strategy layer.

*Region capital:* One District in each Region must be designated the Capital. The Capital's Specialization determines the Region's identity. Region cards carry that identity upward to the World map.

*Region completion requirements* (to form a Region card):
- Minimum 3 District cards placed
- At least 1 Capital designated
- Region must control a connected territory (no isolated District islands — they must all be adjacent chain)
- A Region Wonder tile must be opened (rare tile, always exists somewhere in the Region grid, must be reached via adjacency)

**Region card output for World:**
- Civilization score (derived from all Settlements and Districts within)
- Specialization identity (from Capital)
- Territory size (how many District tiles were placed)

---

## The Thematic Coherence Problem Worth Addressing

Your scale names have a conflict:

```
Plot = Settlement
District = town / village / city
Region = city / country / metropolis
World = Planet
```

District and Region overlap — a "city" appears at both levels. And Region's top end ("metropolis") feels smaller than World's "Planet." The jump from metropolis to Planet skips several meaningful scales.

Suggest aligning the thematic identity more clearly:

| Scale | Identity | Governed by | Unique resource |
|---|---|---|---|
| Plot | Settlement / Camp | Survival | Food, Brushwood |
| District | Village / Town | Population | Commerce, Craft |
| Region | Kingdom / Nation | Territory | Governance, Culture |
| World | Planet | Civilization | Energy, Influence |
| Planetary System | Star Empire | Expansion | Stellar resources |
| Universe | Cosmic faction | — | — |
| Multiverse | — | — | — |

Each scale introduces a new governing concept and a new top-level resource. Survival → Population → Territory → Civilization → Expansion. This is a natural human-history arc which makes the scale progression feel *earned* rather than arbitrary.

---

## The Biggest Open Question

You haven't defined what triggers the transition from playing at one scale to needing to engage with the next.

Right now the implicit answer is "when you have enough cards to place." But that's passive — the upper scale just waits for you to fill it. 

Consider adding **pull mechanics** — reasons the upper scale *demands* your attention:

- District sends a resource request to its Settlements ("District needs 50 more Food — complete a Settlement within 3 minutes or Commerce drops")
- Region event affects all Districts within it ("War incoming — Districts need Defense buildings or lose population")
- World-scale event cascades downward through all layers

This creates **top-down pressure** to balance the natural **bottom-up flow** of card completion. The player isn't just building upward — they're also responding to demands coming downward. That two-directional tension is what makes the multi-scale system feel alive rather than sequential.

