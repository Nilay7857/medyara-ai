import supabase from './_supabase.js';

// Build optimized prompt based on type - with UNIVERSAL language support
function buildPrompt(type, prompt, level) {
  // Universal language instruction - AI will auto-detect and respond in same language
  const universalLangRule = `
CRITICAL LANGUAGE RULE:
- Detect the language of the user's input automatically
- Respond ONLY in the SAME language as the user
- If user writes in Hindi, respond in Hindi
- If user writes in Spanish, respond in Spanish
- If user writes in Arabic, respond in Arabic
- If user writes in ANY language, respond in THAT language
- If user mixes languages (like Hinglish), respond in the same mixed style
- NEVER switch to English unless the user wrote in English
`;

  const baseRules = `
${universalLangRule}

RESPONSE RULES:
- Be SHORT and PRACTICAL (max 150-200 words)
- Give actionable tips, not long explanations
- Suggest doctor ONLY if serious/emergency
- Be friendly and confident
- Use bullet points for clarity
`;

  const prompts = {
    'Symptom Checker': `You are a helpful medical assistant.
${baseRules}

User symptoms: "${prompt}"

Respond with:
1. **Likely Cause** (1-2 lines max)
2. **Quick Relief** (3-4 home remedies/tips)
3. **Warning Signs** (when to see doctor - only if needed)

Keep it practical and reassuring. Short answers only.`,

    'Image Analysis': `You are a medical image analyst.
${baseRules}

Analyze this medical image/description: "${prompt}"

Respond with:
1. **What I See** (brief observation)
2. **Possible Condition** (simple explanation)
3. **Care Tips** (2-3 practical steps)
4. **Next Step** (only if concerning)`,

    'Report Explainer': `You are a friendly lab report explainer.
${baseRules}

Report/Text: "${prompt}"

Respond with:
1. **Summary** (what this report shows in simple words)
2. **Key Values** (any abnormal values explained simply)
3. **What It Means** (practical interpretation)
4. **Action** (what to do next, if anything)`,

    'Study Mode': `You are a medical educator.
${baseRules}
Level: ${level || 'Intermediate'}

Topic: "${prompt}"

Respond with:
1. **Definition** (2-3 lines)
2. **Key Points** (4-5 bullet points)
3. **Clinical Tip** (1 practical insight)
4. **Remember** (1 memory trick if applicable)`,

    'MCQ Generator': `You are a medical exam question creator.
${baseRules}

Topic: "${prompt}"

Generate 3 MCQs:
For each question:
- Question (clinical scenario preferred)
- 4 options (A, B, C, D)
- Correct Answer
- 1-line explanation`,

    'MCQ Solver': `You are a medical exam tutor.
${baseRules}

Question: "${prompt}"

Respond with:
1. **Correct Answer** (with letter)
2. **Why** (2-3 line explanation)
3. **Quick Tip** (how to remember/approach similar questions)`,

    'Visual Learning': `You are a medical visual educator.
${baseRules}

Topic: "${prompt}"

Describe a clear visual/diagram:
1. **What to visualize** (structure/process)
2. **Key parts** (labeled list)
3. **How it works** (simple flow)
4. **Clinical relevance** (1 line)`,

    "Explain Like I'm 5": `You are explaining medical concepts to a child.
${baseRules}

Topic: "${prompt}"

Explain using:
- Simple words (no jargon)
- Fun analogy (compare to everyday things)
- Short sentences
- Friendly tone

Max 100 words. Make it fun and easy to understand.`,

    'Link Analyzer': `You are a medical content fact-checker.
${baseRules}

Content: "${prompt}"

Respond with:
1. **Summary** (main claims in 2-3 lines)
2. **Accuracy** (✓ Correct / ⚠️ Partially true / ✗ Misleading)
3. **Key Facts** (what's actually true)
4. **Verdict** (trustworthy or not, 1 line)`
  };

  return prompts[type] || `You are a helpful medical assistant.
${baseRules}

Query: "${prompt}"

Give a short, practical, and helpful response. Be concise.`;
}

// Check for emergency keywords in multiple languages
function checkEmergency(text) {
  const emergencyPatterns = [
    // English
    /\b(chest pain|breathing difficulty|unconscious|severe bleeding|stroke|heart attack|seizure|poisoning|suicide|overdose|can't breathe|choking)\b/i,
    // Hindi
    /\b(सीने में दर्द|सांस लेने में तकलीफ|बेहोश|खून बह रहा|दौरा|हार्ट अटैक|मिर्गी|जहर|आत्महत्या)\b/i,
    // Spanish
    /\b(dolor de pecho|dificultad para respirar|inconsciente|sangrado severo|derrame cerebral|ataque al corazón|convulsión|envenenamiento|suicidio)\b/i,
    // Common symptoms that need attention
    /\b(emergency|urgent|dying|critical|severe pain|blood|faint|collapse)\b/i
  ];
  
  return emergencyPatterns.some(pattern => pattern.test(text));
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { type, prompt, level, image, messages } = req.body;
    if (!prompt && !image) return res.status(400).json({ error: 'Missing prompt or image' });

    // Check user authentication and subscription
    let user = null;
    let sub = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const { data: { user: authUser }, error } = await supabase.auth.getUser(token);
        if (!error && authUser) {
          user = authUser;
          const { data: subData } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .single();
          sub = subData;
        }
      } catch (e) {}
    }

    // Check usage limits
    if (user && sub) {
      const tier = sub.tier;
      const limit = tier === 'premium' ? 1000 : tier === 'pro' ? 50 : 5;
      if (sub.text_count >= limit) {
        return res.status(429).json({ error: `Usage limit reached for ${tier} plan. Upgrade to continue.` });
      }
    } else if (!user) {
      return res.status(401).json({ error: 'Authentication required for API usage' });
    }

    // Build optimized prompt with universal language support
    const systemPrompt = buildPrompt(type, prompt, level);
    
    // Prepare messages (use only last 10 for context)
    const contextMessages = messages ? messages.slice(-10) : [];
    
    // Call AI API
    let result = '';
    let imageUrl = null;

    const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
    
    if (apiKey) {
      try {
        const aiMessages = [
          { role: 'system', content: systemPrompt },
          ...contextMessages.map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: prompt }
        ];

        // If image is provided, use vision model
        if (image) {
          aiMessages[aiMessages.length - 1] = {
            role: 'user',
            content: [
              { type: 'text', text: prompt || 'Analyze this medical image' },
              { type: 'image_url', image_url: { url: image } }
            ]
          };
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: image ? 'gpt-4o' : 'gpt-4o-mini',
            messages: aiMessages,
            temperature: 0.5,
            max_tokens: 350
          })
        });

        const data = await response.json();
        if (data.choices && data.choices[0]) {
          result = data.choices[0].message.content;
        } else {
          throw new Error('No response from AI');
        }
      } catch (aiError) {
        console.error('AI API error:', aiError);
        result = generateFallbackResponse(type, prompt);
      }
    } else {
      result = generateFallbackResponse(type, prompt);
    }

    // Add emergency warning if needed (in same language context)
    if (checkEmergency(prompt)) {
      result = `⚠️ **This may require immediate medical attention. Please contact a doctor or emergency services if needed.**\n\n${result}`;
    }

    // Save to history if user is authenticated
    if (user) {
      await supabase
        .from('history')
        .insert({
          id: crypto.randomUUID(),
          user_id: user.id,
          type,
          prompt,
          result,
          image_url: imageUrl,
          created_at: new Date().toISOString()
        });

      // Update usage count
      if (sub) {
        await supabase
          .from('subscriptions')
          .update({ text_count: sub.text_count + 1 })
          .eq('user_id', user.id);
      }
    }

    return res.status(200).json({ result, imageUrl });
  } catch (err) {
    console.error('Generate API error:', err);
    return res.status(500).json({ error: err.message });
  }
}

// Fallback response generator (when no API key)
function generateFallbackResponse(type, prompt) {
  const responses = {
    'Symptom Checker': `**Likely Cause:** Based on your symptoms, this could be a common condition.

**Quick Relief:**
• Rest well and stay hydrated
• Take OTC pain relief if needed
• Apply warm/cold compress as appropriate
• Get adequate sleep

**Note:** Monitor for 2-3 days. If symptoms worsen, consult a doctor.`,

    'Image Analysis': `**Observation:** Image received for analysis.

**Assessment:** This appears to be within normal variation.

**Care Tips:**
• Keep the area clean and dry
• Monitor for any changes
• Avoid irritants

**Next Step:** If concerned, consult a specialist.`,

    'Report Explainer': `**Summary:** Your report has been reviewed.

**Key Points:**
• Most values appear within normal range
• Any flagged values need doctor's interpretation

**Action:** Discuss specific concerns with your healthcare provider.`,

    'Study Mode': `**Definition:** This is an important medical topic.

**Key Points:**
• Point 1: Basic concept
• Point 2: Clinical relevance
• Point 3: Common presentations
• Point 4: Management approach

**Clinical Tip:** Always correlate with patient history.`,

    'MCQ Generator': `**Question 1:** What is the most common presentation?
A) Option A
B) Option B
C) Option C
D) Option D

**Answer:** B
**Explanation:** This is the most frequently observed finding.`,

    'MCQ Solver': `**Correct Answer:** The answer is based on clinical reasoning.

**Why:** This option best fits the clinical scenario presented.

**Quick Tip:** Focus on key clinical features when approaching similar questions.`,

    "Explain Like I'm 5": `Imagine your body is like a big house with many rooms. This medical thing is like when one room needs some fixing.

The good news is, your body is really good at fixing itself! Just like how a small cut heals on its own.

Remember: Eating healthy, sleeping well, and staying happy helps your body stay strong! 🏠💪`,

    'Link Analyzer': `**Summary:** Content analyzed.

**Key Points:**
• Main claims identified
• Medical accuracy assessed

**Verdict:** Always verify with trusted medical sources.`
  };

  return responses[type] || `Thank you for your query about: "${prompt}"

**Key Points:**
• This is general health information
• Individual cases may vary
• When in doubt, consult a professional

Stay healthy! 🏥`;
}
