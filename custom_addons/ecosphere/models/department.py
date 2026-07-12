from odoo import models, fields

class EcoDepartment(models.Model):
    _name = "ecosphere.department"
    _description = "Department"

    name = fields.Char(string="Department Name", required=True)
    code = fields.Char(string="Department Code")
    head = fields.Char(string="Department Head")
    employee_count = fields.Integer(string="Employee Count")

    environmental_score = fields.Float(string="Environmental Score")
    social_score = fields.Float(string="Social Score")
    governance_score = fields.Float(string="Governance Score")

    total_score = fields.Float(string="Total ESG Score")