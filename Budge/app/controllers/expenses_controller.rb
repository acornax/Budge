class ExpensesController < ApplicationController
	respond_to :json

	def index
		@expenses = Expense.all
		respond_with @expenses
	end

	def show
		@expense = Expense.find(params(:id))
		respond_with @expense
	end

	def create
		respond_with Expense.create(params[:expense])
	end

	def update
		respond_with Expenses.update(params[:id], params[:expense])
	end

	def destroy
		respond_with Expense.destroy(params[:id])
	end

end
