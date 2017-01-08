object @transaction

attributes :id, :amount, :info

attributes :transaction_type => :type


node :date do |e|
 if !e.transaction_date.nil?
   e.transaction_date.to_time.to_i*1000
 end
end