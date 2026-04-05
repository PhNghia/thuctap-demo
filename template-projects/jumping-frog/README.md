# Froggy Jumps

An educational quiz game built with React and Vite where a frog jumps to the correct lilypad containing the right answer. The frog starts on the ground in front of 4 lilypads and performs a jumping animation when the correct answer is selected.

## Features

- Interactive quiz-based gameplay with 4 lilypads per question
- Frog positioned in front of the lilypads on starting ground
- Smooth jumping animation with arc motion to correct lilypad
- Multiple choice questions with visual feedback
- Score tracking and high score persistence
- Canvas-based animation
- Educational content (customizable questions)

## How to Play

- Read the question displayed above the canvas
- Frog starts on the green ground in front of 4 lilypads
- Click on one of the 4 lilypads containing the answer options
- If correct: Lilypad turns green, frog performs jumping animation to it, score increases, next question loads
- If wrong: Lilypad turns red, try again
- Complete all questions to reach the shore and win!

## Questions

The game includes sample questions about general knowledge. In a real educational setting, questions can be customized for any subject.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

## Build for Production

```bash
npm run build
```

## Technologies Used

- React
- Vite
- HTML5 Canvas
- localStorage for data persistence
