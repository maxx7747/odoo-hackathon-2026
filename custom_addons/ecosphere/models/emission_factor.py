from odoo import models, fields

class EmissionFactor(models.Model):
    _name = "ecosphere.emission.factor"
    _description = "Emission Factor"

    name = fields.Char(required=True)

    category = fields.Selection([
        ("fuel","Fuel"),
        ("electricity","Electricity"),
        ("travel","Travel")
    ])

    factor = fields.Float()