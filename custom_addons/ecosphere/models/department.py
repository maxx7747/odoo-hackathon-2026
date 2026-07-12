from odoo import models, fields, api

class Department(models.Model):
    _name = "ecosphere.department"
    _description = "Department"

    name = fields.Char(required=True)
    code = fields.Char()
    manager = fields.Char(string="Department Manager")
    employee_count = fields.Integer()

    environmental_score = fields.Float(
        compute="_compute_scores",
        store=True
    )

    social_score = fields.Float(
        compute="_compute_scores",
        store=True
    )

    governance_score = fields.Float(
        compute="_compute_scores",
        store=True
    )

    total_score = fields.Float(
        compute="_compute_scores",
        store=True
    )

    status = fields.Selection([
        ('excellent', 'Excellent'),
        ('good', 'Good'),
        ('average', 'Average'),
        ('poor', 'Poor')
    ], compute="_compute_status", store=True)

    @api.depends()
    def _compute_scores(self):
        for rec in self:
            rec.environmental_score = 80
            rec.social_score = 75
            rec.governance_score = 90

            rec.total_score = (
                rec.environmental_score +
                rec.social_score +
                rec.governance_score
            ) / 3

    @api.depends("total_score")
    def _compute_status(self):
        for rec in self:
            if rec.total_score >= 85:
                rec.status = "excellent"
            elif rec.total_score >= 70:
                rec.status = "good"
            elif rec.total_score >= 50:
                rec.status = "average"
            else:
                rec.status = "poor"