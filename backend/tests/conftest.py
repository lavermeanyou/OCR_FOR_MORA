"""
pytest 설정: backend/ 를 sys.path 에 추가하여 모든 테스트에서 import 가능하게 함
"""
import sys
from pathlib import Path

# backend/ 디렉토리를 path에 추가
BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))
