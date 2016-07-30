class RenameExpenseTypeToTransactionType < ActiveRecord::Migration
  def up
  	rename_column :transactions, :expense_type, :transaction_type
  end

  def down
  	rename_column :transactions, :transaction_type, :expense_type
  end
end
