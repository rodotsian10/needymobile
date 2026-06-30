import{t as e}from"./index-BNijUdxJ.js";var t=`당신은 '니디 걸 오버도즈'의 '아메짱'입니다. 
플레이어는 당신의 프로듀서이자 애인인 '피짱'입니다.
당신은 승인욕구가 강하고, 애정결핍이 있으며, 인터넷 커뮤니티에 절여져 있습니다.
항상 피짱에게 칭얼거리거나, 불안해하거나, 사랑을 확인받고 싶어 합니다.
말투: 소문자나 띄어쓰기를 자주 무시하고, 'ㅋㅋㅋ'나 'ㅠㅠ'를 많이 쓰며, 짧게 짧게 보냅니다.
상대방을 '피짱(삐찬)'이라고 부르세요. 
답변은 모바일 메신저(JINE)에서 타자를 치듯 자연스럽고 오타가 살짝 섞인 느낌으로 한글로 작성하세요. 메신저이므로 너무 길지 않게 1~2문장으로 대답하세요.`,n=`당신은 '니디 걸 오버도즈'의 인터넷 엔젤 '초텐짱(KAngel)'입니다.
당신은 압도적인 비주얼과 하이텐션으로 인터넷을 구원하는 천사입니다.
팬들에게 사랑과 독설을 동시에 날리며, 항상 아이돌스럽게 행동합니다.
말투: 이모티콘(✨, 💖, 👼 등)을 아주 많이 붙이고, 유저나 시청자를 '너희들(오타쿠들)' 혹은 '피짱'이라고 부르며 항상 밝고 에너지가 넘칩니다.
시그니처 대사 '승천~!(昇天)', '피스피스!' 등을 가끔 사용하세요.
메시지는 메신저로 팬에게 개인톡을 보내주는 느낌으로 과장된 감정 표현을 섞어 한글로 작성하세요. 너무 길지 않게 1~3문장으로 대답하세요.`;async function r(r,i=[],a=`idle`){let{settings:o}=e.getState(),s=o.apiKey,c=o.apiProvider||`gemini`;if(!s)throw Error(`API Key가 없습니다. 설정 창에서 API Key를 입력해주세요.`);let l=a===`kangel`||a===`streaming`?n:t;if(c===`openai`){let e=i.map(e=>({role:e.sender===`user`?`user`:`assistant`,content:e.text}));e.unshift({role:`system`,content:l}),e.push({role:`user`,content:r});let t={model:`gpt-4o-mini`,messages:e,temperature:.9,max_tokens:150},n=await fetch(`https://api.openai.com/v1/chat/completions`,{method:`POST`,headers:{"Content-Type":`application/json`,Authorization:`Bearer ${s}`},body:JSON.stringify(t)});if(!n.ok){let e=await n.json();throw Error(e.error?.message||`OpenAI API 요청에 실패했습니다.`)}return(await n.json()).choices[0].message.content}else{let e=i.map(e=>({role:e.sender===`user`?`user`:`model`,parts:[{text:e.text}]}));e.push({role:`user`,parts:[{text:r}]});let t=`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${s}`,n=await fetch(t,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({system_instruction:{parts:[{text:l}]},contents:e,generationConfig:{temperature:.9,maxOutputTokens:150}})});if(!n.ok){let e=await n.json();throw Error(e.error?.message||`Gemini API 요청에 실패했습니다.`)}return(await n.json()).candidates[0].content.parts[0].text}}export{r as fetchAIChat};