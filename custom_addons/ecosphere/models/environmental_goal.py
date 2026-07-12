from odoo import models, fields

class ESGGoal(models.Model):

    _name="ecosphere.goal"

    name=fields.Char(required=True)

    target=fields.Float()

    achieved=fields.Float()

    deadline=fields.Date()