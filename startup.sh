#!/bin/bash
# 소스 코드가 압축 해제된 실제 임시 폴더 경로로 이동
cd /tmp/8dee* 2>/dev/null || cd /home/site/wwwroot

# Gunicorn 실행
gunicorn --bind=0.0.0.0 --timeout 600 app:app
