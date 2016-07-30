class RenameExpenseDateToTransactionDate < ActiveRecord::Migration
  def up
  	rename_column :transactions, :expense_date, :transaction_date
  end

  def down
  	rename_column :transactions, :transaction_date, :expense_date
  end
end
