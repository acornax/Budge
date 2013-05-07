class CreateBudgetComponents < ActiveRecord::Migration
  def change
    create_table :budget_components do |t|
      t.references :budget
      t.string :type
      t.float :amount, :default => 0
      t.timestamps
    end
  end
end
