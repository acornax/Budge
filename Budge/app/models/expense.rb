class Expense < ActiveRecord::Base
  attr_accessible :amount, :expense_type, :expense_date
  belongs_to :user
end
