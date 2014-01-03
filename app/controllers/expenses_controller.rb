require 'csv'

class ExpensesController < ApplicationController

	def index
		@expenses = Expense.all
		render 'index.json.rabl' #.where(:user_id => current_user.id)
	end

	def show
		@expense = Expense.find(params(:id))
		render 'show.json.rabl'
	end

	def create
		params[:expense][:user_id] = current_user.id
		@expense = Expense.create(params[:expense])
		render 'show.json.rabl'
	end

	def update
		@expense = Expenses.update(params[:id], params[:expense])
		render 'show.json.rabl'
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
			expense.user_id = current_user.id
			expense.save!
		end
		render :nothing => true
	end

	def destroy
		respond_with Expense.destroy(params[:id])
		render :nothing => true
	end

end
