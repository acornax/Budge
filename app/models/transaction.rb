class Transaction < ActiveRecord::Base
  attr_accessible :amount, :transaction_type, :info, :transaction_date, :user_id
  belongs_to :user

  def date_format_map
  	{"vancity_visa" => 0, "pc_mastercard" => 1, "vancity_bank" => 2}
  end

  def date_formats 
  	["%d/%m/%Y","%m/%d/%Y", nil]
  end

  def get_date_format statement_type
	return self.date_formats[self.date_format_map[statement_type]]
  end
end
