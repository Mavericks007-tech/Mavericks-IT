import logging

from django.core.cache import cache
from django.db.models import F
from django.http import HttpResponsePermanentRedirect, HttpResponseRedirect

log = logging.getLogger(__name__)


class RedirectMiddleware:
    """Look up Redirect rows for the request path. 60s cache. Increments hit_count."""

    CACHE_PREFIX = 'redirect:'
    CACHE_TTL = 60
    SKIP_PREFIXES = ('/admin/', '/api/', '/static/', '/media/', '/ckeditor5/')

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        path = request.path
        if path.startswith(self.SKIP_PREFIXES):
            return self.get_response(request)

        cached = cache.get(self.CACHE_PREFIX + path)
        if cached is None:
            from site_content.models import Redirect
            try:
                r = Redirect.objects.only('to_path', 'status_code', 'id').get(
                    from_path=path, is_active=True
                )
                cached = (r.to_path, r.status_code, r.id)
            except Redirect.DoesNotExist:
                cached = False
            cache.set(self.CACHE_PREFIX + path, cached, self.CACHE_TTL)

        if cached:
            to_path, status_code, rid = cached
            from site_content.models import Redirect
            Redirect.objects.filter(pk=rid).update(hit_count=F('hit_count') + 1)
            cls = HttpResponsePermanentRedirect if status_code == 301 else HttpResponseRedirect
            log.info('RedirectMiddleware: %s -> %s (%d)', path, to_path, status_code)
            return cls(to_path)

        return self.get_response(request)
