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
		respond_with Expense.destroy(params[:id])
		render :nothing => true
	end

	def upload
		csv_text = params[:file].read
		csv_text = csv_text.tr("'","")
		csv = CSV.parse(csv_text, :headers => true, :quote_char => "\'")

		csv.each do |row|
			row_hash = row.to_hash
			@expense = Expense.new
			build_expense(row_hash)
			@expense.save!
		end
		render :nothing => true
	end

private


def build_expense hash 
	hash.each do |key, val|
		begin
			val = val.tr('$','')
			val = eval(val)
	    rescue Exception => e
	    	next
		end
		if val.is_a?(Float) && val > 0
			@expense.amount = val
			break
		end
	end

	hash.each do |key, val|
		begin
			val = Date.parse(val) 
	    rescue ArgumentError
	    	next
	    end
		if val.is_a? Date
			@expense.expense_date = val
			break
		end
	end
	@expense.user_id = current_user.id
end

def build_guest_expenses
	@expenses = []
	365.times do |n|
		expense = Expense.new
		expense.expense_date = Date.parse('01/01/2013') + rand(365)
		expense.amount = rand(30)
		@expenses << expense
	end
end

end
