class AddExpenseDateToExpense < ActiveRecord::Migration
  def change
  	add_column :expenses, :expense_date, :datetime
  end
end
