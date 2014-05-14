class Place
  include Mongoid::Document
  include Geocoder::Model::Mongoid

  cache

  field :approved, type: Boolean, default: false 
  field :type # startup, accelerator, incubator, coworking, investor, service, event
  field :lat, type: Float
  field :lng, type: Float
  field :address
  field :uri
  field :description
  field :description_big
  field :sector
  field :title
  field :owner_email
  field :date, type: Date

  field :coordinates, type: Array, default: [0.0,0.0]

  scope :pending, where(approved: false).asc(:title)
  scope :social, where(type: "social").asc(:title)
  scope :accelerator, where(type: "accelerator").asc(:title)
  scope :coworking, where(type: "coworking").asc(:title)
  scope :investor, where(type: "investor").asc(:title)
  scope :academy, where(type: "academy").asc(:title)

  validates_presence_of :title, :address, :uri, :description,:description_big , :owner_email
  validates_presence_of :date, if: :event?
  validates :description_big, length:{maximum: 150}

  geocoded_by :address
  before_save :geocode_if_required

  def event?
    self.type == 'event'
  end

  def status
    approved ? "Approved" : "Pending"
  end

 

  def plot_coordinates
    self.lng = self.coordinates[0]
    self.lat = self.coordinates[1]
  end

  def geocode_if_required
    if self.lng.blank? || self.lat.blank?
      if geocode
        plot_coordinates
      end
    else
      self.coordinates[0] = self.lng
      self.coordinates[1] = self.lat
    end
  end

end
