from odoo import models, fields

class EcoEnvironment(models.Model):
    _name = "ecosphere.environment"
    _description = "Environmental Record"

    name = fields.Char("Title", required=True)
    department_id = fields.Many2one(
        "ecosphere.department",
        string="Department"
    )

    emission = fields.Float("Carbon Emission (kg CO₂)")
    target = fields.Float("Target Emission")

    date = fields.Date(
        string="Date",
        default=fields.Date.today
    )