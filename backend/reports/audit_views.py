"""Audit log endpoint — aggregates django-simple-history records across models."""
from django.apps import apps
from rest_framework.decorators import api_view, permission_classes
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


HISTORY_TYPE_LABELS = {'+': 'create', '~': 'update', '-': 'delete'}


def _historical_models():
    """Return all installed model classes that have a `history` manager."""
    found = []
    for m in apps.get_models():
        # Historical models themselves are named "Historical*". Skip them.
        if m.__name__.startswith('Historical'):
            continue
        if hasattr(m, 'history') and hasattr(m.history, 'all'):
            found.append(m)
    return found


def _serialize(rec, source_model):
    return {
        'id': str(rec.history_id),
        'model': source_model.__name__,
        'app': source_model._meta.app_label,
        'object_repr': str(rec.instance) if rec.instance else f"{source_model.__name__}({rec.id})",
        'object_id': str(rec.id),
        'action': HISTORY_TYPE_LABELS.get(rec.history_type, rec.history_type),
        'user': rec.history_user.username if rec.history_user else None,
        'user_id': rec.history_user_id,
        'timestamp': rec.history_date.isoformat(),
        'change_reason': rec.history_change_reason or '',
    }


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def audit_log(request):
    """Flat, paginated audit feed across every history-tracked model.

    Query params:
        model=Lead     filter to one model name
        user=alice     filter to one username
        action=update  create | update | delete
        limit=50       page size (max 200)
        offset=0
    """
    model_filter = request.query_params.get('model')
    user_filter = request.query_params.get('user')
    action_filter = request.query_params.get('action')

    rows = []
    for m in _historical_models():
        if model_filter and m.__name__ != model_filter:
            continue
        qs = m.history.all().select_related('history_user').order_by('-history_date')[:500]
        for rec in qs:
            if action_filter and HISTORY_TYPE_LABELS.get(rec.history_type) != action_filter:
                continue
            if user_filter and (not rec.history_user or rec.history_user.username != user_filter):
                continue
            rows.append(_serialize(rec, m))

    rows.sort(key=lambda r: r['timestamp'], reverse=True)

    try:
        limit = min(int(request.query_params.get('limit', 50)), 200)
    except ValueError:
        limit = 50
    try:
        offset = max(int(request.query_params.get('offset', 0)), 0)
    except ValueError:
        offset = 0

    return Response({
        'total': len(rows),
        'limit': limit,
        'offset': offset,
        'results': rows[offset: offset + limit],
        'available_models': sorted({m.__name__ for m in _historical_models()}),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def audit_object(request, app_label, model_name, object_id):
    """Return full history for one object."""
    try:
        m = apps.get_model(app_label, model_name)
    except LookupError:
        return Response({'detail': 'model not found'}, status=404)
    if not hasattr(m, 'history'):
        return Response({'detail': 'model not history-tracked'}, status=400)

    rows = []
    for rec in m.history.filter(id=object_id).order_by('-history_date'):
        rows.append({
            **_serialize(rec, m),
            'snapshot': {
                f.name: _safe(getattr(rec, f.name, None))
                for f in rec._meta.fields
                if not f.name.startswith('history_')
            },
        })
    return Response({'results': rows})


def _safe(v):
    """JSON-safe coercion."""
    if v is None:
        return None
    if hasattr(v, 'isoformat'):
        return v.isoformat()
    return str(v) if not isinstance(v, (str, int, float, bool, list, dict)) else v
