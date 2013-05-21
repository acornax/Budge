class Expense < ActiveRecord::Base
  attr_accessible :amount, :expense_type
  belongs_to :user
end
