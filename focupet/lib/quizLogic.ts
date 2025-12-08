// app/onboarding/quizLogic.ts
import type { PetType, QuizOption } from "./quizConfig";

export function determinePetFromAnswers(
  selectedOptions: QuizOption[]
): PetType {
  const scores: Record<PetType, number> = {
    Cat: 0,
    Dog: 0,
    Duck: 0,
    Seal: 0,
  };

  selectedOptions.forEach((opt) => {
    scores[opt.pet] += 1;
  });

  const entries = Object.entries(scores) as [PetType, number][];

  let bestPet: PetType = "Cat";
  let bestScore = -1;
  let ties: PetType[] = [];

  for (const [pet, score] of entries) {
    if (score > bestScore) {
      bestScore = score;
      bestPet = pet;
      ties = [pet];
    } else if (score === bestScore) {
      ties.push(pet);
    }
  }

  if (ties.length > 1) {
    const idx = Math.floor(Math.random() * ties.length);
    return ties[idx];
  }

  return bestPet;
}