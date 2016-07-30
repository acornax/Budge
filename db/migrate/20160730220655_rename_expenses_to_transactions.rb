class RenameExpensesToTransactions < ActiveRecord::Migration
  def up
  	rename_table :expenses, :transactions
  end

  def down
	rename_table :transactions, :expenses
  end
end
