---
title: "Designer-Driven, Data-Oriented Systems"
start_date: "2023-6-22"
end_date: "2026-01-15"
excerpt: "Engineered key systems that enabled designers to independently create dynamic content with data-oriented solutions."
image: "assets/images/portfolio/statue.jpg"
category: "professional"
tags: ["Unreal Engine", "C++", "Economy", "Design"]
hidden_tags: ["Progression"]
studio: "Intrepid Studios"
role: "Gameplay Engineer"
duration: "30 months"
featured: true
---

## Handing Design the Keys

MMOs require enormous amounts of content to feel fulfilling, and the economy lives and breathes through design's ability to produce and iterate on that content efficiently and safely. For the economy, I was a key contributor on many of our design data driven systems, providing access to powerful dynamic functionality to designers while ensuring the content produced was validated and production secure.

## Dynamic Expressions, Designer-Driven Data

Ashes of Creation utilized an in-house toolset to give designers access to a custom lightweight scripting language when defining objects and data records. I played a key role in tying economy systems into context dependent expression hooks across functionality such as crafting, rewards, item stats, vendor pricing, and more. These results then needed to be verified, error handled, and logged at varying levels of verbosity to ensure system stability and engineering-level edge case management across thousands of individual record implementations.

**Key Contribution**

> The recipe system for crafting and processing was a high vulnerability point for bad itemization data to allow an undetected error to reach production code. A recipe missing from inclusion on any crafting station can be easily missed by QA, and its downstream dependencies become quietly inaccessible. After identifying this as a failure point, I developed a comprehensive crafting validation tool that scanned tens of thousands of records to construct a map of possible failure points ranging from basic invalid data errors all the way to complex scenarios that identified recipes containing raw ingredients with unobtainable sources. Over multiple development cycles, this validator was used to identify over 2500 issues across the recipe system and saved countless hours of design and QA time.