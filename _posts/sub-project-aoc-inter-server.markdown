---
title: "Inter-Server Gameplay & Economy Integration"
start_date: "2023-06-22"
end_date: "2026-01-15"
excerpt: "Developed key economy systems in an environment of changing server authority."
image: "assets/images/portfolio/wide-world.jpg"
category: "professional"
tags: ["Unreal Engine", "C++", "Economy", "Networking"]
studio: "Intrepid Studios"
role: "Gameplay Engineer"
duration: "30 months"
featured: true
---

## Stability in a Highly Asynchronous World

Ashes of Creation utilized a one-of-a-kind dynamic server gridding technology. This created unique challenges for core systems as common assumptions like static server authority could not be relied upon.

## Seamless Cross-Server Interaction

Interactions across server boundaries were inevitable, unpredictable, and vital to be unnoticeable by players. A consistent element of my engineering work was in ensuring both stability and correctness of numerous economy systems in inter-server scenarios. I tackled this in a variety of different ways across several features.

For gathering, I used time synchronization via the replicated interaction response to subtly alter the predictive client-side animation to conclude at the same time the operation ended.

For surveying, each server grid tracked both the gatherables on it and the state of gatherables present in its neighbors by proximity and communicated updates to those neighbors to ensure that survey results remained synchronized with the global world state.

For transactions, I ensured safe order of operations and utilized forensics logging to guarantee that players could never receive rewards without cost and that any incident where a transaction cost is incurred and the result is not received can be rectified promptly and correctly.

Through numerous systems, I maintained a steady and consistently correct infrastructure despite these challenges. 