class Expense < ActiveRecord::Base
  attr_accessible :amount, :expense_type, :expense_date, :user_id
  belongs_to :user

  def date_format_map
  	{"vancity_visa" => 0, "pc_mastercard" => 1}
  end

  def date_formats 
  	["%d/%m/%Y","%m/%d/%Y"]
  end

  def get_date_format statement_type
	return self.date_formats[self.date_format_map[statement_type]]
  end
end
