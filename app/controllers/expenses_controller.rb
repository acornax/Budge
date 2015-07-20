require 'csv'

class ExpensesController < ApplicationController

	def index
		if current_user
			@expenses = Expense.where(:user_id => current_user.id)
		else
			build_guest_expenses
		end

		render 'index.json.rabl'
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

	def destroy
		Expense.destroy(params[:id])
		render :nothing => true
	end

	def upload
		@expenses = []
		csv_text = params[:file].read
		csv_text = csv_text.tr("'","")
		csv = CSV.parse(csv_text, :headers => true, :quote_char => "\'")

		csv.each do |row|
			@expense = Expense.new
			build_expense(row, params[:statement_type])
			@expense.save!
			@expenses << @expense;

		end
		render 'index.json.rabl'
	end

private

def build_expense(row, statement_type)
	if statement_type == "vancity_visa"
		dateIndex = 0
		amountIndex = 2
		infoIndex = 3
	elsif statement_type == "vancity_bank"
		dateIndex = 1
		amountIndex = 4
		infoIndex = 2
	elsif statement_type == "pc_mastercard"
		dateIndex = 0
		amountIndex = 2
		infoIndex = 3
	end

	begin
		raw_amount = row[amountIndex]
		@expense.amount = eval(raw_amount.tr('$',''))
	rescue Exception => e	    	
	end

	begin
		raw_date = row[dateIndex]
		date_format = @expense.get_date_format(statement_type)
		if date_format.nil?
			@expense.expense_date = Date.parse(raw_date)
		else
			@expense.expense_date = Date.strptime(raw_date, date_format)
		end
    rescue ArgumentError
    end

    @expense.expense_info = row[infoIndex]

	@expense.user_id = current_user.id

end

def build_guest_expenses
	@expenses = []
	365.times do |n|
		expense = Expense.new
		expense.expense_date = Date.parse('01/01/2013') + rand(365)
		expense.amount = rand(30) + 1
		expense.expense_info = "Example Expense"
		@expenses << expense
	end
end

end
