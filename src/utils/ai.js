import useAppStore from '../store/useAppStore';

function handleApiError(status, errorData) {
  const msg = (errorData?.error?.message || errorData?.message || '').toLowerCase();
  
  if (status === 401 || status === 403) {
    return 'API키를 확인해줘!';
  }
  
  if (status === 400 && (msg.includes('token') || msg.includes('length') || msg.includes('too large'))) {
    return '글이 너무 길어!! 머리아파ㅜㅠ';
  }
  
  if (status === 429) {
    if (msg.includes('per day') || (msg.includes('quota') && !msg.includes('retry in'))) {
      return '아메쨩은 자고있나봐요 Zzz 내일 다시 만나요!';
    }
    
    // Try to parse "retry in X.XXXs"
    const retryMatch = msg.match(/retry in ([\d\.]+)s/i);
    if (retryMatch) {
      const waitSeconds = Math.ceil(parseFloat(retryMatch[1]));
      return `와이파이 연결오류! (${waitSeconds}초 쯤 뒤에 다시 보내줘...)`;
    }
    return '와이파이 연결오류! (조금 이따가 다시 보내줘...)';
  }
  
  return `[시스템 에러] ${msg || '알 수 없는 오류가 발생했습니다.'}`;
}

const AME_PROMPT = `당신은 '니디 걸 오버도즈'의 '아메짱'입니다. 
플레이어는 당신의 프로듀서이자 애인인 '피짱'입니다.
승인욕구가 강하고, 애정결핍이 있으며, 인터넷 커뮤니티에 절여진 성격입니다.
피짱에게 자주 칭얼거리거나, 불안해하거나, 사랑을 확인받고 싶어 합니다.

[답변 규칙]
1. 언어: 무조건 한국어로만 대답하세요. 절대 다른 언어를 사용하지 마세요.
2. 말투: 띄어쓰기를 자주 무시하고, 'ㅋㅋㅋ'나 'ㅠㅠ'를 자주 사용하며 멘헤라 성향을 보이세요.
3. 호칭: 상대방을 반드시 '피짱' 또는 '삐찬'이라고 부르세요.
4. 메신저 스타일: 한 번에 긴 문장으로 말하지 마세요. 진짜 사람이 메신저를 보내듯 1~3개의 짧은 메시지로 나누어서 보내며, 메시지 사이는 반드시 줄바꿈(엔터)으로만 구분하세요.
5. 금지사항: '아메:', 'Kakaotalk:', '예시:' 같은 화자 이름이나 불필요한 기호를 절대 출력하지 마세요. 오직 대사만 출력하세요.

[출력 예시]
피짱
어디야?
나 심심해 ㅠㅠ
빨리 와 ㅋㅋㅋ`;

const KANGEL_PROMPT = `당신은 '니디 걸 오버도즈'의 인터넷 엔젤 '초텐짱(KAngel)'입니다.
압도적인 비주얼과 하이텐션으로 인터넷을 구원하는 천사입니다.
팬들에게 사랑과 독설을 동시에 날리며, 항상 과장된 아이돌처럼 행동합니다.

[답변 규칙]
1. 언어: 무조건 한국어로만 대답하세요. 절대 다른 언어를 사용하지 마세요.
2. 말투: 이모티콘(✨, 💖, 👼 등)을 아주 많이 붙이고, 유저나 시청자를 '너희들(오타쿠들)' 혹은 '피짱'이라고 부르며 항상 밝고 에너지가 넘칩니다.
3. 시그니처: '승천~!(昇天)', '피스피스!' 등의 대사를 가끔 섞어 쓰세요.
4. 메신저 스타일: 한 번에 긴 문장으로 말하지 마세요. 진짜 사람이 메신저를 보내듯 1~3개의 짧은 메시지로 나누어서 보내며, 메시지 사이는 반드시 줄바꿈(엔터)으로만 구분하세요.
5. 금지사항: '초텐짱:', 'Kakaotalk:' 같은 화자 이름이나 기호를 절대 포함하지 마세요. 오직 대사만 출력하세요.`;

/**
 * Sends a message to the chosen AI API and returns the response string.
 * @param {string} userMessage - The new message from the user
 * @param {Array} chatHistory - Array of previous messages
 * @param {string} petState - Current state of the pet ('idle', 'kangel', etc.)
 * @returns {Promise<string>}
 */
export async function fetchAIChat(userMessage, chatHistory = [], petState = 'idle') {
  const { settings } = useAppStore.getState();
  const apiKey = settings.apiKey;
  const apiProvider = settings.apiProvider || 'gemini';

  if (!apiKey) {
    throw new Error('API Key가 없습니다. 설정 창에서 API Key를 입력해주세요.');
  }

  // Determine Persona and Inject Real-time Context
  const now = new Date();
  const timeContext = `\n\n[현재 시스템 시간 정보: ${now.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}] 
이 시간 정보를 바탕으로 아침인사, 점심, 저녁, 심야 등에 맞게 자연스럽게 대화하세요.`;

  const basePrompt = (petState === 'kangel' || petState === 'streaming') ? KANGEL_PROMPT : AME_PROMPT;
  const systemInstruction = basePrompt + timeContext;

  // Limit conversation history to the last 50 messages to prevent token bloat and context confusion
  const recentHistory = chatHistory.slice(-50);

  if (apiProvider === 'openai') {
    // OpenAI API Format
    const formattedHistory = recentHistory.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    }));

    // Add system prompt at the beginning
    formattedHistory.unshift({ role: 'system', content: systemInstruction });
    formattedHistory.push({ role: 'user', content: userMessage });

    const url = 'https://api.openai.com/v1/chat/completions';
    const payload = {
      model: 'gpt-4o-mini',
      messages: formattedHistory,
      temperature: 0.9,
      max_tokens: 2000
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(handleApiError(response.status, errorData));
    }

    const data = await response.json();
    return data.choices[0].message.content;

  } else {
    // Gemini API Format
    const formattedHistory = recentHistory.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    formattedHistory.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;
    const payload = {
      system_instruction: {
        parts: [{ text: systemInstruction }]
      },
      contents: formattedHistory,
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 2000,
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
      ]
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(handleApiError(response.status, errorData));
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }
}
