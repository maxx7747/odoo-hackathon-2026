{
    'name': 'EcoSphere Gamification',
    'version': '18.0.1.0.0',
    'summary': 'Gamification Module for ESG',
    'author': 'Your Team',
    'category': 'Human Resources',
    'depends': ['base', 'mail', 'hr'],
    'data': [
        'security/ir.model.access.csv',
        'views/menu.xml',
        'views/challenge_views.xml',
    ],
    'installable': True,
    'application': True,
}