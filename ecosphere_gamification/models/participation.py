from odoo import models, fields

class ESGParticipation(models.Model):

    _name='esg.participation'

    employee_id = fields.Many2one('hr.employee')

    challenge_id = fields.Many2one('esg.challenge')

    progress = fields.Integer()

    proof = fields.Binary()

    approved = fields.Boolean()

    xp_awarded = fields.Integer()

    def approve(self):

        self.approved=True

        self.xp_awarded=self.challenge_id.xp

        self.employee_id.xp += self.challenge_id.xp