---
title: "Race Engineer Simulator"
start_date: "2022-01-01"
end_date: "2022-03-01"
excerpt: "A personal project racing strategy game that taught me a lot of lessons."
image: "assets/images/portfolio/RES.png"
category: "personal"
tags: ["Unity", "C#", "NPC AI"]
hidden_tags: [Git]
role: "Solo Developer"
duration: "3 months"
featured: true
---

## My First True Game

Shortly after graduating, I gave myself a goal to build and ship a small game solo. As an extremely early in career developer, I found myself daunted by the art requirements, and approached the design of the game with the guiding question "how can I make a compelling game that showcases my engineering skills without getting trapped by overwhelming art requirements?"

The design I came up with was a racing game in which you do not play as the race car driver. Instead, you play as the driver's pit lane engineer, your only control is over your driver's strategy, and your only visibility is through simple telemetry data. Your job is not to drive a car to first place, it is to coach a driver to victory with nothing but timesheets, tire wear data, and lap information.

It ended up being a fun and rewarding project that gave me a chance to latch onto a passion of mine in motor racing while teaching me valuable lessons in engineering that I still make use of today.

## The Hard Part is Being Easy

The most ambitious task I took on for RES was the opposing NPC AI. While I had originally designed the AI to have a degree of control comparable to the player, I quickly discovered that to do so simply created unbeatable monsters. So, I pulled back a bit. The AI in RES uses a custom decision tree that makes a new race state prediction at the end of every lap. When an opposing racer finishes a lap, the AI engineer performs an integration approximation to determine what the current rate of tire wear will be at the end of the new lap. From there, it performs an A* search of the solution space for possible tire strategies to determine the 15 most viable pit stop plans. It then randomly selects a strategy between the 7th and 15th best option. If that strategy calls to take a pitstop on the next lap, it will perform that stop and switch to the tire compound that strategy requested.

Originally, I had planned to have the solution randomly pick between the 1st and 3rd best strategies, though even with the player having the best possible car and driver, this resulted in an impossible level of difficulty. Even a pivot to choosing between the 3rd and 7th best strategies failed to produce a winnable race. Eventually, and through extensive player testing, I was able to settle on the range of 7th to 15th most effective strategy. This was a shock to me, and it's the whole reason I still include this story on my portfolio. While I have grown significantly as an engineer since I launched this game, it remains a very influential project in my history as a developer, and I am quite proud of what I built.

## Play It

Race Engineer Simulator is available for free on my [itch.io page](https://sergeant-slash.itch.io/race-engineer-simulator), however the project has been dormant for quite some time, and has not been actively maintained.