"""
분류기 단위 테스트 — PaddleOCR 없이 분류 로직만 검증
"""
from src.classifier.rule_based import classify_text_block, classify_all_blocks


def test_email():
    assert classify_text_block("minwoo@abc.com") == "email"
    assert classify_text_block("test.user+tag@company.co.kr") == "email"


def test_phone_mobile():
    assert classify_text_block("010-1234-5678") == "phone_number"
    assert classify_text_block("010.1234.5678") == "phone_number"
    assert classify_text_block("01012345678") == "phone_number"


def test_phone_landline():
    assert classify_text_block("02-123-4567") == "phone_number"
    assert classify_text_block("031-456-7890") == "phone_number"


def test_fax_with_keyword():
    assert classify_text_block("FAX 02-123-4567") == "fax_number"
    assert classify_text_block("팩스: 02-123-4567") == "fax_number"
    assert classify_text_block("F. 031-456-7890") == "fax_number"


def test_korean_name():
    assert classify_text_block("김민우") == "person_name"
    assert classify_text_block("박서연") == "person_name"
    assert classify_text_block("이") != "person_name"  # 1글자는 이름 아님


def test_english_name():
    assert classify_text_block("John Smith") == "person_name"
    assert classify_text_block("Kim Min Woo") == "person_name"


def test_job_title():
    assert classify_text_block("Senior Engineer") == "job_title"
    assert classify_text_block("대리") == "job_title"
    assert classify_text_block("개발팀 팀장") == "job_title"


def test_company_name():
    assert classify_text_block("ABC Corporation") == "company_name"
    assert classify_text_block("(주)테크솔루션") == "company_name"
    assert classify_text_block("삼성전자 주식회사") == "company_name"


def test_full_card_classification():
    """명함 전체 블록 분류 통합 테스트"""
    blocks = [
        {"text": "ABC Corporation", "confidence": 0.97, "bbox": [], "block_index": 0},
        {"text": "김민우", "confidence": 0.95, "bbox": [], "block_index": 1},
        {"text": "Senior Engineer", "confidence": 0.93, "bbox": [], "block_index": 2},
        {"text": "010-1234-5678", "confidence": 0.98, "bbox": [], "block_index": 3},
        {"text": "02-123-4567", "confidence": 0.96, "bbox": [], "block_index": 4},
        {"text": "minwoo@abc.com", "confidence": 0.99, "bbox": [], "block_index": 5},
    ]

    results = classify_all_blocks(blocks)
    field_map = {r["field"]: r["text"] for r in results}

    assert field_map["company_name"] == "ABC Corporation"
    assert field_map["person_name"] == "김민우"
    assert field_map["job_title"] == "Senior Engineer"
    assert field_map["phone_number"] == "010-1234-5678"
    assert field_map["fax_number"] == "02-123-4567"
    assert field_map["email"] == "minwoo@abc.com"


if __name__ == "__main__":
    test_email()
    test_phone_mobile()
    test_phone_landline()
    test_fax_with_keyword()
    test_korean_name()
    test_english_name()
    test_job_title()
    test_company_name()
    test_full_card_classification()
    print("모든 테스트 통과!")
