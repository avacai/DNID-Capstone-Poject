// app/onboarding/quizConfig.ts

export type PetType = "Cat" | "Dog" | "Duck" | "Seal";

export type QuizOption = {
id: string;
label: string;
pet: PetType;
};

export type QuizQuestion = {
id: string;
text: string;
options: QuizOption[];
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
{
id: "weekend",
text: "What’s your ideal weekend?",
options: [
{
id: "weekend_cat",
label: "Reading or drawing alone",
pet: "Cat",
},
{
id: "weekend_dog",
label: "Hanging out with friends or going to a park",
pet: "Dog",
},
{
id: "weekend_duck",
label: "Splashing in puddles or walking near water",
pet: "Duck",
},
{
id: "weekend_seal",
label: "Curling up in bed with snacks and movies",
pet: "Seal",
},
],
},
{
id: "recharge",
text: "How do you usually recharge after a long day?",
options: [
{
id: "recharge_cat",
label: "Quiet time alone",
pet: "Cat",
},
{
id: "recharge_dog",
label: "Talking to friends or being social",
pet: "Dog",
},
{
id: "recharge_duck",
label: "Doing something fun or silly",
pet: "Duck",
},
{
id: "recharge_seal",
label: "Taking a nap or eating",
pet: "Seal",
},
],
},
{
id: "energy",
text: "Which best describes your energy level?",
options: [
{
id: "energy_cat",
label: "Calm but focused",
pet: "Cat",
},
{
id: "energy_dog",
label: "Energetic and loud",
pet: "Dog",
},
{
id: "energy_duck",
label: "Playful and restless",
pet: "Duck",
},
{
id: "energy_seal",
label: "Sleepy and chill",
pet: "Seal",
},
],
},
{
id: "awake",
text: "When do you feel most awake?",
options: [
{
id: "awake_cat",
label: "Late at night",
pet: "Cat",
},
{
id: "awake_dog",
label: "In the morning",
pet: "Dog",
},
{
id: "awake_duck",
label: "Anytime the sun’s out",
pet: "Duck",
},
{
id: "awake_seal",
label: "Whenever I get up from a nap",
pet: "Seal",
},
],
},
{
id: "activity",
text: "Pick a favorite activity:",
options: [
{
id: "activity_cat",
label: "Drawing or journaling",
pet: "Cat",
},
{
id: "activity_dog",
label: "Playing games or sports",
pet: "Dog",
},
{
id: "activity_duck",
label: "Exploring outside",
pet: "Duck",
},
{
id: "activity_seal",
label: "Eating or swimming",
pet: "Seal",
},
],
},
];