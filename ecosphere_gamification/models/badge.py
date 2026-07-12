from odoo import models, fields

class ESGBadge(models.Model):

    _name='esg.badge'

    name=fields.Char()

    description=fields.Text()

    unlock_xp=fields.Integer()

class Employee(models.Model):

    _inherit='hr.employee'

    xp=fields.Integer()

    badge_ids=fields.Many2many('esg.badge')