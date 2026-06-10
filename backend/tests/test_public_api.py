"""Public (anonymous) endpoint smoke tests."""
import pytest


@pytest.mark.django_db
def test_homepage_endpoint(api_client):
    r = api_client.get('/api/v1/homepage/')
    assert r.status_code == 200


@pytest.mark.django_db
def test_site_endpoint(api_client):
    r = api_client.get('/api/v1/site/')
    assert r.status_code == 200


@pytest.mark.django_db
def test_seo_endpoint(api_client):
    r = api_client.get('/api/v1/seo/?path=/')
    assert r.status_code == 200


@pytest.mark.django_db
def test_sitemap_feed(api_client):
    r = api_client.get('/api/v1/seo/sitemap-feed/')
    assert r.status_code == 200
    body = r.json()
    for key in ('services', 'industries', 'blog', 'pages'):
        assert key in body
        assert isinstance(body[key], list)


@pytest.mark.django_db
def test_robots_policy(api_client):
    r = api_client.get('/api/v1/seo/robots-policy/')
    assert r.status_code == 200
    assert 'allow_indexing' in r.json()


@pytest.mark.django_db
def test_services_list(api_client):
    r = api_client.get('/api/v1/services/')
    assert r.status_code == 200


@pytest.mark.django_db
def test_industries_list(api_client):
    r = api_client.get('/api/v1/industries/')
    assert r.status_code == 200


@pytest.mark.django_db
def test_blog_list(api_client):
    r = api_client.get('/api/v1/blog/')
    assert r.status_code == 200


@pytest.mark.django_db
def test_portfolio_list(api_client):
    r = api_client.get('/api/v1/portfolio/')
    assert r.status_code == 200


@pytest.mark.django_db
def test_public_lead_submit_throttle_or_create(api_client):
    payload = {
        'full_name': 'Test User',
        'email': 'unit-test@example.com',
        'phone': '+8801712345678',
    }
    r = api_client.post('/api/v1/crm/public/leads/', payload, format='json')
    assert r.status_code in (201, 429), r.content
