class Expense < ActiveRecord::Base
  attr_accessible :amount, :expense_type, :expense_date, :user_id
  belongs_to :user
end
