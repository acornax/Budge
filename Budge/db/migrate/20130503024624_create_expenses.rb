class CreateExpenses < ActiveRecord::Migration
  def change
    create_table :expenses do |t|
      t.timestamps
      t.references :user
      t.string :type
      t.float :amount
    end
  end
end
