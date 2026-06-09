from django.http import JsonResponse

from .models import (
    CaseStudy, CTASection, Differentiator, HeroSection, Industry,
    ProcessStep, Service, Testimonial, TrustStat,
)


def _hero_dict(h):
    if not h:
        return None
    return {
        'id': str(h.id),
        'headline': h.headline,
        'subheadline': h.subheadline,
        'primary_cta_text': h.primary_cta_text,
        'primary_cta_link': h.primary_cta_link,
        'secondary_cta_text': h.secondary_cta_text,
        'secondary_cta_link': h.secondary_cta_link,
        'gradient_start': h.gradient_start,
        'gradient_end': h.gradient_end,
        'particle_count': h.particle_count,
    }


def _service_dict(s):
    return {
        'id': str(s.id),
        'title': s.title,
        'slug': s.slug,
        'subtitle': s.subtitle,
        'simple_explanation': s.simple_explanation,
        'long_description': s.long_description,
        'icon_name': s.icon_name,
        'gradient_from': s.gradient_from,
        'gradient_to': s.gradient_to,
        'cta_link': s.cta_link,
        'starting_price': str(s.starting_price) if s.starting_price else None,
        'currency': s.currency,
        'order': s.order,
    }


def _trust_dict(t):
    return {
        'id': str(t.id),
        'label': t.label,
        'value': t.value,
        'numeric_value': t.numeric_value,
        'suffix': t.suffix,
    }


def _testimonial_dict(t):
    return {
        'id': str(t.id),
        'name': t.name,
        'title': t.title,
        'company': t.company,
        'content': t.content,
        'rating': t.rating,
        'service_used': t.service_used,
    }


def _industry_dict(i):
    return {
        'id': str(i.id),
        'name': i.name,
        'slug': i.slug,
        'icon_name': i.icon_name,
        'description': i.description,
        'long_description': i.long_description,
        'example_service': i.example_service,
    }


def _diff_dict(d):
    return {
        'id': str(d.id),
        'title': d.title,
        'description': d.description,
        'icon_name': d.icon_name,
    }


def _process_dict(p):
    return {
        'id': str(p.id),
        'step_number': p.step_number,
        'title': p.title,
        'description': p.description,
        'duration': p.duration,
        'icon_name': p.icon_name,
    }


def _cta_dict(c):
    if not c:
        return None
    return {
        'id': str(c.id),
        'headline': c.headline,
        'subtext': c.subtext,
        'primary_cta_text': c.primary_cta_text,
        'primary_cta_link': c.primary_cta_link,
        'secondary_cta_text': c.secondary_cta_text,
        'secondary_cta_link': c.secondary_cta_link,
    }


def _case_dict(c):
    return {
        'id': str(c.id),
        'title': c.title,
        'client_name': c.client_name,
        'industry': c.industry,
        'metric': c.metric,
        'metric_description': c.metric_description,
        'image_url': c.image_url,
    }


def homepage_data(request):
    try:
        hero = HeroSection.objects.filter(is_active=True).first()
        services = Service.objects.filter(is_featured=True).order_by('order')
        trust_stats = TrustStat.objects.filter(is_active=True).order_by('order')
        testimonials = Testimonial.objects.filter(is_featured=True).order_by('order')[:4]
        industries = Industry.objects.filter(is_active=True).order_by('order')
        differentiators = Differentiator.objects.all().order_by('order')
        process_steps = ProcessStep.objects.all().order_by('step_number')
        case_studies = CaseStudy.objects.filter(is_featured=True).order_by('order')[:6]
        cta = CTASection.objects.filter(is_active=True).first()

        data = {
            'hero': _hero_dict(hero),
            'services': [_service_dict(s) for s in services],
            'trust_stats': [_trust_dict(t) for t in trust_stats],
            'testimonials': [_testimonial_dict(t) for t in testimonials],
            'industries': [_industry_dict(i) for i in industries],
            'differentiators': [_diff_dict(d) for d in differentiators],
            'process_steps': [_process_dict(p) for p in process_steps],
            'case_studies': [_case_dict(c) for c in case_studies],
            'cta': _cta_dict(cta),
        }
        return JsonResponse(data)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def site_settings(request):
    """SiteSettings + active nav menus + footer columns + links."""
    from site_content.models import NavMenu, FooterColumn, SiteSettings

    settings_obj = SiteSettings.objects.first()
    header_menu = NavMenu.objects.filter(location='header', is_active=True).prefetch_related('items').first()
    footer_columns = FooterColumn.objects.filter(is_active=True).prefetch_related('links').order_by('order')

    def _nav_item(it):
        return {
            'id': str(it.id),
            'label': it.label,
            'url': it.url,
            'open_in_new_tab': it.open_in_new_tab,
            'icon_name': it.icon_name,
            'order': it.order,
        }

    return JsonResponse({
        'settings': {
            'site_name': settings_obj.site_name if settings_obj else 'Mavericks Tech Bangladesh',
            'tagline': settings_obj.tagline if settings_obj else '',
            'logo': settings_obj.logo.url if settings_obj and settings_obj.logo else None,
            'favicon': settings_obj.favicon.url if settings_obj and settings_obj.favicon else None,
            'contact_email': settings_obj.contact_email if settings_obj else '',
            'contact_phone': settings_obj.contact_phone if settings_obj else '',
            'whatsapp_number': settings_obj.whatsapp_number if settings_obj else '',
            'office_address': settings_obj.office_address if settings_obj else '',
            'office_hours': settings_obj.office_hours if settings_obj else '',
            'social': {
                'linkedin': settings_obj.linkedin_url if settings_obj else '',
                'facebook': settings_obj.facebook_url if settings_obj else '',
                'instagram': settings_obj.instagram_url if settings_obj else '',
                'youtube': settings_obj.youtube_url if settings_obj else '',
                'twitter': settings_obj.twitter_url if settings_obj else '',
            },
            'analytics': {
                'google_analytics_id': settings_obj.google_analytics_id if settings_obj else '',
                'google_tag_manager_id': settings_obj.google_tag_manager_id if settings_obj else '',
                'facebook_pixel_id': settings_obj.facebook_pixel_id if settings_obj else '',
            },
        } if settings_obj else None,
        'header_nav': [_nav_item(it) for it in (header_menu.items.filter(is_active=True).order_by('order') if header_menu else [])],
        'footer_columns': [
            {
                'id': str(c.id),
                'heading': c.heading,
                'order': c.order,
                'links': [
                    {
                        'id': str(l.id),
                        'label': l.label,
                        'url': l.url,
                        'open_in_new_tab': l.open_in_new_tab,
                        'order': l.order,
                    }
                    for l in c.links.filter(is_active=True).order_by('order')
                ],
            }
            for c in footer_columns
        ],
    })


def services_list(request):
    from .models import Service
    services = Service.objects.all().order_by('order')
    return JsonResponse({'results': [_service_dict(s) for s in services]})


def service_detail(request, slug):
    from .models import Service
    s = Service.objects.filter(slug=slug).first()
    if not s:
        return JsonResponse({'detail': 'Not found'}, status=404)
    return JsonResponse(_service_dict(s))


def industries_list(request):
    from .models import Industry
    industries = Industry.objects.filter(is_active=True).order_by('order')
    return JsonResponse({'results': [_industry_dict(i) for i in industries]})


def industry_detail(request, slug):
    from .models import Industry
    i = Industry.objects.filter(slug=slug).first()
    if not i:
        return JsonResponse({'detail': 'Not found'}, status=404)
    return JsonResponse(_industry_dict(i))


def page_detail(request, slug):
    from site_content.models import Page
    p = Page.objects.filter(slug=slug, status='published').first()
    if not p:
        # Allow draft view for now (admin convenience). In prod restrict.
        p = Page.objects.filter(slug=slug).first()
    if not p:
        return JsonResponse({'detail': 'Not found'}, status=404)
    return JsonResponse({
        'id': str(p.id),
        'title': p.title,
        'slug': p.slug,
        'body': p.body,
        'status': p.status,
        'featured_image': p.featured_image.file.url if p.featured_image and p.featured_image.file else None,
    })


def blog_list(request):
    from .models import BlogPost
    posts = BlogPost.objects.filter(is_published=True).order_by('-published_at')
    return JsonResponse({'results': [{
        'id': str(p.id),
        'title': p.title,
        'slug': p.slug,
        'excerpt': p.excerpt,
        'featured_image': p.featured_image,
        'author': p.author,
        'read_time': p.read_time,
        'category': p.category,
        'tags': p.tags,
        'published_at': p.published_at.isoformat(),
    } for p in posts]})


def blog_detail(request, slug):
    from .models import BlogPost
    p = BlogPost.objects.filter(slug=slug, is_published=True).first()
    if not p:
        return JsonResponse({'detail': 'Not found'}, status=404)
    BlogPost.objects.filter(pk=p.pk).update(views=p.views + 1)
    return JsonResponse({
        'id': str(p.id),
        'title': p.title,
        'slug': p.slug,
        'excerpt': p.excerpt,
        'content': p.content,
        'featured_image': p.featured_image,
        'author': p.author,
        'author_avatar': p.author_avatar,
        'read_time': p.read_time,
        'category': p.category,
        'tags': p.tags,
        'views': p.views + 1,
        'published_at': p.published_at.isoformat(),
    })


def portfolio_list(request):
    from .models import CaseStudy
    cases = CaseStudy.objects.all().order_by('order')
    return JsonResponse({'results': [_case_dict(c) for c in cases]})


def portfolio_detail(request, pk):
    from .models import CaseStudy
    c = CaseStudy.objects.filter(pk=pk).first()
    if not c:
        return JsonResponse({'detail': 'Not found'}, status=404)
    return JsonResponse({
        **_case_dict(c),
        'description': c.description,
        'challenge': c.challenge,
        'solution': c.solution,
        'results': c.results,
        'logo_url': c.logo_url,
        'testimonial_quote': c.testimonial_quote,
        'testimonial_author': c.testimonial_author,
        'testimonial_title': c.testimonial_title,
        'technologies': c.technologies,
    })


def seo_meta(request):
    """Return MetaTag + SchemaOrg for given ?path=/some/path."""
    from seo.models import MetaTag, SchemaOrg

    path = request.GET.get('path', '/')
    meta = MetaTag.objects.filter(path=path).first()
    schemas = SchemaOrg.objects.filter(path=path, is_active=True).order_by('order')

    return JsonResponse({
        'meta': {
            'path': meta.path,
            'title': meta.title,
            'description': meta.description,
            'canonical_url': meta.canonical_url,
            'robots': meta.robots,
            'og_title': meta.og_title or meta.title,
            'og_description': meta.og_description or meta.description,
            'og_image': meta.og_image.url if meta.og_image else None,
            'og_type': meta.og_type,
            'twitter_card': meta.twitter_card,
            'twitter_title': meta.twitter_title or meta.title,
            'twitter_description': meta.twitter_description or meta.description,
            'twitter_image': meta.twitter_image.url if meta.twitter_image else None,
            'primary_keywords': meta.primary_keywords,
            'secondary_keywords': meta.secondary_keywords,
        } if meta else None,
        'schemas': [
            {
                'schema_type': s.schema_type,
                'data': s.data,
            }
            for s in schemas
        ],
    })
