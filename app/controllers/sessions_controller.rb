class SessionsController < ApplicationController

	def new
		@user = User.new

	end

	def create
		user = User.find_by_email(params[:email])
		
		if user && user.password_hash == Digest::SHA2.hexdigest(user.password_salt + params[:password])
			cookies[:auth_token] = user.auth_token
			redirect_to root_path
		else
			redirect_to login_path, :notice => "Login Failed"
		end

	end

	def destroy
		cookies[:auth_token] = nil
		redirect_to root_path, :notice => "You have been logged out"
	end

end
