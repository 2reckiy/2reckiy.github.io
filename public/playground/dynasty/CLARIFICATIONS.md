# V1 Questions

## 1. Dynasty Tree Structure & Visualization

**Marriage mechanics:**
- Can a person have multiple marriages over their lifetime (remarriage after spouse death/divorce)?
- Can marriages be between members of the same dynasty (cousins, etc.) or only between different dynasties?
- Who "owns" the children - both parents' dynasties, or just one?

**Tree layout:**
- Should spouses appear side-by-side on the same level, or should one dynasty be "primary" with spouses joining from the side?
- For your player's dynasty: do you want to see ONLY direct descendants, or also include siblings/cousins (full family tree)?
- Should we show multiple generations at once, or focus on a specific generation range?

## 2. Entity Properties

**Person attributes - which of these matter for v1?**
- Age, gender, fertility status
- Traits/skills that affect gameplay?
- Physical appearance (for avatar/icon)?
- Relationship quality between spouses?

**Dynasty attributes:**
- Just a name and color, or also prestige/wealth/power levels?
- AI dynasties - how many competing dynasties (3? 5? 10?)?

## 3. Gameplay Mechanics

**Marriage arrangement:**
- Does player click two people to propose marriage, or select from a list of available candidates?
- Are there restrictions (age gaps, already married, etc.)?
- Can AI dynasties reject/accept player proposals, or is it instant?

**Win/loss conditions:**
- Is there a goal (reach X members, survive X years, achieve highest prestige)?
- What happens if player's dynasty dies out?

**Time & Events:**
- Age ranges: at what age can people marry? Have children? Die of old age?
- Birth rate: should fertile couples have children automatically, or is it random chance?
- Death: purely random, or age-based probability?

## 4. Visual Style

**Aesthetics:**
- Minimalist (circles/squares for people) or more detailed (portraits, icons)?
- Color coding: by dynasty, by gender, by generation, or age?
- UI placement: controls at top/bottom? Side panel for details?

# V1 Answers

## 1. Dynasty Tree Structure & Visualization

**Marriage mechanics:**

Q: Can a person have multiple marriages over their lifetime (remarriage after spouse death/divorce)?
A: Yes
Q: Can marriages be between members of the same dynasty (cousins, etc.) or only between different dynasties?
A: yes
Q: Who "owns" the children - both parents' dynasties, or just one?
A: children are "own" by both parents.

**Tree layout:**

Q: Should spouses appear side-by-side on the same level, or should one dynasty be "primary" with spouses joining from the side?
A: spouses should appear side-by-side on the same level
Q: For your player's dynasty: do you want to see ONLY direct descendants, or also include siblings/cousins (full family tree)?
A: I want to see full family tree, but if dynasty memeber is moved to other dynasty after marriage it shouldnot be displayed as part of his origin. 
Q: Should we show multiple generations at once, or focus on a specific generation range?
A: show multiple generations at once, maybe with some lazy loading for next iterations

## 2. Entity Properties

**Person attributes - which of these matter for v1?**

Q: Age, gender, fertility status. Traits/skills that affect gameplay? Physical appearance (for avatar/icon)? Relationship quality between spouses?
A: Age, gender, fertility, some random traits/skills, avatar/icon placeholder

**Dynasty attributes:**

Q: Just a name and color, or also prestige/wealth/power levels?
A: Name, Color, prestige/wealth/power could be added as placeholders
Q: AI dynasties - how many competing dynasties (3? 5? 10?)?
A: it should be configurable property, 5 by default

## 3. Gameplay Mechanics

**Marriage arrangement:**

Q: Does player click two people to propose marriage, or select from a list of available candidates?
A: select from a list of available candidates
Q: Are there restrictions (age gaps, already married, etc.)?
A: Marriage is availabe: from 16 y.o., if current status is not married 
Q: Can AI dynasties reject/accept player proposals, or is it instant?
A: instant for the first iteration

**Win/loss conditions:**

Q: Is there a goal (reach X members, survive X years, achieve highest prestige)?
A: it could be skipped for the first iteration, but easy to add further
Q: What happens if player's dynasty dies out?
A: game is ended, need to restart

**Time & Events:**

Q: Age ranges: at what age can people marry? Have children? Die of old age?
A: people can marry and Have children from 16 y.o., and die of old age randomly.
Q: Birth rate: should fertile couples have children automatically, or is it random chance?
A: random for the first iteration
Q: Death: purely random, or age-based probability?
A: age-based probability but random

## 4. Visual Style

**Aesthetics:**

Q: Minimalist (circles/squares for people) or more detailed (portraits, icons)?
A: Minimalist, structured, compact person card with portrait placeholder and icons for gender, traits etc.
Q: Color coding: by dynasty, by gender, by generation, or age?
A: by dynasty, 
Q: UI placement: controls at top/bottom? Side panel for details?
A: Side panel for details
