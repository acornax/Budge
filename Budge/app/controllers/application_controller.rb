class ApplicationController < ActionController::Base
  protect_from_forgery
  helper_method :current_user


	def login_required
		if !current_user
			redirect_to login_path, :notice => "Login required"
		end
	end

	def current_user
		if cookies[:auth_token]
			current_user = User.find_by_auth_token(cookies[:auth_token])
		end
	end
end
