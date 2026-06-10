"""Auth-required admin / CMS / CRM endpoint smoke tests."""
import pytest

CMS_RESOURCES = [
    'services', 'industries', 'testimonials', 'trust-stats',
    'pages', 'redirects', 'meta-tags', 'schemas',
    'hero-sections', 'cta-sections', 'process-steps', 'case-studies',
    'differentiators', 'blog-posts', 'media', 'users', 'groups',
    'email-templates',
]

CRM_RESOURCES = [
    'leads', 'clients', 'contacts', 'projects', 'milestones',
    'quotes', 'invoices', 'payments', 'tasks', 'activities',
    'notes', 'files', 'comments',
]


@pytest.mark.django_db
@pytest.mark.parametrize('resource', CMS_RESOURCES)
def test_cms_admin_list(auth_client, resource):
    r = auth_client.get(f'/api/v1/cms/admin/{resource}/')
    assert r.status_code == 200, (resource, r.content[:200])


@pytest.mark.django_db
@pytest.mark.parametrize('resource', CRM_RESOURCES)
def test_crm_list(auth_client, resource):
    r = auth_client.get(f'/api/v1/crm/{resource}/')
    assert r.status_code == 200, (resource, r.content[:200])


@pytest.mark.django_db
def test_site_settings_singleton(auth_client):
    r = auth_client.get('/api/v1/cms/admin/site-settings/singleton/')
    assert r.status_code == 200


@pytest.mark.django_db
def test_email_settings_singleton(auth_client):
    r = auth_client.get('/api/v1/cms/admin/email-settings/singleton/')
    assert r.status_code == 200


@pytest.mark.django_db
def test_audit_log_endpoint(auth_client):
    r = auth_client.get('/api/v1/reports/audit/')
    assert r.status_code == 200
    body = r.json()
    assert 'results' in body
    assert 'available_models' in body


@pytest.mark.django_db
def test_dashboard_endpoint(auth_client):
    r = auth_client.get('/api/v1/reports/dashboard/')
    assert r.status_code == 200


@pytest.mark.django_db
def test_lead_bulk_action_requires_ids(auth_client):
    r = auth_client.post('/api/v1/crm/leads/bulk-action/', {}, format='json')
    assert r.status_code == 400


@pytest.mark.django_db
def test_csv_export_leads(auth_client):
    r = auth_client.get('/api/v1/crm/leads/export.csv/')
    assert r.status_code == 200
    assert r['Content-Type'].startswith('text/csv')


@pytest.mark.django_db
def test_csv_export_clients(auth_client):
    r = auth_client.get('/api/v1/crm/clients/export.csv/')
    assert r.status_code == 200
    assert r['Content-Type'].startswith('text/csv')


@pytest.mark.django_db
def test_timeline_requires_scope(auth_client):
    r = auth_client.get('/api/v1/crm/timeline/')
    assert r.status_code == 400


@pytest.mark.django_db
def test_anon_blocked_on_admin(api_client):
    r = api_client.get('/api/v1/cms/admin/services/')
    assert r.status_code in (401, 403)
