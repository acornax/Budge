require 'csv'

class TransactionsController < ApplicationController

	def index
		if current_user
			@transactions = Transaction.where(:user_id => current_user.id)
		else
			build_guest_transactions
		end

		render 'index.json.rabl'
	end

	def show
		@transaction = Transaction.find(params(:id))
		render 'show.json.rabl'
	end

	def create
		params[:transaction][:user_id] = current_user.id
		@transaction = Transaction.create(params[:transaction])
		render 'show.json.rabl'
	end

	def update
		@transaction = Transactions.update(params[:id], params[:transaction])
		render 'show.json.rabl'
	end

	def destroy
		Transaction.destroy(params[:id])
		render :nothing => true
	end

	def upload
		@transactions = []
		csv_text = params[:file].read
		csv_text = csv_text.tr("'","")
		csv = CSV.parse(csv_text, :headers => true, :quote_char => "\'")

		csv.each do |row|
			@transaction = Transaction.new
			build_transaction(row, params[:statement_type])
			@transaction.save!
			@transactions << @transaction;

		end
		render 'index.json.rabl'
	end

private

def build_transaction(row, statement_type)
	if statement_type == "vancity_visa"
		dateIndex = 0
		expenseIndex = 2
		incomeIndex = 2
		infoIndex = 3
	elsif statement_type == "vancity_bank"
		dateIndex = 1
		expenseIndex = 4
		incomeIndex = 5
		infoIndex = 2
	elsif statement_type == "pc_mastercard"
		dateIndex = 0
		expenseIndex = 2
		incomeIndex = 2
		infoIndex = 3
	end

	# Attempt to set the amount based on the expense index
	begin
		raw_amount = row[expenseIndex]
		@transaction.amount = eval(raw_amount.tr('$',''))
		@transaction.amount=@transaction.amount*-1
	rescue Exception => e	    	
		# Attempt to set the amount based on the income index if setting via the expense index fails
		begin
			raw_amount = row[incomeIndex]
			@transaction.amount = eval(raw_amount.tr('$',''))
		rescue Exception => e	    	
		end
	end

	begin
		raw_date = row[dateIndex]
		date_format = @transaction.get_date_format(statement_type)
		if date_format.nil?
			@transaction.transaction_date = Date.parse(raw_date)
		else
			@transaction.transaction_date = Date.strptime(raw_date, date_format)
		end
    rescue ArgumentError
    end

    @transaction.info = row[infoIndex]

	@transaction.user_id = current_user.id

end

def build_guest_transactions
	@transactions = []
	365.times do |n|
		transaction = Transaction.new
		transaction.transaction_date = Date.parse('01/01/2013') + rand(365)
		transaction.amount = rand(30) + 1
		transaction.info = "Example Transaction"
		@transactions << transaction
	end
end

end
