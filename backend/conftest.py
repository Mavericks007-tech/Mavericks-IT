"""Top-level pytest fixtures for the whole backend test suite."""
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def admin_user(db):
    return User.objects.create_superuser(
        username='pytestadmin',
        email='pytestadmin@example.com',
        password='secret-123',
    )


@pytest.fixture
def auth_client(api_client, admin_user):
    api_client.force_authenticate(admin_user)
    return api_client


@pytest.fixture
def staff_user(db):
    return User.objects.create_user(
        username='pyteststaff',
        email='staff@example.com',
        password='secret-123',
        is_staff=True,
    )


@pytest.fixture(autouse=True)
def _allow_testserver(settings):
    """Add 'testserver' to ALLOWED_HOSTS for every test."""
    hosts = list(getattr(settings, 'ALLOWED_HOSTS', []))
    if 'testserver' not in hosts:
        hosts.append('testserver')
    settings.ALLOWED_HOSTS = hosts
