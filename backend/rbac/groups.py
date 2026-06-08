"""Role -> (app_label.model_name -> [actions]) mapping.

actions: 'view', 'add', 'change', 'delete'
Used by seed_rbac mgmt command to populate Django Groups + Permissions.
"""

ALL = ['view', 'add', 'change', 'delete']
READ = ['view']
EDIT = ['view', 'add', 'change']

# Apps with models the system uses.
CMS_MODELS = [
    'cms.herosection', 'cms.service', 'cms.testimonial', 'cms.truststat',
    'cms.industry', 'cms.casestudy', 'cms.differentiator', 'cms.processstep',
    'cms.blogpost', 'cms.ctasection',
]
SITE_MODELS = [
    'site_content.sitesettings', 'site_content.navmenu', 'site_content.navitem',
    'site_content.footercolumn', 'site_content.footerlink',
    'site_content.mediaasset', 'site_content.page', 'site_content.redirect',
]
SEO_MODELS = ['seo.metatag', 'seo.schemaorg']
CRM_MODELS = [
    'crm.client', 'crm.contact', 'crm.lead', 'crm.project', 'crm.milestone',
    'crm.quote', 'crm.quotelineitem', 'crm.invoice', 'crm.invoicelineitem',
    'crm.payment', 'crm.task', 'crm.activity', 'crm.note',
]
COMMS_MODELS = [
    'comms.emailsettings', 'comms.emailtemplate', 'comms.emaillog', 'comms.emailcampaign',
]


def _grant(perms_map, models, actions):
    for m in models:
        perms_map[m] = sorted(set(perms_map.get(m, []) + actions))


def admin_perms():
    p = {}
    _grant(p, CMS_MODELS + SITE_MODELS + SEO_MODELS + CRM_MODELS + COMMS_MODELS, ALL)
    return p


def manager_perms():
    """Full CRM, full Comms, read SEO + content."""
    p = {}
    _grant(p, CRM_MODELS + COMMS_MODELS, ALL)
    _grant(p, CMS_MODELS + SITE_MODELS + SEO_MODELS, READ)
    return p


def sales_agent_perms():
    """Manage own leads/clients/quotes, view projects/invoices, no admin."""
    p = {}
    _grant(p, [
        'crm.lead', 'crm.client', 'crm.contact', 'crm.quote', 'crm.quotelineitem',
        'crm.task', 'crm.activity', 'crm.note',
    ], EDIT)
    _grant(p, ['crm.project', 'crm.milestone', 'crm.invoice', 'crm.payment'], READ)
    _grant(p, ['comms.emailtemplate', 'comms.emaillog'], READ)
    return p


def editor_perms():
    """Manage all content + SEO + blog. No CRM access."""
    p = {}
    _grant(p, CMS_MODELS + SITE_MODELS + SEO_MODELS, ALL)
    return p


def marketing_perms():
    """Edit blog, email campaigns, read leads."""
    p = {}
    _grant(p, ['cms.blogpost', 'site_content.page', 'site_content.mediaasset'], ALL)
    _grant(p, COMMS_MODELS, ALL)
    _grant(p, ['crm.lead'], READ)
    _grant(p, SEO_MODELS, EDIT)
    return p


def developer_perms():
    """Read everything, edit projects + tasks."""
    p = {}
    _grant(p, ['crm.project', 'crm.milestone', 'crm.task', 'crm.note', 'crm.activity'], EDIT)
    _grant(p, CRM_MODELS, READ)
    _grant(p, CMS_MODELS + SITE_MODELS, READ)
    return p


def designer_perms():
    """Same as developer."""
    return developer_perms()


def support_perms():
    """Read CRM, edit activities + notes + tasks."""
    p = {}
    _grant(p, ['crm.task', 'crm.activity', 'crm.note'], EDIT)
    _grant(p, CRM_MODELS, READ)
    _grant(p, ['comms.emaillog', 'comms.emailtemplate'], READ)
    return p


def viewer_perms():
    """Read-only across everything."""
    p = {}
    _grant(p, CMS_MODELS + SITE_MODELS + SEO_MODELS + CRM_MODELS + COMMS_MODELS, READ)
    return p


ROLE_MATRIX = {
    'Admin': admin_perms(),
    'Manager': manager_perms(),
    'SalesAgent': sales_agent_perms(),
    'Editor': editor_perms(),
    'Marketing': marketing_perms(),
    'Developer': developer_perms(),
    'Designer': designer_perms(),
    'Support': support_perms(),
    'Viewer': viewer_perms(),
}
