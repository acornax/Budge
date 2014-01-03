class Budget < ActiveRecord::Base
  # attr_accessible :title, :body
  belongs_to :user
  has_many :budget_components

  accepts_nested_attributes_for :budget_components
end
