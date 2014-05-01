class PlacesController < ApplicationController
  inherit_resources
  layout "admin", except: [:map, :embedded]
  before_filter :authenticate_user!, except: [:map, :embedded, :create, :new]
  before_filter :set_origin, except: [:map, :embedded]

 
  def index
    @places = Place.asc(:title).all 
    @setting = Setting.first
  end

  def create
    @place = Place.new params[:place]
    if @place.save
      flash[:notice] = "Thanks, your entry has been submitted and will be reviewed shortly!"
      if current_user
        redirect_to places_path, notice: "Place successfully added."
      else
        redirect_to root_path
      end
    else
      flash[:notice] = "Error"
      redirect_to root_path
    end
  end

  def embedded
        @place = Place.new

    gon.places = []
    

    @markers = Place.where(approved: true).all

    TYPES.each do |type|
      @markers.send(type[1].to_sym).each do |value|
        place = ["#{value.title}", 
                "#{value.type}",
                "#{value.lat}",
                "#{value.lng}", 
                "#{value.description}", 

                "#{value.uri}", 
                "#{value.address}",
                "#{value.description_big}",
                "#{value.date.strftime("%a, %b %e, %Y") if value.type == "event"}"]
        gon.places.push place
      end
    end
  end

  def map
    @place = Place.new

    gon.places = []
    

    @markers = Place.where(approved: true).all

    TYPES.each do |type|
      @markers.send(type[1].to_sym).each do |value|
        place = ["#{value.title}", 
                "#{value.type}",
                "#{value.lat}",
                "#{value.lng}", 
                "#{value.description}", 

                "#{value.uri}", 
                "#{value.address}",
                "#{value.description_big}",
                "#{value.date.strftime("%a, %b %e, %Y") if value.type == "event"}"]
        gon.places.push place
      end
    end

  end

  def edit
    gon.place = []
    @place  = Place.find(params[:id])

    placejs = {latitude: @place.lat, longitude: @place.lng};

    gon.place.push placejs


  end

  def admin
    @places = Place.order_by(:title.asc ).all 
    render "index"
  end

  def destroy
    destroy! { places_path }
  end

  def update
    update! { places_path }
  end

  protected

  def set_origin
    @origin = "non-modal"
  end
end
