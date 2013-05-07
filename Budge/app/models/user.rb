class User < ActiveRecord::Base
  attr_accessible :email, :password, :password_confirmation
  has_one :budget
  has_many :expenses


  validates_confirmation_of :password, :on => :create
  validates_presence_of :password
  validates_uniqueness_of :email, :case_sensitive => false

  before_create :hash_and_salt_password
  before_create :generate_auth_token

  attr_accessor :password, :password_confirmation


private

def hash_and_salt_password
	self.password_salt = SecureRandom.base64(8)
	self.password_hash = Digest::SHA2.hexdigest(self.password_salt + self.password)
end

def generate_auth_token
  self.auth_token = SecureRandom.base64(8)
end

end
