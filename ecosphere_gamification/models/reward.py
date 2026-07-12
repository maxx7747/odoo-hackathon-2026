from odoo import models, fields

class ESGReward(models.Model):

    _name='esg.reward'

    name=fields.Char()

    points_required=fields.Integer()

    stock=fields.Integer()

    status=fields.Boolean(default=True)

    def redeem(self):

        employee=self.env.user.employee_id

        if employee.xp>=self.points_required:

            employee.xp-=self.points_required

            self.stock-=1