export type Sentence = {
  hindi: string;
  english: string;
};

export type Lesson = {
  id: string;
  title: string;
  youtubeUrl?: string;
  sentences: Sentence[];
};

export const lessons: Lesson[] = [
  {
    id: "lesson-1",
    title: "Lesson 1 — Daily Life",
    youtubeUrl: "https://youtube.com/@yourchannel",
    sentences: [
      { hindi: "मैं स्कूल जाता हूँ", english: "I go to school" },
      { hindi: "वह खाना खा रही है", english: "She is eating food" },
      { hindi: "मुझे पानी चाहिए", english: "I need water" },
      { hindi: "आज मौसम अच्छा है", english: "The weather is good today" },
      { hindi: "मेरा नाम राहुल है", english: "My name is Rahul" },
      { hindi: "तुम कहाँ रहते हो", english: "Where do you live" },
      { hindi: "मैं काम पर जा रहा हूँ", english: "I am going to work" },
      { hindi: "यह मेरा घर है", english: "This is my house" },
      { hindi: "मुझे भूख लगी है", english: "I am hungry" },
      { hindi: "वह बहुत अच्छा है", english: "He is very good" },
    ],
  },
  {
    id: "lesson-2",
    title: "Lesson 2 — Greetings",
    youtubeUrl: "https://youtube.com/@yourchannel",
    sentences: [
      { hindi: "नमस्ते", english: "Hello" },
      { hindi: "आप कैसे हैं", english: "How are you" },
      { hindi: "मिलकर खुशी हुई", english: "Nice to meet you" },
      { hindi: "शुभ प्रभात", english: "Good morning" },
      { hindi: "शुभ रात्रि", english: "Good night" },
      { hindi: "अलविदा", english: "Goodbye" },
      { hindi: "धन्यवाद", english: "Thank you" },
      { hindi: "माफ़ कीजिए", english: "I am sorry" },
      { hindi: "कृपया", english: "Please" },
      { hindi: "स्वागत है", english: "You are welcome" },
    ],
  },
  {
    id: "lesson-3",
    title: "Lesson 3 — Family",
    youtubeUrl: "https://youtube.com/@yourchannel",
    sentences: [
      { hindi: "मेरी माँ बहुत अच्छी हैं", english: "My mother is very good" },
      { hindi: "मेरे पिताजी डॉक्टर हैं", english: "My father is a doctor" },
      { hindi: "मेरा एक भाई है", english: "I have one brother" },
      { hindi: "मेरी बहन स्कूल जाती है", english: "My sister goes to school" },
      { hindi: "हम साथ रहते हैं", english: "We live together" },
      { hindi: "मेरा परिवार बड़ा है", english: "My family is big" },
      { hindi: "दादाजी घर पर हैं", english: "Grandfather is at home" },
      { hindi: "बच्चे खेल रहे हैं", english: "The children are playing" },
      { hindi: "हम खाना साथ खाते हैं", english: "We eat food together" },
      { hindi: "परिवार सबसे जरूरी है", english: "Family is the most important" },
    ],
  },
];