class UsersController < ApplicationController

	def show
		@budget = Budget.new
	end

	def new

	end

	def create
		@user = User.new(params[:user])
		@user.save!
		redirect_to expenses_path
	end

	def edit

	end

	def update

	end


end
