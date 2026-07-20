import os
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
import requests

load_dotenv()

app = Flask(__name__, template_folder='templates', static_folder='static')

# AI_SERVICE_URL 기본값 설정
AI_SERVICE_URL = os.getenv("AI_SERVICE_URL", "https://api.abclab.ktds.com/v1")
AI_SERVICE_API_KEY = os.getenv("AI_SERVICE_API_KEY")

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/query", methods=["POST"])
def query():
    data = request.json
    user_input = data.get("query", "")
    
    if not user_input:
        return jsonify({"error": "질문을 입력해주세요."}), 400
    
    try:
        # 디버깅용 프린트문 추가 (실행 후 터미널 콘솔 확인)
        print(f"[DEBUG] 사용 중인 API KEY: {AI_SERVICE_API_KEY}")
        print(f"[DEBUG] 생성된 헤더: Bearer {AI_SERVICE_API_KEY}")

        # 요청 헤더 설정
        headers = {
            "Authorization": f"Bearer {AI_SERVICE_API_KEY}",
            "Content-Type": "application/json",
            "User-Agent": "OTD_Work_Agent/1.0"
        }
        
        # 요청 페이로드 설정
        payload = {
            "inputs": {},
            "query": user_input,
            "response_mode": "blocking",
            "conversation_id": "",
            "user": "test1234",
            "files": []
        }
        
        # chat-messages 엔드포인트로 POST 요청
        chat_messages_url = "https://api.abclab.ktds.com/v1/chat-messages"
        response = requests.post(chat_messages_url, json=payload, headers=headers, timeout=30)
        response.raise_for_status()

        # [디버그 추가] 서버가 보내온 실제 원본 텍스트를 콘솔에 출력
        print(f"[DEBUG] API 서버 응답 원본: {response.text}")
        
        result = response.json()
        return jsonify({"response": result.get("answer", "응답을 받을 수 없습니다.")})
        
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"AI 서비스 호출 중 오류가 발생했습니다: {str(e)}"}), 500

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy"})

if __name__ == "__main__":
        # 서버 기동 시 환경 변수가 잘 로드되었는지 즉시 콘솔에 출력
    print("\n" + "="*50)
    print(f"[서버 시작 디버그] 로드된 API KEY: '{AI_SERVICE_API_KEY}'")
    print(f"[서버 시작 디버그] 키 타입: {type(AI_SERVICE_API_KEY)}")
    print("="*50 + "\n")
    
    app.run(host="0.0.0.0", port=5000, debug=True)
