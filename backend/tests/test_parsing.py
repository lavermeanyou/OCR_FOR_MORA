"""
ParsingSkill JSON 검증 테스트
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.skills.parsing_skill import ParsingSkill


def make_block(text, confidence=0.95, block_index=0):
    return {
        "text": text,
        "confidence": confidence,
        "bbox": [],
        "block_index": block_index,
    }


def test_parsing_full_card():
    """전체 명함 데이터 파싱."""
    skill = ParsingSkill()
    blocks = [
        make_block("(주)모라테크", block_index=0),
        make_block("김민수", block_index=1),
        make_block("개발팀장", block_index=2),
        make_block("010-1234-5678", block_index=3),
        make_block("minsu@mora.co.kr", block_index=4),
    ]
    result = skill.execute(blocks)

    assert "parsed" in result
    parsed = result["parsed"]
    assert parsed.get("company") == "(주)모라테크"
    assert parsed.get("name") == "김민수"
    assert parsed.get("position") == "개발팀장"
    assert parsed.get("phone") == "010-1234-5678"
    assert parsed.get("email") == "minsu@mora.co.kr"


def test_parsing_empty():
    """빈 입력."""
    skill = ParsingSkill()
    result = skill.execute([])
    assert result["parsed"] == {}
    assert result["classified_blocks"] == []


def test_parsing_email_only():
    """이메일만 있는 경우."""
    skill = ParsingSkill()
    result = skill.execute([make_block("test@example.com")])
    assert result["parsed"].get("email") == "test@example.com"


def test_parsing_result_json_structure():
    """결과 JSON 구조 검증."""
    skill = ParsingSkill()
    blocks = [make_block("홍길동"), make_block("010-9999-8888")]
    result = skill.execute(blocks)

    assert isinstance(result, dict)
    assert "classified_blocks" in result
    assert "parsed" in result
    assert isinstance(result["classified_blocks"], list)
    assert isinstance(result["parsed"], dict)

    # 각 classified block 구조 검증
    for block in result["classified_blocks"]:
        assert "text" in block
        assert "confidence" in block
        assert "field" in block
