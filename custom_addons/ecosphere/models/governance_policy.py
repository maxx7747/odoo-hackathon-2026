from odoo import models, fields

class GovernancePolicy(models.Model):
    _name = "ecosphere.governance"

    name = fields.Char(required=True)
    department_id = fields.Many2one("ecosphere.department")
    compliance = fields.Boolean()
    audit_date = fields.Date()
    score = fields.Float()