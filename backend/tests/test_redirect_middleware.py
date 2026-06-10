"""RedirectMiddleware end-to-end: row → 301 + hit_count increments."""
import pytest

from site_content.models import Redirect


@pytest.mark.django_db
def test_redirect_301_relative(api_client):
    Redirect.objects.create(from_path='/old-x', to_path='/new-x', status_code=301, is_active=True)
    r = api_client.get('/old-x')
    assert r.status_code == 301
    assert r['Location'] == '/new-x'


@pytest.mark.django_db
def test_redirect_302_when_temp(api_client):
    Redirect.objects.create(from_path='/temp-y', to_path='/new-y', status_code=302, is_active=True)
    r = api_client.get('/temp-y')
    assert r.status_code == 302


@pytest.mark.django_db
def test_inactive_redirect_skipped(api_client):
    Redirect.objects.create(from_path='/inactive', to_path='/x', status_code=301, is_active=False)
    r = api_client.get('/inactive')
    # Falls through to whatever handler, will likely 404 — just not a 301.
    assert r.status_code != 301


@pytest.mark.django_db
def test_redirect_skips_admin_prefix(api_client):
    Redirect.objects.create(from_path='/admin/leak', to_path='/danger', status_code=301, is_active=True)
    r = api_client.get('/admin/leak')
    # Must not match — admin prefix bypassed by middleware.
    assert r['Location' if r.has_header('Location') else 'Content-Type'] != '/danger'


@pytest.mark.django_db
def test_hit_count_increments(api_client):
    from django.core.cache import cache
    cache.clear()
    r_row = Redirect.objects.create(from_path='/counted', to_path='/done', is_active=True)
    api_client.get('/counted')
    api_client.get('/counted')
    r_row.refresh_from_db()
    assert r_row.hit_count >= 1
