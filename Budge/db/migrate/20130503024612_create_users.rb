class CreateUsers < ActiveRecord::Migration
  def change
    create_table :users do |t|

      t.timestamps
      t.string :email
      t.string :password_hash
      t.string :password_salt
      
    end
  end
end
