---
title: "Economy & Live Operations"
start_date: "2023-06-22"
end_date: "2026-01-15"
excerpt: "Built core elements of an MMORPG economy and owned them through to a live service environment."
image: "assets/images/portfolio/caravan-banner.jpg"
category: "professional"
tags: ["Unreal Engine", "C++", "Economy", "Live Ops"]
hidden_tags: ["Feature Flags", "Distributed", "Analytics"]
studio: "Intrepid Studios"
role: "Gameplay Engineer"
duration: "30 months"
featured: true
---

## Building and Servicing the Lifeblood of an MMORPG

 As one of only two dedicated economy gameplay engineers since 2023, I was involved in nearly every facet of Ashes of Creation's economy code. From lean prototypes and MVP features in 2023, through to launching production ready core systems in 2024, and all the way to live service ownership of features in 2025, I've worked on systems that kept hundreds of thousands of players engaged and coming back.

 ## Key Feature Ownership Highlights

 ### Inland Fishing

 *February 2024 - Project Conclusion*

Ahead of our 2024 closed alpha test, we determined that we needed to have all 22 of our professions online, pivoting from our initial target of 19. A critical example of this was our baseline fishing system. I took the fishing profession from initial design discussions, through technical design proposals, prototyping, and all the way through to production and live operations. Fishing posed a unique challenge compared to other professions as it was the only one that did not utilize an interactable actor or component. Fishing leveraged tech from both the combat and vehicle teams to use a physically simulated projectile to engage with water, eschewing our usual raycasts, and allowing for a an experience not limited by designated fishing areas.

### Gear Set Bonuses

*June 2024 - Project Conclusion*

Working in close collaboration with economy design, I engineered and maintained a rarity affected set bonus system. Under this system, gear would provide varying benefits depending not just on how many items of a given set were equipped but also based on the rarity distribution of those items. This system provided a strong layer of buildcrafting complexity when deciding on item usage for crafting.

### Item Instance Modifications

*Various*

I built a significant number of the systems that handled operations performed on single items. These ranged from item modifications like gear tempering and gem socketing to unique item instance data tracking like persisted crafter information and sport fishing catch measurements. These systems were required to be heavily protected as they represented high danger areas for exploitation. Some of the notable functionalities that I worked on include:

- Gem socketing
- Item deconstruction
- Gear tempering
- Sport fish size
- Learnable recipe consumables
- Item repair

**Contribution Highlight**

> The original sport fishing design assigned each fish a uniformly random weight and length within fixed ranges. However, that system came with two major flaws: the strong possibility of fish that had clashing weights and lengths and extreme sized fish being as common as any other fish, which weakened the chase fantasy for competitive fishing.
> 
> I proposed and implemented a revised approach to target both issues. By determining length with a decaying distribution and deriving weight biased to that value, the system produced a believable size relationship and sustained long lasting competition, even under live MMO population scale.

### Vendor Price Calculation Refactor

*January 2025*

After a player report about an inconsistency in the pricing of the lowest cost item in the game led to me identifying a small order of operations error in some of the oldest code in the game, the team determined that we could no longer sustain the technical debt of maintaining the pre-alpha price calculation code. In January of 2025, I tackled the multifaceted task of a ground-up refactor of our vendor code, including a full rewrite of our price calculations. This new system allowed for safer dynamic pricing, resolved a key issue had been causing order-dependant pricing, and located a critical error in tax calculation code that caused certain transactions to threaten to clear the gold supply of settlements.

## Key Collaborative Work

### Crafting and Processing

As the face of the in-game economy, crafting and processing systems were one of my enduring core focuses. Individually, some of my key contributions included our quality calculation algorithm, tracking and learning recipes, and live service safeguards for professions.

**Contribution Highlight**

> One notable functionality that I developed was our crafting and processing quality formulas. Originally, we used a naive average quality of ingredients system, however, through analyzing telemetry data, it became abundantly clear that players were taking advantage of this system by using large quantities of high-quality but accessible resources to overwhelm their use of low-quality rare and expensive ingredients. Armor Molds, for example, required significant investment to construct as a tertiary stage crafted ingredient, and were suitably asked for in low quantities by Armorsmithing recipes. Metal fragments, however, were a highly accessible secondary stage processed ingredient and were typically required in medium to high quantities. Players would thus accumulate very high quality metal fragments, use a base quality Armor Mold, and acquire a highly coveted Epic armor piece. In collaboration with one of the economy team technical designers, we solved this issue by replacing the material quality calculation with one that used an average of averages, wherein each individual ingredient type first determined the average of its quality contributed, then determined the final product quality by averaging those values. This change was strongly successful, and it repaired the chase requirement for complex ingredients.

### Gatherables and Gathering

In addition to fishing, I contributed to supporting systems for gathering including interaction animation syncing, NPC gatherables for hunting, and inter-server tracking for surveying.

### Reward Tables

I spent a considerable amount of time as the primary engineer on our reward table system. While the system did not have a singular owner, over multiple development cycles, I contributed heavily to the system's development. Some notable contributions included locating and repairing a predictable RNG seed bug, constructing pipelines for designers to utilize situational data to determine rewards, and implementing reward result tracking for analytics and forensics.