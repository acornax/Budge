class RenameExpenseType < ActiveRecord::Migration
  def up
  	rename_column :expenses, :type, :expense_type
  end

  def down
  	rename_column :expenses, :expense_type, :type
  end
end
