class UsersController < ApplicationController

	def show
		@budget = Budget.new
	end

	def new

	end

	def create
		@user = User.new(params[:user])
		if @user.save
		    cookies[:auth_token] = @user.auth_token
			redirect_to enter_expenses_path
		else
			flash[:user_error] = "- Error. Please Try again."
			redirect_to login_path
		end
	end

	def edit

	end

	def update

	end


end
