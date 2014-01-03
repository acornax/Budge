class UsersController < ApplicationController

	def show
		@budget = Budget.new
	end

	def new

	end

	def create
		@user = User.new(params[:user])
		@user.save!
		render :nothing => true
	end

	def edit

	end

	def update

	end


end
