# frozen_string_literal: true

class Blocks::MicCheckComponentPreview < ViewComponent::Preview
  def default
    render(Blocks::MicCheckComponent.new)
  end
end
