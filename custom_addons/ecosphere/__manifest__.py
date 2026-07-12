{
    'name': 'EcoSphere ESG Management',
    'version': '1.0',
    'summary': 'ESG Management System',
    'author': 'Team EcoSphere',
    'category': 'Management',
    'depends': ['base'],

        'data': [
    'security/ir.model.access.csv',
    'views/menu.xml',
    'views/department_views.xml',
    'views/environmental_views.xml',
    'views/social_views.xml',
    'views/governance_views.xml',
    'views/dashboard_views.xml',
    'data/demo.xml',
    ],
    'installable': True,
    'application': True,
}