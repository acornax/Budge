class AddExpenseInfoToExpenses < ActiveRecord::Migration
  def change
  	add_column :expenses, :expense_info, :string
  end
end
