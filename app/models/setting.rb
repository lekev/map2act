class Setting
  include Mongoid::Document


  field :site_name
  field :facebook_page
  field :twitter_handle
  field :analytics_snippet, type: String

  validates_presence_of :site_name

end
