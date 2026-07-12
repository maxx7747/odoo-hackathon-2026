from odoo import models, fields

class ESGChallenge(models.Model):
    _name = 'esg.challenge'

    name = fields.Char(required=True)
    description = fields.Text()

    xp = fields.Integer()

    difficulty = fields.Selection([
        ('easy','Easy'),
        ('medium','Medium'),
        ('hard','Hard')
    ])

    deadline = fields.Date()

    state = fields.Selection([
        ('draft','Draft'),
        ('active','Active'),
        ('review','Under Review'),
        ('completed','Completed'),
        ('archived','Archived')
    ],default='draft')