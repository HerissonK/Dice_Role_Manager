📘 Stage 1 Report — Project: Character Sheet Creation & Dice Role Management
0. Team Formation & Roles Definition
Team Member
Name: Kévin Hérisson


Solo project developer, responsible for all technical, functional, and organizational tasks.


Even though this is an individual project, the structure follows standard team-based project documentation requirements.
Assigned Roles
Project Manager (PM)
 Handles planning, priorities, and time management.


UI/UX Designer
 Designs the interface, workflow, and user experience.


Frontend Developer
 Builds the web pages, forms, and dynamic display.


Backend Developer
 Implements logic, calculations, and (if needed) data persistence.


Fullstack Developer
 Ensures integration between frontend and backend components.


Rationale for Role Assignment
Since the project is handled by one person, assigning roles:
Improves task organization


Highlights required skills


Structures the development process


Stakeholders
Stakeholder
Role
Impact
Kévin Hérisson
Developer, designer, product owner
Final decisions on features, design, and technical implementation
End Users
D&D players and beginners
Their needs guide simplicity and usability
External Reference: AideDD D&D Builder
Functional inspiration
Helps identify core features and best practices


1. Brainstorming and Idea Evaluation
Step 1: Individual Research
Inspirations:
D&D Beyond


AideDD – D&D Builder


Dice roller tools (Avrae, Roll20)


Character management mobile apps


Brainstorming Techniques Used
✔ Mind Mapping
Explored ideas around “tabletop RPG tools”:
Character sheet


Dice rolling system


Dynamic inventory


Random NPC generator


Spell management


Simple combat tracker


✔ SCAMPER (applied to the AideDD Builder concept)
Substitute: Simplify the interface to be beginner-friendly


Combine: Merge character sheet + dice roller in one tool


Adapt: Adjust for standard D&D 5e rules


Modify: Add a guided mode


Put to another use: Useful for RPG introduction workshops


Eliminate: Remove overly complex advanced options


Reverse: Start from actions before stats


✔ “How Might We” Questions
How might we make character creation easier for beginners?


How might we automate dice rolls using character stats?


How might we reduce calculation errors during gameplay?







Step 2: Ideas List
Idea
Description
Feasibility
Difficulty
User Value
1. Interactive character sheet (D&D)
Full creation with saving
High
Medium
Very high
2. Automatic dice roll system
Click-to-roll with bonus calculation
High
Low
Very high
3. Random NPC generator
Name & stat generation
Medium
Medium
Moderate
4. Inventory management
Add/remove items
Medium
Medium
Moderate
5. Simple combat tracker
Turn-by-turn automation
Low
High
Low


Ranked Ideas
Character sheet creation → selected


Dice roll system → added to MVP


NPC generator


Inventory manager


Combat tracker



2. Decision & Refinement (MVP Selection)
Selected MVP
➡️ Character sheet creation + automatic dice roll management
Reasons for Selection
High impact and usefulness


Technically feasible within time constraints


Demonstrates multiple skills (UI, logic, interactivity)


Easily expandable in future versions


Inspired by established tools → reliable functional reference



Problem Statement
Beginners struggle to correctly fill character sheets


Dice roll modifiers are often misunderstood


Manual calculations lead to errors


Tools are often too complex for new players


Proposed Solution
A guided and intuitive interface to build a character sheet step-by-step


A dice roller automatically adding modifiers based on stats


A clear visual output, usable during sessions



Target Users
Beginner D&D players


Game Masters needing a simple tool


Casual players wanting quick access via browser


Application Type
Web application, responsive for desktop and mobile



Objectives (SMART Goals)
Build a complete character sheet interface
 Measurable: Includes stats, modifiers, skills, class, name
 Deadline: End of Stage 2


Integrate a functional dice rolling system
 Measurable: Supports d20, d12, d10, d8, d6, d4 with auto-modifiers
 Deadline: Within two weeks after character sheet


Create a user-friendly interface
 Measurable: No more than 4 visible primary actions per screen



Project Scope
✔ In-Scope (for the MVP)
Character sheet creation


Automatic modifier calculation


Dice roll system with integrated bonuses


Simple, responsive UI


Local storage save system


❌ Out-of-Scope
NPC generator


Combat tracker


Full spell management system


Advanced inventory features


Professional PDF export



Risks & Mitigation Strategies
Risk
Impact
Mitigation
Complexity of bonus calculations
Medium
Structure logic clearly and test each step
Solo workload
High
Break tasks into sprints and prioritize core features
UI complexity
Medium
Prototype before coding
Scope overflow
Medium
Maintain a “future features” list to avoid adding too much


3. Final Documentation Summary
MVP Summary
The project aims to develop a web application allowing users to create a D&D character sheet and perform automatic dice rolls. The interface will be simple, clear, and efficient, suitable for both beginners and experienced players.
Rationale
Feasible and high-value idea


Covers a broad range of technical skills


Easy to showcase in a portfolio


Builds on familiar tools while offering improvements


Potential Impact
Reduces calculation errors for players


Helps beginners start playing quickly


Provides a unified tool for character sheet creation and dice rolling
