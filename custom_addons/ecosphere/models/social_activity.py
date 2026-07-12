from odoo import models, fields

class SocialActivity(models.Model):
    _name = "ecosphere.social"

    name = fields.Char(required=True)
    department_id = fields.Many2one("ecosphere.department")
    participants = fields.Integer()
    activity_date = fields.Date()
    score = fields.Float()