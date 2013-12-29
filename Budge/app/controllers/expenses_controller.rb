require 'csv'

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

	def upload
		csv_text = params[:file].read
		csv_text = csv_text.tr("'","")
		csv = CSV.parse(csv_text, :headers => true, :quote_char => "\'")

		csv.each do |row|
			row_hash = row.to_hash
			expense = Expense.new
			expense.amount = row_hash[" Billing Amount"].tr('$','').to_f
			expense.expense_date = Date.parse(row_hash["Transaction Date"])
			expense.save!
		end
		render :nothing => true
	end

	def destroy
		respond_with Expense.destroy(params[:id])
	end

end
