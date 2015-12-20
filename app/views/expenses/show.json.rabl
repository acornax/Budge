object @expense

attributes :id, :amount, :info

attributes :expense_type => :type


node :date do |e|
 if !e.expense_date.nil?
   e.expense_date.to_time.to_i*1000
 end
end