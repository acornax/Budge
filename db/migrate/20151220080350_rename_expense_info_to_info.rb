class RenameExpenseInfoToInfo < ActiveRecord::Migration
  def up
  	rename_column :expenses, :expense_info, :info
  end

  def down
  	rename_column :expenses, :info, :expense_info
  end
end
