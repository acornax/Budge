class BudgetsController < ApplicationController

	def index

	end


	def create
		budget = Budget.new(params[:budget])
		budget.user = current_user
		budget.save!
	end

end
