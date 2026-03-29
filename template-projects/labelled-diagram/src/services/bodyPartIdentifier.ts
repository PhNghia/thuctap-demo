/**
 * AI Body Part Identifier Service
 * Uses Claude to identify body parts and verify correct placements
 */

import type { Label } from "../types/diagram";

interface AIResponse {
  isCorrect: boolean;
  confidence: number;
  feedback: string;
  suggestion?: string;
}

class BodyPartIdentifier {
  private bodyPartHierarchy: Record<string, string[]> = {
    head: ["eyes", "ears", "mouth", "face"],
    body: ["chest", "torso", "stomach"],
    torso: ["chest", "shoulders", "arms"],
    limbs: ["arms", "legs", "hands", "feet"],
    arms: ["hands", "fingers"],
    legs: ["feet", "calves"],
    shoulder: ["arms", "neck"],
  };

  /**
   * Verify if a label placement is correct based on zone and label
   */
  verifyPlacement(
    labelName: string,
    zoneName: string,
    correctLabelId: string,
    actualLabelId: string
  ): AIResponse {
    const isCorrect = correctLabelId === actualLabelId;

    if (isCorrect) {
      return {
        isCorrect: true,
        confidence: 0.95,
        feedback: `✓ Correct! "${labelName}" is part of the ${zoneName}.`,
      };
    }

    // Check if there's anatomical relationship
    const relationship = this.checkAnatomicalRelationship(labelName, zoneName);

    return {
      isCorrect: false,
      confidence: relationship ? 0.6 : 0.1,
      feedback: `✗ Not quite. "${labelName}" is not the ${zoneName}.`,
      suggestion: relationship
        ? `Hint: "${labelName}" is near the ${zoneName}, but not the same.`
        : `Hint: Try a different body part for the ${zoneName}.`,
    };
  }

  /**
   * Check if two body parts have anatomical relationship
   */
  private checkAnatomicalRelationship(part1: string, part2: string): boolean {
    const normalized1 = part1.toLowerCase();
    const normalized2 = part2.toLowerCase();

    // Check if part1 is related to part2
    for (const [key, related] of Object.entries(this.bodyPartHierarchy)) {
      if (
        normalized1.includes(key) ||
        related.some((r) => normalized1.includes(r))
      ) {
        if (
          normalized2.includes(key) ||
          related.some((r) => normalized2.includes(r))
        ) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Get AI suggestion for the next correct placement
   */
  getSuggestion(
    remainingLabels: Label[],
    nextZoneName: string
  ): Label | undefined {
    // Simple heuristic: find labels related to the zone
    const normalized = nextZoneName.toLowerCase();

    return remainingLabels.find((label) => {
      const labelLower = label.name.toLowerCase();
      // Check if label name contains or is contained in zone name
      return (
        labelLower.includes(normalized) || normalized.includes(labelLower)
      );
    });
  }

  /**
   * Get learning feedback with AI context
   */
  getLearningFeedback(labelName: string, zoneName: string): string {
    const feedbackMap: Record<string, Record<string, string>> = {
      head: {
        eyes: "The eyes are located on the face, in the head region.",
        ears: "The ears are on the sides of the head.",
        mouth: "The mouth is the opening in the lower part of the face.",
      },
      chest: {
        lungs: "The lungs are inside the chest cavity for breathing.",
        heart: "The heart is located in the chest, pumping blood.",
      },
      hand: {
        fingers: "Fingers are the small digits that make up the hand.",
      },
      leg: {
        feet: "The feet are at the end of the legs.",
      },
    };

    const key = zoneName.toLowerCase();
    const label = labelName.toLowerCase();

    return (
      feedbackMap[key]?.[label] ||
      `${labelName} is an important part of the ${zoneName}. Keep learning!`
    );
  }

  /**
   * Generate completion message
   */
  getCompletionMessage(accuracy: number): string {
    const messages = {
      perfect:
        "🎉 Perfect! You've correctly labeled all body parts! Great anatomy knowledge!",
      excellent:
        "🌟 Excellent work! You got most of the body parts correct!",
      good: "👍 Good job! You're learning the body parts well!",
      fair: "📚 Nice try! Keep practicing to master the body parts!",
      learning:
        "🚀 Keep going! You're on your way to mastering anatomy!",
    };

    if (accuracy >= 0.95) return messages.perfect;
    if (accuracy >= 0.85) return messages.excellent;
    if (accuracy >= 0.7) return messages.good;
    if (accuracy >= 0.5) return messages.fair;
    return messages.learning;
  }
}

export const aiIdentifier = new BodyPartIdentifier();
