from odoo import models

class Leaderboard(models.Model):

    _inherit='hr.employee'

    def get_leaderboard(self):

        return self.search([],order="xp desc")