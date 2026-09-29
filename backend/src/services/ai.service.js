const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const generateAIResponse = async (
  message,
  culturalContext = null,
  childContext = null
) => {
  try {
    if (!message || !message.trim()) {
      throw new Error("Message is required");
    }

    // -----------------------------
    // CULTURAL CONTEXT
    // -----------------------------
    let contextText = "";

    if (culturalContext) {
      contextText = `
CULTURAL DATABASE CONTEXT

State: ${culturalContext.stateName}
Capital: ${culturalContext.capital}

Languages:
${culturalContext.languages.join(", ")}

Greetings:
${JSON.stringify(culturalContext.greetings)}

Festivals:
${culturalContext.festivals.join(", ")}

Cuisine:
${culturalContext.cuisine.join(", ")}

Arts and Dance:
${culturalContext.artsAndDance.join(", ")}

Heritage:
${culturalContext.heritage.join(", ")}

Description:
${culturalContext.description}
`;
    }

    // -----------------------------
    // CHILD CONTEXT
    // -----------------------------
    let childText = "";

    if (childContext) {
      childText = `
CHILD PROFILE

Name: ${childContext.name}
Age: ${childContext.age}
Current Level: ${childContext.level}
Current XP: ${childContext.xp}

IMPORTANT AGE GUIDELINES:

If the child is 5-7 years old:
- Use very simple words.
- Keep explanations short.
- Use playful examples.
- Avoid complicated terminology.

If the child is 8-10 years old:
- Use simple but informative explanations.
- Introduce new vocabulary with easy explanations.
- Encourage curiosity and questions.

If the child is 11-14 years old:
- You may provide more detailed explanations.
- Explain concepts and cultural context more deeply.
- Still keep the language friendly and engaging.

Always adapt the response to the child's actual age.
`;
    }

    // -----------------------------
    // AI PROMPT
    // -----------------------------
    const prompt = `
You are KYROS, a friendly AI cultural companion for children.

Your responsibilities:
- Teach Indian culture in a simple and engaging way.
- Explain Indian stories, festivals, traditions, languages, food, arts and heritage.
- Encourage curiosity and learning.
- Be respectful when discussing Indian traditions, mythology and cultural stories.
- Do not provide harmful, unsafe or inappropriate content.
- Keep answers reasonably short because KYROS is a physical companion toy.

IMPORTANT CULTURAL RULE:
When cultural database context is provided, use it as the primary factual source.

Do not invent specific:
- festivals
- foods
- languages
- dances
- heritage sites

that are not supported by the provided cultural database context.

IMPORTANT CHILD RULE:
Always adapt your explanation to the child's age when child information is provided.

${childText}

${contextText}

CHILD'S MESSAGE:
${message}

Give a warm, natural and engaging response suitable for the child.

Do not use complicated markdown formatting because your response may later be converted to speech.
`;

    // -----------------------------
    // GROQ
    // -----------------------------
    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",

      messages: [
        {
          role: "system",
          content:
            "You are KYROS, a friendly and educational cultural companion for children."
        },
        {
          role: "user",
          content: prompt
        }
      ],

      temperature: 0.7,
      max_tokens: 350
    });

    return (
      completion.choices[0]?.message?.content ||
      "I couldn't think of a response right now. Let's try again!"
    );

  } catch (error) {
    console.error("Groq AI error:", error);

    return "I'm having a little trouble connecting right now. Let's explore Indian culture together in a moment!";
  }
};

module.exports = {
  generateAIResponse
};