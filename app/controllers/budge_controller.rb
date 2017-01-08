class BudgeController < ApplicationController

 def start
 	if current_user
 		redirect_to enter_transactions_path
 	end
 end
end
