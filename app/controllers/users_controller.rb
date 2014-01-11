class UsersController < ApplicationController

	def show
		@budget = Budget.new
	end

	def new

	end

	def create
		@user = User.new(params[:user])
		@user.save!
	    cookies[:auth_token] = @user.auth_token
		redirect_to enter_expenses_path
	end

	def edit

	end

	def update

	end


end
