---
title: "Economy & Live Operations"
start_date: "2024-10-15"
end_date: "2026-01-15"
excerpt: "Designed and implemented economy systems with live service safeguards and real-time monitoring."
image: "assets/images/portfolio/combat-system-preview.jpg"
category: "professional"
tags: ["Unreal Engine", "C++", "Economy", "Live Ops"]
hidden_tags: ["Feature Flags", "Distributed"]
studio: "Intrepid Studios"
role: "Gameplay Engineer"
duration: "18 months"
featured: true
---

## An MMO Economy, From Prototypes to 200K Players

As one of just two full-time economy systems gameplay engineers on Ashes of Creation since 2023, I've owned and evolved core economy and character progression systems through every stage of an MMORPG life cycle. I contributed extensively to character professions, crafting, itemization, and rewards, working in close collaboration with veteran MMO designers to both build ground level features and support them in a live environment.

### High Level Work

- Developed highly visible item modification systems including tempering, gem socketing, deconstruction, crafter attribution, and sport fishing fish sizing data

- Contributed to key high-risk and asynchronous elements of crafting, processing, and gathering systems including serverside verification and clientside prediction

- Designed and built core gameplay functionality including key contributions to inland fishing, hunting, and a unique dynamic set bonus system


## Technical Challenges

### Deeply Intertwined Professions

The professions system design for Ashes of Creation was extremely complex. Our 22 professions, across three categories (gathering, processing, and crafting), were foundationally linked and impossible to bring to a live game environment in pieces. This required a unique technical challenge in which large inter-connected but fundamentally disparate systems neeeded to be built and evolved in parallel. To facilitate this, we became extremely experienced at maximizing object oriented programming gains, by strongly compartmentalizing our professions and not cutting corners, we were able to maintain a large set of functionaltities with minimum overhead and technical debt.

**Example Professions Work: Fishing**

One of the core systems I built in the economy ecosystem was the inland fishing profession. Fishing faced two key challenges:

- It was the only profession that was not attached to an interactable actor

- It had an extremely unique physical presence in the world

For our other gathering professions, we were able to leverage our existing interactable system. This gave us access to simple raycasts and pre-handled interaction boilerplate. However, for a combination of both architecture and design, we did not wish for fishing to be a simple "press E to interact" mechanic. From an arcitecture stance, this would have created kilometer scaled interaction volumes and strongly impacted our ability to place other gatherables inside aquatic environments. From a design stance, it was a mechanic that felt overly gamified in a world that we were endeavoring to make feel grounded and alive.

I solved these problems by leveraging work from a trio of different teams. Working with the Player Combat team, I drove fishing through a modified combat ability. This gave me the opportunity to treat a fishing rod cast as a physical projectile, which allowed for both a unique gameplay layer and to have a flexible and customizable interaction event at range. I also worked with the Tech Art and Vehicle teams to leverage their water surface determination techniques for our caravan rafts. With these two tools in my pocket, I was able to attach gathering data directly to regions of water and create the foundation of the most individually unique profession in the game.

### 

- Developed highly visible item modification systems including tempering, gem socketing, deconstruction, crafter attribution, and sport fishing fish sizing data

- Contributed to key high-risk and asynchronous elements of crafting, processing, and gathering systems including serverside verification and clientside prediction

- Designed and built core gameplay functionality including key contributions to inland fishing, hunting, and a unique dynamic set bonus system




### Input Buffering System

One of the first challenges was making combat feel responsive despite animation commitments. I implemented a robust input buffering system that:

- Queues player inputs during attack animations
- Validates buffered inputs against the current combo state
- Handles input priority for conflicting commands (dodge vs. attack)
- Supports variable buffer windows per animation

```cpp
void UCombatComponent::BufferInput(EInputAction Action)
{
    FBufferedInput NewInput;
    NewInput.Action = Action;
    NewInput.TimeBuffered = GetWorld()->GetTimeSeconds();
    NewInput.ValidWindow = GetBufferWindowForCurrentState();
    
    InputBuffer.Add(NewInput);
}
```

### Combo State Machine

The combo system uses a hierarchical state machine that manages:

- Light and heavy attack chains
- Directional attack variants
- Combo branches and finishers
- Cancel windows into dodge/block

I worked closely with design to create a data-driven approach where combo routes could be configured in data assets without code changes.

### Hit Detection & Feedback

For hit detection, I implemented a hybrid approach:

1. **Hitbox Generation** - Weapon trace hitboxes spawned from animation notifies
2. **Hit Validation** - Server-authoritative hit confirmation for multiplayer
3. **Feedback Systems** - Hit stop, camera shake, controller rumble, and VFX triggers

The hit stop system was particularly important for game feel:

```cpp
void UCombatComponent::ApplyHitStop(float Duration, float TimeScale)
{
    // Apply localized time dilation to attacker and target
    SetCustomTimeDilation(TimeScale);
    
    // Schedule restoration
    GetWorld()->GetTimerManager().SetTimer(
        HitStopTimer, 
        this, 
        &UCombatComponent::RestoreTimeDilation, 
        Duration, 
        false
    );
}
```

## Collaboration

This system required close collaboration with multiple disciplines:

- **Animation** - Defining notify windows, root motion curves, and blend spaces
- **Design** - Balancing damage values, combo timing, and stamina costs
- **VFX** - Triggering particle effects and trails at the right moments
- **Audio** - Implementing layered sound design for impact variation

## Key Features Implemented

- **Combo System** - 20+ unique attack chains with branching paths
- **Target Lock-On** - Soft and hard lock systems with target switching
- **Parry/Block** - Frame-perfect parry windows with directional blocking
- **Stamina Management** - Attack costs, recovery, and exhaustion states
- **Damage Types** - Physical, elemental, and status effect support
- **AI Integration** - Exposed combat actions for enemy AI behavior trees

## Performance Considerations

Combat is performance-critical, so I focused on:

- Object pooling for hitbox actors and VFX
- Efficient collision queries using trace channels
- Minimizing GC pressure during combat sequences
- Profiling and optimizing hot paths

## Results

The combat system has been praised in internal playtests for its responsiveness and depth. Key metrics:

- **Input latency**: <50ms from button press to visible response
- **Frame budget**: Combat systems use <2ms per frame on target hardware
- **Designer iteration**: New combos can be added in ~30 minutes

## Lessons Learned

- Early investment in debug visualization saves countless hours
- Data-driven systems dramatically speed up iteration
- Hit stop duration is measured in milliseconds but feels like miles
- Always get the basic loop feeling good before adding complexity
