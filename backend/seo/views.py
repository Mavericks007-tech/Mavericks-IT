"""SEO support endpoints — slug feed for sitemap, robots policy."""
from django.http import JsonResponse
from django.views.decorators.cache import cache_page
from django.views.decorators.http import require_GET

from cms.models import BlogPost, Industry, Service
from site_content.models import Page


@require_GET
@cache_page(300)
def sitemap_feed(request):
    """Return all crawlable slugs grouped by type. Consumed by Next /sitemap.xml route."""
    services = list(
        Service.objects.filter(is_active=True)
        .values('slug', 'updated_at')
    )
    industries = list(
        Industry.objects.filter(is_active=True)
        .values('slug', 'updated_at')
    )
    blog = list(
        BlogPost.objects.filter(is_published=True)
        .values('slug', 'updated_at', 'published_at')
    )
    pages = list(
        Page.objects.filter(status='published', show_in_sitemap=True)
        .values('slug', 'updated_at')
    )

    def fmt(rows, date_field='updated_at'):
        return [
            {
                'slug': r['slug'],
                'lastmod': (r.get('published_at') or r[date_field]).isoformat()
                if r.get(date_field) else None,
            }
            for r in rows
        ]

    return JsonResponse({
        'services': fmt(services),
        'industries': fmt(industries),
        'blog': fmt(blog),
        'pages': fmt(pages),
    })


@require_GET
@cache_page(300)
def robots_policy(request):
    """Return JSON describing whether crawlers should be allowed.
    Next /robots.txt handler can call this if it ever needs DB state.
    Currently static — kept for future toggle from admin."""
    from django.conf import settings as dj
    return JsonResponse({
        'allow_indexing': not dj.DEBUG and dj.ENVIRONMENT == 'production',
        'sitemap': f"{dj.BASE_URL.replace('http://', 'https://').rstrip('/')}/sitemap.xml",
    })
