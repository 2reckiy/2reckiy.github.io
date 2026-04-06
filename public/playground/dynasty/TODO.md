# V1 Prompt
I want to build a web app game prototype in single html+css+js fullscreen canvas file. Using data-driven approach, classes, GameEngine for game loop if needed, for easy migration to reactjs+pixijs stack.

Main concept is dynasty family tree visualisation with top-down direction. 

Marriage layout should be next to each other regardless of generation with provided.

In the attached file I provide examples how should tree connectors be displayed: one main arrow from marriage which spreads to all children.

Let's add minimal functionality for the first iteration:

1. starting with only one dynasty member
2. clicking on person should display some element (modal or aside panel) with the person  information  and some button actions:
   1. arrange marriage - randomly create a person
3. time progress, with possibility to pause or speed up, 1 day or 1 year per second

Minimalistic game UI. with white-black colours, light colours palette with bright accent colours palette for main element and events.

this starting implementation will be base for next game mechanics: many dynasties, alliances, genes, cadet branches, dynasty merge etc.

clarify all needed information before generate the code.

# V2 Prompt
I want to build web app game prototype on full-screen canvas with html+css+js. Using data-driven approach, classes, main GameEngine class to handle game loop, resize,  input events. it should be easy to migrate to reactjs+pixijs stack.

Main concept of the game is build own dynasty/family. 
Main view feature is  dynasty/family tree top-down visualisation.
Starting with 1 or 2 members player should arrange marriages with other dynasties members to grow his own dynasty in real time.

For the start we need to figure out two main things:
1. optimal data structure for dynasty tree storing and visualisation
2. base entities classes
3. correct dynasty tree visualisation:
   1. top-down direction
   2. correct connections for marriages, children, sibling with connectors

Also I plan to implement listed features in the first iteration:
1. time progress, with possibility to pause or speed up, 1 year per second
2. random birth and death
3. base AI dynasties auto management

clarify all needed information before generate the code.

# V1 Clarifications

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
