document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('questionForm');
    const input = document.getElementById('questionInput');
    const submitBtn = document.getElementById('submitBtn');
    const chatContainer = document.getElementById('chatContainer');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const question = input.value.trim();
        if (!question) return;

        // 사용자 메시지 추가
        addMessage(question, 'user');
        input.value = '';
        input.disabled = true;
        submitBtn.disabled = true;

        // 로딩 표시
        const loadingId = addLoading();

        try {
            const response = await fetch('/api/query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: question
                })
            });

            const data = await response.json();

            // 로딩 제거
            removeLoading(loadingId);

            if (response.ok) {
                // 💡 AI 응답을 추가할 때 타이핑 모드로 호출
                addMessage(data.response, 'bot', true);
            } else {
                addMessage(`오류: ${data.error || '알 수 없는 오류가 발생했습니다.'}`, 'bot', false);
            }
        } catch (error) {
            removeLoading(loadingId);
            addMessage(`네트워크 오류: ${error.message}`, 'bot', false);
        } finally {
            // 💡 타이핑 중일 때 전송 버튼이 성급하게 활성화되는 것을 방지하기 위해,
            // 봇 답변일 때는 타이핑 함수 완료 시점에 활성화되도록 처리했습니다.
        }
    });

    // 💡 세 번째 인자isTyping을 추가하여 봇의 정상 답변에만 타이핑 효과를 선택 적용합니다.
    function addMessage(text, sender, isTyping = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        messageDiv.appendChild(contentDiv);
        chatContainer.appendChild(messageDiv);

        if (sender === 'bot' && isTyping) {
            let currentIndex = 0;
            const typingSpeed = 25; // 💡 글자당 출력 속도 (25ms = 0.025초). 숫자가 작을수록 빨라집니다.

            // 한 글자씩 증가시키며 화면을 갱신하는 타이머 시작
            const typingInterval = setInterval(() => {
                if (currentIndex <= text.length) {
                    const currentText = text.substring(0, currentIndex);
                    
                    // 마크다운 파싱 처리 (한 글자씩 증가할 때마다 완벽히 렌더링되도록 변환)
                    if (typeof marked !== 'undefined') {
                        contentDiv.innerHTML = marked.parse(currentText);
                    } else {
                        contentDiv.textContent = currentText;
                    }
                    
                    currentIndex++;
                    chatContainer.scrollTop = chatContainer.scrollHeight; // 글자가 늘어날 때마다 자동 스크롤 하단 이동
                } else {
                    // 타이핑이 모두 완료되면 타이머를 종료하고 입력창 잠금을 해제합니다.
                    clearInterval(typingInterval);
                    enableInputControls();
                }
            }, typingSpeed);

        } else {
            // 유저 메시지나 에러 메시지는 한 번에 출력
            if (sender === 'bot' && typeof marked !== 'undefined') {
                contentDiv.innerHTML = marked.parse(text);
            } else {
                contentDiv.textContent = text;
            }
            chatContainer.scrollTop = chatContainer.scrollHeight;
            enableInputControls();
        }
    }

    // 💡 입력창과 버튼을 다시 활성화해주는 공통 함수
    function enableInputControls() {
        input.disabled = false;
        submitBtn.disabled = false;
        input.focus();
    }

    function addLoading() {
        const loadingId = 'loading-' + Date.now();
        const loadingDiv = document.createElement('div');
        loadingDiv.id = loadingId;
        loadingDiv.className = 'message bot';
        loadingDiv.innerHTML = '<div class="message-content"><em>응답 중...</em></div>';
        chatContainer.appendChild(loadingDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        return loadingId;
    }

    function removeLoading(loadingId) {
        const loadingDiv = document.getElementById(loadingId);
        if (loadingDiv) {
            loadingDiv.remove();
        }
    }
});
