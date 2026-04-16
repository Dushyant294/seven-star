# Seven Star - Official Game Rules

## Overview

**Seven Star** is a 4-player team-based card game (2v2) played over exactly **15 rounds**. Players connect online using Socket.IO, join rooms with unique codes, and compete to win the most tricks for their team.

---

## Players & Teams

- **4 Players** required to start a game
- Players are divided into **2 Teams**:
  - **Team 1** (TEAM1)
  - **Team 2** (TEAM2)
- **2 players per team**
- Teammates sit opposite each other (Team 1 player, Team 2 player, Team 1 player, Team 2 player)

---

## The Deck

### Card Composition

| Value | Cards per Color | Hierarchy Rank |
|-------|-----------------|----------------|
| 5     | 1               | 1 (Lowest)     |
| 6     | 2               | 2              |
| 7     | 2               | 3              |
| 8     | 2               | 4              |
| 9     | 2               | 5              |
| Skip  | 2               | 6              |
| Reverse | 2             | 7              |
| +2    | 2               | 8 (Highest)    |

### Color Distribution
- **4 Colors**: Red (R), Blue (B), Green (G), Yellow (Y)
- **15 cards per color**
- **60 cards total**

### Card Value Ranking (Lowest to Highest)
```
5 < 6 < 7 < 8 < 9 < Skip < Reverse < +2
```

---

## Game Setup

1. **Create/Join Room**: One player creates a room and receives a 5-character room code. Other players join using this code.
2. **Team Selection**: Each player selects either TEAM1 or TEAM2 (maximum 2 players per team)
3. **Start Game**: The host clicks "Start Game" when all conditions are met:
   - Exactly 4 players in room
   - Exactly 2 players per team
4. **Dealing**: Server shuffles all 60 cards and deals **15 cards to each player**
5. **Starting Player**: Randomly selected to begin Round 1

---

## Gameplay

### Turn Structure

1. **Lead Player** plays first card (any card from hand)
2. Play proceeds **clockwise** around the table
3. Each player **plays one card** per round
4. After all 4 players play, the **trick is resolved**

### The Following Color Rule

> **If you have a card matching the lead color, you MUST play it.**

- If you have cards of the lead color in your hand, you cannot play a different color
- If you have **no cards** of the lead color, you may play **any card** from your hand

### Playing a Card

- Click on a card in your hand to play it
- Invalid plays (breaking the following rule) are rejected by the server
- Played cards appear in the center trick area

---

## The Star Color

### What is the Star?

The **Star Color** is a special mechanic that can dominate tricks once established.

### How to Create the Star

The Star is created **once per game** when ALL conditions are met simultaneously:

1. A **Skip card** is played
2. The Skip card's color is **different** from the lead color
3. The player **does NOT have any cards** of the lead color in hand

When these conditions are met, the Skip card's color becomes the **Star Color** for the entire game.

### Star Rules

- Star can only be created **once per game**
- Once created, the Star Color **cannot change**
- The Star remains active for all remaining rounds (1-15)
- If no Star is created during the game, no Star exists

### Strategic Note

Creating a Star is a **sacrifice** - you play a powerful Skip card out-of-suit. This can be risky if the Star color doesn't appear often in tricks.

---

## Winning a Trick (Round)

### Resolution Order

**Step 1: Check for Star Cards (if Star exists)**
- Look at all cards in the trick that match the Star Color
- If at least one Star card was played, the **highest value Star card wins**

**Step 2: Fallback to Lead Color**
- If no Star cards were played (or no Star exists), look at cards matching the **lead (first played) color**
- The **highest value lead color card wins**

### Tie-Breaking Rule

> **If multiple cards of the same highest value and color are played, the LAST player who played that card wins the trick.**

**Example:**
- P1 → Red +2 (lead)
- P2 → Red 5
- P3 → Yellow 5
- P4 → Red +2

Highest value = +2 (Red)
Both P1 and P4 played Red +2
**P4 wins** (played last)

### Determining the Winner

| Condition | Winner |
|-----------|--------|
| Star exists + Star cards played | Highest value Star card (last one if tie) |
| No Star cards played | Highest value lead color card (last one if tie) |
| No Star exists | Highest value lead color card (last one if tie) |

### After the Trick

- The winning player takes the trick
- Their team receives **+1 point**
- The winner **starts the next round**

---

## Scoring & Winning

### Score Tracking

- **Team 1 Score** = Number of tricks won by Team 1 players
- **Team 2 Score** = Number of tricks won by Team 2 players
- **Total points per game = 15** (one per trick)

### Determining the Winner

| Team 1 Score > Team 2 Score | **Team 1 Wins** |
| Team 2 Score > Team 1 Score | **Team 2 Wins** |
| Team 1 Score = Team 2 Score | **Draw** |

### Game End

- Game ends after **15 rounds** (all tricks played)
- Final scores and winner are displayed
- The Star Color is shown (or "None" if never created)

---

## Strategy Tips

### 1. Hand Management
- Balance your hand across colors
- Having at least one card of each color gives you flexibility

### 2. Star Awareness
- Watch for when a Star might be created
- Save high-value cards (Skip, Reverse, +2) of the Star color
- Once Star exists, try to win tricks with high-value Star cards

### 3. Leading Decisions
- Consider what color you lead - you might trigger the Star
- Leading a color where you have high-value cards is often wise

### 4. Following Rules
- If you have the lead color, you must play it (no exceptions)
- Plan which cards to keep vs. play early

### 5. Team Coordination
- While there's no chat, your plays affect your teammate
- Help your teammate by winning tricks they can't

---

## Quick Reference

| Rule | Description |
|------|-------------|
| Players | 4 players (2v2 teams) |
| Cards | 60 total (15 per player) |
| Rounds | 15 tricks per game |
| Colors | 4 (Red, Blue, Green, Yellow) |
| Values | 5 < 6 < 7 < 8 < 9 < Skip < Reverse < +2 |
| Must Follow | Play lead color if you have it |
| Star Creation | Play Skip out-of-suit (no lead color) |
| Star Effect | Highest Star card wins trick |
| Fallback | Highest lead color card wins |
| Tie-Breaker | Last player with highest card wins |
| Points | 1 per trick won by your team |
| Win Game | Team with more points after 15 rounds |

---

## Technical Info

- **Client**: React
- **Server**: Node.js + Express + Socket.IO
- **Real-time**: All game state synchronized via WebSocket
- **Room Codes**: 5-character alphanumeric codes

---

*Have fun playing Seven Star!*
