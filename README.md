# ITE Cisco Flashcards

The home screen lists seeded decks as cards, each with total cards, mastered, due, streak, and a mastery bar. Content is aimed at Nitec / Higher Nitec Infocomm students: OSI and devices, IPv4 subnetting, Cisco IOS, VLANs and STP, routing and WAN, wireless fundamentals, plus ACLs with IMDA, PDPA, fibre ONTs, and local ISPs.

## Features

- Decks with title, description, and color tag
- Cards with question (front) and answer (back)
- Spaced repetition: “Got it” schedules longer intervals; “Review again” brings the card back sooner
- Flip animation in study mode
- Per-deck stats: total cards, mastered, due, study streak, mastery progress
- CSV import (`question,answer` per line)
- Data stored in the browser **IndexedDB** database `ite-cisco-flashcards`

## Run

```bash
npm install
npm run dev
```

Open the URL Vite prints (default http://localhost:5173).

## Import format

```
What is a VLAN?,A broadcast domain on a switch
"Question, with a comma","Answer, also quoted"
```
