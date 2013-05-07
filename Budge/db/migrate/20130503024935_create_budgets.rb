class CreateBudgets < ActiveRecord::Migration
  def change
    create_table :budgets do |t|
      t.timestamps
      t.references :user
    end
  end
end
