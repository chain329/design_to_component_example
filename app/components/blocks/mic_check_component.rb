# frozen_string_literal: true

module Blocks
  class MicCheckComponent < ViewComponent::Base
    def initialize(resource = {})
      @width = resource.fetch(:width, 26)
      @height = resource.fetch(:height, 10)
    end
  end
end
