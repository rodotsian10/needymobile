import useAppStore from '../store/useAppStore';

const AME_PROMPT = `당신은 '니디 걸 오버도즈'의 '아메짱'입니다. 
플레이어는 당신의 프로듀서이자 애인인 '피짱'입니다.
당신은 승인욕구가 강하고, 애정결핍이 있으며, 인터넷 커뮤니티에 절여져 있습니다.
항상 피짱에게 칭얼거리거나, 불안해하거나, 사랑을 확인받고 싶어 합니다.
말투: 소문자나 띄어쓰기를 자주 무시하고, 'ㅋㅋㅋ'나 'ㅠㅠ'를 많이 쓰며, 짧게 짧게 보냅니다.
상대방을 '피짱(삐찬)'이라고 부르세요. 
답변은 모바일 메신저(JINE)에서 타자를 치듯 자연스럽고 오타가 살짝 섞인 느낌으로 한글로 작성하세요. 메신저이므로 너무 길지 않게 1~2문장으로 대답하세요.`;

const KANGEL_PROMPT = `당신은 '니디 걸 오버도즈'의 인터넷 엔젤 '초텐짱(KAngel)'입니다.
당신은 압도적인 비주얼과 하이텐션으로 인터넷을 구원하는 천사입니다.
팬들에게 사랑과 독설을 동시에 날리며, 항상 아이돌스럽게 행동합니다.
말투: 이모티콘(✨, 💖, 👼 등)을 아주 많이 붙이고, 유저나 시청자를 '너희들(오타쿠들)' 혹은 '피짱'이라고 부르며 항상 밝고 에너지가 넘칩니다.
시그니처 대사 '승천~!(昇天)', '피스피스!' 등을 가끔 사용하세요.
메시지는 메신저로 팬에게 개인톡을 보내주는 느낌으로 과장된 감정 표현을 섞어 한글로 작성하세요. 너무 길지 않게 1~3문장으로 대답하세요.`;

/**
 * Sends a message to the Gemini API and returns the response string.
 * @param {string} userMessage - The new message from the user
 * @param {Array} chatHistory - Array of previous messages { role: 'user'|'model', parts: [{ text: '...' }] }
 * @param {string} petState - Current state of the pet ('idle', 'kangel', etc.)
 * @returns {Promise<string>}
 */
export async function fetchGeminiChat(userMessage, chatHistory = [], petState = 'idle') {
  const { settings } = useAppStore.getState();
  const apiKey = settings.apiKey;

  if (!apiKey) {
    throw new Error('API Key가 없습니다. 설정 창에서 API Key를 입력해주세요.');
  }

  // Determine Persona
  const systemInstruction = (petState === 'kangel' || petState === 'streaming') ? KANGEL_PROMPT : AME_PROMPT;

  // Format history for Gemini API
  // Gemini expects: { role: "user" | "model", parts: [{ text: "..." }] }
  const formattedHistory = chatHistory.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }]
  }));

  formattedHistory.push({
    role: 'user',
    parts: [{ text: userMessage }]
  });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const payload = {
    system_instruction: {
      parts: [{ text: systemInstruction }]
    },
    contents: formattedHistory,
    generationConfig: {
      temperature: 0.9,
      maxOutputTokens: 150, // Keep responses short like a messenger
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API Error:', errorData);
      throw new Error(errorData.error?.message || 'API 요청에 실패했습니다.');
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('AI Request failed:', error);
    throw error;
  }
}
