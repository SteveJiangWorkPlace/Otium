"""
Tests for the Resend-backed email service.
"""

from unittest.mock import patch

from services.email_service import EmailService


def test_send_email_returns_false_without_resend_api_key():
    service = EmailService()
    service.resend_api_key = ""

    assert service._send_email_via_resend(
        "user@example.com",
        "Test subject",
        "<p>Hello</p>",
        "Hello",
    ) is False


def test_send_email_returns_false_without_resend_from():
    service = EmailService()
    service.resend_api_key = "re_test_key"
    service.resend_from = ""

    assert service._send_email_via_resend(
        "user@example.com",
        "Test subject",
        "<p>Hello</p>",
        "Hello",
    ) is False


def test_send_email_via_resend_uses_configured_sender():
    service = EmailService()
    service.resend_api_key = "re_test_key"
    service.resend_from = "noreply@example.com"

    with patch("services.email_service.resend.Emails.send", return_value={"id": "email_123"}) as send:
        assert service._send_email_via_resend(
            "user@example.com",
            "Test subject",
            "<p>Hello</p>",
            "Hello",
        ) is True

    send.assert_called_once_with(
        {
            "from": "noreply@example.com",
            "to": "user@example.com",
            "subject": "Test subject",
            "html": "<p>Hello</p>",
            "text": "Hello",
        }
    )
