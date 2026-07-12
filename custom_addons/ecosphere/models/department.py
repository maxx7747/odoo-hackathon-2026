from odoo import models, fields, api

class Department(models.Model):
    _name = "ecosphere.department"
    _description = "Department"

    name = fields.Char(required=True)
    code = fields.Char()
    manager = fields.Char()

    employee_count = fields.Integer()

    environmental_score = fields.Float(default=0)
    social_score = fields.Float(default=0)
    governance_score = fields.Float(default=0)

    total_score = fields.Float(
        compute="_compute_total",
        store=True
    )

    @api.depends(
        "environmental_score",
        "social_score",
        "governance_score"
    )
    def _compute_total(self):
        for rec in self:
            rec.total_score = (
                rec.environmental_score +
                rec.social_score +
                rec.governance_score
            ) / 3